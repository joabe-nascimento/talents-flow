# TalentFlow - Start All Services
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TalentFlow - Iniciando Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$scriptPath\start-backend.ps1`""

Write-Host "Aguardando backend inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "[2/2] Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$scriptPath\start-frontend.ps1`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Sistema Iniciado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8085/api" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:8085/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dois terminais foram abertos." -ForegroundColor Yellow
Write-Host "Feche-os para parar os serviços." -ForegroundColor Yellow
Write-Host ""
pause





