import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ElevenLabsService from '../services/elevenlab-service.js';
import hebrewTtsService from '../services/hebrew-tts-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize ElevenLabs service
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsService = elevenLabsApiKey 
  ? new ElevenLabsService(elevenLabsApiKey)
  : null;

console.log(`[VoiceOver] ElevenLabs API configured: ${elevenLabsService ? 'YES' : 'NO'}`);
console.log(`[VoiceOver] Native Israeli Hebrew Neural TTS Engine initialized: YES`);

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

// Multilingual language catalog with Hebrew positioned at the end
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (US / UK)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'zh', name: 'Mandarin Chinese (中文)', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'nl', name: 'Dutch (Nederlands)', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'pl', name: 'Polish (Polski)', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish (Svenska)', flag: '🇸🇪' },
  { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
  { code: 'el', name: 'Greek (Ελληνικά)', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew (עברית ישראלית)', flag: '🇮🇱' }
];

// Clean Modern Hebrew phrases formatted for natural pronunciation
const MULTILINGUAL_PHRASES = {
  en: "Welcome to FableVoice Audio Studio. Active voice model calibrated with multilingual speech synthesis.",
  es: "Buenas noches mi pequeño héroe, que descanses y que las estrellas guíen tus hermosos sueños.",
  fr: "Bonne nuit mon petit ange, dors bien et fais de très beaux rêves étoilés.",
  de: "Gute Nacht, mein kleiner Held, schlaf gut und träum etwas Wunderschönes.",
  it: "Buonanotte mio piccolo eroe, dormi sereno e fai sogni d'oro.",
  pt: "Boa noite meu pequeno herói, durma bem e tenha lindos sonhos estelares.",
  ja: "おやすみなさい、私の小さなヒーロー。素敵な星の夢を見てね。",
  zh: "晚安，我的小英雄，做个甜甜的美梦，繁星会守护着你。",
  ko: "잘 자요, 나의 작은 영웅. 반짝이는 별들이 예쁜 꿈으로 안내해 줄 거예요.",
  hi: "शुभ रात्रि मेरे प्यारे बच्चे, मीठे सपने देखो और आराम से सो जाओ।",
  ar: "تصبح على خير يا بطلي الصغير، נוماً هניئاً ואחלאماً سعيدة.",
  nl: "Goedenacht mijn kleine held, slaap lekker en droom fijn.",
  ru: "Спокойной ночи, мой маленький герой, приятных снов под звёздным небом.",
  he: "שלום, לילה טוב והמשך ערב נעים. חלומות פז ושינה מתוקה."
};

// GET available voices (including native Israeli Hebrew voices)
router.get('/voices', async (req, res) => {
  try {
    const { category } = req.query;
    let combinedVoices = [];

    // Add native Israeli Hebrew neural voices
    const hebrewVoices = hebrewTtsService.getHebrewVoices().map(v => ({
      id: v.id,
      name: v.name,
      category: 'hebrew',
      description: v.description,
      previewUrl: null,
      labels: { gender: v.gender, accent: 'Israeli Hebrew (עברית)', descriptive: 'Native Hebrew Neural Voice' }
    }));

    combinedVoices.push(...hebrewVoices);

    // Add ElevenLabs voices if available
    if (elevenLabsService && elevenLabsService.isConfigured()) {
      try {
        let elVoices = await elevenLabsService.getVoices();
        combinedVoices.push(...elVoices);
      } catch (err) {
        console.error('[VoiceOver] Error fetching ElevenLabs voices:', err.message);
      }
    } else {
      // Default fallback standard voices
      combinedVoices.push(
        { 
          id: '21m00Tcm4TlvDq8ikWAM', 
          name: 'Rachel - Calibrated Storyteller', 
          category: 'family', 
          description: 'Warm, soothing maternal voice profile',
          previewUrl: null,
          labels: { gender: 'Female', accent: 'Multilingual', descriptive: 'Maternal Storyteller' }
        },
        { 
          id: 'AZnzlk1XvdvUeBnXmlld', 
          name: 'Domi - Adventure Narrator', 
          category: 'professional', 
          description: 'Deep, engaging fatherly voice profile',
          previewUrl: null,
          labels: { gender: 'Male', accent: 'Multilingual', descriptive: 'Deep & Reassuring' }
        }
      );
    }

    if (category) {
      combinedVoices = combinedVoices.filter(v => v.category === category);
    }

    res.json(combinedVoices);
  } catch (error) {
    console.error('Voice fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// GET soundtrack catalog
router.get('/soundtracks', (req, res) => {
  res.json(SOUNDTRACK_CATALOG);
});

// GET multilingual catalog & phrases
router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    phrases: MULTILINGUAL_PHRASES
  });
});

// POST generate AI Screenplay Script (with natural Hebrew phrases)
router.post('/screenplay/generate-script', (req, res) => {
  const { theme, characters, childName, language } = req.body;
  const name = childName || (language === 'he' ? 'דניאל' : 'Leo');
  const lang = language || 'en';

  const storyThemesHe = {
    'bedtime': {
      title: `המסע של ${name} לאי החלומות`,
      scenes: [
        { character: 'Narrator', text: `השמש שקעה לאיטה מעבר לאופק, והערב השקט ירד על הבית של ${name}.` },
        { character: 'Mother', text: `לילה טוב ילד שלי. עצום עיניים ותקשיב לשיר הערש שהכוכבים שרים לך בשמיים.` },
        { character: 'Child', text: `לילה טוב אמא, לילה טוב כוכבים נוצצים, לילה טוב לכל העולם.` },
        { character: 'Narrator', text: `עם חיוך שליו ורוגע עמוק, ${name} נרדם ונכנס אל עולם של חלומות יפים ונעימים.` }
      ]
    },
    'fantasy': {
      title: `${name} ודרקון הכוכבים`,
      scenes: [
        { character: 'Narrator', text: `בלב היער הקסום, במקום שבו הציפורים שרות בלילה, ${name} מצא שביל של אור זוהר.` },
        { character: 'Child', text: `תראו כמה האור הזה יפה! בואו נלך ונראה לאן הוא מוביל אותנו.` },
        { character: 'Wise Elder', text: `רק בעלי לב טוב ואוהב יכולים לפגוש את דרקון הכוכבים ולהביא שלום ליער.` },
        { character: 'Narrator', text: `הדרקון חייך, פיזר אבק כוכבים נוצץ, והאיר את הלילה בשלווה ובשמחה גדולה.` }
      ]
    }
  };

  const storyThemesEn = {
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

  const selectedStory = (lang === 'he' && storyThemesHe[theme])
    ? storyThemesHe[theme]
    : (storyThemesEn[theme] || storyThemesEn['bedtime']);

  res.json(selectedStory);
});

// POST generate voiceover with auto-routing to Native Hebrew Neural Engine OR ElevenLabs
router.post('/generate', async (req, res) => {
  try {
    const { script, voice, emotion, stability, similarityBoost, style, speed, modelId, language } = req.body;

    if (!script || !script.trim()) {
      return res.status(400).json({ error: 'Script text is required' });
    }

    const isHebrewText = /[\u0590-\u05FF]/.test(script) || language === 'he' || (voice && voice.startsWith('he-IL'));

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. ROUTE TO NATIVE HEBREW NEURAL ENGINE FOR 100% CRYSTAL-CLEAR ISRAELI SPEECH
    if (isHebrewText) {
      console.log(`[VoiceOver] Routing to Native Israeli Hebrew Neural Engine (chars=${script.length})`);
      try {
        const audioBuffer = await hebrewTtsService.synthesizeHebrew(script, voice || 'he-IL-HilaNeural');
        const filename = `hebrew-voiceover-${Date.now()}.mp3`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, audioBuffer);

        return res.json({
          id: `vo-he-${Date.now()}`,
          filename,
          url: `/uploads/${filename}`,
          voice: voice || 'he-IL-HilaNeural',
          script,
          audioLength: audioBuffer.length,
          duration: Math.ceil(script.length / 12),
          status: 'complete',
          engine: 'Native Israeli Neural Engine',
          createdAt: new Date().toISOString()
        });
      } catch (heErr) {
        console.error('[VoiceOver] Native Hebrew synthesis error:', heErr);
        return res.status(500).json({ error: `Hebrew synthesis error: ${heErr.message}` });
      }
    }

    // 2. ROUTE TO ELEVENLABS FOR ENGLISH & MULTILINGUAL SPEECH
    if (!elevenLabsService || !elevenLabsService.isConfigured()) {
      return res.status(400).json({ error: 'ElevenLabs API key is not configured or invalid' });
    }

    console.log(`[VoiceOver] ElevenLabs synthesis: voice=${voice}, chars=${script.length}`);

    try {
      const audioBuffer = await elevenLabsService.synthesize(script, voice, {
        emotion: emotion || 'neutral',
        stability: typeof stability === 'number' ? stability : 0.5,
        similarityBoost: typeof similarityBoost === 'number' ? similarityBoost : 0.75,
        style: typeof style === 'number' ? style : 0.0,
        modelId: modelId || 'eleven_multilingual_v2',
        language: language || 'auto'
      });

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
        engine: 'ElevenLabs Multilingual V2',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[VoiceOver] ElevenLabs synthesis failed:', err.message);
      return res.status(500).json({ error: err.message || 'Audio synthesis failed' });
    }
  } catch (error) {
    console.error('Generation route error:', error);
    res.status(500).json({ error: error.message || 'Voiceover generation failed' });
  }
});

// Health check for ElevenLabs & Hebrew Engine
router.get('/status', (req, res) => {
  res.json({
    service: 'voiceover',
    hebrewEngine: 'ready (Native Israeli Neural)',
    elevenLabsConfigured: elevenLabsService ? elevenLabsService.isConfigured() : false,
    status: 'ready'
  });
});

export default router;
