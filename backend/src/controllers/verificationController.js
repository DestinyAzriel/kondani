const IDVerification = require('../models/IDVerification');
const User = require('../models/User');
const { storeUpload } = require('../services/cloudinaryService');
const faceVerify = require('../services/faceVerificationService');

// Auto-approve when AWS Rekognition similarity (computed server-side, can't be
// faked) is at least this %. Same-person matches typically score 95-99.
const AUTO_APPROVE_SIMILARITY = 88;

/**
 * Submit a selfie for verification.
 * Body: faceMatchScore (0-100), poseChallenge (string), livenessPassed (bool)
 * File: 'selfie'
 */
exports.submitPhotoVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { poseChallenge } = req.body;

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

        // Keep the raw selfie bytes for the face match, and store a copy for records.
        const selfieBuffer = req.file.buffer;
        const selfieUrl = await storeUpload(req.file, 'selfies', 'image');

        // Resolve the profile photo to a fetchable absolute URL.
        let profilePhoto = user.photos[0];
        if (profilePhoto && !/^https?:/i.test(profilePhoto)) {
            const origin = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
            profilePhoto = origin + (profilePhoto.startsWith('/') ? '' : '/') + profilePhoto;
        }

        let similarity = 0;
        let passed = false;
        let status = 'pending';
        let message = '';

        if (faceVerify.isConfigured()) {
            try {
                const result = await faceVerify.compareFaces(profilePhoto, selfieBuffer);
                similarity = Math.round(result.similarity);
                passed = result.matched && similarity >= AUTO_APPROVE_SIMILARITY;
                status = passed ? 'approved' : 'rejected';
                message = passed
                    ? 'You are verified! 🎉'
                    : 'That selfie didn\'t clearly match your profile photo. Face the camera in good lighting and try again.';
            } catch (err) {
                console.error('Rekognition compare failed:', err?.name || err?.message);
                status = 'rejected';
                message = 'We couldn\'t read a clear face. Make sure your face — and your main profile photo — are clearly visible, then try again.';
            }
        } else {
            // Verification not configured yet — leave pending, don't auto-decide.
            status = 'pending';
            message = 'Selfie received — verification is being set up. Please check back soon.';
        }

        const data = {
            userId,
            selfieUrl,
            poseChallenge,
            faceMatchScore: similarity,
            livenessPassed: true,
            status,
            metadata: { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        };

        let verification = await IDVerification.findOne({ userId });
        if (verification) {
            Object.assign(verification, data);
            verification.reviewedAt = passed ? new Date() : undefined;
            await verification.save();
        } else {
            verification = await IDVerification.create({
                ...data,
                reviewedAt: passed ? new Date() : undefined
            });
        }

        // Reflect on the user
        user.verification.id.status = status;
        user.verification.id.submittedAt = new Date();
        user.verification.id.verified = passed;
        if (passed) {
            user.verification.id.reviewedAt = new Date();
            user.isVerified = true;
        } else {
            user.isVerified = false;
        }
        await user.save();

        res.json({ status, verified: passed, faceMatchScore: similarity, message });
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
