const axios = require('axios');

class PaymentService {
    constructor() {
        this.airtelMoneyConfig = {
            apiKey: process.env.AIRTEL_MONEY_API_KEY,
            secret: process.env.AIRTEL_MONEY_SECRET,
            baseUrl: process.env.AIRTEL_MONEY_BASE_URL || 'https://openapiuat.airtel.africa',
            merchantId: process.env.AIRTEL_MONEY_MERCHANT_ID
        };

        this.mpambaConfig = {
            apiKey: process.env.MPAMBA_API_KEY,
            secret: process.env.MPAMBA_SECRET,
            baseUrl: process.env.MPAMBA_BASE_URL || 'https://api.mpamba.mw',
            merchantId: process.env.MPAMBA_MERCHANT_ID
        };
    }

    /**
     * Initiate Airtel Money payment
     */
    async initiateAirtelMoney(phoneNumber, amount, referenceId) {
        try {
            // Format phone number (remove +265 if present)
            const formattedPhone = phoneNumber.replace(/^\+?265/, '');

            const payload = {
                reference: referenceId,
                subscriber: {
                    country: 'MW',
                    currency: 'MWK',
                    msisdn: formattedPhone
                },
                transaction: {
                    amount: amount,
                    country: 'MW',
                    currency: 'MWK',
                    id: referenceId
                }
            };

            const response = await axios.post(
                `${this.airtelMoneyConfig.baseUrl}/merchant/v1/payments/`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Country': 'MW',
                        'X-Currency': 'MWK',
                        'Authorization': `Bearer ${await this.getAirtelToken()}`
                    }
                }
            );

            return {
                success: true,
                transactionId: response.data.data?.transaction?.id,
                status: response.data.status?.code === '200' ? 'processing' : 'failed',
                message: response.data.status?.message,
                rawResponse: response.data
            };

        } catch (error) {
            console.error('Airtel Money initiation error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'failed',
                message: error.response?.data?.status?.message || 'Payment initiation failed',
                rawResponse: error.response?.data
            };
        }
    }

    /**
     * Get Airtel Money auth token
     */
    async getAirtelToken() {
        try {
            const response = await axios.post(
                `${this.airtelMoneyConfig.baseUrl}/auth/oauth2/token`,
                {
                    client_id: this.airtelMoneyConfig.apiKey,
                    client_secret: this.airtelMoneyConfig.secret,
                    grant_type: 'client_credentials'
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            return response.data.access_token;
        } catch (error) {
            console.error('Airtel token error:', error);
            throw new Error('Failed to get Airtel Money token');
        }
    }

    /**
     * Initiate TNM Mpamba payment
     */
    async initiateMpamba(phoneNumber, amount, referenceId) {
        try {
            // Format phone number
            const formattedPhone = phoneNumber.replace(/^\+?265/, '265');

            const payload = {
                amount: amount,
                currency: 'MWK',
                externalId: referenceId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: formattedPhone
                },
                payerMessage: 'Kondani Premium Subscription',
                payeeNote: `Subscription payment - ${referenceId}`
            };

            const response = await axios.post(
                `${this.mpambaConfig.baseUrl}/collection/v1_0/requesttopay`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.mpambaConfig.apiKey}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
                    }
                }
            );

            return {
                success: true,
                transactionId: referenceId,
                status: 'processing',
                message: 'Payment initiated successfully',
                rawResponse: response.data
            };

        } catch (error) {
            console.error('Mpamba initiation error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'failed',
                message: error.response?.data?.message || 'Payment initiation failed',
                rawResponse: error.response?.data
            };
        }
    }

    /**
     * Check Airtel Money payment status
     */
    async checkAirtelStatus(transactionId) {
        try {
            const response = await axios.get(
                `${this.airtelMoneyConfig.baseUrl}/standard/v1/payments/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${await this.getAirtelToken()}`,
                        'X-Country': 'MW',
                        'X-Currency': 'MWK'
                    }
                }
            );

            const status = response.data.data?.transaction?.status;
            return {
                status: status === 'TS' ? 'completed' : status === 'TF' ? 'failed' : 'processing',
                rawResponse: response.data
            };
        } catch (error) {
            console.error('Airtel status check error:', error);
            return { status: 'unknown', rawResponse: error.response?.data };
        }
    }

    /**
     * Check Mpamba payment status
     */
    async checkMpambaStatus(referenceId) {
        try {
            const response = await axios.get(
                `${this.mpambaConfig.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.mpambaConfig.apiKey}`,
                        'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
                    }
                }
            );

            const status = response.data.status;
            return {
                status: status === 'SUCCESSFUL' ? 'completed' : status === 'FAILED' ? 'failed' : 'processing',
                rawResponse: response.data
            };
        } catch (error) {
            console.error('Mpamba status check error:', error);
            return { status: 'unknown', rawResponse: error.response?.data };
        }
    }
}

module.exports = new PaymentService();
