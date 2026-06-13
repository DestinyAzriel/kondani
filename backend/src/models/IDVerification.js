const mongoose = require('mongoose');

// Selfie / photo verification (Tinder-style), replacing national-ID upload.
// The face match is computed client-side with the open-source face-api.js and
// the score is submitted here. Above a threshold we auto-approve; otherwise it
// waits for manual admin review. Model name kept as 'IDVerification' so existing
// admin queries keep working; collection just stores selfie data now.
const photoVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    selfieUrl: {
        type: String,
        required: true
    },
    poseChallenge: String,        // e.g. 'turn_head_left', 'smile', 'point_up'
    faceMatchScore: Number,       // 0-100 similarity vs profile photo (face-api.js)
    livenessPassed: Boolean,      // basic liveness from the pose challenge
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: String,
    metadata: {
        ipAddress: String,
        userAgent: String
    }
}, { timestamps: true });

module.exports = mongoose.model('IDVerification', photoVerificationSchema);
