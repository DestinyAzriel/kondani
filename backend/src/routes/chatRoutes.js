const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chat media (voice notes, images). Local disk for now; move to Cloudinary at deploy.
const CHAT_DIR = 'uploads/chat-media/';
fs.mkdirSync(CHAT_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CHAT_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.webm';
    cb(null, 'cm-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

router.get('/', authMiddleware, chatController.getChats);
router.post('/upload', authMiddleware, upload.single('file'), chatController.uploadChatMedia);
router.get('/:id/messages', authMiddleware, chatController.getMessages);
router.post('/:id/messages', authMiddleware, chatController.sendMessage);
router.post('/online', authMiddleware, chatController.setUserOnline);
router.post('/offline', authMiddleware, chatController.setUserOffline);
router.post('/typing', authMiddleware, chatController.setTyping);

module.exports = router;