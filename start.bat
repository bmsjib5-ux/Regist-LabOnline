@echo off
setlocal enabledelayedexpansion
title Regist LabOnline - Local Dev Server
cd /d "%~dp0"

echo ============================================
echo  Regist LabOnline - Local Dev Server
echo ============================================
echo.

REM ---- Clear stale PORT env var so node reads .env cleanly ----
set "PORT="

REM ---- Read APP_PORT from .env (default 3000) ----
set "APP_PORT=3000"
if exist .env (
    for /f "usebackq tokens=2 delims==" %%a in (`findstr /b /i "PORT=" .env`) do (
        set "APP_PORT=%%a"
        goto :got_port
    )
)
:got_port
set "APP_PORT=!APP_PORT: =!"
set "APP_PORT=!APP_PORT:	=!"

echo !APP_PORT!| findstr /r "^[0-9][0-9]*$" >nul
if errorlevel 1 (
    echo [X] Invalid PORT in .env: [!APP_PORT!]  -- falling back to 3000
    set "APP_PORT=3000"
)
echo Using port: !APP_PORT!
echo.

REM ---- Pre-check if port is busy ----
set "BUSY_PID="
for /f "usebackq delims=" %%a in (`powershell -nop -c "((Get-NetTCPConnection -LocalPort !APP_PORT! -State Listen -ErrorAction SilentlyContinue) | Select-Object -First 1).OwningProcess"`) do set "BUSY_PID=%%a"

if defined BUSY_PID (
    echo [X] Port !APP_PORT! is already in use by PID !BUSY_PID!
    for /f "usebackq tokens=* delims=" %%n in (`powershell -nop -c "(Get-Process -Id !BUSY_PID! -ErrorAction SilentlyContinue).ProcessName"`) do echo     Process: %%n
    echo.
    choice /c YN /n /m "Kill PID !BUSY_PID! and continue? [Y/N] "
    if errorlevel 2 (
        echo Aborted.
        pause
        exit /b 1
    )
    taskkill /pid !BUSY_PID! /f >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo [+] Killed PID !BUSY_PID!
    echo.
)

REM ---- Run node server in this window (logs visible, Ctrl+C to stop) ----
echo Starting Node server...  Open http://localhost:!APP_PORT! in your browser.
echo Press Ctrl+C to stop.
echo.
node server.js

echo.
echo [-] Server stopped.
endlocal
pause
