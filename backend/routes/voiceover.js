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

// GET available voices (with optional category filter)
router.get('/voices', async (req, res) => {
  try {
    const { category } = req.query; // 'professional', 'cartoon', or all

    // If ElevenLabs is configured, fetch real voices
    if (elevenLabsService && elevenLabsService.isConfigured()) {
      try {
        let voices = await elevenLabsService.getVoices();

        // Filter by category if requested
        if (category) {
          voices = voices.filter(v => v.category === category);
        }

        return res.json(voices);
      } catch (err) {
        console.error('Error fetching ElevenLabs voices:', err);
        // Fall back to default voices
      }
    }

    // Default voices (fallback if ElevenLabs not configured)
    let defaultVoices = [
      { 
        id: 'default-male', 
        name: 'Default Male', 
        category: 'professional', 
        description: 'Standard male voice',
        cartoonCharacter: null,
        cartoonStyle: null
      },
      { 
        id: 'default-female', 
        name: 'Default Female', 
        category: 'professional', 
        description: 'Standard female voice',
        cartoonCharacter: null,
        cartoonStyle: null
      },
      { 
        id: 'cartoon-1', 
        name: 'Cartoon Character 1', 
        category: 'cartoon', 
        description: 'Fun cartoon voice',
        cartoonCharacter: 'character_1',
        cartoonStyle: 'Energetic, playful'
      }
    ];

    // Filter by category if requested
    if (category) {
      defaultVoices = defaultVoices.filter(v => v.category === category);
    }

    res.json(defaultVoices);
  } catch (error) {
    console.error('Voice fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// GET voices by category
router.get('/voices/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs not configured' });
    }

    const voices = await elevenLabsService.getVoicesByCategory(category);
    res.json(voices);
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch voices by category' });
  }
});

// GET all cartoon voices specifically
router.get('/voices/cartoon/all', async (req, res) => {
  try {
    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs not configured' });
    }

    const cartoonVoices = await elevenLabsService.getVoices(true);
    res.json(cartoonVoices);
  } catch (error) {
    console.error('Cartoon voices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cartoon voices' });
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

// POST generate voiceover
router.post('/generate', async (req, res) => {
  try {
    const { script, voice, emotion, format } = req.body;

    if (!script || !voice) {
      return res.status(400).json({ error: 'Script and voice are required' });
    }

    // If ElevenLabs is configured, generate real audio
    if (elevenLabsService && elevenLabsService.isConfigured()) {
      try {
        // Generate audio
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

        return res.json({
          id: `vo-${Date.now()}`,
          filename,
          url: `/uploads/${filename}`,
          voice,
          emotion: emotion || 'neutral',
          script,
          duration: Math.ceil(script.length / 15),
          status: 'complete',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('ElevenLabs generation error:', err);
        return res.status(500).json({ error: 'Audio generation failed', details: err.message });
      }
    }

    // Fallback: placeholder response
    res.json({
      id: `vo-${Date.now()}`,
      script,
      voice,
      emotion: emotion || 'neutral',
      duration: Math.ceil(script.length / 15),
      status: 'processing',
      message: 'ElevenLabs not configured. Placeholder response.',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Voiceover generation failed' });
  }
});

// POST text-to-speech conversion
router.post('/tts', async (req, res) => {
  try {
    const { text, voice, emotion } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'Text and voice are required' });
    }

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs API not configured' });
    }

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
    elevenLabsConfigured: elevenLabsService && elevenLabsService.isConfigured(),
    status: 'ready'
  });
});

export default router;
