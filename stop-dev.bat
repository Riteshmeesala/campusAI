@echo off
title Stop CampusIQ+ Microservices
echo ===================================================================
echo             Stopping CampusIQ+ Microservices Suite
echo ===================================================================
echo.

echo Terminating running java processes (Spring Cloud microservices)...
taskkill /F /IM java.exe 2>nul

echo Terminating running node processes (React frontend)...
taskkill /F /IM node.exe 2>nul

echo.
echo All CampusIQ+ services stopped successfully.
pause
