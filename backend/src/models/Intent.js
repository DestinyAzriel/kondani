const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    passes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Targets this user Super Liked (subset of likes — for the star + "stood out")
    superLikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Each user has exactly one Intent document — enforce uniqueness & fast lookup
intentSchema.index({ user: 1 }, { unique: true });
// Speed up mutual-like check: Intent.find({ user: { $in:[...] }, likes: currentUserId })
intentSchema.index({ likes: 1 });

module.exports = mongoose.model('Intent', intentSchema);
