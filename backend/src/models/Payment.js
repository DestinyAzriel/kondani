const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
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
        enum: ['airtel_money', 'mpamba'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    transactionId: String, // From payment gateway
    referenceId: String, // Our internal reference
    gatewayResponse: mongoose.Schema.Types.Mixed, // Raw response from gateway
    failureReason: String,
    metadata: {
        ipAddress: String,
        userAgent: String,
        initiatedAt: Date,
        completedAt: Date
    }
}, { timestamps: true });

// Index for quick lookups
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ referenceId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
