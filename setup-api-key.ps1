#!/usr/bin/env pwsh

# Voice Over System - Secure API Key Setup
# This script safely adds your ElevenLabs API key

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Voice Over System - API Key Setup" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "This will securely add your ElevenLabs API key" -ForegroundColor Yellow
Write-Host "Your key will NOT be displayed on screen`n" -ForegroundColor Yellow

Write-Host "Get your API key from:" -ForegroundColor Green
Write-Host "https://elevenlabs.io/account/api-keys`n" -ForegroundColor Green

# Create secure string input
$secureApiKey = Read-Host -Prompt "🔑 Enter your ElevenLabs API key" -AsSecureString
$apiKey = [System.Net.NetworkCredential]::new("", $secureApiKey).Password

if ([string]::IsNullOrWhiteSpace($apiKey)) {
  Write-Host "`n❌ No API key provided. Setup cancelled.`n" -ForegroundColor Red
  exit 1
}

Write-Host "`n✓ API key received (length: $($apiKey.Length) chars)" -ForegroundColor Green
$confirm = Read-Host "`nConfirm you want to save this API key? (yes/no)"

if ($confirm -ne "yes" -and $confirm -ne "y") {
  Write-Host "`n❌ Setup cancelled.`n" -ForegroundColor Red
  exit 1
}

# Handle .env file
$envPath = ".env"

if (Test-Path $envPath) {
  Write-Host "Updating existing .env file..." -ForegroundColor Yellow
  
  $envContent = Get-Content $envPath -Raw
  
  if ($envContent -match "ELEVENLABS_API_KEY=") {
    # Replace existing key
    $envContent = $envContent -replace "ELEVENLABS_API_KEY=.*", "ELEVENLABS_API_KEY=$apiKey"
  } else {
    # Add new key
    if (-not $envContent.EndsWith("`n")) {
      $envContent += "`n"
    }
    $envContent += "`n# ElevenLabs API Configuration`nELEVENLABS_API_KEY=$apiKey`n"
  }
  
  Set-Content $envPath $envContent -Encoding UTF8
} else {
  Write-Host "Creating new .env file..." -ForegroundColor Yellow
  
  $content = @"
PORT=5001
NODE_ENV=development

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=$apiKey
"@
  
  Set-Content $envPath $content -Encoding UTF8
}

Write-Host "`n✅ API key saved successfully!`n" -ForegroundColor Green

Write-Host "Next steps:`n" -ForegroundColor Cyan
Write-Host "1. Restart the server:" -ForegroundColor White
Write-Host "   npm start`n" -ForegroundColor Yellow
Write-Host "2. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5001`n" -ForegroundColor Yellow
Write-Host "3. Start creating voiceovers! 🎉`n" -ForegroundColor Green
