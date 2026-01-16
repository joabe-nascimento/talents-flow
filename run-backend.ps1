# TalentFlow - Script para iniciar o Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TalentFlow - Iniciando Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
$dockerCheck = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker nao encontrado! Por favor, instale o Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "Docker encontrado: $dockerCheck" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando servicos..." -ForegroundColor Yellow
Write-Host "  - PostgreSQL (porta 5434)"
Write-Host "  - Backend API (porta 8085)"
Write-Host ""

# Iniciar com docker-compose
docker-compose up -d postgres backend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   Servicos iniciados com sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend API: http://localhost:8085/api" -ForegroundColor Cyan
    Write-Host "Swagger UI:  http://localhost:8085/api/swagger-ui.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para ver os logs: docker-compose logs -f backend" -ForegroundColor Yellow
    Write-Host "Para parar: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "Erro ao iniciar os servicos!" -ForegroundColor Red
}


