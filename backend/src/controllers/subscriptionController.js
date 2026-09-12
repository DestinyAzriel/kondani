const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const crypto = require('crypto');

// Pricing plans (in MWK)
const PLANS = {
    '1_week': {
        id: '1_week',
        tier: 'plus',
        name: '1 Week Plus',
        price: 600,
        duration: 7,
        badge: 'Plus',
        features: [
            'Unlimited likes every day',
            'Rewind accidental left-swipes',
            '2 Super Likes every day',
            'See how many people liked you'
        ]
    },
    '1_month': {
        id: '1_month',
        tier: 'gold',
        name: '1 Month Gold',
        price: 2400,
        duration: 30,
        badge: 'Gold',
        popular: true,
        features: [
            'See who likes you & match instantly',
            'Unlimited likes every day',
            '5 Super Likes every day',
            '1 Monthly Profile Boost (10x views)',
            'Rewind accidental left-swipes',
            'Exclusive Gold badge on profile'
        ]
    },
    '1_year': {
        id: '1_year',
        tier: 'platinum',
        name: '1 Year VIP Platinum',
        price: 6000,
        duration: 365,
        badge: 'VIP Platinum',
        bestValue: true,
        features: [
            'Priority Likes (your likes seen first)',
            'See who likes you & match instantly',
            'Unlimited likes every day',
            '10 Super Likes every day',
            '3 Monthly Profile Boosts',
            'Rewind accidental left-swipes',
            'Exclusive VIP Platinum badge'
        ]
    }
};

/**
 * Get available subscription plans
 */
exports.getPlans = async (req, res) => {
    try {
        res.json({
            plans: Object.values(PLANS),
            currency: 'MWK'
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get plans' });
    }
};

/**
 * Initiate subscription payment session with PayChangu
 */
exports.initiatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan = '1_month' } = req.body;

        // Validate plan
        const selectedPlan = PLANS[plan];
        if (!selectedPlan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const amount = selectedPlan.price;
        const referenceId = `KON-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Determine client return URL and backend callback webhook URL
        const originHeader = req.headers.origin || req.headers.referer;
        let clientOrigin = 'http://localhost:5173';
        if (originHeader) {
            try {
                const url = new URL(originHeader);
                clientOrigin = `${url.protocol}//${url.host}`;
            } catch (_) {}
        } else if (process.env.CLIENT_ORIGIN) {
            clientOrigin = process.env.CLIENT_ORIGIN.split(',')[0].trim();
        }

        // PayChangu browser redirect destinations:
        // - callback_url: customer is redirected here on payment SUCCESS (PayChangu appends tx_ref query param)
        // - return_url: customer is redirected here on payment CANCEL or FAILURE
        const callbackUrl = `${clientOrigin}/premium?status=success`;
        const returnUrl = `${clientOrigin}/premium?status=cancelled`;

        // Split name into first and last if available
        const nameParts = (user.name || 'Kondani Member').trim().split(/\s+/);
        const firstName = nameParts[0] || 'Kondani';
        const lastName = nameParts.slice(1).join(' ') || 'Member';

        // Initiate checkout session on PayChangu
        const paymentResult = await paymentService.createPaymentSession({
            amount,
            currency: 'MWK',
            tx_ref: referenceId,
            first_name: firstName,
            last_name: lastName,
            email: user.email || `${user.phoneNumber.replace(/[^0-9]/g, '')}@kondani.mw`,
            callback_url: callbackUrl,
            return_url: returnUrl,
            title: `Kondani ${selectedPlan.name}`,
            description: `Unlock Kondani Gold (${selectedPlan.name})`
        });

        if (!paymentResult.success || !paymentResult.checkoutUrl) {
            return res.status(502).json({
                error: paymentResult.message || 'Payment gateway initiation failed'
            });
        }

        // Create pending subscription record
        const subscription = await Subscription.create({
            userId,
            plan,
            status: 'pending',
            amount,
            currency: 'MWK',
            paymentMethod: 'paychangu',
            transactionId: referenceId
        });

        // Create payment tracking record
        await Payment.create({
            userId,
            subscriptionId: subscription._id,
            amount,
            currency: 'MWK',
            paymentMethod: 'paychangu',
            phoneNumber: user.phoneNumber,
            referenceId,
            checkoutUrl: paymentResult.checkoutUrl,
            status: 'pending',
            gatewayResponse: paymentResult.rawResponse,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                initiatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Payment session created',
            checkoutUrl: paymentResult.checkoutUrl,
            referenceId,
            amount,
            currency: 'MWK',
            plan: selectedPlan
        });

    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ error: 'Failed to initiate payment: ' + error.message });
    }
};

/**
 * Check payment status and activate subscription if confirmed
 */
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { referenceId } = req.params;

        const payment = await Payment.findOne({ referenceId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment transaction not found' });
        }

        // If already completed, return activated status immediately
        if (payment.status === 'completed') {
            const subscription = await Subscription.findById(payment.subscriptionId);
            return res.json({
                status: 'completed',
                message: 'Payment verified and active',
                subscription
            });
        }

        // Check live status with PayChangu
        const statusResult = await paymentService.verifyPayment(referenceId);

        if (statusResult.status === 'completed') {
            payment.status = 'completed';
            payment.gatewayResponse = statusResult.rawResponse;
            if (statusResult.reference) {
                payment.transactionId = statusResult.reference;
            }
            if (!payment.metadata) payment.metadata = {};
            payment.metadata.completedAt = new Date();
            await payment.save();

            // Activate subscription
            const subscription = await Subscription.findById(payment.subscriptionId);
            const planConfig = PLANS[payment.plan || subscription?.plan] || PLANS['1_month'];
            if (subscription) {
                subscription.status = 'active';
                subscription.tier = planConfig.tier;
                subscription.startDate = new Date();
                subscription.endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);
                if (statusResult.reference) {
                    subscription.transactionId = statusResult.reference;
                }
                await subscription.save();
            }

            // Update user premium status
            const user = await User.findById(payment.userId);
            if (user) {
                user.isPremium = true;
                user.subscriptionTier = planConfig.tier;
                user.premiumUntil = subscription ? subscription.endDate : new Date(Date.now() + planConfig.duration * 86400000);
                await user.save();
            }

            // Notify real-time client if Socket.io is connected
            const io = req.app.get('io');
            if (io && payment.userId) {
                io.to(payment.userId.toString()).emit('subscription_activated', {
                    isPremium: true,
                    subscriptionTier: planConfig.tier,
                    premiumUntil: user ? user.premiumUntil : null
                });
            }

            return res.json({
                status: 'completed',
                message: `Payment confirmed! Welcome to Kondani ${planConfig.badge}.`,
                subscriptionTier: planConfig.tier,
                subscription
            });
        }

        if (statusResult.status === 'failed') {
            payment.status = 'failed';
            payment.failureReason = statusResult.message || 'Payment failed';
            payment.gatewayResponse = statusResult.rawResponse;
            await payment.save();

            await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: 'cancelled' });

            return res.json({
                status: 'failed',
                message: 'Payment was not completed.',
                payment
            });
        }

        // Still pending
        return res.json({
            status: 'pending',
            message: 'Payment is pending customer confirmation.',
            checkoutUrl: payment.checkoutUrl,
            referenceId
        });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({ error: 'Failed to check payment status: ' + error.message });
    }
};

/**
 * Handle PayChangu Webhook
 */
exports.handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['signature'];
        const rawBody = req.rawBody;

        // Verify signature if provided
        if (signature && rawBody) {
            const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
            if (!isValid) {
                console.warn('PayChangu webhook signature mismatch');
                return res.status(403).json({ error: 'Invalid signature' });
            }
        }

        const payload = req.body || {};
        console.log('PayChangu Webhook received:', JSON.stringify(payload));

        const txRef = payload.tx_ref || payload.data?.tx_ref || payload.reference;
        if (!txRef) {
            return res.status(400).json({ error: 'Missing tx_ref in webhook payload' });
        }

        const payment = await Payment.findOne({ referenceId: txRef });
        if (!payment) {
            console.warn(`Webhook received for unknown reference: ${txRef}`);
            return res.status(200).json({ received: true, note: 'Payment record not found' });
        }

        // Verify directly with PayChangu to confirm legitimate status
        const statusResult = await paymentService.verifyPayment(txRef);

        if (statusResult.status === 'completed' && payment.status !== 'completed') {
            payment.status = 'completed';
            payment.gatewayResponse = statusResult.rawResponse;
            if (statusResult.reference) {
                payment.transactionId = statusResult.reference;
            }
            if (!payment.metadata) payment.metadata = {};
            payment.metadata.completedAt = new Date();
            await payment.save();

            const subscription = await Subscription.findById(payment.subscriptionId);
            const planConfig = PLANS[payment.plan || subscription?.plan] || PLANS['1_month'];
            if (subscription) {
                subscription.status = 'active';
                subscription.tier = planConfig.tier;
                subscription.startDate = new Date();
                subscription.endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);
                if (statusResult.reference) {
                    subscription.transactionId = statusResult.reference;
                }
                await subscription.save();
            }

            const user = await User.findById(payment.userId);
            if (user) {
                user.isPremium = true;
                user.subscriptionTier = planConfig.tier;
                user.premiumUntil = subscription ? subscription.endDate : new Date(Date.now() + planConfig.duration * 86400000);
                await user.save();
            }

            const io = req.app.get('io');
            if (io && payment.userId) {
                io.to(payment.userId.toString()).emit('subscription_activated', {
                    isPremium: true,
                    subscriptionTier: planConfig.tier,
                    premiumUntil: user ? user.premiumUntil : null
                });
            }

            console.log(`Successfully activated ${planConfig.badge} subscription for user ${payment.userId} via webhook`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('PayChangu webhook error:', error);
        res.status(500).json({ error: 'Webhook processing error' });
    }
};

/**
 * Get user's current subscription status
 */
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await Subscription.findOne({
            userId,
            status: 'active'
        }).sort({ createdAt: -1 });

        const user = await User.findById(userId).select('isPremium subscriptionTier premiumUntil');

        res.json({
            isPremium: Boolean(user?.isPremium && (!user.premiumUntil || new Date(user.premiumUntil) > new Date())),
            subscriptionTier: user?.subscriptionTier || 'free',
            premiumUntil: user?.premiumUntil || null,
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

/**
 * Handle GET redirect if PayChangu redirects the browser to /api/subscription/webhook
 */
exports.handleWebhookRedirect = (req, res) => {
    const txRef = req.query.tx_ref || req.query.ref || '';
    const origin = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',')[0].trim() : 'http://localhost:5173';
    return res.redirect(`${origin}/premium?status=success&tx_ref=${encodeURIComponent(txRef)}`);
};
