const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { storeUpload } = require('../services/cloudinaryService');

const storage = multer.memoryStorage();

// Multer instance for photo uploads (images up to 5MB)
const photoUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Multer instance for voice uploads (audio up to 2MB)
const voiceUpload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
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
 * @route   POST /api/profile/photos
 * @desc    Upload a profile photo via backend → Cloudinary
 * @access  Private
 */
router.post('/photos', auth, photoUpload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo file provided' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if ((user.photos || []).length >= 6) {
            return res.status(400).json({ error: 'Maximum 6 photos allowed' });
        }

        const photoUrl = await storeUpload(req.file, 'profiles', 'image');

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { photos: photoUrl } },
            { new: true }
        ).select('-password');

        res.json({ photoUrl, photos: updatedUser.photos });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   DELETE /api/profile/photos/:index
 * @desc    Remove a profile photo by its index in the photos array
 * @access  Private
 */
router.delete('/photos/:index', auth, async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (isNaN(index) || index < 0 || index >= (user.photos || []).length) {
            return res.status(400).json({ error: 'Invalid photo index' });
        }

        user.photos.splice(index, 1);
        await user.save();

        res.json({ photos: user.photos });
    } catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   POST /api/profile/voice
 * @desc    Upload voice intro via backend → Cloudinary
 * @access  Private
 */
router.post('/voice', auth, voiceUpload.single('voice'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No voice file provided' });
        }

        const voiceUrl = await storeUpload(req.file, 'voice', 'video'); // Cloudinary uses 'video' for audio

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { voiceIntro: voiceUrl } },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ voiceUrl, user });
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
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        // Exclude self and blocked users
        const Block = require('../models/Block');
        const blocks = await Block.find({
            $or: [{ blockerId: req.user.id }, { blockedUserId: req.user.id }]
        });
        const blockedIds = blocks.map(b =>
            String(b.blockerId) === String(req.user.id) ? b.blockedUserId : b.blockerId
        );

        const excludedIds = [currentUser._id, ...blockedIds];

        // Preference filter
        const query = {
            _id: { $nin: excludedIds },
            isBanned: { $ne: true },
            name: { $exists: true, $ne: '' }
        };

        if (currentUser.preferences?.gender && currentUser.preferences.gender !== 'Everyone') {
            query.gender = currentUser.preferences.gender;
        }

        let candidates = await User.find(query)
            .select('_id name age birthdate gender bio district location photos interests isVerified createdAt')
            .limit(50)
            .lean();

        // If gender filter produced 0 candidates, fallback to all valid users
        if (candidates.length === 0) {
            delete query.gender;
            candidates = await User.find(query)
                .select('_id name age birthdate gender bio district location photos interests isVerified createdAt')
                .limit(50)
                .lean();
        }

        // Calculate AI Compatibility Score for each candidate
        const scoredPicks = candidates.map(candidate => {
            let score = 70; // Base compatibility

            // Shared interests (+10 per shared interest, max 20)
            const myInterests = currentUser.interests || [];
            const theirInterests = candidate.interests || [];
            const shared = myInterests.filter(i => theirInterests.includes(i));
            score += Math.min(20, shared.length * 10);

            // Verified badge bonus (+8)
            if (candidate.isVerified) score += 8;

            // Multiple photos bonus (+5)
            if (candidate.photos && candidate.photos.length >= 2) score += 5;

            // Bio bonus (+4)
            if (candidate.bio && candidate.bio.trim().length > 15) score += 4;

            // Stable pseudo-random variation per candidate per day (0-6)
            const dayNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
            const charSum = String(candidate._id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            score += (charSum + dayNum) % 7;

            // Calculate age safely
            let age = (candidate.age && candidate.age >= 18 && candidate.age <= 100) ? candidate.age : null;
            if (!age && candidate.birthdate) {
                const ageDiff = Date.now() - new Date(candidate.birthdate).getTime();
                const calcAge = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
                if (calcAge >= 18 && calcAge <= 100) age = calcAge;
            }

            return {
                id: candidate._id,
                _id: candidate._id,
                name: candidate.name || 'Member',
                age,
                gender: candidate.gender,
                bio: candidate.bio || '',
                district: candidate.district || '',
                photos: (candidate.photos && candidate.photos.length) ? candidate.photos : [],
                interests: theirInterests,
                isVerified: Boolean(candidate.isVerified),
                matchScore: Math.min(98, score),
                distance: candidate.district ? candidate.district : 'Nearby'
            };
        });

        // Sort by highest match score
        scoredPicks.sort((a, b) => b.matchScore - a.matchScore);

        const limit = currentUser.isPremium ? 10 : 6;
        const topPicks = scoredPicks.slice(0, limit);

        res.json({ picks: topPicks });
    } catch (error) {
        console.error('Daily picks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
