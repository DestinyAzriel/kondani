const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    metrics: {
        // User metrics
        dau: Number, // Daily Active Users
        newUsers: Number,
        totalUsers: Number,

        // Engagement metrics
        matches: Number,
        messages: Number,
        videoCall: Number,
        swipes: Number,

        // Premium metrics
        premiumSignups: Number,
        premiumCancellations: Number,
        totalPremiumUsers: Number,

        // Revenue metrics
        revenue: Number,
        transactions: Number,

        // Safety metrics
        reports: Number,
        blocks: Number
    }
}, { timestamps: true });

// Compound index for efficient queries
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
