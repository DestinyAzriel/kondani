# Deploy all recent fixes (ticks, gold badge, controllers) to Linode VPS
# Run from PowerShell in d:\kondani:
# .\deploy_to_linode.ps1

$VPS  = "root@139.162.156.72"
$KEY  = "C:\Users\Dell\.ssh\id_linode_kondani"
$DEST = "/root/kondani"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING ALL CHAT & VERIFICATION FIXES TO LINODE" -ForegroundColor Cyan
Write-Host "  VPS: 139.162.156.72" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Uploading updated backend controllers & fix script..." -ForegroundColor Green
scp -i $KEY backend\src\controllers\chatController.js         "${VPS}:${DEST}/backend/src/controllers/chatController.js"
scp -i $KEY backend\src\controllers\authController.js         "${VPS}:${DEST}/backend/src/controllers/authController.js"
scp -i $KEY backend\src\controllers\intentController.js       "${VPS}:${DEST}/backend/src/controllers/intentController.js"
scp -i $KEY backend\src\controllers\likesController.js        "${VPS}:${DEST}/backend/src/controllers/likesController.js"
scp -i $KEY backend\src\controllers\planController.js         "${VPS}:${DEST}/backend/src/controllers/planController.js"
scp -i $KEY backend\src\controllers\verificationController.js "${VPS}:${DEST}/backend/src/controllers/verificationController.js"
scp -i $KEY backend\server.js                                 "${VPS}:${DEST}/backend/server.js"
scp -i $KEY backend\fix_production_gold_ticks.js              "${VPS}:${DEST}/backend/fix_production_gold_ticks.js"

Write-Host "`n[2/4] Uploading updated frontend components..." -ForegroundColor Green
scp -i $KEY vue-project\src\components\feature\ChatPanel.vue "${VPS}:${DEST}/vue-project/src/components/feature/ChatPanel.vue"
scp -i $KEY vue-project\src\views\app\ChatsView.vue          "${VPS}:${DEST}/vue-project/src/views/app/ChatsView.vue"
scp -i $KEY vue-project\src\components\layout\DesktopNav.vue "${VPS}:${DEST}/vue-project/src/components/layout/DesktopNav.vue"

Write-Host "`n[3/4] Running DB audit & repair on Linode (removing unverified gold ticks)..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST}/backend && node fix_production_gold_ticks.js"

Write-Host "`n[4/4] Restarting backend & building frontend on Linode..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST}/backend && pm2 restart kondani-backend && echo 'PM2 backend restarted OK'"
ssh -i $KEY $VPS "if [ -d '${DEST}/vue-project' ]; then cd ${DEST}/vue-project && npm run build 2>&1 | tail -5 && echo 'Frontend build complete'; fi"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT & DB AUDIT COMPLETE!" -ForegroundColor Green
Write-Host "  Now refresh your browser with Ctrl+F5 or Shift+Reload." -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
