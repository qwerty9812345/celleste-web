@echo off
title Celleste Family Site - Setup
cd /d "%~dp0"
echo.
echo   ========================================
echo     🏠  Celleste Family Site - Setup
echo   ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
echo.
pause
