const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
router.get('/profile', authMiddleware, authController.getProfile);
// Add the profile update route with file upload support
router.put('/profile', authMiddleware, upload.array('photos', 6), authController.updateProfile);
// Health check endpoint (no authentication required)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;