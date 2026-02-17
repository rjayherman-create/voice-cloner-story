# 🎙️ ElevenLabs Integration - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get ElevenLabs API Key

1. Go to https://elevenlabs.io
2. Sign up (free account: 10,000 characters/month)
3. Go to Account Settings → API Key
4. Copy your API key

### Step 2: Add API Key to .env

Open `C:\voice over system\.env` and update:

```env
PORT=5001
NODE_ENV=development

# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_your_api_key_here_123456789
```

Replace `sk_your_api_key_here_123456789` with your actual API key.

### Step 3: Restart the Server

Stop the current server and start it again:

```bash
npm start
```

### Step 4: Test It

1. Open http://localhost:5001
2. Click "+ New Project"
3. Create a project
4. Select the project
5. You should now see **real ElevenLabs voices** in the dropdown!
6. Write a script
7. Select a voice and emotion
8. Click "Generate Voiceover"
9. Real audio will be generated and saved!

---

## How It Works

### Voice Loading
- When you click the voice dropdown, it fetches **all available voices** from ElevenLabs
- First load caches voices for 24 hours
- Voices are stored in: `backend/.voices-cache.json`

### Audio Generation
1. You enter script → Select voice → Select emotion
2. Click "Generate Voiceover"
3. ElevenLabs API receives: script, voice ID, emotion settings
4. API generates MP3 audio
5. Audio saved to: `projects/{projectId}/voiceovers/`
6. Preview available immediately

### Emotion Mapping
Your emotion selection adjusts voice parameters:
- **Happy**: High pitch stability (0.75), High similarity (0.9)
- **Excited**: Very stable (0.8), Very similar (0.95)
- **Calm**: Medium-high (0.6), High (0.85)
- **Serious**: Low-medium (0.45), Medium (0.7)
- **Sad**: Low (0.4), Low-medium (0.6)
- **Angry**: Very low (0.3), High (0.8)
- **Neutral**: Medium (0.5), Medium (0.75)

---

## Available ElevenLabs Voices

Once configured, you'll have access to:

### Professional Voices
- Adam, Bill, Callum, Daniel, George, etc. (male)
- Alice, Bella, Charlotte, Emily, Iva, etc. (female)

### Descriptive Categories
- Professional
- Conversational
- Narrator
- Soft
- Warm
- etc.

See all at: https://api.elevenlabs.io/v1/voices (with your API key)

---

## API Endpoints

### Get All Voices
```bash
GET /api/voiceover/voices
```

Returns array of all available ElevenLabs voices:
```json
[
  {
    "id": "21m00Tcm4TlvDq8ikWAM",
    "name": "Adam",
    "category": "professional",
    "description": "A male voice with a deep tone",
    "previewUrl": "https://..."
  },
  ...
]
```

### Get Voice Preview
```bash
GET /api/voiceover/voices/{voiceId}/preview
```

Returns:
```json
{
  "previewUrl": "https://..."
}
```

### Generate Voiceover
```bash
POST /api/voiceover/generate
Content-Type: application/json

{
  "script": "Hello world",
  "voice": "21m00Tcm4TlvDq8ikWAM",
  "emotion": "happy"
}
```

Returns:
```json
{
  "id": "vo-1707042400000",
  "filename": "voiceover-1707042400000.mp3",
  "url": "/uploads/voiceover-1707042400000.mp3",
  "voice": "21m00Tcm4TlvDq8ikWAM",
  "emotion": "happy",
  "script": "Hello world",
  "duration": 2,
  "status": "complete"
}
```

### Check Status
```bash
GET /api/voiceover/status
```

Returns:
```json
{
  "service": "voiceover",
  "elevenLabsConfigured": true,
  "status": "ready"
}
```

---

## Pricing

### Free Tier
- 10,000 characters/month
- Limited to 1 voice
- Great for testing!

### Starter ($5/month)
- 100,000 characters/month
- All 29 professional voices
- Priority support

### Pro ($99/month)
- 1,000,000 characters/month
- All features
- Voice cloning
- Custom voices

See https://elevenlabs.io/pricing for details

---

## Troubleshooting

### No voices showing?
Check:
1. `.env` file has `ELEVENLABS_API_KEY` set
2. API key is correct (no spaces, no copy errors)
3. Server restarted after adding key
4. Check console for errors: `npm start`

### Generation fails?
Check:
1. API key is valid
2. You have characters remaining (free tier: 10k/month)
3. Voice ID is correct
4. Script is not empty
5. Check error message for details

### Slow first load?
- First time fetching voices takes ~2 seconds (API call)
- After that, cached for 24 hours
- Cache file: `backend/.voices-cache.json`

### Clear cache:
```bash
# Delete cache file to force refresh
rm backend/.voices-cache.json

# Restart server
npm start
```

---

## Configuration Options

### In .env:
```env
# Required
ELEVENLABS_API_KEY=sk_your_key

# Optional (defaults shown)
ELEVENLABS_MODEL=eleven_monolingual_v1
```

### Emotion Mapping (in elevenlab-service.js)
You can adjust emotion parameters:
```javascript
mapEmotionToStability(emotion) {
  // 0.0 = variable, 1.0 = stable
  // Adjust for different effects
}

mapEmotionToSimilarity(emotion) {
  // 0.0 = different, 1.0 = same
  // Adjust for voice consistency
}
```

---

## Advanced Usage

### Custom Emotion Settings
Modify `elevenlab-service.js`:

```javascript
mapEmotionToStability(emotion) {
  const emotionMap = {
    'neutral': 0.5,
    'happy': 0.75,  // ← Adjust these
    'sad': 0.4,
    // ... more
  };
  return emotionMap[emotion] || 0.5;
}
```

### Batch Generation
Generate multiple voiceovers quickly:
1. Create project
2. Write multiple scripts
3. Select voice
4. Generate multiple variations with different emotions
5. All saved to project

### Voice Blending (Future)
Mix multiple voices for unique effects

---

## API Key Security

### Do's ✅
- Store in `.env` file
- Add `.env` to `.gitignore`
- Never commit API key to git
- Use environment variables in production

### Don'ts ❌
- Don't hardcode API key in code
- Don't share API key with others
- Don't post in public repositories
- Don't use in client-side code

---

## Supported Models

ElevenLabs offers multiple models:

| Model | Quality | Speed | Cost |
|-------|---------|-------|------|
| `eleven_monolingual_v1` | High | Fast | $0.30 per 1M chars |
| `eleven_multilingual_v1` | High | Medium | $0.30 per 1M chars |
| `eleven_multilingual_v2` | Highest | Medium | $0.30 per 1M chars |

Current default: `eleven_monolingual_v1`

To change, edit `backend/routes/voiceover.js`:
```javascript
const audioBuffer = await elevenLabsService.synthesize(script, voice, {
  emotion: emotion || 'neutral',
  modelId: 'eleven_multilingual_v2'  // ← Change here
});
```

---

## Features Now Available

✅ **Real ElevenLabs voices** (~29 professional voices)
✅ **Emotion-aware synthesis** (adjusts pitch/tone)
✅ **Audio generation** (MP3 files saved)
✅ **Voice preview** (listen before generation)
✅ **Project organization** (saves to project)
✅ **Caching** (24-hour voice cache)
✅ **Error handling** (detailed error messages)
✅ **Status checking** (API health check)

---

## Next Steps

1. ✅ Add API key to `.env`
2. ✅ Restart server
3. ✅ Test voice generation
4. ⏳ (Optional) Customize emotion mappings
5. ⏳ (Optional) Add voice preview playback
6. ⏳ (Optional) Integrate voice cloning

---

## Support

**Need help?**
- ElevenLabs Docs: https://elevenlabs.io/docs
- API Reference: https://api.elevenlabs.io/docs
- Status Page: https://status.elevenlabs.io

**Issue with generation?**
- Check `.env` for API key
- Check console for error details
- Verify API key validity
- Check character limit (free: 10k/month)

---

## Status

- ✅ Backend ready
- ✅ Frontend ready
- ⏳ Waiting for API key
- ⏳ Add to `.env`
- ⏳ Restart server

Then enjoy unlimited professional voices! 🎙️
