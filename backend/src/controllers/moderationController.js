const Report = require('../models/Report');
const Block = require('../models/Block');
const User = require('../models/User');

/**
 * Report a user
 */
exports.reportUser = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { reportedUserId, reason, description } = req.body;

        // Validate
        if (reporterId === reportedUserId) {
            return res.status(400).json({ error: 'Cannot report yourself' });
        }

        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already reported recently (within 24 hours)
        const recentReport = await Report.findOne({
            reporterId,
            reportedUserId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentReport) {
            return res.status(400).json({ error: 'You have already reported this user recently' });
        }

        // Create report
        const report = await Report.create({
            reporterId,
            reportedUserId,
            reason,
            description
        });

        // Check if user has multiple reports (auto-flag for review)
        const reportCount = await Report.countDocuments({
            reportedUserId,
            status: { $in: ['pending', 'under_review'] }
        });

        if (reportCount >= 3) {
            report.status = 'under_review';
            await report.save();
        }

        res.json({
            message: 'Report submitted successfully. Our team will review it within 24 hours.',
            report
        });

    } catch (error) {
        console.error('Report user error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
};

/**
 * Block a user
 */
exports.blockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const { blockedUserId, reason } = req.body;

        // Validate
        if (blockerId === blockedUserId) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        const blockedUser = await User.findById(blockedUserId);
        if (!blockedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already blocked
        const existingBlock = await Block.findOne({ blockerId, blockedUserId });
        if (existingBlock) {
            return res.status(400).json({ error: 'User already blocked' });
        }

        // Create block
        const block = await Block.create({
            blockerId,
            blockedUserId,
            reason
        });

        res.json({ message: 'User blocked successfully', block });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
};

/**
 * Unblock a user
 */
exports.unblockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const { blockedUserId } = req.body;

        const result = await Block.findOneAndDelete({ blockerId, blockedUserId });

        if (!result) {
            return res.status(404).json({ error: 'Block not found' });
        }

        res.json({ message: 'User unblocked successfully' });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
};

/**
 * Get blocked users
 */
exports.getBlockedUsers = async (req, res) => {
    try {
        const blockerId = req.user.id;

        const blocks = await Block.find({ blockerId })
            .populate('blockedUserId', 'name photos')
            .sort({ createdAt: -1 });

        res.json({ blocks });

    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ error: 'Failed to get blocked users' });
    }
};

/**
 * Get all reports (Admin only)
 */
exports.getAllReports = async (req, res) => {
    try {
        // TODO: Add admin role check

        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate('reporterId', 'name photos')
            .populate('reportedUserId', 'name photos')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(query);

        res.json({
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({ error: 'Failed to get reports' });
    }
};

/**
 * Review report (Admin only)
 */
exports.reviewReport = async (req, res) => {
    try {
        // TODO: Add admin role check

        const { reportId } = req.params;
        const { status, action, actionNotes } = req.body;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        report.status = status;
        report.action = action;
        report.actionNotes = actionNotes;
        report.reviewedBy = req.user.id;
        report.reviewedAt = new Date();
        await report.save();

        // Apply action if needed
        if (action === 'temporary_ban' || action === 'permanent_ban') {
            const user = await User.findById(report.reportedUserId);
            user.isBanned = true;
            user.banReason = actionNotes;
            user.bannedUntil = action === 'temporary_ban' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
            await user.save();
        }

        res.json({ message: 'Report reviewed successfully', report });

    } catch (error) {
        console.error('Review report error:', error);
        res.status(500).json({ error: 'Failed to review report' });
    }
};
