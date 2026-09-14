const User = require('../models/User');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const IDVerification = require('../models/IDVerification');

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // User stats
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });
        const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        const premiumUsers = await User.countDocuments({ isPremium: true });
        const verifiedUsers = await User.countDocuments({ 'verification.id.verified': true });

        // Report stats
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const totalReports = await Report.countDocuments();

        // Subscription stats
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // ID verification stats
        const pendingVerifications = await IDVerification.countDocuments({ status: 'pending' });

        res.json({
            users: {
                total: totalUsers,
                newToday: newUsersToday,
                newThisMonth: newUsersThisMonth,
                active: activeUsers,
                premium: premiumUsers,
                verified: verifiedUsers
            },
            reports: {
                pending: pendingReports,
                total: totalReports
            },
            subscriptions: {
                active: activeSubscriptions,
                revenue: totalRevenue[0]?.total || 0
            },
            verifications: {
                pending: pendingVerifications
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
};

/**
 * Get all users with pagination
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, isPremium, isBanned } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (isPremium !== undefined) query.isPremium = isPremium === 'true';
        if (isBanned !== undefined) query.isBanned = isBanned === 'true';

        const users = await User.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

/**
 * Update user (ban, make admin, etc.)
 */
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, isBanned, banReason, bannedUntil, isPremium } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (role) user.role = role;
        if (isBanned !== undefined) user.isBanned = isBanned;
        if (banReason) user.banReason = banReason;
        if (bannedUntil) user.bannedUntil = bannedUntil;
        if (isPremium !== undefined) user.isPremium = isPremium;

        await user.save();

        res.json({ message: 'User updated successfully', user });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await User.findByIdAndDelete(userId);

        // TODO: Also delete user's intents, messages, reports, etc.

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

/**
 * Get revenue analytics
 */
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let startDate;
        if (period === '7d') {
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === '30d') {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        } else {
            startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        }

        const revenueByDay = await Payment.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const revenueByPlan = await Payment.aggregate([
            { $match: { status: 'completed' } },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: 'subscriptionId',
                    foreignField: '_id',
                    as: 'subscription'
                }
            },
            { $unwind: '$subscription' },
            {
                $group: {
                    _id: '$subscription.plan',
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            revenueByDay,
            revenueByPlan
        });

    } catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ error: 'Failed to get revenue analytics' });
    }
};

/**
 * Get verifications for admin review
 */
exports.getVerifications = async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        const filter = {};
        if (status !== 'all') {
            filter.status = status;
        }

        const verifications = await IDVerification.find(filter)
            .populate('userId', 'name phoneNumber photos district age gender isVerified')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ verifications });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ error: 'Failed to get verifications' });
    }
};

/**
 * Review a verification (approve or reject)
 */
exports.reviewVerification = async (req, res) => {
    try {
        const { verificationId } = req.params;
        const { status, rejectionReason } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const verification = await IDVerification.findById(verificationId);
        if (!verification) {
            return res.status(404).json({ error: 'Verification record not found' });
        }

        verification.status = status;
        verification.reviewedBy = req.user.id;
        verification.reviewedAt = new Date();
        if (rejectionReason) verification.rejectionReason = rejectionReason;
        await verification.save();

        const user = await User.findById(verification.userId);
        if (user) {
            user.isVerified = status === 'approved';
            if (user.verification && user.verification.id) {
                user.verification.id.verified = status === 'approved';
                user.verification.id.status = status;
                user.verification.id.reviewedAt = new Date();
                if (rejectionReason) user.verification.id.rejectionReason = rejectionReason;
            }
            await user.save();
        }

        res.json({ message: `Verification ${status} successfully`, verification });
    } catch (error) {
        console.error('Review verification error:', error);
        res.status(500).json({ error: 'Failed to review verification' });
    }
};

/**
 * Get reports for admin review
 */
exports.getReports = async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        const filter = {};
        if (status !== 'all') {
            filter.status = status;
        }

        const reports = await Report.find(filter)
            .populate('reporterId', 'name phoneNumber photos')
            .populate('reportedUserId', 'name phoneNumber photos isBanned district')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to get reports' });
    }
};

/**
 * Review a report
 */
exports.reviewReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, action, actionNotes } = req.body;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (status) report.status = status;
        if (action) report.action = action;
        if (actionNotes) report.actionNotes = actionNotes;
        report.reviewedBy = req.user.id;
        report.reviewedAt = new Date();
        await report.save();

        // If action is ban, ban the reported user
        if (action === 'temporary_ban' || action === 'permanent_ban') {
            const user = await User.findById(report.reportedUserId);
            if (user) {
                user.isBanned = true;
                user.banReason = report.reason + (actionNotes ? `: ${actionNotes}` : '');
                if (action === 'temporary_ban') {
                    user.bannedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
                } else {
                    user.bannedUntil = null; // permanent
                }
                await user.save();
            }
        }

        res.json({ message: 'Report reviewed successfully', report });
    } catch (error) {
        console.error('Review report error:', error);
        res.status(500).json({ error: 'Failed to review report' });
    }
};
