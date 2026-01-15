@echo off
chcp 65001 >nul
echo ========================================
echo   TalentFlow - Iniciando Sistema
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend...
start "TalentFlow Backend" cmd /k "start-backend.bat"
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend...
start "TalentFlow Frontend" cmd /k "start-frontend.bat"

echo.
echo ========================================
echo   Sistema Iniciado!
echo ========================================
echo.
echo Frontend: http://localhost:4200
echo Backend API: http://localhost:8080/api
echo Swagger: http://localhost:8080/api/swagger-ui.html
echo.
echo Pressione qualquer tecla para sair...
pause >nul


