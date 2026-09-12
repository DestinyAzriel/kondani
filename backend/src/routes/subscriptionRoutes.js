const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

// Get available plans
router.get('/plans', subscriptionController.getPlans);

// Initiate payment for subscription
router.post('/initiate', authMiddleware, subscriptionController.initiatePayment);

// Check payment status
router.get('/payment-status/:referenceId', authMiddleware, subscriptionController.checkPaymentStatus);

// PayChangu Webhook (public endpoint for IPN notifications)
router.post('/webhook', subscriptionController.handleWebhook);
// Fallback if PayChangu redirects user browser to webhook URL
router.get('/webhook', subscriptionController.handleWebhookRedirect);

// Get user's subscription status
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);

module.exports = router;
