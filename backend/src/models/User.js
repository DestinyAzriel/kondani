const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: String,
    googleId: String,
    facebookId: String,
    name: String,
    age: Number,
    gender: String,
    bio: String,
    photos: [String],
    interests: [String],
    district: String, // e.g. 'Lilongwe', 'Chitipa'
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verification: {
        phone: {
            verified: { type: Boolean, default: false },
            verifiedAt: Date
        },
        id: {
            verified: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ['none', 'pending', 'approved', 'rejected'],
                default: 'none'
            },
            documentType: {
                type: String,
                enum: ['national_id', 'passport', null],
                default: null
            },
            documentUrl: String,
            submittedAt: Date,
            reviewedAt: Date,
            rejectionReason: String
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumUntil: Date,
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: String,
    bannedUntil: Date, // null = permanent ban
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    fcmToken: String, // Firebase Cloud Messaging token for push notifications
    isProfileComplete: {
        type: Boolean,
        default: false
    },

    // New competitive features
    prompts: [{
        id: String,
        question: String,
        answer: String,
        category: String
    }],
    voiceIntro: String, // URL to voice recording
    lastSeen: {
        type: Number,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    dailyPicks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastPicksDate: Date,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    passes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    preferences: {
        ageMin: { type: Number, default: 18 },
        ageMax: { type: Number, default: 60 },
        distance: { type: Number, default: 100 }, // km
        gender: { type: String, default: 'Everyone' },
        verifiedOnly: { type: Boolean, default: false }
    },

    lastActive: Date,

    // Free-tier daily like cap (Gold members are unlimited)
    likesToday: { type: Number, default: 0 },
    likesTodayDate: { type: String, default: '' }, // YYYY-MM-DD
    // Super Likes per day (Free 1 / Gold 5)
    superLikesToday: { type: Number, default: 0 },
    superLikesTodayDate: { type: String, default: '' }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
