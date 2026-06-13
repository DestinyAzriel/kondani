const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for voice file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for voice files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

/**
 * @route   POST /api/profile/prompts
 * @desc    Update profile prompts
 * @access  Private
 */
router.post('/prompts', auth, async (req, res) => {
    try {
        const { prompts } = req.body;

        // Validate prompts array
        if (!Array.isArray(prompts) || prompts.length > 3) {
            return res.status(400).json({
                error: 'Invalid prompts. Must be an array with max 3 items.'
            });
        }

        // Validate each prompt
        for (const prompt of prompts) {
            if (!prompt.id || !prompt.question || !prompt.answer) {
                return res.status(400).json({
                    error: 'Each prompt must have id, question, and answer'
                });
            }
            if (prompt.answer.length > 200) {
                return res.status(400).json({
                    error: 'Prompt answers must be 200 characters or less'
                });
            }
        }

        // Update user prompts
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { prompts } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Update prompts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   POST /api/profile/voice
 * @desc    Upload voice intro
 * @access  Private
 */
router.post('/voice', auth, upload.single('voice'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No voice file provided' });
        }

        // TODO: Upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For now, we'll store a placeholder URL
        const voiceUrl = `https://kondani-voice.s3.amazonaws.com/${req.user.id}_${Date.now()}.webm`;

        // Update user voice intro
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { voiceIntro: voiceUrl } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            voiceUrl,
            user
        });
    } catch (error) {
        console.error('Voice upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   DELETE /api/profile/voice
 * @desc    Delete voice intro
 * @access  Private
 */
router.delete('/voice', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $unset: { voiceIntro: 1 } },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('Voice delete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /api/profile/daily-picks
 * @desc    Get AI-curated daily picks
 * @access  Private
 */
router.get('/daily-picks', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        // Check if picks were already generated today
        const today = new Date().setHours(0, 0, 0, 0);
        const lastPicksDate = currentUser.lastPicksDate ?
            new Date(currentUser.lastPicksDate).setHours(0, 0, 0, 0) : 0;

        let picks = currentUser.dailyPicks || [];

        // Generate new picks if needed
        if (lastPicksDate < today || picks.length === 0) {
            picks = await generateDailyPicks(currentUser);

            await User.findByIdAndUpdate(req.user.id, {
                $set: {
                    dailyPicks: picks,
                    lastPicksDate: new Date()
                }
            });
        }

        // Populate user details
        const populatedPicks = await User.find({
            _id: { $in: picks }
        }).select('-password').limit(currentUser.isPremium ? 10 : 5);

        res.json(populatedPicks);
    } catch (error) {
        console.error('Daily picks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Generate AI-curated daily picks
 * @param {Object} user - Current user
 * @returns {Array} - Array of user IDs
 */
async function generateDailyPicks(user) {
    try {
        // Build matching criteria
        const criteria = {
            _id: { $ne: user._id }, // Exclude self
            isVisible: true,
            // Exclude already liked/passed users
            _id: {
                $nin: [
                    ...(user.likes || []),
                    ...(user.passes || []),
                    ...(user.matches || [])
                ]
            }
        };

        // Gender preference
        if (user.preferences?.gender && user.preferences.gender !== 'Everyone') {
            criteria.gender = user.preferences.gender;
        }

        // Age range
        if (user.preferences?.ageMin && user.preferences?.ageMax) {
            criteria.age = {
                $gte: user.preferences.ageMin,
                $lte: user.preferences.ageMax
            };
        }

        // Find potential matches
        let potentialMatches = await User.find(criteria)
            .select('_id interests location photos isVerified')
            .limit(50);

        // Calculate compatibility scores
        const scoredMatches = potentialMatches.map(match => {
            let score = 0;

            // Shared interests (highest weight)
            const sharedInterests = (user.interests || []).filter(interest =>
                (match.interests || []).includes(interest)
            );
            score += sharedInterests.length * 20;

            // Verification bonus
            if (match.isVerified) score += 10;

            // Photo completeness
            if (match.photos && match.photos.length >= 3) score += 10;

            // Location proximity (if available)
            // TODO: Implement geolocation scoring

            return {
                userId: match._id,
                score,
                sharedInterests
            };
        });

        // Sort by score and take top picks
        scoredMatches.sort((a, b) => b.score - a.score);
        const topPicks = scoredMatches.slice(0, user.isPremium ? 10 : 5);

        return topPicks.map(pick => pick.userId);
    } catch (error) {
        console.error('Generate daily picks error:', error);
        return [];
    }
}

module.exports = router;
