const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// In-memory storage; the controller streams buffers to Cloudinary (or disk fallback).
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit to match nginx
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/send-otp', authController.register);
router.post('/verify-otp', authController.login);
router.post('/google', authController.googleAuth);

// WhatsApp Inbound 1-Tap Verification routes
const whatsappBot = require('../services/whatsappBotService');
router.post('/whatsapp-session', (req, res) => {
  try {
    const { socketId, phone } = req.body || {};
    const session = whatsappBot.registerSession(socketId, phone);
    res.json(session);
  } catch (err) {
    console.error('Error creating WhatsApp session:', err);
    res.status(500).json({ error: 'Failed to create verification session' });
  }
});

router.get('/whatsapp-status', (req, res) => {
  try {
    const status = whatsappBot.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch WhatsApp status' });
  }
});

router.get('/whatsapp-poll/:code', (req, res) => {
  try {
    const result = whatsappBot.checkSessionStatus(req.params.code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check verification status' });
  }
});

router.get('/profile', authMiddleware, authController.getProfile);
// Add the profile update route with file upload support and clean error handling
router.put('/profile', authMiddleware, (req, res, next) => {
  upload.array('photos', 6)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'One of your photos is too large. Maximum size is 25MB.' });
      }
      return res.status(400).json({ error: `Photo upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, authController.updateProfile);
// Permanently delete the account
router.delete('/profile', authMiddleware, authController.deleteAccount);
// Health check endpoint (no authentication required)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;