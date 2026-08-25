# CampusIQ PowerShell Launcher
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "          Starting CampusIQ System" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/2] Starting Backend (Spring Boot :8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; mvn spring-boot:run"

Write-Host "[2/2] Starting Frontend (React :3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm start"

Write-Host "`nServers are launching in separate windows:" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " - Backend:  http://localhost:8080/api" -ForegroundColor White
Write-Host "====================================================`n" -ForegroundColor Cyan
