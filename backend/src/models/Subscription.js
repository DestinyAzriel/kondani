const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['1_week', '1_month', '1_year', '3_months', '6_months', '12_months'],
        required: true
    },
    tier: {
        type: String,
        enum: ['plus', 'gold', 'platinum'],
        default: 'gold'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'MWK'
    },
    paymentMethod: {
        type: String,
        default: 'paychangu'
    },
    transactionId: String,
    autoRenew: {
        type: Boolean,
        default: false
    },
    features: {
        unlimitedSwipes: { type: Boolean, default: true },
        seeWhoLikesYou: { type: Boolean, default: true },
        globalPassport: { type: Boolean, default: true },
        priorityVisibility: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Index for finding active subscriptions
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' && this.endDate > new Date();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
