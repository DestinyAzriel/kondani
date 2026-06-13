const analyticsService = require('../services/analyticsService');

/**
 * Get analytics for date range
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const analytics = await analyticsService.getAnalytics(start, end);
        const mau = await analyticsService.calculateMAU();
        const conversionRate = await analyticsService.calculateConversionRate();

        res.json({
            analytics,
            summary: {
                mau,
                conversionRate: conversionRate.toFixed(2) + '%'
            }
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
};

/**
 * Trigger manual analytics calculation (admin only)
 */
exports.calculateAnalytics = async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date ? new Date(date) : new Date();

        await analyticsService.calculateDailyAnalytics(targetDate);

        res.json({ message: 'Analytics calculated successfully' });

    } catch (error) {
        console.error('Calculate analytics error:', error);
        res.status(500).json({ error: 'Failed to calculate analytics' });
    }
};
