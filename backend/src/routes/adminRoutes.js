const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');

// WhatsApp Bot — QR pairing & connection status (allows browser access via ?secret=... or admin auth)
router.get('/whatsapp-bot/status', (req, res, next) => {
  const secret = req.query.secret;
  if (secret && secret === (process.env.JWT_SECRET || 'kondani_secret_key_2024')) {
    return next();
  }
  return authMiddleware(req, res, () => {
    checkAdmin(req, res, next);
  });
}, (req, res) => {
  const whatsappBot = require('../services/whatsappBotService');
  const status = whatsappBot.getStatus();
  // Return an HTML page with the QR image embedded for easy scanning
  if (status.qr) {
    res.send(`<!DOCTYPE html>
<html><head><title>Kondani WhatsApp Bot — Pair</title>
<style>body{background:#111;color:#eee;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:20px}
img{border:12px solid #25D366;border-radius:12px;width:280px;height:280px}
p{color:#aaa;font-size:14px;text-align:center}
.status{padding:8px 20px;border-radius:99px;font-weight:700;font-size:13px;background:#1a2a1a;color:#25D366;border:1px solid #25D366}
</style></head><body>
<span class="status">🟡 WAITING FOR SCAN</span>
<img src="${status.qr}" alt="QR Code"/>
<p>Open WhatsApp on <strong>+265 989 503 152</strong><br>
Go to Linked Devices → Link a Device → scan this QR code.</p>
<p style="color:#555">Refresh this page if the QR expires. Bot number: ${status.botNumber}</p>
<script>setTimeout(()=>location.reload(), 20000)</script>
</body></html>`);
  } else if (status.connected) {
    res.send(`<!DOCTYPE html>
<html><head><title>Kondani WhatsApp Bot — Connected</title>
<style>body{background:#111;color:#eee;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:20px}
.status{padding:12px 28px;border-radius:99px;font-weight:700;font-size:16px;background:#1a2a1a;color:#25D366;border:2px solid #25D366}
p{color:#aaa;font-size:14px;text-align:center}
</style></head><body>
<span class="status">✅ WHATSAPP BOT CONNECTED</span>
<p>Bot number: <strong>${status.botNumber}</strong><br>The inbound verification bot is live and ready.</p>
</body></html>`);
  } else {
    res.send(`<!DOCTYPE html>
<html><head><title>Kondani WhatsApp Bot — Initializing</title>
<style>body{background:#111;color:#eee;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:20px}
.status{padding:12px 28px;border-radius:99px;font-weight:700;font-size:16px;background:#2a2010;color:#f4b740;border:2px solid #f4b740}
p{color:#aaa;font-size:14px;text-align:center}
</style></head><body>
<span class="status">⏳ INITIALIZING…</span>
<p>The WhatsApp bot is starting up. Please wait a few seconds and refresh.</p>
<script>setTimeout(()=>location.reload(), 5000)</script>
</body></html>`);
  }
});

// All other admin routes strictly require auth + admin role
router.use(authMiddleware, checkAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/revenue', adminController.getRevenueAnalytics);

// Analytics
router.get('/analytics', analyticsController.getAnalytics);
router.post('/analytics/calculate', analyticsController.calculateAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Verifications (Selfie / ID)
router.get('/verifications', adminController.getVerifications);
router.post('/verifications/:verificationId/review', adminController.reviewVerification);

// Moderation & Reports
router.get('/reports', adminController.getReports);
router.post('/reports/:reportId/review', adminController.reviewReport);

module.exports = router;
