const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
}));

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

module.exports = router;
