const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');

// All routes require auth + admin
router.use(authMiddleware, checkAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/revenue', adminController.getRevenueAnalytics);

// Analytics
router.get('/analytics', analyticsController.getAnalytics);
router.post('/analytics/calculate', analyticsController.calculateAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Verifications (Selfie / ID)
router.get('/verifications', adminController.getVerifications);
router.post('/verifications/:verificationId/review', adminController.reviewVerification);

// Moderation & Reports
router.get('/reports', adminController.getReports);
router.post('/reports/:reportId/review', adminController.reviewReport);

module.exports = router;
