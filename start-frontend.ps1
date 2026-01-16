# TalentFlow - Frontend Starter Script
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TalentFlow - Frontend Angular" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $scriptPath "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "Erro: Pasta frontend não encontrada!" -ForegroundColor Red
    Write-Host "Caminho esperado: $frontendPath" -ForegroundColor Yellow
    pause
    exit 1
}

Set-Location $frontendPath

Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Erro: Node.js não encontrado no PATH!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js ou reinicie o terminal." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Verificando dependências..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências (npm install)..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend estará disponível em: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

npm start




