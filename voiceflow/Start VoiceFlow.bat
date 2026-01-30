@echo off
title VoiceFlow
cd /d "%~dp0"

echo ====================================
echo    VoiceFlow - Speech to Text
echo ====================================
echo.

REM Проверяем есть ли node_modules
if not exist "node_modules" (
    echo [!] Установка зависимостей...
    call npm install
    echo.
)

REM Собираем Electron
echo [*] Компиляция TypeScript...
call npm run build:electron

REM Запускаем
echo [*] Запуск VoiceFlow...
echo.
call npm run electron:dev

pause
