@echo off
REM Voice Over System - Frontend Dev Server Launcher

title Voice Over System - Frontend Dev Server
color 0B
cls

echo.
echo ============================================
echo   Voice Over System - Frontend Dev Server
echo ============================================
echo.
echo Make sure backend is running on port 5001!
echo.
echo Starting frontend dev server on port 5173...
echo.

cd frontend

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm install
  echo.
)

echo Frontend available at http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
