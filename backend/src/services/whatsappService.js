const axios = require('axios');
const whatsappBot = require('./whatsappBotService');

/**
 * Send a WhatsApp message
 * 1. Primary: Self-hosted Baileys WhatsApp Bot (Free, unlimited, direct from admin phone)
 * 2. Fallback: Green API (if credentials provided)
 *
 * @param {Object} options
 * @param {string} options.to - Recipient phone number in international format (+265...)
 * @param {string} options.message - Text message content
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function sendWhatsApp({ to, message }) {
    // 1. Try our dedicated connected Baileys WhatsApp bot first
    try {
        const botStatus = whatsappBot.getStatus();
        if (botStatus && botStatus.connected) {
            const botResult = await whatsappBot.sendWhatsAppDirect(to, message);
            if (botResult.success) {
                console.log(`[WhatsApp] Sent OTP to ${to} via connected Baileys bot (+${botStatus.botNumber})`);
                return { success: true };
            }
            console.warn(`[WhatsApp] Baileys bot dispatch failed:`, botResult.error);
        } else {
            console.warn('[WhatsApp] Baileys bot is not currently connected, checking fallbacks...');
        }
    } catch (botErr) {
        console.warn('[WhatsApp] Error calling Baileys bot:', botErr.message);
    }

    // 2. Fallback to Green API if configured
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const apiToken = process.env.GREEN_API_TOKEN;

    if (!instanceId || !apiToken) {
        return { success: false, error: 'No WhatsApp gateway available' };
    }

    // Normalize phone number: Green API expects format like "265888000000@c.us" (no + prefix)
    let normalized = String(to).replace(/\D/g, ''); // strip all non-digits
    if (normalized.startsWith('0')) {
        normalized = '265' + normalized.slice(1); // convert local 0xxx to 265xxx
    }
    if (!normalized.startsWith('265')) {
        normalized = '265' + normalized; // ensure Malawi country code
    }
    const chatId = `${normalized}@c.us`;

    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    const payload = {
        chatId,
        message
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        console.log(`[WhatsApp] Sent WhatsApp OTP to ${to} (chatId: ${chatId}):`, JSON.stringify(response.data));
        return { success: true, data: response.data };
    } catch (err) {
        const errorData = err.response?.data || err.message;
        console.warn(`[WhatsApp] Failed to send WhatsApp to ${to}:`, typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
        return { success: false, error: errorData };
    }
}

module.exports = { sendWhatsApp };
