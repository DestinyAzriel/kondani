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

function getCycleInfo() {
    const now = new Date();
    const nextRefresh = new Date(now);
    nextRefresh.setHours(18, 0, 0, 0);
    if (now >= nextRefresh) {
        nextRefresh.setDate(nextRefresh.getDate() + 1);
    }
    const yyyy = nextRefresh.getFullYear();
    const mm = String(nextRefresh.getMonth() + 1).padStart(2, '0');
    const dd = String(nextRefresh.getDate()).padStart(2, '0');
    const cycleDate = `${yyyy}-${mm}-${dd}-18`;
    return { nextRefreshAt: nextRefresh.toISOString(), cycleDate };
}

function scoreCandidate(currentUser, candidate, cycleDate) {
    let score = 70; // Base compatibility

    const myInterests = currentUser.interests || [];
    const theirInterests = candidate.interests || [];
    const shared = myInterests.filter(i => theirInterests.includes(i));
    score += Math.min(20, shared.length * 10);

    if (candidate.isVerified && candidate.verification?.id?.status === 'approved') score += 8;
    if (candidate.photos && candidate.photos.length >= 2) score += 5;
    if (candidate.bio && candidate.bio.trim().length > 15) score += 4;

    // Stable deterministic variation per candidate per cycle
    const charSum = String(candidate._id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    score += (charSum) % 6;

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
        isVerified: Boolean(candidate.isVerified && candidate.verification?.id?.status === 'approved'),
        matchScore: Math.min(98, score),
        distance: candidate.district ? candidate.district : 'Nearby'
    };
}

/**
 * @route   GET /api/profile/daily-picks
 * @desc    Get real daily picks for the current 6 PM cycle
 * @access  Private
 */
router.get('/daily-picks', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const { nextRefreshAt, cycleDate } = getCycleInfo();
        const DailyPick = require('../models/DailyPick');
        const Intent = require('../models/Intent');
        const Block = require('../models/Block');

        // Check if user already has a batch for this 6 PM cycle
        let userDailyPick = await DailyPick.findOne({ user: req.user.id, cycleDate });

        if (userDailyPick) {
            if (userDailyPick.completed) {
                return res.json({
                    picks: [],
                    completedToday: true,
                    nextRefreshAt,
                    totalToday: userDailyPick.picks.length
                });
            }

            const unswipedIds = userDailyPick.picks.filter(id =>
                !userDailyPick.swiped.some(sId => String(sId) === String(id))
            );

            if (unswipedIds.length === 0) {
                userDailyPick.completed = true;
                await userDailyPick.save();
                return res.json({
                    picks: [],
                    completedToday: true,
                    nextRefreshAt,
                    totalToday: userDailyPick.picks.length
                });
            }

            const candidateUsers = await User.find({
                _id: { $in: unswipedIds },
                isBanned: { $ne: true },
                role: { $nin: ['admin', 'moderator'] },
                isProfileComplete: { $ne: false }
            })
                .select('_id name age birthdate gender bio district location photos interests isVerified verification')
                .lean();

            const formatted = candidateUsers.map(c => scoreCandidate(currentUser, c, cycleDate));
            formatted.sort((a, b) => b.matchScore - a.matchScore);

            return res.json({
                picks: formatted,
                completedToday: false,
                nextRefreshAt,
                totalToday: userDailyPick.picks.length
            });
        }

        // New cycle: Curate fresh real users
        const blocks = await Block.find({
            $or: [{ blockerId: req.user.id }, { blockedUserId: req.user.id }]
        });
        const blockedIds = blocks.map(b =>
            String(b.blockerId) === String(req.user.id) ? b.blockedUserId : b.blockerId
        );

        const userIntent = await Intent.findOne({ user: req.user.id });
        const alreadyInteracted = userIntent ? [
            ...(userIntent.likes || []),
            ...(userIntent.passes || []),
            ...(userIntent.matches || [])
        ] : [];

        const excludedIds = [currentUser._id, ...blockedIds, ...alreadyInteracted];

        const query = {
            _id: { $nin: excludedIds },
            isBanned: { $ne: true },
            name: { $exists: true, $ne: '' },
            role: { $nin: ['admin', 'moderator'] },
            isProfileComplete: { $ne: false }
        };

        if (currentUser.preferences?.gender && currentUser.preferences.gender !== 'Everyone') {
            query.gender = currentUser.preferences.gender;
        }

        let candidates = await User.find(query)
            .select('_id name age birthdate gender bio district location photos interests isVerified verification')
            .limit(50)
            .lean();

        // Fallback if gender yielded zero candidates
        if (candidates.length === 0 && query.gender) {
            delete query.gender;
            candidates = await User.find(query)
                .select('_id name age birthdate gender bio district location photos interests isVerified verification')
                .limit(50)
                .lean();
        }

        if (candidates.length === 0) {
            return res.json({
                picks: [],
                completedToday: false,
                exhausted: true,
                nextRefreshAt,
                totalToday: 0
            });
        }

        const scoredPicks = candidates.map(c => scoreCandidate(currentUser, c, cycleDate));
        scoredPicks.sort((a, b) => b.matchScore - a.matchScore);

        const limit = currentUser.isPremium ? 10 : 6;
        const topPicks = scoredPicks.slice(0, limit);

        await DailyPick.create({
            user: currentUser._id,
            cycleDate,
            picks: topPicks.map(p => p._id),
            swiped: [],
            completed: false
        });

        res.json({
            picks: topPicks,
            completedToday: false,
            nextRefreshAt,
            totalToday: topPicks.length
        });
    } catch (error) {
        console.error('Daily picks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   POST /api/profile/daily-picks/:id/swipe
 * @desc    Record a real like or pass on a daily pick with cycle completion tracking
 * @access  Private
 */
router.post('/daily-picks/:id/swipe', auth, async (req, res) => {
    try {
        const { action } = req.body; // 'like' | 'pass'
        const candidateId = req.params.id;
        const currentUserId = req.user.id;

        const { cycleDate, nextRefreshAt } = getCycleInfo();
        const DailyPick = require('../models/DailyPick');
        const Intent = require('../models/Intent');
        const User = require('../models/User');

        let dailyPick = await DailyPick.findOne({ user: currentUserId, cycleDate });
        if (dailyPick) {
            if (!dailyPick.swiped.some(id => String(id) === String(candidateId))) {
                dailyPick.swiped.push(candidateId);
            }
            const allSwiped = dailyPick.picks.every(pId =>
                dailyPick.swiped.some(sId => String(sId) === String(pId))
            );
            if (allSwiped) {
                dailyPick.completed = true;
            }
            await dailyPick.save();
        }

        let isMatch = false;
        let matchData = null;

        if (action === 'like') {
            let userIntent = await Intent.findOne({ user: currentUserId });
            if (!userIntent) {
                userIntent = await Intent.create({ user: currentUserId });
            }
            if (!userIntent.likes.some(id => String(id) === String(candidateId))) {
                userIntent.likes.push(candidateId);
                await userIntent.save();
            }

            // Check if reciprocal like exists
            const targetIntent = await Intent.findOne({ user: candidateId });
            if (targetIntent && targetIntent.likes.some(id => String(id) === String(currentUserId))) {
                isMatch = true;
                if (!userIntent.matches.some(id => String(id) === String(candidateId))) {
                    userIntent.matches.push(candidateId);
                    await userIntent.save();
                }
                if (!targetIntent.matches.some(id => String(id) === String(currentUserId))) {
                    targetIntent.matches.push(currentUserId);
                    await targetIntent.save();
                }
                const matchedUser = await User.findById(candidateId).select('name photos district age isVerified verification');
                if (matchedUser) {
                    matchData = {
                        id: matchedUser._id,
                        _id: matchedUser._id,
                        name: matchedUser.name,
                        photos: matchedUser.photos,
                        district: matchedUser.district,
                        age: matchedUser.age,
                        isVerified: Boolean(matchedUser.isVerified && matchedUser.verification?.id?.status === 'approved')
                    };
                }
            }
        } else {
            let userIntent = await Intent.findOne({ user: currentUserId });
            if (!userIntent) {
                userIntent = await Intent.create({ user: currentUserId });
            }
            if (!userIntent.passes.some(id => String(id) === String(candidateId))) {
                userIntent.passes.push(candidateId);
                await userIntent.save();
            }
        }

        res.json({
            success: true,
            isMatch,
            matchData,
            completedToday: dailyPick ? dailyPick.completed : false,
            nextRefreshAt
        });
    } catch (error) {
        console.error('Daily pick swipe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
