import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8085;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to safely get API key (never sending to browser)
const getApiKey = () => {
  const key = process.env.ELEVENLABS_API_KEY || '';
  return key.trim();
};

// ==================================================
// STEP 1 — ELEVENLABS CONNECTION TEST
// ==================================================
app.get('/api/elevenlabs/status', async (req, res) => {
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === 'YOUR_REAL_ELEVENLABS_KEY') {
    return res.status(401).json({
      status: 'error',
      code: 401,
      error: 'ELEVENLABS_API_KEY is missing or set to placeholder in .env file.'
    });
  }

  try {
    // Call ElevenLabs User API to verify connection
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey }
    });

    const resText = await response.text();

    if (!response.ok) {
      console.error(`[ElevenLabs Status Error] HTTP ${response.status}:`, resText);
      return res.status(response.status).json({
        status: 'error',
        code: response.status,
        error: resText
      });
    }

    let userData;
    try {
      userData = JSON.parse(resText);
    } catch (e) {
      userData = { raw: resText };
    }

    res.json({
      status: 'connected',
      message: '✓ ElevenLabs API Connected',
      subscription: userData.subscription?.tier || 'active'
    });
  } catch (err) {
    console.error('[ElevenLabs Connection Exception]:', err.message);
    res.status(500).json({
      status: 'error',
      code: 500,
      error: `Network / Server Exception: ${err.message}`
    });
  }
});

// Endpoint to update .env key directly from local UI if needed
app.post('/api/elevenlabs/set-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: 'API Key cannot be empty' });
  }

  const cleanKey = apiKey.trim();
  process.env.ELEVENLABS_API_KEY = cleanKey;

  const envPath = path.join(__dirname, '.env');
  const envContent = `# ElevenLabs Secret API Key (ONLY READ BY EXPRESS SERVER)\nELEVENLABS_API_KEY=${cleanKey}\nPORT=${PORT}\n`;
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    res.json({ success: true, message: 'API key saved to .env and active.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write .env file: ' + err.message });
  }
});

// ==================================================
// STEP 5 — CREATE THE ELEVENLABS VOICE CLONE
// ==================================================
app.post('/api/voices/clone', upload.single('sample'), async (req, res) => {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === 'YOUR_REAL_ELEVENLABS_KEY') {
    return res.status(401).json({
      status: 'error',
      code: 401,
      error: 'ELEVENLABS_API_KEY is missing in server .env environment.'
    });
  }

  const { name, consent } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Voice Name is required.' });
  }

  if (consent !== 'true' && consent !== true) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Permission consent confirmation is required.' });
  }

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Audio recording file must be attached.' });
  }

  try {
    console.log(`[Clone Request] Uploading audio sample (${req.file.size} bytes, ${req.file.mimetype}) for voice "${name}"...`);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', 'Standalone Family Voice Clone Test');

    // Create a Node 20 global File object attached to form-data
    const sampleFileName = req.file.originalname || 'voice_sample.webm';
    const audioFile = new File([req.file.buffer], sampleFileName, { type: req.file.mimetype || 'audio/webm' });
    formData.append('files', audioFile);

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: formData
    });

    const resText = await response.text();

    if (!response.ok) {
      console.error(`[ElevenLabs Clone Error] HTTP ${response.status}:`, resText);
      return res.status(response.status).json({
        status: 'error',
        code: response.status,
        error: resText
      });
    }

    let data;
    try {
      data = JSON.parse(resText);
    } catch (e) {
      return res.status(500).json({ status: 'error', code: 500, error: 'Failed to parse ElevenLabs JSON response: ' + resText });
    }

    console.log(`[Clone Success] ElevenLabs returned Voice ID: ${data.voice_id}`);

    res.status(201).json({
      status: 'success',
      voice_id: data.voice_id,
      requires_verification: data.requires_verification || false,
      name: name.trim()
    });
  } catch (err) {
    console.error('[Clone Exception]:', err.message);
    res.status(500).json({
      status: 'error',
      code: 500,
      error: `Server Exception during voice cloning: ${err.message}`
    });
  }
});

// ==================================================
// STEP 6 — CRITICAL VOICE-ID TEST (TTS)
// ==================================================
app.post('/api/voices/:voiceId/test', async (req, res) => {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === 'YOUR_REAL_ELEVENLABS_KEY') {
    return res.status(401).json({
      status: 'error',
      code: 401,
      error: 'ELEVENLABS_API_KEY is missing in server .env environment.'
    });
  }

  const { voiceId } = req.params;
  const { text } = req.body;

  if (!voiceId) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Target Voice ID is required.' });
  }

  const testText = text || "Hi! This is a test of my cloned family voice. Tonight we're going to read a wonderful story together.";

  try {
    console.log(`[TTS Test Request] Generating speech using EXACT Voice ID "${voiceId}"...`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: testText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.15,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ElevenLabs TTS Error] HTTP ${response.status} for Voice ID ${voiceId}:`, errText);
      return res.status(response.status).json({
        status: 'error',
        code: response.status,
        error: errText
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Voice-ID', voiceId);
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('[TTS Exception]:', err.message);
    res.status(500).json({
      status: 'error',
      code: 500,
      error: `Server Exception during TTS synthesis: ${err.message}`
    });
  }
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 STANDALONE ELEVENLABS VOICE TESTER RUNNING`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔑 Key configured: ${getApiKey() && getApiKey() !== 'YOUR_REAL_ELEVENLABS_KEY' ? 'YES' : 'NO (Action required)'}`);
  console.log(`==================================================\n`);
});
