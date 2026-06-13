const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Add axios for Telegram API calls
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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
    
    // Notify admin (manual SMS sending)
    notifyAdmin(phoneNumber, otp);
    
    return otp;
}

// Register user
exports.register = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        
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
        const { phoneNumber, otp } = req.body;
        
        // Verify OTP
        const stored = otpStore.get(phoneNumber);
        if (!stored || stored.expires < Date.now()) {
            return res.status(400).json({ error: 'OTP expired or not found' });
        }
        
        if (stored.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        // Remove used OTP
        otpStore.delete(phoneNumber);
        
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
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
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
            // Process uploaded files
            const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
            
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
        
        // Update the user
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                ...updateData,
                isProfileComplete: !!(updateData.name && updateData.age && updateData.bio && updateData.photos && updateData.photos.length > 0)
            },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};