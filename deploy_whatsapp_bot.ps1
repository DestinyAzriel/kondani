# Deploy WhatsApp Inbound Bot to VPS
# Run from d:\kondani as: .\deploy_whatsapp_bot.ps1
# You will be prompted for your SSH key passphrase.

$VPS  = "root@139.162.156.72"
$KEY  = "C:\Users\Dell\.ssh\id_linode_kondani"
$DEST = "/root/kondani"

Write-Host "`n=== Deploying WhatsApp Inbound Verification Bot ===" -ForegroundColor Cyan
Write-Host "VPS: 139.162.156.72" -ForegroundColor Yellow

Write-Host "`n[1/6] Uploading backend service files..." -ForegroundColor Green
scp -i $KEY backend\src\services\whatsappBotService.js  "${VPS}:${DEST}/backend/src/services/whatsappBotService.js"
scp -i $KEY backend\src\services\whatsappService.js     "${VPS}:${DEST}/backend/src/services/whatsappService.js"

Write-Host "`n[2/6] Uploading updated controllers & routes..." -ForegroundColor Green
scp -i $KEY backend\src\controllers\authController.js   "${VPS}:${DEST}/backend/src/controllers/authController.js"
scp -i $KEY backend\src\routes\authRoutes.js            "${VPS}:${DEST}/backend/src/routes/authRoutes.js"
scp -i $KEY backend\src\routes\adminRoutes.js           "${VPS}:${DEST}/backend/src/routes/adminRoutes.js"

Write-Host "`n[3/6] Uploading server.js & package.json..." -ForegroundColor Green
scp -i $KEY backend\server.js                           "${VPS}:${DEST}/backend/server.js"
scp -i $KEY backend\package.json                        "${VPS}:${DEST}/backend/package.json"

Write-Host "`n[4/6] Uploading updated frontend files..." -ForegroundColor Green
scp -i $KEY vue-project\src\views\auth\LoginView.vue    "${VPS}:${DEST}/vue-project/src/views/auth/LoginView.vue"
scp -i $KEY vue-project\src\views\auth\RegisterView.vue "${VPS}:${DEST}/vue-project/src/views/auth/RegisterView.vue"
scp -i $KEY vue-project\src\services\auth.js            "${VPS}:${DEST}/vue-project/src/services/auth.js"
scp -i $KEY vue-project\src\stores\auth.js              "${VPS}:${DEST}/vue-project/src/stores/auth.js"

Write-Host "`n[5/6] Installing new npm deps on VPS (Baileys, pino, qrcode)..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST}/backend && npm install --save @whiskeysockets/baileys pino qrcode 2>&1 | tail -5 && echo 'npm install done'"

Write-Host "`n[6/6] Restarting backend on VPS..." -ForegroundColor Green
ssh -i $KEY $VPS "pm2 restart kondani-backend && pm2 save && echo 'PM2 restarted OK'"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  DEPLOY COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`nNEXT STEP - Pair the WhatsApp bot:" -ForegroundColor Yellow
Write-Host "  1. Wait ~10 seconds for the bot to initialize" -ForegroundColor White
Write-Host "  2. Open in browser (logged in as admin):" -ForegroundColor White
Write-Host "     https://api.kondanidating.com/api/admin/whatsapp-bot/status" -ForegroundColor Cyan
Write-Host "  3. On +265 989 503 152: WhatsApp > Linked Devices > Link a Device > scan QR" -ForegroundColor White
Write-Host "  4. Page shows CONNECTED = you are live!" -ForegroundColor Green
Write-Host ""
