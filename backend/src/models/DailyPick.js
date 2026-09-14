const mongoose = require('mongoose');

const dailyPickSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // The cycle identifier representing the 24h period anchored at 18:00 (e.g. "2026-09-14")
    cycleDate: {
        type: String,
        required: true,
        index: true
    },
    // The real candidate profiles chosen for this cycle
    picks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Candidates from this batch that the user has already interacted with (liked or passed)
    swiped: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

dailyPickSchema.index({ user: 1, cycleDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyPick', dailyPickSchema);
