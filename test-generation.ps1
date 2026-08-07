$uri = "http://localhost:5001/api/voiceover/generate"
$body = @{
    script = "Hello! This is a test of the voice generation system with real audio from ElevenLabs."
    voice = "CwhRBWXzGAHq8TQ4Fs17"
    emotion = "neutral"
} | ConvertTo-Json

$params = @{
    Uri     = $uri
    Method  = 'POST'
    Headers = @{ 'Content-Type' = 'application/json' }
    Body    = $body
    TimeoutSec = 60
}

$response = Invoke-WebRequest @params
$json = $response.Content | ConvertFrom-Json

Write-Host "Success!" -ForegroundColor Green
Write-Host "Generated Audio URL: $($json.url)"
Write-Host "File: $($json.filename)"
Write-Host "Audio Length: $($json.audioLength) bytes"
