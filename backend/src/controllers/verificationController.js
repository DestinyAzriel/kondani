const IDVerification = require('../models/IDVerification');
const User = require('../models/User');

// Auto-approve when the browser-side face-api.js similarity is at least this %.
// Score = round((1 - euclideanDistance) * 100); a distance < ~0.5 (a solid
// same-person match) maps to >= 50. Borderline cases fall to manual review.
const AUTO_APPROVE_THRESHOLD = 50;

/**
 * Submit a selfie for verification.
 * Body: faceMatchScore (0-100), poseChallenge (string), livenessPassed (bool)
 * File: 'selfie'
 */
exports.submitPhotoVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceMatchScore, poseChallenge, livenessPassed } = req.body;

        if (!req.file) {
            return res.status(400).json({
                error: 'No selfie uploaded',
                message: 'Please take a selfie to verify your profile.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.photos || user.photos.length === 0) {
            return res.status(400).json({
                error: 'Profile photo required',
                message: 'Please add at least one profile photo before verifying.'
            });
        }

        const selfieUrl = `/uploads/selfies/${req.file.filename}`;
        const score = Number(faceMatchScore) || 0;
        const live = livenessPassed === 'true' || livenessPassed === true;
        const passed = score >= AUTO_APPROVE_THRESHOLD && live;
        const status = passed ? 'approved' : 'pending';

        const data = {
            userId,
            selfieUrl,
            poseChallenge,
            faceMatchScore: score,
            livenessPassed: live,
            status,
            metadata: { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        };

        let verification = await IDVerification.findOne({ userId });
        if (verification) {
            Object.assign(verification, data);
            if (passed) verification.reviewedAt = new Date();
            await verification.save();
        } else {
            verification = await IDVerification.create({
                ...data,
                reviewedAt: passed ? new Date() : undefined
            });
        }

        // Reflect on the user (admin counts verification.id.verified)
        user.verification.id.status = status;
        user.verification.id.submittedAt = new Date();
        if (passed) {
            user.verification.id.verified = true;
            user.verification.id.reviewedAt = new Date();
            user.isVerified = true;
        }
        await user.save();

        res.json({
            status,
            verified: passed,
            faceMatchScore: score,
            message: passed
                ? 'You are verified! 🎉'
                : 'Selfie submitted — we will review it shortly.'
        });
    } catch (error) {
        console.error('submitPhotoVerification error:', error);
        res.status(500).json({
            error: 'Failed to submit verification',
            message: 'An unexpected error occurred. Please try again.'
        });
    }
};

/**
 * Get current user's verification status.
 */
exports.getVerificationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('verification isVerified');
        const record = await IDVerification.findOne({ userId: req.user.id });
        res.json({
            isVerified: user?.isVerified || false,
            phone: user?.verification?.phone,
            selfie: {
                status: user?.verification?.id?.status || 'none',
                faceMatchScore: record?.faceMatchScore,
                submittedAt: user?.verification?.id?.submittedAt,
                rejectionReason: user?.verification?.id?.rejectionReason
            }
        });
    } catch (error) {
        console.error('getVerificationStatus error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
};

/**
 * Review a verification (admin). Body: { status: 'approved'|'rejected', rejectionReason? }
 */
exports.reviewVerification = async (req, res) => {
    try {
        const { verificationId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const verification = await IDVerification.findById(verificationId);
        if (!verification) {
            return res.status(404).json({ error: 'Verification not found' });
        }

        verification.status = status;
        verification.reviewedBy = req.user.id;
        verification.reviewedAt = new Date();
        if (rejectionReason) verification.rejectionReason = rejectionReason;
        await verification.save();

        const user = await User.findById(verification.userId);
        if (user) {
            user.verification.id.status = status;
            user.verification.id.verified = status === 'approved';
            user.verification.id.reviewedAt = new Date();
            if (rejectionReason) user.verification.id.rejectionReason = rejectionReason;
            user.isVerified = status === 'approved';
            await user.save();
        }

        res.json({ message: `Verification ${status}`, verification });
    } catch (error) {
        console.error('reviewVerification error:', error);
        res.status(500).json({ error: 'Failed to review verification' });
    }
};
