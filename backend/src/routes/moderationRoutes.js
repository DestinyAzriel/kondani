const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const authMiddleware = require('../middleware/auth');

// User actions
router.post('/report', authMiddleware, moderationController.reportUser);
router.post('/block', authMiddleware, moderationController.blockUser);
router.post('/unblock', authMiddleware, moderationController.unblockUser);
router.get('/blocked-users', authMiddleware, moderationController.getBlockedUsers);

// Admin actions
router.get('/reports', authMiddleware, moderationController.getAllReports);
router.post('/reports/:reportId/review', authMiddleware, moderationController.reviewReport);

module.exports = router;
