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
