# TalentFlow - Backend Starter Script
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TalentFlow - Backend API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Erro: Docker não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Docker Desktop." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Iniciando Backend e PostgreSQL com Docker Compose..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:8085/api" -ForegroundColor Cyan
Write-Host "Swagger UI: http://localhost:8085/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host "PostgreSQL: localhost:5434" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguarde o build (pode levar alguns minutos na primeira vez)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione Ctrl+C para parar os serviços" -ForegroundColor Yellow
Write-Host ""

docker-compose up --build backend postgres




