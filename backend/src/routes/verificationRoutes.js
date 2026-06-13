const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the selfie upload directory exists (multer diskStorage won't create it).
const SELFIE_DIR = 'uploads/selfies/';
fs.mkdirSync(SELFIE_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SELFIE_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const ok = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase())
            && /jpeg|jpg|png/.test(file.mimetype);
        return ok ? cb(null, true) : cb(new Error('Only JPEG/PNG images are allowed'));
    }
});

// Selfie verification (Tinder-style, face-api.js score computed in the browser)
router.post('/selfie', authMiddleware, upload.single('selfie'), verificationController.submitPhotoVerification);
router.get('/status', authMiddleware, verificationController.getVerificationStatus);
router.post('/review/:verificationId', authMiddleware, verificationController.reviewVerification); // admin

module.exports = router;
