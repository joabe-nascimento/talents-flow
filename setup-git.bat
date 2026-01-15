@echo off
echo Inicializando Git...
git init
git remote add origin https://github.com/joabe-nascimento/talents-flow.git
git add .
git commit -m "feat: Initial commit - TalentFlow HR Management System"
git branch -M main
git push -u origin main
echo.
echo Git configurado com sucesso!
pause

