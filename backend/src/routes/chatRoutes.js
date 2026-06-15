const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Chat media (voice notes, images). Buffered in memory → Cloudinary (disk fallback).
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

router.get('/', authMiddleware, chatController.getChats);
router.post('/upload', authMiddleware, upload.single('file'), chatController.uploadChatMedia);
router.get('/:id/messages', authMiddleware, chatController.getMessages);
router.post('/:id/messages', authMiddleware, chatController.sendMessage);
router.post('/online', authMiddleware, chatController.setUserOnline);
router.post('/offline', authMiddleware, chatController.setUserOffline);
router.post('/typing', authMiddleware, chatController.setTyping);

module.exports = router;