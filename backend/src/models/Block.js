const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blockerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: String
}, { timestamps: true });

// Compound index to prevent duplicate blocks and enable fast lookups
blockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
blockSchema.index({ blockedUserId: 1 });

module.exports = mongoose.model('Block', blockSchema);
