const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Buffered in memory → Cloudinary (disk fallback) via the controller.
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        return /image\/(jpeg|jpg|png)/.test(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only JPEG/PNG images are allowed'));
    }
});

// Selfie verification (Tinder-style, face-api.js score computed in the browser)
router.post('/selfie', authMiddleware, upload.single('selfie'), verificationController.submitPhotoVerification);
router.get('/status', authMiddleware, verificationController.getVerificationStatus);
router.post('/review/:verificationId', authMiddleware, verificationController.reviewVerification); // admin

module.exports = router;
