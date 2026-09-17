const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Add axios for Telegram API calls
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { storeUpload } = require('../services/cloudinaryService');
const { sendSMS } = require('../services/smsService');
const { sendWhatsApp } = require('../services/whatsappService');

// Configure axios with timeout and retry settings
const telegramAxios = axios.create({
    timeout: 10000, // 10 second timeout
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // Looser SSL requirements
});

// Mock OTP storage (in memory)
const otpStore = new Map();

// Function to notify admin (now with improved error handling and retries)
function notifyAdmin(phoneNumber, otp) {
    console.log(`
====================================================
🚨 NEW OTP REQUEST 🚨
Phone Number: ${phoneNumber}
OTP Code: ${otp}
Action Required: Manually send this OTP via Airtel SMS
====================================================
`);

    // Send Telegram notification if configured
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const message = `🚨 NEW OTP REQUEST\nPhone: ${phoneNumber}\nOTP: ${otp}\nPlease send via Airtel SMS`;
        
        // Try to send with retry logic
        sendTelegramMessage(message, 3)
            .then(() => {
                console.log('✅ Telegram notification sent successfully');
            })
            .catch((error) => {
                console.error('Failed to send Telegram notification after retries:', error.message);
                console.log('⚠️  Falling back to console notification only');
            });
    } else {
        console.log('ℹ️  Telegram not configured - using console notification only');
    }

    // TODO: Uncomment and configure when ready for automated SMS
    /*
    // Example Termii/Africa's Talking integration (when you're ready to automate)
    // axios.post('https://api.termii.com/...', {
    //     to: phoneNumber,
    //     sms: `Your OTP: ${otp}`,
    //     api_key: process.env.TERMII_API_KEY
    // }).catch(console.error);
    */
}

// Retry logic for Telegram notifications
async function sendTelegramMessage(message, retries = 3) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error('Telegram credentials not configured');
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    };

    for (let i = 0; i < retries; i++) {
        try {
            await telegramAxios.post(url, payload);
            return; // Success
        } catch (error) {
            console.warn(`Telegram attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error; // Last attempt, rethrow
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}

// Send OTP function
async function sendOTP(phoneNumber) {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(phoneNumber, {
        otp,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    const otpMessage = `Your Kondani verification code is: *${otp}*\n\nThis code is valid for 5 minutes. Do not share it with anyone.`;

    // --- Primary: WhatsApp via Green API ---
    const waResult = await sendWhatsApp({ to: phoneNumber, message: otpMessage });
    if (waResult.success) {
        console.log(`[OTP] ✅ WhatsApp OTP dispatched to ${phoneNumber}`);
        // Also notify admin via console/Telegram for audit
        notifyAdmin(phoneNumber, otp);
        return otp;
    }

    console.warn(`[OTP] WhatsApp delivery failed for ${phoneNumber}, trying Africa's Talking SMS fallback...`);

    // --- Fallback: Africa's Talking SMS ---
    const smsMessage = `Your Kondani verification code is ${otp}. Valid for 5 minutes. Do not share this code.`;
    const smsResult = await sendSMS({ to: phoneNumber, message: smsMessage });
    if (smsResult.success) {
        console.log(`[OTP] ✅ SMS OTP dispatched to ${phoneNumber} via Africa's Talking`);
    } else {
        console.warn(`[OTP] ⚠️ Both WhatsApp and SMS delivery failed for ${phoneNumber}. Using admin notification only.`);
        console.warn(`[OTP] WhatsApp error:`, JSON.stringify(waResult.error));
        console.warn(`[OTP] SMS error:`, JSON.stringify(smsResult.error));
    }

    // Admin / console notification fallback (always runs)
    notifyAdmin(phoneNumber, otp);
    
    return otp;
}

function normalizePhoneNumber(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('265')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return `+265${digits}`;
}

// Register user
exports.register = async (req, res) => {
    try {
        let { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
        phoneNumber = normalizePhoneNumber(phoneNumber);
        
        // Generate and send OTP
        await sendOTP(phoneNumber);
        
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login with OTP
exports.login = async (req, res) => {
    try {
        let { phoneNumber, otp } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        phoneNumber = normalizePhoneNumber(phoneNumber);
        
        // Verify OTP (allows 123456 for testing/dev or stored OTP)
        const isTestOtp = otp === '123456';
        if (!isTestOtp) {
            const stored = otpStore.get(phoneNumber);
            if (!stored || stored.expires < Date.now()) {
                return res.status(400).json({ error: 'OTP expired or not found' });
            }
            if (stored.otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
            // Remove used OTP
            otpStore.delete(phoneNumber);
        }
        
        // Find or create user
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({ phoneNumber });
            await user.save();
        }
        
        // Generate JWT
        const token = jwt.sign(
            { id: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
            { expiresIn: '30d' }
        );
        
        res.json({
            token,
            user
        });
    } catch (err) {
        console.error('verify-otp/login error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Google One-Tap & OAuth Sign-In (100% Phone-Free)
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify ID token with Google's tokeninfo API
        const tokenRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
            timeout: 10000
        });
        const payload = tokenRes.data;

        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const googleId = payload.sub;
        const email = payload.email.toLowerCase();
        const name = payload.name || payload.given_name || 'Kondani Member';
        const photo = payload.picture || null;

        // Find or create user
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            user = new User({
                googleId,
                email,
                name,
                photos: photo ? [photo] : [],
                isVerified: true,
                verification: {
                    email: { verified: true, verifiedAt: new Date() }
                },
                isProfileComplete: false
            });
            await user.save();
            console.log(`[Google Auth] Created new user: ${email} (${name})`);
        } else {
            // Update googleId and photo if missing
            let changed = false;
            if (!user.googleId) {
                user.googleId = googleId;
                changed = true;
            }
            if ((!user.photos || user.photos.length === 0) && photo) {
                user.photos = [photo];
                changed = true;
            }
            if (!user.name && name) {
                user.name = name;
                changed = true;
            }
            if (changed) {
                await user.save();
            }
            console.log(`[Google Auth] Existing user logged in: ${email}`);
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'kondani_secret_key_2024',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user,
            isNewUser: isNewUser || !user.isProfileComplete
        });
    } catch (err) {
        console.error('[Google Auth Error]:', err.response?.data || err.message);
        res.status(400).json({ error: 'Google sign-in failed. Please try again.' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Auto-check premium expiry
        if (user.isPremium && user.premiumUntil && new Date(user.premiumUntil) < new Date()) {
            user.isPremium = false;
            user.subscriptionTier = 'free';
            await user.save();
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Permanently delete the current user's account + related data
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Remove this user from everyone else's likes/passes/matches/dailyPicks
        await User.updateMany(
            { $or: [{ likes: userId }, { passes: userId }, { matches: userId }, { dailyPicks: userId }] },
            { $pull: { likes: userId, passes: userId, matches: userId, dailyPicks: userId } }
        );

        // Best-effort cleanup of related collections (ignore if a model/field differs)
        try { const Message = require('../models/Message'); await Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }, { from: userId }, { to: userId }] }); } catch (e) {}
        try { const Intent = require('../models/Intent'); await Intent.deleteMany({ user: userId }); } catch (e) {}
        try { const IDVerification = require('../models/IDVerification'); await IDVerification.deleteMany({ userId }); } catch (e) {}
        try { const Report = require('../models/Report'); await Report.deleteMany({ $or: [{ reporter: userId }, { reported: userId }] }); } catch (e) {}
        try { const Block = require('../models/Block'); await Block.deleteMany({ $or: [{ blocker: userId }, { blocked: userId }] }); } catch (e) {}

        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Could not delete account. Please try again.' });
    }
};

// Update user profile with support for file uploads
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Handle both regular form data and multipart form data (with files)
        let updateData = {};
        
        if (req.body.profileData) {
            // Handle multipart form data with file uploads
            updateData = JSON.parse(req.body.profileData);
        } else {
            // Handle regular JSON data
            updateData = req.body;
        }
        
        // Handle photo uploads if present
        if (req.files && req.files.length > 0) {
            // Upload each new file to Cloudinary (or disk fallback) → store the URL
            const photoUrls = await Promise.all(
                req.files.map(file => storeUpload(file, 'photos', 'image'))
            );

            // If we have existing photo URLs from the client, merge them
            if (req.body.photoUrls) {
                try {
                    const existingPhotoUrls = JSON.parse(req.body.photoUrls);
                    photoUrls.push(...existingPhotoUrls);
                } catch (e) {
                    console.warn('Could not parse existing photo URLs:', e);
                }
            }
            
            updateData.photos = photoUrls;
        } else if (req.body.photoUrls) {
            // Handle photo URLs without new uploads
            try {
                updateData.photos = JSON.parse(req.body.photoUrls);
            } catch (e) {
                console.warn('Could not parse photo URLs:', e);
                updateData.photos = [];
            }
        }
        
        // Fix location field if it's not properly formatted
        if (updateData.location) {
            if (typeof updateData.location === 'string') {
                // If location is a string, set it to default GeoJSON format
                updateData.location = {
                    type: "Point",
                    coordinates: [0, 0]
                };
            } else if (typeof updateData.location === 'object' && !updateData.location.type) {
                // If location is an object but missing type, fix it
                updateData.location = {
                    type: "Point",
                    coordinates: Array.isArray(updateData.location.coordinates) ? updateData.location.coordinates : [0, 0]
                };
            }
        }
        
        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.phoneNumber;
        delete updateData.role;
        delete updateData.isBanned;
        delete updateData.banReason;
        delete updateData.bannedUntil;
        delete updateData.fcmToken;
        
        // Find existing user first to safely preserve completion status
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const finalName = updateData.name !== undefined ? updateData.name : existingUser.name;
        const finalAge = updateData.age !== undefined ? updateData.age : existingUser.age;
        const finalBio = updateData.bio !== undefined ? updateData.bio : existingUser.bio;
        const finalPhotos = updateData.photos !== undefined ? updateData.photos : existingUser.photos;

        const isComplete = existingUser.isProfileComplete || !!(finalName && finalAge && finalBio && Array.isArray(finalPhotos) && finalPhotos.length > 0);

        // Merge preferences and notifications if partially provided
        if (updateData.preferences) {
            updateData.preferences = {
                ...(existingUser.preferences ? (existingUser.preferences.toObject ? existingUser.preferences.toObject() : existingUser.preferences) : {}),
                ...updateData.preferences
            };
        }
        if (updateData.notifications) {
            updateData.notifications = {
                ...(existingUser.notifications ? (existingUser.notifications.toObject ? existingUser.notifications.toObject() : existingUser.notifications) : {}),
                ...updateData.notifications
            };
        }

        // Update the user
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                ...updateData,
                isProfileComplete: isComplete
            },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (updateData.showOnlineStatus !== undefined) {
            const { onlineUsers } = require('./chatController');
            const io = req.app.get('io');
            if (io) {
                const isOnline = updateData.showOnlineStatus ? onlineUsers.has(String(userId)) : false;
                io.emit('user_status', { userId: String(userId), isOnline });
            }
        }
        
        res.json(user);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};