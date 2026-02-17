# Voice Over System - Quick Start Guide

## Step 1: Install Dependencies

Navigate to the voice-over-system folder and install:

```bash
cd "C:\voice over system"
npm install
```

## Step 2: Start the Application

### Option A: Local Development (Recommended for development)

**Terminal 1 - Start Backend:**
```bash
npm start
```
Backend will run on `http://localhost:5001`

**Terminal 2 - Start Frontend:**
```bash
npm run frontend:dev
```
Frontend will run on `http://localhost:5173`

### Option B: Docker

```bash
docker-compose up --build
```
Access at `http://localhost:5001`

## Step 3: Test the UI

1. Open `http://localhost:5173` (or 5001 for Docker)
2. Enter a script in the textarea
3. Select a voice (Male Narrator, Female Narrator, Cartoon voices, etc.)
4. Select an emotion (Neutral, Happy, Sad, Excited, etc.)
5. Click "🎬 Generate Voiceover"

## Current Status

✅ **Completed:**
- Clean MVP UI
- Voice and emotion selection
- Script input with character count
- Backend routes for voices, emotions, generation

⏳ **TODO - Next Steps:**
1. Integrate actual TTS provider (ElevenLabs recommended)
2. Add audio preview
3. Add download functionality
4. Implement emotion-based voice modification
5. Add cartoon sound effects
6. Add voice blending for character variety

## Troubleshooting

**Port 5001/5173 already in use:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**Dependencies won't install:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

**Frontend not loading:**
```bash
cd frontend
npm install
npm run build
cd ..
```

## File Structure Reference

- `backend/routes/voiceover.js` - API endpoints
- `backend/server.js` - Express server setup
- `frontend/src/components/VoiceOverStudio.jsx` - Main UI component
- `frontend/src/components/VoiceOverStudio.css` - Styling
- `.env` - Environment variables (TTS provider config goes here)
- `docker-compose.yml` - Docker containerization
- `Dockerfile` - Docker image build

## Next: Integrate TTS

Once the app is running, integrate your chosen TTS provider:

1. Get API key (ElevenLabs, Google Cloud, AWS, etc.)
2. Add to `.env` file
3. Update `backend/routes/voiceover.js` to call TTS API
4. Test with generate endpoint

Questions? Check README.md for detailed endpoint documentation.
