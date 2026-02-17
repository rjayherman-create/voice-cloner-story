@echo off
REM Voice Over System - Secure API Key Setup
REM This script safely adds your ElevenLabs API key

cls
echo.
echo ============================================
echo   Voice Over System - API Key Setup
echo ============================================
echo.
echo This will securely add your ElevenLabs API key
echo Your key will NOT be displayed on screen
echo.
echo Get your API key from:
echo https://elevenlabs.io/account/api-keys
echo.

REM Create a temporary VBScript to hide input
setlocal enabledelayedexpansion
set "tempvbs=%temp%\getkey.vbs"

(
  echo Set objStdIn = WScript.StdIn
  echo Set objStdOut = WScript.StdOut
  echo objStdOut.Write "🔑 Enter your ElevenLabs API key (hidden): "
  echo WScript.StdErr.WriteLine ""
  echo strPassword = ""
  echo While Not objStdIn.AtEndOfStream
  echo     c = objStdIn.Read(1)
  echo     If c = Chr(13) Then
  echo         objStdOut.WriteLine ""
  echo         Exit While
  echo     ElseIf c = Chr(8) Then
  echo         strPassword = Left(strPassword, Len(strPassword) - 1^)
  echo     Else
  echo         strPassword = strPassword ^& c
  echo     End If
  echo Wend
  echo WScript.Echo strPassword
) > "!tempvbs!"

for /f "delims=" %%A in ('cscript //nologo "!tempvbs!"') do (
  set "apikey=%%A"
)

del "!tempvbs!"

if "!apikey!"=="" (
  echo.
  echo ❌ No API key provided. Setup cancelled.
  echo.
  pause
  exit /b 1
)

echo.
echo ✓ API key received ^(length: !apikey:~0,5!...^)
echo.
set /p confirm="Confirm you want to save this API key? (yes/no): "

if /i not "!confirm!"=="yes" (
  if /i not "!confirm!"=="y" (
    echo.
    echo ❌ Setup cancelled.
    echo.
    pause
    exit /b 1
  )
)

REM Read existing .env or create new one
if exist .env (
  echo Updating existing .env file...
  
  REM Create temporary file
  setlocal enabledelayedexpansion
  set found=0
  for /f "delims=" %%A in (.env) do (
    if "%%A"=="" (
      echo.
    ) else if "%%A:~0,20%"=="ELEVENLABS_API_KEY=" (
      echo ELEVENLABS_API_KEY=!apikey! >> .env.tmp
      set found=1
    ) else (
      echo %%A >> .env.tmp
    )
  )
  
  if !found!==0 (
    echo ELEVENLABS_API_KEY=!apikey! >> .env.tmp
  )
  
  REM Replace original file
  del .env
  ren .env.tmp .env
) else (
  echo Creating new .env file...
  (
    echo PORT=5001
    echo NODE_ENV=development
    echo.
    echo # ElevenLabs API Configuration
    echo ELEVENLABS_API_KEY=!apikey!
  ) > .env
)

echo.
echo ✅ API key saved successfully!
echo.
echo Next steps:
echo.
echo 1. Restart the server:
echo    npm start
echo.
echo 2. Open your browser:
echo    http://localhost:5001
echo.
echo 3. Start creating voiceovers! 🎉
echo.
pause
