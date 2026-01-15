@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   TalentFlow - Backend (Modo Dev)
echo ========================================
echo.
echo Iniciando apenas o PostgreSQL...
echo Backend será executado via IDE ou Maven
echo.
echo PostgreSQL: localhost:5434
echo   Database: talentflow
echo   User: postgres
echo   Password: postgres
echo.

docker-compose up postgres

echo.
echo PostgreSQL encerrado.
pause


