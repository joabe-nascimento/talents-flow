@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   TalentFlow - Backend API
echo ========================================
echo.
echo Iniciando Backend com Docker Compose...
echo.
echo Backend estará disponível em: http://localhost:8085/api
echo Swagger UI: http://localhost:8085/api/swagger-ui.html
echo PostgreSQL: localhost:5434
echo.
echo Aguarde o build do Docker (pode levar alguns minutos na primeira vez)...
echo.

docker-compose up --build backend postgres

echo.
echo Backend encerrado.
pause

