@echo off
echo.
echo ============================================
echo   Voice Over System - Starting...
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  echo.
)

REM Build frontend if dist doesn't exist
if not exist "frontend\dist" (
  echo Building frontend...
  call npm run frontend:build
  echo.
)

echo.
echo ✓ Starting backend server on http://localhost:5001
echo ✓ Frontend available at http://localhost:5173 (dev mode)
echo.
echo Press Ctrl+C to stop
echo.

npm start
