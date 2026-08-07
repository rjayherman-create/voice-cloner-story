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

// Curated Ambient Soundtracks for Bedtime & Children Stories
const SOUNDTRACK_CATALOG = [
  {
    id: 'lullaby-harp',
    title: 'Lullaby Harp & Celestial Strings',
    category: 'Bedtime',
    tempo: 'Slow & Gentle (60 BPM)',
    previewNote: 'Soft soothing harp notes for restful bedtime sleep',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-lullaby-piano-112199.mp3'
  },
  {
    id: 'enchanted-forest',
    title: 'Enchanted Forest Whispers',
    category: 'Fantasy',
    tempo: 'Atmospheric (72 BPM)',
    previewNote: 'Gentle night breeze, twinkling chimes, and distant magical flutes',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf73301.mp3?filename=magical-story-10339.mp3'
  },
  {
    id: 'cosmic-wonder',
    title: 'Starlight Music Box & Dreams',
    category: 'Wonder',
    tempo: 'Calm & Dreamy (64 BPM)',
    previewNote: 'Delicate music box bells floating through starry skies',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lullaby-music-box-12345.mp3'
  },
  {
    id: 'gentle-rain-piano',
    title: 'Gentle Rain & Cozy Piano',
    category: 'Relaxation',
    tempo: 'Serene (55 BPM)',
    previewNote: 'Warm piano chords accompanied by soft rainfall',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_b287518596.mp3?filename=peaceful-piano-10707.mp3'
  }
];

// GET available voices
router.get('/voices', async (req, res) => {
  try {
    const { category } = req.query;

    if (elevenLabsService && elevenLabsService.isConfigured()) {
      try {
        let voices = await elevenLabsService.getVoices();
        if (category) {
          voices = voices.filter(v => v.category === category);
        }
        return res.json(voices);
      } catch (err) {
        console.error('[VoiceOver] Error fetching ElevenLabs voices:', err.message);
      }
    }

    // Default fallback voices
    let defaultVoices = [
      { 
        id: 'default-female', 
        name: 'Sarah - Bedtime Storyteller', 
        category: 'family', 
        description: 'Warm, soothing maternal voice profile',
        previewUrl: null,
        labels: { gender: 'Female', accent: 'American', descriptive: 'Maternal Storyteller' }
      },
      { 
        id: 'default-male', 
        name: 'Roger - Adventure Narrator', 
        category: 'professional', 
        description: 'Deep, engaging fatherly voice profile',
        previewUrl: null,
        labels: { gender: 'Male', accent: 'American', descriptive: 'Deep & Reassuring' }
      }
    ];

    res.json(defaultVoices);
  } catch (error) {
    console.error('Voice fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// GET soundtrack catalog
router.get('/soundtracks', (req, res) => {
  res.json(SOUNDTRACK_CATALOG);
});

// POST generate AI Screenplay Script
router.post('/screenplay/generate-script', (req, res) => {
  const { theme, characters, childName } = req.body;
  const name = childName || 'Leo';

  const storyThemes = {
    'fantasy': {
      title: `${name} and the Enchanted Star-Dragon`,
      scenes: [
        { character: 'Narrator', text: `Deep within the whispering sapphire woods, where fireflies glowed like little suns, young ${name} found a shimmering golden key tucked under a sleeping acorn.` },
        { character: 'Child', text: `Look! It’s glowing! I wonder what magical door this key opens tonight...` },
        { character: 'Wise Elder', text: `Hold tight to your courage, little traveler. The Star-Dragon only shares his light with those who have a kind and gentle heart.` },
        { character: 'Narrator', text: `With a deep breath and a joyful smile, ${name} turned the key in the ancient oak tree, and the sky burst into a magnificent shower of peaceful starlight.` }
      ]
    },
    'bedtime': {
      title: `${name}’s Voyage to the Island of Dreams`,
      scenes: [
        { character: 'Narrator', text: `As twilight settled softly over the rooftops, the gentle night wind whispered a cozy lullaby to ${name}.` },
        { character: 'Mother', text: `Close your eyes, my dear. The moon is painting the clouds in shades of silver and lavender, watching over your sweet dreams.` },
        { character: 'Child', text: `Goodnight stars, goodnight moon, goodnight sleepy world...` },
        { character: 'Narrator', text: `Wrapped in warm blankets, ${name} drifted peacefully off into the land where every adventure is filled with wonder, safe and sound.` }
      ]
    },
    'adventure': {
      title: `${name} and the Secret Cloud Castle`,
      scenes: [
        { character: 'Narrator', text: `High above the velvet mountains, a castle woven entirely of marshmallow clouds floated across the twilight sky.` },
        { character: 'Father', text: `Ready for liftoff, captain? Grab your compass, tonight we chart a course for the Northern Constellations!` },
        { character: 'Child', text: `Full speed ahead! I can already see the glowing rainbow bridge!` },
        { character: 'Narrator', text: `Together, hand in hand, they soared through the sparkling clouds, laughing all the way home to bed.` }
      ]
    }
  };

  const selectedStory = storyThemes[theme] || storyThemes['bedtime'];
  res.json(selectedStory);
});

// POST generate voiceover with fine-tuned voice settings (stability, clarity, speed)
router.post('/generate', async (req, res) => {
  try {
    const { script, voice, emotion, stability, similarityBoost, style, speed } = req.body;

    if (!script || !voice) {
      return res.status(400).json({ error: 'Script and voice are required' });
    }

    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs API not configured' });
    }

    console.log(`[VoiceOver] Generating speech: voice=${voice}, chars=${script.length}, stability=${stability}, similarityBoost=${similarityBoost}`);

    try {
      const audioBuffer = await elevenLabsService.synthesize(script, voice, {
        emotion: emotion || 'neutral',
        stability: typeof stability === 'number' ? stability : 0.5,
        similarityBoost: typeof similarityBoost === 'number' ? similarityBoost : 0.75,
        style: typeof style === 'number' ? style : 0.0,
        modelId: 'eleven_turbo_v2_5'
      });

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
        script,
        audioLength: audioBuffer.length,
        duration: Math.ceil(script.length / 14),
        status: 'complete',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[VoiceOver] ElevenLabs synthesis error:', err);
      return res.status(500).json({ error: 'Audio synthesis failed', details: err.message });
    }
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Voiceover generation failed' });
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
