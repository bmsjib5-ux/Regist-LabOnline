@echo off
chcp 65001 >nul
title Regist LabOnline - Server + Tunnel

cd /d "%~dp0"

echo.
echo ============================================
echo   Regist LabOnline - Server + Tunnel
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    echo         Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where cloudflared >nul 2>nul
if errorlevel 1 (
    echo [ERROR] cloudflared is not installed.
    echo         Download: https://github.com/cloudflare/cloudflared/releases
    echo         ^(pick cloudflared-windows-amd64.msi^)
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    if not exist ".env.example" (
        echo [ERROR] Missing both .env and .env.example
        echo.
        pause
        exit /b 1
    )
    echo [SETUP] Creating .env from .env.example ...
    copy ".env.example" ".env" >nul
    echo [SETUP] Opening .env in Notepad - please paste your NOTION_TOKEN, save, then close Notepad to continue.
    echo.
    notepad .env
)

if not exist "node_modules" (
    echo [SETUP] Installing dependencies ^(first run only^) ...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo   Starting server + tunnel
echo   Local : http://localhost:3000
echo   Public: see [tunnel] log below
echo   Press Ctrl+C to stop both processes
echo ============================================
echo.

call npm run start:tunnel

echo.
echo Stopped.
pause
