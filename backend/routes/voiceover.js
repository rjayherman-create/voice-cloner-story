import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ElevenLabsService from '../services/elevenlab-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize ElevenLabs service
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsService = elevenLabsApiKey 
  ? new ElevenLabsService(elevenLabsApiKey)
  : null;

console.log(`[VoiceOver] ElevenLabs API configured: ${elevenLabsService ? 'YES' : 'NO'}`);
if (elevenLabsService) {
  console.log(`[VoiceOver] API Key: ${elevenLabsApiKey.substring(0, 10)}...`);
}

// GET available voices (with optional category filter)
router.get('/voices', async (req, res) => {
  try {
    const { category } = req.query;

    // ALWAYS try to fetch from ElevenLabs first if configured
    if (elevenLabsService && elevenLabsService.isConfigured()) {
      try {
        console.log('[VoiceOver] Fetching voices from ElevenLabs API...');
        let voices = await elevenLabsService.getVoices();
        console.log(`[VoiceOver] Successfully fetched ${voices.length} voices from ElevenLabs`);

        // Filter by category if requested
        if (category) {
          voices = voices.filter(v => v.category === category);
        }

        return res.json(voices);
      } catch (err) {
        console.error('[VoiceOver] Error fetching ElevenLabs voices:', err.message);
        // Fall through to default voices on error
      }
    } else {
      console.log('[VoiceOver] ElevenLabs not configured, using default voices');
    }

    // Default voices (fallback if ElevenLabs not configured or errored)
    let defaultVoices = [
      { 
        id: 'default-male', 
        name: 'Default Male', 
        category: 'professional', 
        description: 'Standard male voice',
        previewUrl: null,
        labels: {
          gender: 'Male',
          accent: 'American',
          descriptive: 'Professional'
        }
      },
      { 
        id: 'default-female', 
        name: 'Default Female', 
        category: 'professional', 
        description: 'Standard female voice',
        previewUrl: null,
        labels: {
          gender: 'Female',
          accent: 'American',
          descriptive: 'Professional'
        }
      }
    ];

    if (category) {
      defaultVoices = defaultVoices.filter(v => v.category === category);
    }

    res.json(defaultVoices);
  } catch (error) {
    console.error('Voice fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// GET voice preview URL
router.get('/voices/:voiceId/preview', async (req, res) => {
  try {
    const { voiceId } = req.params;

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs not configured' });
    }

    const previewUrl = await elevenLabsService.getVoicePreview(voiceId);
    res.json({ previewUrl });
  } catch (error) {
    console.error('Preview fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
});

// GET available emotions
router.get('/emotions', (req, res) => {
  const emotions = [
    'neutral',
    'happy',
    'sad',
    'angry',
    'excited',
    'calm',
    'serious'
  ];

  res.json(emotions);
});

// POST generate voiceover with real audio file creation
router.post('/generate', async (req, res) => {
  try {
    const { script, voice, emotion, format } = req.body;

    if (!script || !voice) {
      return res.status(400).json({ error: 'Script and voice are required' });
    }

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs API not configured' });
    }

    console.log(`[VoiceOver] Generating audio: voice=${voice}, emotion=${emotion}, chars=${script.length}`);

    try {
      // Generate audio from ElevenLabs
      const audioBuffer = await elevenLabsService.synthesize(script, voice, {
        emotion: emotion || 'neutral',
        modelId: 'eleven_turbo_v2_5'
      });

      // Save audio file
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `voiceover-${Date.now()}.mp3`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, audioBuffer);

      console.log(`[VoiceOver] Audio file saved: ${filename} (${audioBuffer.length} bytes)`);

      return res.json({
        id: `vo-${Date.now()}`,
        filename,
        url: `/uploads/${filename}`,
        voice,
        emotion: emotion || 'neutral',
        script,
        audioLength: audioBuffer.length,
        duration: Math.ceil(script.length / 15),
        status: 'complete',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[VoiceOver] ElevenLabs generation error:', err);
      return res.status(500).json({ error: 'Audio generation failed', details: err.message });
    }
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Voiceover generation failed' });
  }
});

// POST text-to-speech conversion (streaming)
router.post('/tts', async (req, res) => {
  try {
    const { text, voice, emotion } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'Text and voice are required' });
    }

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs API not configured' });
    }

    console.log(`[VoiceOver] TTS request: voice=${voice}, chars=${text.length}`);

    const audioBuffer = await elevenLabsService.synthesize(text, voice, {
      emotion: emotion || 'neutral'
    });

    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'TTS conversion failed' });
  }
});

// Health check for ElevenLabs
router.get('/status', (req, res) => {
  res.json({
    service: 'voiceover',
    elevenLabsConfigured: elevenLabsService ? elevenLabsService.isConfigured() : false,
    status: 'ready'
  });
});

export default router;
