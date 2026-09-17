# Deploy WhatsApp OTP changes to VPS
# Files to deploy:
# 1. backend/src/services/whatsappService.js (NEW)
# 2. backend/src/controllers/authController.js (UPDATED)
# 3. backend/src/views/auth/LoginView.vue (UPDATED frontend)
# 4. backend/src/views/auth/RegisterView.vue (UPDATED frontend)
# 5. backend/.env (needs GREEN_API keys added)

Write-Host "=== Deploying WhatsApp OTP to VPS ===" -ForegroundColor Cyan
Write-Host "VPS: 139.162.156.72" -ForegroundColor Yellow

# Copy new whatsappService.js
Write-Host "
[1/4] Uploading whatsappService.js..." -ForegroundColor Green
scp -i C:\Users\Dell\.ssh\id_linode_kondani d:\kondani\backend\src\services\whatsappService.js root@139.162.156.72:/root/kondani/backend/src/services/whatsappService.js

# Copy updated authController.js
Write-Host "
[2/4] Uploading authController.js..." -ForegroundColor Green
scp -i C:\Users\Dell\.ssh\id_linode_kondani d:\kondani\backend\src\controllers\authController.js root@139.162.156.72:/root/kondani/backend/src/controllers/authController.js

# Copy updated frontend auth views
Write-Host "
[3/4] Uploading LoginView.vue and RegisterView.vue..." -ForegroundColor Green
scp -i C:\Users\Dell\.ssh\id_linode_kondani d:\kondani\vue-project\src\views\auth\LoginView.vue root@139.162.156.72:/root/kondani/vue-project/src/views/auth/LoginView.vue
scp -i C:\Users\Dell\.ssh\id_linode_kondani d:\kondani\vue-project\src\views\auth\RegisterView.vue root@139.162.156.72:/root/kondani/vue-project/src/views/auth/RegisterView.vue

Write-Host "
[4/4] Restarting backend on VPS..." -ForegroundColor Green
ssh -i C:\Users\Dell\.ssh\id_linode_kondani root@139.162.156.72 "cd /root/kondani/backend && pm2 restart kondani-backend && echo 'Backend restarted OK'"

Write-Host "
=== IMPORTANT: Add your Green API credentials to VPS .env ===" -ForegroundColor Yellow
Write-Host "Run: ssh -i C:\Users\Dell\.ssh\id_linode_kondani root@139.162.156.72" -ForegroundColor Cyan
Write-Host "Then: nano /root/kondani/backend/.env" -ForegroundColor Cyan
Write-Host "Add: GREEN_API_INSTANCE_ID=<your-instance-id>" -ForegroundColor White
Write-Host "Add: GREEN_API_TOKEN=<your-api-token>" -ForegroundColor White
Write-Host "Then: pm2 restart kondani-backend" -ForegroundColor Cyan

Write-Host "
Done!" -ForegroundColor Green
