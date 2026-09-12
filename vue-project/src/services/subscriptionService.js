import { api } from './authService';

class SubscriptionService {
    // Get available plans
    async getPlans() {
        const response = await api.get('/subscription/plans');
        return response.data;
    }

    // Initiate PayChangu checkout session
    async initiatePayment(plan = '1_month') {
        const response = await api.post('/subscription/initiate', {
            plan
        });
        return response.data;
    }

    // Check payment status
    async checkPaymentStatus(referenceId) {
        const response = await api.get(`/subscription/payment-status/${referenceId}`);
        return response.data;
    }

    // Get subscription status
    async getSubscriptionStatus() {
        const response = await api.get('/subscription/status');
        return response.data;
    }

    // Cancel subscription
    async cancelSubscription() {
        const response = await api.post('/subscription/cancel');
        return response.data;
    }

    // Poll payment status with friendly timeout
    async pollPaymentStatus(referenceId, maxAttempts = 20, interval = 3000) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const result = await this.checkPaymentStatus(referenceId);
                if (result.status === 'completed' || result.status === 'failed') {
                    return result;
                }
            } catch (err) {
                console.warn('Poll attempt error:', err.message);
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        return { status: 'pending', message: 'Payment confirmation is still processing.' };
    }
}

export default new SubscriptionService();
