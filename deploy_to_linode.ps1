# Deploy all recent fixes (ticks, gold badge, controllers) to Linode VPS
# Run from PowerShell in d:\kondani:
# .\deploy_to_linode.ps1

$VPS  = "root@139.162.156.72"
$KEY  = "C:\Users\Dell\.ssh\id_linode_kondani"
$DEST = "/root/kondani"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  PULLING LATEST CODE & DEPLOYING TO LINODE VPS" -ForegroundColor Cyan
Write-Host "  VPS: 139.162.156.72" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Pulling latest git commits on Linode VPS..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST} && git pull origin main"

Write-Host "`n[2/3] Building frontend on Linode..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST}/vue-project && npm run build 2>&1 | tail -5 && echo 'Frontend build complete'"

Write-Host "`n[3/3] Restarting PM2 backend on Linode..." -ForegroundColor Green
ssh -i $KEY $VPS "cd ${DEST}/backend && pm2 restart kondani-backend && echo 'PM2 backend restarted OK'"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT TO LINODE VPS COMPLETE!" -ForegroundColor Green
Write-Host "  Now refresh your browser with Ctrl+F5 or Shift+Reload." -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan
