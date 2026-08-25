@echo off
title CampusIQ Launcher
echo ====================================================
echo           Starting CampusIQ System
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend (Spring Boot :8080)...
start "CampusIQ Backend (Port 8080)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo [2/2] Launching Frontend (React :3000)...
start "CampusIQ Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ====================================================
echo  Servers are starting in separate windows:
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://localhost:8080/api
echo ====================================================
echo.
pause
