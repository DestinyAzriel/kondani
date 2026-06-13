const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   POST /api/activity/heartbeat
 * @desc    Update user's last seen timestamp
 * @access  Private
 */
router.post('/heartbeat', auth, async (req, res) => {
    try {
        const { timestamp, isActive } = req.body;

        await User.findByIdAndUpdate(req.user.id, {
            $set: {
                lastSeen: timestamp || Date.now(),
                isOnline: isActive !== false
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   POST /api/activity/status
 * @desc    Update user's activity status
 * @access  Private
 */
router.post('/status', auth, async (req, res) => {
    try {
        const { status, timestamp } = req.body;

        const update = {
            lastSeen: timestamp || Date.now(),
            isOnline: status === 'active'
        };

        await User.findByIdAndUpdate(req.user.id, { $set: update });

        res.json({ success: true });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /api/activity/:userId
 * @desc    Get user's activity status
 * @access  Private
 */
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('lastSeen isOnline');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            lastSeen: user.lastSeen,
            isOnline: user.isOnline
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /api/activity/online/count
 * @desc    Get count of online users
 * @access  Private
 */
router.get('/online/count', auth, async (req, res) => {
    try {
        // Users active in last 5 minutes
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        const count = await User.countDocuments({
            lastSeen: { $gte: fiveMinutesAgo },
            isOnline: true
        });

        res.json({ count });
    } catch (error) {
        console.error('Online count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /api/activity/online/users
 * @desc    Get list of online users
 * @access  Private
 */
router.get('/online/users', auth, async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Users active in last 5 minutes
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        const users = await User.find({
            _id: { $ne: req.user.id }, // Exclude self
            lastSeen: { $gte: fiveMinutesAgo },
            isOnline: true,
            isVisible: true
        })
            .select('name age location photos isVerified lastSeen')
            .limit(parseInt(limit));

        res.json(users);
    } catch (error) {
        console.error('Online users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
