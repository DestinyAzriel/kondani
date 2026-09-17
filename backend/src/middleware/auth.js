const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kondani_secret_key_2024');
        const user = await User.findById(decoded.id).select('_id role email phoneNumber isBanned');
        
        if (!user) {
            return res.status(401).json({ error: 'User session has expired. Please sign in again.' });
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Account has been suspended' });
        }

        req.user = decoded;
        req.userDoc = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};
