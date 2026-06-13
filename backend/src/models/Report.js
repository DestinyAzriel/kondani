const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['harassment', 'fake_profile', 'inappropriate_content', 'scam', 'spam', 'other'],
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved', 'dismissed'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    action: {
        type: String,
        enum: ['none', 'warning', 'temporary_ban', 'permanent_ban', 'account_deleted'],
        default: 'none'
    },
    actionNotes: String
}, { timestamps: true });

// Indexes
reportSchema.index({ reportedUserId: 1, status: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
