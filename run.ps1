# LlegoYA Startup Script
Write-Host "🚀 Iniciando LlegoYA - Ecosistema de Delivery Boliviano" -ForegroundColor Cyan

# Start Backend
Write-Host "📡 Iniciando Backend en puerto 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal

# Start Frontend
Write-Host "💻 Iniciando Frontend Dashboard..." -ForegroundColor Green
Set-Location client
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal

Write-Host "✅ ¡Todo listo! Revisa las ventanas de terminal abiertas." -ForegroundColor Yellow
