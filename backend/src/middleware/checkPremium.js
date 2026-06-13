const User = require('../models/User');

/**
 * Middleware to check if user has active premium subscription
 */
const checkPremium = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('isPremium premiumUntil');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if premium is active and not expired
        const isPremiumActive = user.isPremium && user.premiumUntil && user.premiumUntil > new Date();

        if (!isPremiumActive) {
            // Update user if premium expired
            if (user.isPremium && (!user.premiumUntil || user.premiumUntil <= new Date())) {
                user.isPremium = false;
                await user.save();
            }

            return res.status(403).json({
                error: 'Premium subscription required',
                message: 'This feature is only available for premium members',
                upgradeUrl: '/premium'
            });
        }

        // Attach premium status to request
        req.isPremium = true;
        next();

    } catch (error) {
        console.error('Premium check error:', error);
        res.status(500).json({ error: 'Failed to verify premium status' });
    }
};

module.exports = checkPremium;
