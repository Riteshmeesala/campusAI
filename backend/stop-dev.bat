@echo off
title CampusIQ Stopper
echo ====================================================
echo           Stopping CampusIQ Services
echo ====================================================
echo.

echo [1/2] Stopping Backend on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Terminated process PID %%a on port 8080
)

echo [2/2] Stopping Frontend on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Terminated process PID %%a on port 3000
)

echo.
echo All CampusIQ services stopped successfully.
echo.
pause
