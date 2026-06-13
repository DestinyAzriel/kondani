const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google OAuth Strategy (only if credentials provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: (process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/api/oauth/callback') + '/google'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0]?.value,
                        photos: [profile.photos[0]?.value],
                        phoneNumber: `google_${profile.id}`,
                        verification: {
                            phone: { verified: true, verifiedAt: new Date() }
                        }
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }));
    console.log('✅ Google OAuth configured');
} else {
    console.log('⚠️  Google OAuth not configured - skipping');
}

// Facebook OAuth Strategy (only if credentials provided)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: (process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/api/oauth/callback') + '/facebook',
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ facebookId: profile.id });

                if (!user) {
                    user = await User.create({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        photos: [profile.photos?.[0]?.value],
                        phoneNumber: `facebook_${profile.id}`,
                        verification: {
                            phone: { verified: true, verifiedAt: new Date() }
                        }
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }));
    console.log('✅ Facebook OAuth configured');
} else {
    console.log('⚠️  Facebook OAuth not configured - skipping');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
