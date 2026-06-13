const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const crypto = require('crypto');

// Pricing plans (in MWK)
const PLANS = {
    '1_month': { price: 3000, duration: 30 },
    '6_months': { price: 15000, duration: 180 },
    '12_months': { price: 24000, duration: 365 }
};

/**
 * Get available subscription plans
 */
exports.getPlans = async (req, res) => {
    try {
        res.json({
            plans: [
                { id: '1_month', name: '1 Month', price: 3000, duration: 30, savings: 0 },
                { id: '6_months', name: '6 Months', price: 15000, duration: 180, savings: 17 },
                { id: '12_months', name: '12 Months', price: 24000, duration: 365, savings: 33 }
            ],
            currency: 'MWK',
            features: [
                'See who likes you',
                'Unlimited swipes',
                'Global Passport (all regions)',
                'Priority visibility'
            ]
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plans' });
    }
};

/**
 * Initiate subscription payment
 */
exports.initiatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan, paymentMethod, phoneNumber } = req.body;

        // Validate plan
        if (!PLANS[plan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Validate payment method
        if (!['airtel_money', 'mpamba'].includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        const amount = PLANS[plan].price;
        const referenceId = `KON-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Create pending subscription
        const subscription = await Subscription.create({
            userId,
            plan,
            status: 'pending',
            amount,
            paymentMethod
        });

        // Create payment record
        const payment = await Payment.create({
            userId,
            subscriptionId: subscription._id,
            amount,
            paymentMethod,
            phoneNumber,
            referenceId,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                initiatedAt: new Date()
            }
        });

        // Initiate payment with gateway
        let paymentResult;
        if (paymentMethod === 'airtel_money') {
            paymentResult = await paymentService.initiateAirtelMoney(phoneNumber, amount, referenceId);
        } else {
            paymentResult = await paymentService.initiateMpamba(phoneNumber, amount, referenceId);
        }

        // Update payment with gateway response
        payment.status = paymentResult.status;
        payment.transactionId = paymentResult.transactionId;
        payment.gatewayResponse = paymentResult.rawResponse;
        if (!paymentResult.success) {
            payment.failureReason = paymentResult.message;
        }
        await payment.save();

        if (!paymentResult.success) {
            subscription.status = 'cancelled';
            await subscription.save();
            return res.status(400).json({
                error: paymentResult.message,
                referenceId
            });
        }

        res.json({
            message: 'Payment initiated. Please approve on your phone.',
            referenceId,
            transactionId: paymentResult.transactionId,
            amount,
            paymentMethod
        });

    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

/**
 * Check payment status
 */
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { referenceId } = req.params;

        const payment = await Payment.findOne({ referenceId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // If already completed or failed, return current status
        if (['completed', 'failed', 'cancelled'].includes(payment.status)) {
            return res.json({ status: payment.status, payment });
        }

        // Check status with gateway
        let statusResult;
        if (payment.paymentMethod === 'airtel_money') {
            statusResult = await paymentService.checkAirtelStatus(payment.transactionId);
        } else {
            statusResult = await paymentService.checkMpambaStatus(referenceId);
        }

        payment.status = statusResult.status;
        payment.gatewayResponse = statusResult.rawResponse;

        // If payment completed, activate subscription
        if (statusResult.status === 'completed') {
            payment.metadata.completedAt = new Date();
            await payment.save();

            const subscription = await Subscription.findById(payment.subscriptionId);
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = new Date(Date.now() + PLANS[subscription.plan].duration * 24 * 60 * 60 * 1000);
            subscription.transactionId = payment.transactionId;
            await subscription.save();

            // Update user premium status
            const user = await User.findById(payment.userId);
            user.isPremium = true;
            user.premiumUntil = subscription.endDate;
            await user.save();

            return res.json({
                status: 'completed',
                message: 'Payment successful! Premium activated.',
                subscription
            });
        }

        if (statusResult.status === 'failed') {
            payment.failureReason = 'Payment failed';
            await payment.save();

            const subscription = await Subscription.findById(payment.subscriptionId);
            subscription.status = 'cancelled';
            await subscription.save();
        }

        await payment.save();
        res.json({ status: payment.status, payment });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
};

/**
 * Get user's subscription status
 */
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await Subscription.findOne({
            userId,
            status: 'active'
        }).sort({ createdAt: -1 });

        const user = await User.findById(userId).select('isPremium premiumUntil');

        res.json({
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
            subscription: subscription || null
        });

    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await Subscription.findOne({
            userId,
            status: 'active'
        });

        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();

        res.json({ message: 'Subscription cancelled successfully', subscription });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};
