@echo off
REM Voice Over System - Multi-Terminal Launcher
REM This script opens the backend and frontend in separate terminals

title Voice Over System - Launcher
color 0A
cls

echo.
echo ============================================
echo   Voice Over System MVP - Launcher
echo ============================================
echo.
echo Starting backend and frontend servers...
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
  echo Installing root dependencies...
  call npm install
  echo.
)

REM Start backend in current terminal
echo [1/2] Starting backend server on port 5001...
echo.

REM Build frontend if needed
if not exist "frontend\dist" (
  echo Building frontend...
  call npm run frontend:build
  echo.
)

REM Start backend
npm start
