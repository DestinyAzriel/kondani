const axios = require('axios');

async function sendRequest(url, username, to, message, apiKey, senderId) {
    const isSandbox = username.toLowerCase() === 'sandbox';
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('to', to);
    params.append('message', message);
    if (senderId && !isSandbox) {
        params.append('from', senderId);
    }

    return await axios.post(url, params.toString(), {
        headers: {
            'apiKey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        timeout: 10000
    });
}

/**
 * Send SMS via Africa's Talking REST API
 * @param {Object} options
 * @param {string} options.to - Recipient phone number in international format (+265...)
 * @param {string} options.message - Text message content
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendSMS({ to, message }) {
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const configuredUsername = process.env.AFRICASTALKING_USERNAME || 'sandbox';
    const senderId = process.env.AFRICASTALKING_SENDER_ID;

    if (!apiKey) {
        console.warn('[SMS] AFRICASTALKING_API_KEY not configured.');
        return { success: false, error: 'SMS gateway not configured' };
    }

    // Try configured username first, followed by known app aliases if auth fails
    const candidates = [configuredUsername];
    if (configuredUsername.toLowerCase() !== 'sandbox') {
        ['kondani', 'Kondani-APP', 'kondani-app'].forEach(u => {
            if (!candidates.includes(u)) candidates.push(u);
        });
    }

    let lastError = null;

    for (const user of candidates) {
        try {
            const isSandbox = user.toLowerCase() === 'sandbox';
            const url = isSandbox
                ? 'https://api.sandbox.africastalking.com/version1/messaging'
                : 'https://api.africastalking.com/version1/messaging';

            const response = await sendRequest(url, user, to, message, apiKey, senderId);

            console.log(`[SMS] ✅ Sent SMS to ${to} via Africa's Talking (username: ${user}):`, JSON.stringify(response.data));
            return { success: true, data: response.data };
        } catch (err) {
            const errorData = err.response?.data || err.message;
            lastError = errorData;
            console.warn(`[SMS] Attempt with username "${user}" failed:`, typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
            // If it's not an authentication error, don't keep cycling usernames
            const errStr = String(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
            if (!errStr.toLowerCase().includes('authentication')) {
                break;
            }
        }
    }

    return { success: false, error: lastError };
}

module.exports = {
    sendSMS
};
