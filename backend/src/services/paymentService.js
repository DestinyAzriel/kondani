const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
    constructor() {
        this.baseUrl = process.env.PAYCHANGU_BASE_URL || 'https://api.paychangu.com';
        this.secretKey = process.env.PAYCHANGU_SECRET_KEY;
        this.publicKey = process.env.PAYCHANGU_PUBLIC_KEY;
    }

    /**
     * Get request headers for PayChangu API
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.secretKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Create a hosted payment checkout session
     * @param {Object} data
     * @param {number} data.amount
     * @param {string} data.currency - 'MWK'
     * @param {string} data.tx_ref - Unique reference
     * @param {string} data.first_name
     * @param {string} [data.last_name]
     * @param {string} [data.email]
     * @param {string} data.callback_url - Webhook/IPN URL
     * @param {string} data.return_url - Frontend return URL after payment
     * @param {string} [data.title] - Customization title
     * @param {string} [data.description] - Customization description
     */
    async createPaymentSession({
        amount,
        currency = 'MWK',
        tx_ref,
        first_name,
        last_name,
        email,
        callback_url,
        return_url,
        title = 'Kondani Gold Subscription',
        description = 'Premium subscription on Kondani'
    }) {
        try {
            const payload = {
                amount,
                currency,
                tx_ref,
                first_name: first_name || 'Kondani',
                last_name: last_name || 'Member',
                email: email || 'user@kondani.mw',
                callback_url,
                return_url,
                customization: {
                    title,
                    description
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/payment`,
                payload,
                { headers: this.getHeaders() }
            );

            if (response.data && response.data.status === 'success') {
                return {
                    success: true,
                    checkoutUrl: response.data.data?.checkout_url,
                    tx_ref: response.data.data?.data?.tx_ref || tx_ref,
                    rawResponse: response.data
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Failed to generate payment session',
                rawResponse: response.data
            };

        } catch (error) {
            console.error('PayChangu session creation error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Payment initiation failed',
                rawResponse: error.response?.data
            };
        }
    }

    /**
     * Verify payment status using tx_ref
     * @param {string} tx_ref
     */
    async verifyPayment(tx_ref) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/verify-payment/${encodeURIComponent(tx_ref)}`,
                { headers: this.getHeaders() }
            );

            const resData = response.data;
            if (resData && resData.status === 'success') {
                const paymentData = resData.data;
                const isPaid = paymentData?.status === 'success';

                return {
                    success: isPaid,
                    status: isPaid ? 'completed' : (paymentData?.status || 'processing'),
                    amount: paymentData?.amount,
                    currency: paymentData?.currency,
                    reference: paymentData?.reference,
                    channel: paymentData?.authorization?.channel,
                    rawResponse: resData
                };
            }

            return {
                success: false,
                status: resData?.data?.status || 'failed',
                message: resData?.message || 'Verification failed',
                rawResponse: resData
            };

        } catch (error) {
            const errorData = error.response?.data;
            // PayChangu returns 400 when session is created but customer hasn't completed payment yet
            if (errorData?.data?.status === 'pending') {
                return {
                    success: false,
                    status: 'pending',
                    message: errorData.message || 'Payment pending on customer phone',
                    rawResponse: errorData
                };
            }

            console.error('PayChangu verify error:', errorData || error.message);
            return {
                success: false,
                status: 'unknown',
                message: errorData?.message || error.message,
                rawResponse: errorData
            };
        }
    }

    /**
     * Verify webhook signature from PayChangu
     * @param {string|Buffer} rawBody
     * @param {string} signatureHeader
     */
    verifyWebhookSignature(rawBody, signatureHeader) {
        if (!signatureHeader || !rawBody) return false;
        try {
            const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : (typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
            const computedSignature = crypto
                .createHmac('sha256', this.secretKey)
                .update(bodyStr)
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(computedSignature, 'hex'),
                Buffer.from(signatureHeader, 'hex')
            );
        } catch (err) {
            console.error('Webhook signature verification error:', err.message);
            return false;
        }
    }

    /**
     * Get supported mobile money operators
     */
    async getOperators() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/mobile-money/`,
                { headers: this.getHeaders() }
            );
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching operators:', error.message);
            return [];
        }
    }
}

module.exports = new PaymentService();
