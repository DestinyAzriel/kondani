const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Intent = require('../models/Intent');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Block = require('../models/Block');

class AnalyticsService {
    /**
     * Calculate and store daily analytics
     * Should be run daily via cron job
     */
    async calculateDailyAnalytics(date = new Date()) {
        try {
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

            // User metrics
            const dau = await User.countDocuments({
                lastActive: { $gte: startOfDay, $lt: endOfDay }
            });

            const newUsers = await User.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            const totalUsers = await User.countDocuments();

            // Engagement metrics
            const matches = await Intent.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay },
                type: 'like',
                mutual: true
            });

            const messages = await Message.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            const swipes = await Intent.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            // Premium metrics
            const premiumSignups = await Payment.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay },
                status: 'completed'
            });

            const totalPremiumUsers = await User.countDocuments({ isPremium: true });

            // Revenue metrics
            const revenueData = await Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfDay, $lt: endOfDay },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$amount' },
                        transactions: { $sum: 1 }
                    }
                }
            ]);

            const revenue = revenueData[0]?.revenue || 0;
            const transactions = revenueData[0]?.transactions || 0;

            // Safety metrics
            const reports = await Report.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            const blocks = await Block.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            });

            // Store analytics
            await Analytics.findOneAndUpdate(
                { date: startOfDay },
                {
                    date: startOfDay,
                    metrics: {
                        dau,
                        newUsers,
                        totalUsers,
                        matches,
                        messages,
                        swipes,
                        premiumSignups,
                        totalPremiumUsers,
                        revenue,
                        transactions,
                        reports,
                        blocks
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`Analytics calculated for ${startOfDay.toDateString()}`);

        } catch (error) {
            console.error('Calculate daily analytics error:', error);
            throw error;
        }
    }

    /**
     * Get analytics for a date range
     */
    async getAnalytics(startDate, endDate) {
        try {
            const analytics = await Analytics.find({
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            return analytics;
        } catch (error) {
            console.error('Get analytics error:', error);
            throw error;
        }
    }

    /**
     * Calculate MAU (Monthly Active Users)
     */
    async calculateMAU() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return await User.countDocuments({
            lastActive: { $gte: thirtyDaysAgo }
        });
    }

    /**
     * Calculate conversion rate (free to premium)
     */
    async calculateConversionRate() {
        const totalUsers = await User.countDocuments();
        const premiumUsers = await User.countDocuments({ isPremium: true });

        return totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
    }
}

module.exports = new AnalyticsService();
