# TTS Provider Integration Guide

This guide helps you choose and integrate a Text-to-Speech provider for your Voice Over System.

## Quick Comparison

| Provider | Quality | Cost | Setup | Best For |
|----------|---------|------|-------|----------|
| **ElevenLabs** | Highest | $5-99/mo | 5 min | Commercial, emotions, voices |
| **Google Cloud** | High | $4/1M chars | 10 min | Professional, scaling |
| **AWS Polly** | High | $4/1M chars | 10 min | AWS ecosystem, scaling |
| **Local (Tacotron2)** | Medium | Free | 30 min | Privacy, offline, learning |

## Option 1: ElevenLabs (Recommended)

### Why?
- Best voice quality
- Built-in emotion control
- 29+ pre-made voices
- Voice cloning (add your own voices)
- Most natural-sounding

### Setup (5 minutes)

1. **Get API Key**
   - Go to https://elevenlabs.io
   - Sign up (free tier: 10k chars/month)
   - Get API key from dashboard

2. **Update `.env`**
   ```env
   TTS_PROVIDER=elevenlabs
   ELEVENLABS_API_KEY=sk_***your_key_here***
   ```

3. **Install SDK**
   ```bash
   npm install elevenlabs
   ```

4. **Update `backend/routes/voiceover.js`**
   ```javascript
   import { ElevenLabsClient } from "elevenlabs";

   const client = new ElevenLabsClient({
     apiKey: process.env.ELEVENLABS_API_KEY
   });

   router.post('/generate', async (req, res) => {
     const { script, voice, emotion } = req.body;
     
     const audio = await client.generate({
       voice,
       text: script,
       emotion // "happy", "sad", etc.
     });

     // Save and return audio file
   });
   ```

5. **Test**
   ```bash
   npm start
   # Use UI or: curl -X POST http://localhost:5001/api/voiceover/generate
   ```

### Voice IDs
- `rachel` - Female, professional
- `clyde` - Male, narrator
- `domi` - Female, cheerful
- `george` - Male, deep
- [See all: https://api.elevenlabs.io/v1/voices]

---

## Option 2: Google Cloud Text-to-Speech

### Why?
- Enterprise-grade reliability
- Multi-language support
- SSML for fine control
- Good pricing at scale

### Setup (10 minutes)

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project
   - Enable "Cloud Text-to-Speech API"
   - Create service account key (JSON)

2. **Save Credentials**
   ```bash
   # Download JSON key file to project root
   mv ~/Downloads/key.json ./google-credentials.json
   ```

3. **Update `.env`**
   ```env
   TTS_PROVIDER=google
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

4. **Install SDK**
   ```bash
   npm install @google-cloud/text-to-speech
   ```

5. **Update `backend/routes/voiceover.js`**
   ```javascript
   const textToSpeech = require('@google-cloud/text-to-speech');
   
   const client = new textToSpeech.TextToSpeechClient();
   
   router.post('/generate', async (req, res) => {
     const { script, voice, emotion } = req.body;
     
     const request = {
       input: { text: script },
       voice: { 
         languageCode: 'en-US',
         name: `en-US-${voice}`
       },
       audioConfig: {
         audioEncoding: 'MP3',
         pitch: emotion === 'happy' ? 1.2 : 0.8
       }
     };

     const [response] = await client.synthesizeSpeech(request);
     // Save and return audio
   });
   ```

---

## Option 3: AWS Polly

### Why?
- AWS ecosystem integration
- Good voice variety
- Neural voices available
- Pricing: ~$4 per 1M characters

### Setup (10 minutes)

1. **Set Up AWS Credentials**
   ```bash
   # Use AWS CLI or set environment variables
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_REGION=us-east-1
   ```

2. **Update `.env`**
   ```env
   TTS_PROVIDER=aws
   AWS_REGION=us-east-1
   ```

3. **Install SDK**
   ```bash
   npm install aws-sdk
   ```

4. **Update `backend/routes/voiceover.js`**
   ```javascript
   import AWS from 'aws-sdk';
   
   const polly = new AWS.Polly({
     region: process.env.AWS_REGION
   });

   router.post('/generate', async (req, res) => {
     const { script, voice, emotion } = req.body;
     
     const params = {
       Text: script,
       OutputFormat: 'mp3',
       VoiceId: voice, // 'Joanna', 'Matthew', etc.
       Engine: 'neural' // Better quality
     };

     const audio = await polly.synthesizeSpeech(params).promise();
     // Save and return audio
   });
   ```

---

## Option 4: Local TTS (Tacotron2 + Vocoder)

### Why?
- 100% free
- Privacy (no cloud)
- Works offline
- Learning-friendly

### Cons?
- Slower processing
- Lower quality than commercial
- Requires GPU for speed

### Setup (30 minutes)

1. **Install TTS Package**
   ```bash
   npm install tts
   # or use Python wrapper
   pip install TTS
   ```

2. **Create TTS Service**
   ```javascript
   import { spawn } from 'child_process';

   router.post('/generate', async (req, res) => {
     const { script, voice } = req.body;
     
     // Call local TTS
     const tts = spawn('python', ['tts.py', script, voice]);
     
     tts.stdout.on('data', (data) => {
       // Stream audio or save file
     });
   });
   ```

3. **Python Script** (`tts.py`)
   ```python
   from TTS.api import TTS
   model = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", 
               gpu=True)
   model.tts_to_file(text, file_path="output.wav")
   ```

---

## Implementation Steps (Any Provider)

1. **Choose provider** above
2. **Install dependencies**
3. **Get API credentials** (if needed)
4. **Add to `.env`**
5. **Update `backend/routes/voiceover.js`**
6. **Test with UI or curl**
7. **Implement emotion/voice mapping**
8. **Add error handling**

## Testing Your Integration

Once integrated, test the endpoint:

```bash
curl -X POST http://localhost:5001/api/voiceover/generate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Hello! Testing voiceover integration.",
    "voice": "male-narrator",
    "emotion": "happy"
  }'
```

Should return:
```json
{
  "id": "vo-123",
  "url": "/uploads/vo-123.mp3",
  "duration": 4.5
}
```

## Cost Estimation

For a commercial with ~150 words (45 seconds):

| Provider | Cost |
|----------|------|
| ElevenLabs | $0.01 - $0.05 |
| Google Cloud | $0.00018 |
| AWS Polly | $0.00015 |
| Local | $0 |

## Recommendation

**For Production MVP:** ElevenLabs
- Easiest integration (5 min)
- Best audio quality
- Built-in emotion control
- Great documentation

**For Scaling:** Google Cloud or AWS
- Better pricing at scale
- Enterprise reliability
- Multi-language support

**For Learning/Offline:** Local Tacotron2
- No API costs
- Full control
- Privacy-friendly

---

Once you've chosen and integrated a provider, you can:
1. Add audio preview
2. Implement emotion-based adjustments
3. Add voice blending
4. Integrate sound effects
5. Deploy to production

Need help? Check `README.md` or reach out!
