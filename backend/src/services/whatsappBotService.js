const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory verification sessions: code -> { socketId, createdAt, resolved, phone }
const pendingSessions = new Map();

// Cleanup expired sessions older than 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [code, session] of pendingSessions.entries()) {
        if (now - session.createdAt > 10 * 60 * 1000) {
            pendingSessions.delete(code);
        }
    }
}, 60 * 1000);

let sock = null;
let currentQR = null;
let isConnected = false;
let ioInstance = null;

const BOT_NUMBER = process.env.WHATSAPP_BOT_NUMBER || '265989503152';

function setIO(io) {
    ioInstance = io;
}

function registerSession(socketId, phone = '') {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const code = `KND-${randomDigits}`;
    
    pendingSessions.set(code, {
        socketId,
        phone,
        createdAt: Date.now(),
        resolved: false
    });

    const cleanBot = BOT_NUMBER.replace(/\D/g, '');
    const prefilledText = encodeURIComponent(`Verify ${code}`);
    const waLink = `https://wa.me/${cleanBot}?text=${prefilledText}`;

    return {
        code,
        botNumber: cleanBot,
        waLink,
        expiresIn: 600
    };
}

async function handleInboundMessage(m) {
    if (!m.messages || !m.messages[0]) return;
    const msg = m.messages[0];
    if (msg.key.fromMe) return;

    const fromJid = msg.key.remoteJid;
    if (!fromJid || !fromJid.endsWith('@s.whatsapp.net')) return;

    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 '';

    if (!body) return;

    const match = body.match(/KND-\d{6}/i);
    if (!match) return;

    const code = match[0].toUpperCase();
    console.log(`[WhatsApp Inbound] Received code ${code} from ${fromJid}`);

    const session = pendingSessions.get(code);
    if (!session) {
        console.log(`[WhatsApp Inbound] Code ${code} is expired or invalid`);
        try {
            await sock.sendMessage(fromJid, {
                text: "Verification code expired or invalid. Please tap 'Verify with WhatsApp' again on Kondani."
            });
        } catch (e) {}
        return;
    }

    if (session.resolved) return;
    session.resolved = true;

    const rawNumber = fromJid.split('@')[0];
    const internationalPhone = `+${rawNumber}`;

    console.log(`[WhatsApp Inbound] Successfully matched session for phone: ${internationalPhone}`);

    try {
        let user = await User.findOne({ phoneNumber: internationalPhone });
        if (!user) {
            user = new User({
                phoneNumber: internationalPhone,
                isProfileComplete: false
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
            { expiresIn: '30d' }
        );

        session.token = token;
        session.user = user;

        if (ioInstance) {
            if (session.socketId) {
                ioInstance.to(session.socketId).emit('whatsapp_verified', {
                    token,
                    user,
                    code
                });
            }
            ioInstance.to(`verification_${code}`).emit('whatsapp_verified', {
                token,
                user,
                code
            });
            ioInstance.emit(`whatsapp_verified_${code}`, {
                token,
                user,
                code
            });
        }

        try {
            await sock.sendMessage(fromJid, {
                text: `Welcome to Kondani.\n\nYour phone number (${internationalPhone}) has been verified. You can now return to your browser to continue.`
            });
        } catch (sendErr) {
            console.warn('[WhatsApp Inbound] Confirmation reply note:', sendErr.message);
        }

        // Keep session for 2 minutes so frontend polling can retrieve it even if websocket reconnects
        setTimeout(() => {
            pendingSessions.delete(code);
        }, 120 * 1000);

    } catch (err) {
        console.error('[WhatsApp Inbound] Error during user verification:', err);
    }
}

function checkSessionStatus(code) {
    if (!code) return { status: 'invalid' };
    const session = pendingSessions.get(code.toUpperCase());
    if (!session) return { status: 'not_found' };
    if (session.resolved && session.token) {
        return {
            status: 'verified',
            token: session.token,
            user: session.user
        };
    }
    return { status: 'pending' };
}

async function initWhatsAppBot() {
    const authDir = path.resolve(__dirname, '../../whatsapp-auth');
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['Kondani App', 'Chrome', '120.0.0']
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                try {
                    currentQR = await QRCode.toDataURL(qr);
                    console.log('[WhatsApp Bot] New QR code generated for pairing');
                } catch (e) {
                    console.error('[WhatsApp Bot] Failed to generate QR data URL:', e);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('[WhatsApp Bot] Connection closed. Reconnecting?', shouldReconnect);
                isConnected = false;
                currentQR = null;
                if (shouldReconnect) {
                    setTimeout(initWhatsAppBot, 5000);
                }
            } else if (connection === 'open') {
                console.log('[WhatsApp Bot] Connected to WhatsApp successfully');
                isConnected = true;
                currentQR = null;
            }
        });

        sock.ev.on('messages.upsert', handleInboundMessage);

    } catch (err) {
        console.error('[WhatsApp Bot] Failed to initialize:', err);
        setTimeout(initWhatsAppBot, 10000);
    }
}

async function sendWhatsAppDirect(to, text) {
    if (!sock || !isConnected) {
        return { success: false, error: 'WhatsApp bot is not connected' };
    }
    try {
        let clean = String(to).replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '265' + clean.slice(1);
        if (!clean.startsWith('265')) clean = '265' + clean;
        const jid = `${clean}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text });
        console.log(`[WhatsApp Bot] ✅ Outbound OTP sent to ${jid}`);
        return { success: true };
    } catch (err) {
        console.error(`[WhatsApp Bot] ❌ Failed to send outbound message to ${to}:`, err.message);
        return { success: false, error: err.message };
    }
}

function getStatus() {
    return {
        connected: isConnected,
        qr: currentQR,
        botNumber: BOT_NUMBER
    };
}

module.exports = {
    initWhatsAppBot,
    setIO,
    registerSession,
    checkSessionStatus,
    getStatus,
    sendWhatsAppDirect
};
