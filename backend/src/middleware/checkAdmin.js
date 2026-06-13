const User = require('../models/User');

/**
 * Middleware to check if user is admin
 */
const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('role');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'admin' && user.role !== 'moderator') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin privileges required'
            });
        }

        req.userRole = user.role;
        next();

    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Failed to verify admin status' });
    }
};

module.exports = checkAdmin;
