import { api } from './authService';

class SubscriptionService {
    // Get available plans
    async getPlans() {
        const response = await api.get('/subscription/plans');
        return response.data;
    }

    // Initiate payment
    async initiatePayment(plan, paymentMethod, phoneNumber) {
        const response = await api.post('/subscription/initiate', {
            plan,
            paymentMethod,
            phoneNumber
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

    // Poll payment status
    async pollPaymentStatus(referenceId, maxAttempts = 60, interval = 3000) {
        for (let i = 0; i < maxAttempts; i++) {
            const result = await this.checkPaymentStatus(referenceId);

            if (result.status === 'completed' || result.status === 'failed') {
                return result;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error('Payment status check timeout');
    }
}

export default new SubscriptionService();
