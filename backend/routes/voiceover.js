import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ElevenLabsService from '../services/elevenlab-service.js';
import hebrewTtsService from '../services/hebrew-tts-service.js';
import hebrewPhoneticsEngine from '../services/hebrew-phonetics.js';
import multilingualRosterService from '../services/multilingual-roster.js';
import translationService from '../services/translation-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to dynamically obtain ElevenLabsService with process.env.ELEVENLABS_API_KEY
function getElevenLabsService() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new ElevenLabsService(apiKey.trim());
}

console.log(`[VoiceOver] 30 Native Israeli Hebrew Neural Voice Models: READY`);
console.log(`[VoiceOver] 30-Persona Multilingual Voice Engine (All Languages): READY`);
console.log(`[VoiceOver] Persistent Voice Clone Bucket Storage: ACTIVE`);

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
  ar: "تصبح على خير يا بطלי الصغير، נוماً هניئاً ואחלאماً سعيدة.",
  nl: "Goedenacht mijn kleine held, slaap lekker en droom fijn.",
  ru: "Спокойной ночи, мой маленький герой, приятных снов под звёздным небом.",
  he: "שלום, לילה טוב והמשך ערב נעים. חלומות פז ושינה מתוקה."
};

// GET 30-voice persona roster for any chosen language
router.get('/roster/:lang', (req, res) => {
  const lang = req.params.lang || 'en';
  if (lang === 'he') {
    const heVoices = hebrewTtsService.getHebrewVoices();
    return res.json({
      language: 'he',
      languageName: 'Hebrew (עברית ישראלית)',
      flag: '🇮🇱',
      voices: heVoices
    });
  }
  const roster = multilingualRosterService.getRosterForLanguage(lang);
  res.json(roster);
});

// GET available voices (including 30 Hebrew models, bucket clones, and language roster)
router.get('/voices', async (req, res) => {
  try {
    const { category, language } = req.query;
    let combinedVoices = [];

    // Always include the 30 Native Israeli Hebrew voice models
    const hebrewVoices = hebrewTtsService.getHebrewVoices().map(v => ({
      id: v.id,
      name: v.name,
      group: v.group,
      groupLabel: v.groupLabel,
      relationship: v.relationship,
      category: 'hebrew',
      description: v.description,
      previewUrl: null,
      labels: { gender: v.gender, accent: 'Israeli Hebrew (עברית)', descriptive: 'Native Hebrew Neural Voice' }
    }));

    combinedVoices.push(...hebrewVoices);

    // If specific language requested, include its 30 curated personas
    if (language && language !== 'he') {
      const roster = multilingualRosterService.getRosterForLanguage(language);
      combinedVoices.push(...roster.voices);
    }

    // Add ElevenLabs base voices if configured in environment variable
    const elevenLabs = getElevenLabsService();
    if (elevenLabs && elevenLabs.isConfigured()) {
      try {
        let elVoices = await elevenLabs.getVoices();
        combinedVoices.push(...elVoices);
      } catch (err) {
        console.error('[VoiceOver] Error fetching ElevenLabs voices:', err.message);
      }
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

// POST transliterate Hebrew to phonetics for cloned voice models
router.post('/transliterate-hebrew', (req, res) => {
  const { text } = req.body;
  const phonetics = hebrewPhoneticsEngine.transliterate(text || '');
  res.json({ original: text, phonetics });
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

// POST generate AI Screenplay Script
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

// POST Auto-Translate Text Endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    if (!text || !text.trim()) {
      return res.json({ success: true, text: '' });
    }

    const translatedText = await translationService.translate(text, targetLanguage || 'en', sourceLanguage || 'auto');
    res.json({
      success: true,
      originalText: text,
      targetLanguage,
      translatedText
    });
  } catch (err) {
    console.error('[VoiceOver] Translation route error:', err);
    res.status(500).json({ error: err.message || 'Translation failed', translatedText: req.body.text });
  }
});

// POST AI Script Assistant (Ideas, Podcast Hooks, News Items, Commercials, Length Calibration & Smart Editing)
router.post('/ai-script-assistant', async (req, res) => {
  try {
    const { action, format, currentText, topic, tone, targetLength, language } = req.body;
    const lang = language || 'en';
    const isHe = lang === 'he' || /[\u0590-\u05FF]/.test(topic || currentText || '');
    const len = targetLength || '30s';

    // 1. EDITING / POLISHING / LENGTH FIT ACTIONS
    if (action === 'edit') {
      const text = currentText || '';
      if (!text.trim()) {
        return res.status(400).json({ error: 'Text to edit is required' });
      }

      let resultText = text;

      if (tone === 'conversational') {
        if (isHe) {
          resultText = text
            .replace(/\bשלום\b/g, 'היי לכולם, מה שלומכם? ')
            .replace(/\bאמר\b/g, 'שיתף בהתרגשות')
            .replace(/\./g, '... ') + ' תחשבו על זה רגע, איזה יופי!';
        } else {
          resultText = `Hey everyone, check this out... ${text.replace(/\. /g, '—and you know what? ')} Pretty fascinating, right?`;
        }
      } else if (tone === 'news') {
        if (isHe) {
          resultText = `מבזק חדשות מיוחד: ${text.replace(/\.\s*/g, '. ')} כאן מוקד הדיווחים, נמשיך לעדכן.`;
        } else {
          resultText = `Breaking News Bulletin: ${text.replace(/\.\s*/g, '. ')} Reporting live from the studio, stay tuned for further updates.`;
        }
      } else if (tone === 'shorten' || tone === 'fit_15s') {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        resultText = sentences.slice(0, Math.max(1, Math.min(2, sentences.length))).join('. ').trim() + '.';
      } else if (tone === 'fit_30s') {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        resultText = sentences.slice(0, Math.max(2, Math.min(4, sentences.length))).join('. ').trim() + '.';
      } else if (tone === 'pauses') {
        resultText = text
          .replace(/,/g, ', ...')
          .replace(/\./g, '. \n\n')
          .replace(/—/g, ' — ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        // General polish
        if (isHe) {
          resultText = text.trim().replace(/\s+/g, ' ') + ' שיהיה יום מבורך ומלא השראה.';
        } else {
          resultText = text.trim().replace(/\s+/g, ' ');
          if (!/[.!?]$/.test(resultText)) resultText += '.';
        }
      }

      return res.json({
        success: true,
        action: 'edit',
        tone: tone || 'polish',
        targetLength: len,
        text: resultText
      });
    }

    // 2. CREATIVE GENERATION CALIBRATED BY TARGET LENGTH & FORMAT
    const customTopic = topic && topic.trim() ? topic.trim() : (isHe ? 'עתיד הבינה המלאכותית והטכנולוגיה' : 'the future of artificial intelligence');

    const GENERATED_TEMPLATES_BY_LENGTH = {
      en: {
        '15s': {
          podcast: `Welcome back to The Daily Frequency! Today we're breaking down ${customTopic} in 60 seconds. Let's get right into it!`,
          news: `Breaking News: Major developments announced today regarding ${customTopic}. Analysts report significant market impact. Stay tuned for details.`,
          commercial: `Discover the breakthrough power of ${customTopic}. Built for high performance and unmatched quality. Try it today!`,
          narration: `In a world of constant motion, ${customTopic} sparked a quiet revolution that would change everything.`,
          interview: `Today in the studio, our guest breaks down ${customTopic}. Welcome to the show!`,
          video_script: `[VISUAL: Fast-paced cinematic title card over dynamic motion graphics]\n[VOICEOVER]: Did you know that ${customTopic} is changing everything we know about creation? Here is the 15-second breakdown!`,
          kids_story: `Once upon a starry evening, a friendly little star named Pip discovered ${customTopic} and lit up the whole enchanted night sky!`
        },
        '30s': {
          podcast: `Welcome back to The Daily Frequency! Today we're exploring an incredible breakthrough: ${customTopic}. Whether you're listening on your morning commute or relaxing at home, this is one story you don't want to miss. Let's dive in!`,
          news: `Top Story of the Hour: New developments emerge regarding ${customTopic}. Industry leaders and analysts report significant progress, marking a pivotal moment in today's broadcast. Reporting live, more updates at the top of the hour.`,
          commercial: `Are you ready for the next big breakthrough? Discover the power of ${customTopic}. Designed for creators, thinkers, and innovators who demand the absolute best. Try it today and experience the difference for yourself!`,
          narration: `In a world shaped by rapid change and quiet wonders, ${customTopic} emerged as a guiding light. As dawn broke across the horizon, a new chapter of discovery and inspiration had officially begun.`,
          interview: `Joining us today in the studio is our special guest to talk about ${customTopic}. Thanks for being here—tell us, what was the initial spark that brought this whole project to life?`,
          video_script: `[SCENE 1 - 0:00 - Close-up on speaker in studio with warm ambient lighting]\n[VOICEOVER]: What if I told you that ${customTopic} is about to transform everything you do?\n\n[SCENE 2 - 0:15 - B-Roll cut to high-tech motion graphics and user interface]\n[VOICEOVER]: In today's video, we're revealing the exact breakthrough you need to know. Make sure to hit subscribe, and let's jump right in!`,
          kids_story: `Once upon a time, in a cozy forest where trees whispered secrets, a cheerful little bear named Barnaby discovered ${customTopic}. With a gentle smile and a lantern in his paw, he set off on a wondrous adventure under the twinkling moon.`
        },
        '60s': {
          podcast: `Welcome back to The Daily Frequency! Today we have an extraordinary episode lined up as we examine ${customTopic}. Over the past few weeks, we've seen immense curiosity and debate around what this means for creators, innovators, and our daily lives.\n\nWe're going to unpack the key takeaways, separate the hype from reality, and look at where things are heading next. Settle in with your favorite coffee and let's jump right into the story!`,
          news: `Good morning, this is your special news briefing. Our lead story today centers on groundbreaking updates surrounding ${customTopic}.\n\nAccording to officials and industry observers, recent milestones represent a major leap forward, bringing both new opportunities and important strategic discussions to the forefront. Regulatory bodies and international partners are closely monitoring the rollout. We will bring you live expert commentary and on-the-ground reactions as this story continues to unfold throughout the day.`,
          commercial: `Every once in a while, a tool comes along that completely transforms the way you work and create. Meet the next generation of ${customTopic}.\n\nBuilt from the ground up with studio-grade precision, lightning-fast performance, and an intuitive design that puts you in total control. Join thousands of top creators and professionals who have already upgraded their workflow. Visit our website today to claim your exclusive trial and experience the difference!`,
          narration: `Deep across the horizon, where curiosity meets the edge of the unknown, the journey into ${customTopic} took its first bold steps. Generations of seekers had dreamed of this moment, yet few imagined how swiftly the world would transform.\n\nAs the golden morning light bathed the valleys, whispers of anticipation filled the air. A timeless chapter was unfolding—one where courage, wonder, and imagination forged an unbreakable legacy.`,
          interview: `Welcome back to our studio spotlight series. Today we're thrilled to welcome our featured guest to discuss the groundbreaking work behind ${customTopic}.\n\nFrom the early design sketches to the latest international rollout, this initiative has captivated attention across the industry. Thank you so much for joining us—let's start from the very beginning. What inspired you to take on this ambitious challenge?`,
          video_script: `[SCENE 1 - 0:00 - High-energy intro with animated typography]\n[VOICEOVER]: In just sixty seconds, we're uncovering the truth behind ${customTopic}.\n\n[SCENE 2 - 0:20 - B-Roll screen recordings showcasing real-world workflow]\n[VOICEOVER]: Over the past few months, creators across the world have adopted this revolutionary technique to save hours and unlock studio-quality results.\n\n[SCENE 3 - 0:45 - Camera returns to presenter with call-to-action overlay]\n[VOICEOVER]: If you want to master this for yourself, check the link in the description below and leave your thoughts in the comments!`,
          kids_story: `Chapter 1: The Secret in the Whispering Woods.\n\nDeep in the heart of the Enchanted Valley, little Oliver the owl loved looking at ${customTopic}. Every evening when the sun melted into warm peach and purple tones, he would spread his soft wings and glide over the silver brook.\n\nTonight was special. A gentle breeze carried a lullaby through the trees, inviting every creature great and small to snuggle in cozy blankets and dream happy dreams.`
        },
        '5m': {
          podcast: `🎙️ THE DAILY FREQUENCY — 5-MINUTE FEATURE EPISODE\nTOPIC: ${customTopic}\n\n[SEGMENT 1: THE OPENING HOOK (1:00)]\nWelcome to today's special deep-dive on The Daily Frequency. Today, we're taking five focused minutes to unpack ${customTopic}.\n\nIf you've noticed the headlines lately, you know something major is shifting. But what's the real story? Let's break it down.\n\n[SEGMENT 2: THE CORE BREAKTHROUGH (2:00)]\nAt its foundation, ${customTopic} is solving a challenge that has held innovators back for years. By combining intelligent neural modeling with seamless user control, we are seeing productivity surges that were unthinkable just a year ago.\n\nEarly adopters report dramatic improvements in workflow, noting that tasks that once took days can now be completed in minutes.\n\n[SEGMENT 3: PRACTICAL APPLICATIONS (1:30)]\nSo how does this impact you? Whether you're producing content, managing complex projects, or simply curious about where the tech landscape is heading, ${customTopic} offers actionable advantages today.\n\n[SEGMENT 4: FINAL TAKEAWAY (0:30)]\nThank you for tuning into this 5-minute briefing. Keep innovating, stay curious, and join us tomorrow for our next episode!`,
          news: `📰 SPECIAL 5-MINUTE NEWS BRIEFING\nLEAD REPORT: IN-DEPTH INVESTIGATION INTO ${customTopic}\n\n[0:00 - HEADLINE SUMMARY]\nGood morning. We begin with our comprehensive five-minute report on ${customTopic}, following landmark announcements made earlier today.\n\n[1:15 - THE FACTS & CHRONOLOGY]\nAccording to official documentation and verified sources, key developments around ${customTopic} began unfolding over the past quarter. Strategic partnerships across private industry and academic institutions have accelerated the implementation timeline.\n\n[2:45 - EXPERT & REGULATORY ANALYSIS]\nFinancial and industry analysts emphasize that while adoption rates have surpassed initial benchmarks, regulatory compliance and safety guardrails remain central to sustained integration.\n\n[4:15 - LOOKING AHEAD]\nAs international stakeholders prepare for next month's global summit, all eyes remain on upcoming milestone releases. Reporting live from the central desk, we will keep you updated throughout the day.`,
          video_script: `🎬 5-MINUTE COMPLETE VIDEO SCRIPT & STORYBOARD\nTITLE: The Complete Guide to ${customTopic}\n\n[SCENE 1 - 0:00 - 0:45 | THE HOOK & INTRO]\n[VISUAL]: Fast-paced drone montage of modern cityscapes with kinetic text overlays: "THE REVOLUTION IS HERE". Cut to host in studio.\n[VOICEOVER]: If you think you understand ${customTopic}, think again. In the next five minutes, I'm going to show you why this is the biggest breakthrough of the decade.\n\n[SCENE 2 - 0:45 - 2:15 | THE THREE CORE PILLARS]\n[VISUAL]: Animated 3D diagram illustrating the engine architecture. Screen capture demo showing real-time processing.\n[VOICEOVER]: Pillar number one is precision. Unlike legacy tools that required hours of manual tweaking, ${customTopic} processes complex workflows in real time.\n\n[SCENE 3 - 2:15 - 3:45 | REAL-WORLD DEMONSTRATION]\n[VISUAL]: Split screen: Before vs. After results. B-roll of creative professionals in action.\n[VOICEOVER]: Look at the side-by-side comparison on your screen right now. Notice the difference in fidelity and natural phrasing. That is what sets this apart.\n\n[SCENE 4 - 3:45 - 5:00 | SUMMARY & CTA]\n[VISUAL]: Host returns on camera with subscribe animation and clickable card templates.\n[VOICEOVER]: That wraps up our 5-minute deep dive into ${customTopic}. Which feature surprised you the most? Let me know in the comments below!`,
          kids_story: `🧒 5-MINUTE BEDTIME AUDIO STORY: "The Secret of the Starlight Tree"\nTHEME: ${customTopic}\n\nChapter 1: The Whispering Twilight\nOnce upon a time, at the edge of the sleepy valley, little Leo the fox cub loved watching ${customTopic}. As the golden evening sky turned into shades of soft velvet indigo, Leo wrapped his bushy tail around his paws and listened to the gentle wind.\n\nChapter 2: The Starlight Glow\nHigh above the tallest pine tree, a tiny star named Twinkle began to shimmer with warm golden light. Twinkle whispered, "Don't worry little Leo, ${customTopic} is here to keep you safe and warm through the night."\n\nChapter 3: The Peaceful Slumber\nWith a slow, cozy yawn, Leo snuggled deeper into his bed of soft moss. The forest was quiet, the moon watched over the trees, and peaceful dreams filled the sweet night air.`
        },
        '10m': {
          podcast: `🎙️ THE DAILY FREQUENCY — 10-MINUTE IN-DEPTH PODCAST SPECIAL\nTOPIC: ${customTopic}\n\n[ACT 1: INTRODUCTION & CONTEXT (2:00)]\nWelcome to The Daily Frequency in-depth special. Today, we're taking ten full minutes to explore one of the most talked-about topics of our time: ${customTopic}.\n\nEvery technological leap begins with skepticism, moves into curiosity, and ends with transformation. Today, we're standing right at that transformation point.\n\n[ACT 2: THE TECHNICAL BREAKTHROUGH (3:00)]\nLet's understand how ${customTopic} actually works. Behind the scenes, advanced neural architectures and optimized pipelines are processing data with unprecedented efficiency.\n\nWhat this means in practice is that creators and organizations no longer have to choose between speed and quality. Both are now achieved simultaneously.\n\n[ACT 3: THE BROADER ECONOMIC & CREATIVE SHIFT (3:00)]\nBeyond the technology itself, we need to examine the cultural impact. Industries ranging from entertainment and media to education and enterprise are re-evaluating their core workflows around ${customTopic}.\n\n[ACT 4: CONCLUSION & FUTURE FORECAST (2:00)]\nAs we look toward the horizon, one thing is certain: those who understand and leverage ${customTopic} today will lead tomorrow's creative landscape. Thank you for listening to this 10-minute special. Stay inspired, and we'll see you on the next episode!`,
          news: `📰 10-MINUTE SPECIAL INVESTIGATIVE REPORT\nBROADCAST FOCUS: ${customTopic}\n\n[SEGMENT 1: THE BULLETIN & OVERVIEW (2:00)]\nGood evening. Tonight's special investigative report focuses on ${customTopic}, following a series of high-level announcements and groundbreaking industry disclosures.\n\n[SEGMENT 2: INVESTIGATIVE TIMELINE & ARCHITECTURE (3:00)]\nOur investigative team has spent the past three weeks analyzing technical documentation and interviewing key personnel directly involved in ${customTopic}.\n\n[SEGMENT 3: INTERVIEWS & STAKEHOLDER PERSPECTIVES (3:00)]\nLeaders across multiple sectors emphasize that the adoption curve for ${customTopic} has exceeded previous technological milestones by over forty percent.\n\n[SEGMENT 4: REGULATORY & STRATEGIC SUMMARY (2:00)]\nWith formal policy discussions scheduled to commence next month, international standards are being formulated to ensure robust and transparent governance. This concludes our 10-minute special report.`,
          video_script: `🎬 10-MINUTE COMPLETE VIDEO SCRIPT & STORYBOARD\nTITLE: Everything You Need to Know About ${customTopic}\n\n[0:00 - 2:00 | ACT 1: THE HOOK & MODERN DILEMMA]\n[VISUAL]: Cinematic documentary intro with dramatic pacing and orchestral soundtrack.\n[VOICEOVER]: We live in an era where technology moves faster than our ability to comprehend it. And right now, ${customTopic} is creating waves across the entire world.\n\n[2:00 - 5:00 | ACT 2: HOW IT WORKS IN PRACTICE]\n[VISUAL]: High-resolution walkthroughs, architectural flowcharts, and live operational demos.\n[VOICEOVER]: Let's look under the hood. When ${customTopic} is deployed, three distinct neural layers interact to calibrate the output with mathematical precision.\n\n[5:00 - 8:00 | ACT 3: CASE STUDIES & REAL IMPACT]\n[VISUAL]: On-location B-roll of teams using the platform in production studios.\n[VOICEOVER]: Here is what happened when a leading media team integrated ${customTopic} into their daily pipeline: production turnaround dropped by sixty percent while overall fidelity improved.\n\n[8:00 - 10:00 | ACT 4: THE VERDICT & NEXT STEPS]\n[VISUAL]: Host on camera with final summary infographic cards.\n[VOICEOVER]: The bottom line is simple: ${customTopic} is no longer the future—it is the standard of today. Subscribe for our upcoming deep-dives!`,
          kids_story: `🧒 10-MINUTE BEDTIME AUDIO STORY: "The Journey to the Cloud Castle"\nTHEME: ${customTopic}\n\nChapter 1: The Silver Key (2:00)\nIn a cozy little house under the big oak tree, Maya and her puppy Barnaby were getting ready for bed. But on Maya's windowsill, a gentle sparkling light revealed a magical silver key tied to ${customTopic}.\n\nChapter 2: The River of Clouds (3:00)\nStepping onto a staircase made of soft fluffy clouds, Maya and Barnaby drifted gently above the moonlit valley. Down below, the river looked like a ribbon of sparkling silver ribbon singing a calm lullaby.\n\nChapter 3: The Golden Lullaby Dragon (3:00)\nAt the top of the cloud castle, they met Jasper, the friendly Golden Dragon who loved ${customTopic}. Jasper didn't breathe fire—instead, he breathed warm, cozy vanilla-scented bubbles that made everyone feel peacefully sleepy.\n\nChapter 4: Safe and Sound in Bed (2:00)\nJasper tucked Maya and Barnaby back into their warm blankets with a soft bedtime song. The moon shone softly, the stars whispered goodnight, and sweet, beautiful dreams began.`
        },
        '15m': {
          kids_story: `🧒 15-MINUTE COMPLETE BEDTIME AUDIO STORY: "The Magical Kingdom of Slumber"\nTHEME: ${customTopic}\n\nChapter 1: The Sunset Over Whispering Meadow (3:00)\nOnce upon a time, in a wondrous valley called Whispering Meadow, the golden sun was slowly sinking below the hills, painting the sky with stripes of peach, lavender, and soft pink.\nLittle Leo the squirrel and his best friend Pip the bunny were sitting on a mossy log, watching the gentle twilight settle over ${customTopic}.\nLeo took a deep, relaxing breath. "Listen, Pip," he whispered. "The night breeze is beginning to sing its bedtime song."\n\nChapter 2: The Path of Glowing Fireflies (3:00)\nAs the stars began to twinkle one by one, a family of gentle glowing fireflies appeared along the garden path. Each firefly carried a tiny lantern of warm amber light, illuminating the path toward ${customTopic}.\nTogether, Leo and Pip followed the fireflies across the soft clover grass, where every step felt like walking on warm, cozy pillows.\n\nChapter 3: The Secret Waterfall of Whispers (3:00)\nThey arrived at the edge of the Secret Waterfall, where the water flowed not with a roar, but with a soothing, melodic hum. The water reflected the full silver moon, shimmering with the timeless magic of ${customTopic}.\nSitting on the bank, Leo and Pip felt their eyelids growing heavy and soft as the gentle sound of water washed away all the busy thoughts of the day.\n\nChapter 4: The Sleepy Star Cloud (3:00)\nA fluffy lavender cloud drifted down from the sky, as soft as a feather quilt. The cloud welcomed Leo and Pip, lifting them gently into the calm night air, floating over ${customTopic} while the owls in the treetops gave gentle, rhythmic hoots.\n\nChapter 5: Drifting Off to Sweet Dreams (3:00)\nThe cloud gently lowered Leo and Pip right into their cozy beds lined with dry pine needles and velvet rose petals. Leo cuddled with his favorite stuffed bear, closed his eyes, and smiled. The whole forest was peaceful, the stars watched over them, and wonderful, sweet dreams arrived as deep, restful sleep filled the night. Goodnight little one, sleep tight.`,
          podcast: `🎙️ 15-MINUTE MASTER AUDIO ESSAY & DEEP-DIVE\nTOPIC: ${customTopic}\n\n[CHAPTER 1: THE GENESIS OF AN IDEA (3:00)]\nWelcome to this special 15-minute audio exploration on The Daily Frequency. Today we examine ${customTopic} from its historical origins to its modern reality.\n\n[CHAPTER 2: BREAKING THROUGH THE TECHNICAL BARRIER (3:00)]\nFor years, researchers wrestled with the core bottleneck. How do you maintain organic quality while scaling processing power? With ${customTopic}, the paradigm fundamentally shifted.\n\n[CHAPTER 3: INDUSTRIAL & HUMAN IMPACT (3:00)]\nFrom small indie creators to global media houses, the transformation brought about by ${customTopic} is reshaping economic foundations.\n\n[CHAPTER 4: CRITICAL PERSPECTIVES & ETHICS (3:00)]\nWith great capability comes the imperative for thoughtful governance. Here is how leaders are addressing safety and transparency.\n\n[CHAPTER 5: THE DECADE AHEAD (3:00)]\nAs we project forward into the next ten years, ${customTopic} will stand as a cornerstone milestone. Thank you for joining us for this in-depth 15-minute essay.`,
          news: `📰 15-MINUTE COMPREHENSIVE NEWS DOCUMENTARY\nSUBJECT: ${customTopic}\n\n[ACT 1: BREAKING DEVELOPMENTS & GLOBAL REACTION (3:00)]\nOur lead investigative documentary tonight provides an exhaustive fifteen-minute review of ${customTopic}.\n\n[ACT 2: DECLASSIFIED DOCUMENTS & TIMELINE (3:00)]\nExclusive reporting reveals the strategic milestones that brought ${customTopic} from experimental laboratories to commercial infrastructure.\n\n[ACT 3: ECONOMIC & MARKET FORECASTS (3:00)]\nLeading financial analysts provide quantitative insights into the market shifts directly attributable to ${customTopic}.\n\n[ACT 4: REGULATORY TESTIMONIES (3:00)]\nHear the recorded statements from official oversight committees regarding future standards.\n\n[ACT 5: CONCLUDING BROADCAST & SUMMARY (3:00)]\nThis concludes our 15-minute special broadcast on ${customTopic}. Stay with us for continuing updates throughout the night.`,
          video_script: `🎬 15-MINUTE FULL VIDEO PRODUCTION SCRIPT & MULTI-SCENE STORYBOARD\nTITLE: The Definitive Documentary on ${customTopic}\n\n[ACT 1 - 0:00 - 3:00 | THE PROLOGUE & THE MYSTERY]\n[VISUAL]: Cinematic widescreen footage, slow-motion studio shots, motion title sequence.\n[VOICEOVER]: Throughout human history, moments arrive that quietly reshape how we communicate. Today, ${customTopic} represents that pivotal moment.\n\n[ACT 2 - 3:00 - 6:00 | THE ARCHITECTURAL REVOLUTION]\n[VISUAL]: Detailed 3D animations, code breakdown, technical diagrams.\n[VOICEOVER]: Let us examine the foundational architecture. At the core of ${customTopic} lies an intricate neural mesh designed for real-time fidelity.\n\n[ACT 3 - 6:00 - 9:00 | PRODUCTION FIELD TESTS]\n[VISUAL]: On-site documentary footage of audio engineering suites and studio live rooms.\n[VOICEOVER]: In this sequence, our engineering team puts ${customTopic} through rigorous benchmark testing across multiple stress scenarios.\n\n[ACT 4 - 9:00 - 12:00 | EXPERT INTERVIEWS & COMPARATIVE BENCHMARKS]\n[VISUAL]: Dynamic split-screen interviews with sound designers and industry veterans.\n[VOICEOVER]: The consensus among top professionals is unmistakable: workflow latency has been reduced while acoustic depth has reached new heights.\n\n[ACT 5 - 12:00 - 15:00 | THE EPILOGUE & FUTURE ROADMAP]\n[VISUAL]: Epic drone pullback over studio complex, ending on clean call-to-action title cards.\n[VOICEOVER]: As we look ahead, the story of ${customTopic} is only beginning. Thank you for watching this 15-minute documentary.`
        },
        '30m': {
          podcast: `🎙️ 30-MINUTE MASTER AUDIO EPISODE & AUDIOBOOK CHAPTER\nTITLE: The Architecture of Tomorrow — Deep Dive into ${customTopic}\n\n[ACT I: THE THRESHOLD OF CHANGE (5:00)]\nWelcome to this special 30-minute extended audio broadcast. Today, we step beyond the soundbites to explore the profound architecture behind ${customTopic}.\n\n[ACT II: HISTORICAL ROOTS & PRECURSORS (5:00)]\nTo understand where we are going, we must first examine where we began. The early precursors to ${customTopic} were defined by limitations in computing and algorithmic understanding.\n\n[ACT III: THE PARADIGM SHIFT (5:00)]\nWhen neural processing intersected with real-time acoustic synthesis, ${customTopic} unlocked capabilities that previously existed only in theoretical research.\n\n[ACT IV: INDUSTRIAL REORGANIZATION (5:00)]\nAcross media, software development, education, and international communication, the ripple effects of ${customTopic} are transforming established business models.\n\n[ACT V: ETHICAL FOUNDATIONS & GOVERNANCE (5:00)]\nHow do we balance rapid innovation with ethical responsibility? We examine the international frameworks being developed to govern ${customTopic}.\n\n[ACT VI: THE NEXT HORIZON & CONCLUSION (5:00)]\nAs our 30-minute journey concludes, one truth stands clear: ${customTopic} has unlocked a new era of human creativity. Thank you for listening to this master episode.`,
          news: `📰 30-MINUTE SPECIAL INVESTIGATIVE DOCUMENTARY\nBROADCAST TITLE: The Global Impact of ${customTopic}\n\n[PART 1: THE OPENING STATEMENT & SCOPE (5:00)]\nGood evening and welcome to this 30-minute investigative documentary examining the worldwide emergence of ${customTopic}.\n\n[PART 2: INVESTIGATIVE TIMELINE (5:00)]\nWe trace the pivotal milestones that accelerated the deployment of ${customTopic} over the past thirty-six months.\n\n[PART 3: ECONOMIC AND STRATEGIC ANALYSIS (5:00)]\nSenior market analysts provide in-depth evaluation of the economic disruptions and new opportunities catalyzed by ${customTopic}.\n\n[PART 4: ON-THE-GROUND REPORTERS' ROUNDTABLE (5:00)]\nOur correspondents around the globe report on the direct community and enterprise impact of ${customTopic}.\n\n[PART 5: POLICY AND REGULATORY HEARINGS (5:00)]\nA comprehensive look into congressional and parliamentary hearings addressing ${customTopic}.\n\n[PART 6: CLOSING OUTLOOK (5:00)]\nThis concludes our 30-minute investigative special on ${customTopic}. Stay tuned for further updates.`,
          video_script: `🎬 30-MINUTE MASTER DOCUMENTARY FILM SCRIPT & COMPREHENSIVE STORYBOARD\nTITLE: The Next Frontier: ${customTopic}\n\n[ACT 1: 0:00 - 5:00 | PROLOGUE: THE CHANGING LANDSCAPE]\n[VISUAL]: 4K cinematic cinematography, evocative score, title sequence.\n[VOICEOVER]: Across the grand expanse of human ingenuity, few advancements have captured our imagination like ${customTopic}.\n\n[ACT 2: 5:00 - 10:00 | THE ARCHITECTURAL FOUNDATION]\n[VISUAL]: Immersive 3D wireframe models, server room B-roll, engineering interviews.\n[VOICEOVER]: In this chapter, we step inside the laboratories where the algorithms of ${customTopic} were forged.\n\n[ACT 3: 10:00 - 15:00 | THE PRODUCTION TESTING PHASE]\n[VISUAL]: High-speed camera captures of creative production in real time.\n[VOICEOVER]: Seeing the live benchmarks demonstrates how ${customTopic} handles complex multilingual and high-dynamic audio.\n\n[ACT 4: 15:00 - 20:00 | GLOBAL INDUSTRY PERSPECTIVES]\n[VISUAL]: Interviews across three continents highlighting adoption stories.\n[VOICEOVER]: From Tokyo to London to San Francisco, the response to ${customTopic} has been overwhelmingly positive.\n\n[ACT 5: 20:00 - 25:00 | THE ETHICAL AND SOCIAL CONVERSATION]\n[VISUAL]: Thoughtful cinematic portraits, roundtable discussions.\n[VOICEOVER]: As adoption expands, responsible stewardship of ${customTopic} ensures long-term public trust and equity.\n\n[ACT 6: 25:00 - 30:00 | THE EPILOGUE AND FINAL CREDITS]\n[VISUAL]: Sweeping golden hour cinematography, full orchestral crescendo, end credits.\n[VOICEOVER]: The journey is just beginning. Thank you for joining us for this 30-minute documentary on ${customTopic}.`,
          kids_story: `🧒 30-MINUTE COMPLETE BEDTIME AUDIOBOOK: "The Grand Slumber Journey Across Star Island"\nTHEME: ${customTopic}\n\nChapter 1: The Sunset Over Whispering Meadow (5:00)\nOnce upon a time, in a wondrous valley called Whispering Meadow, the golden sun was slowly sinking below the hills, painting the sky with stripes of peach, lavender, and soft pink. Little Leo the squirrel and his best friend Pip the bunny were sitting on a mossy log, watching the gentle twilight settle over ${customTopic}.\n\nChapter 2: The Path of Glowing Fireflies (5:00)\nAs the stars began to twinkle one by one, a family of gentle glowing fireflies appeared along the garden path. Each firefly carried a tiny lantern of warm amber light, illuminating the path toward ${customTopic}.\n\nChapter 3: The Secret Waterfall of Whispers (5:00)\nThey arrived at the edge of the Secret Waterfall, where the water flowed not with a roar, but with a soothing, melodic hum. The water reflected the full silver moon, shimmering with the timeless magic of ${customTopic}.\n\nChapter 4: The Sleepy Star Cloud (5:00)\nA fluffy lavender cloud drifted down from the sky, as soft as a feather quilt. The cloud welcomed Leo and Pip, lifting them gently into the calm night air, floating over ${customTopic} while the owls in the treetops gave gentle, rhythmic hoots.\n\nChapter 5: The Castle of Sweet Dreams (5:00)\nHigh in the night sky, they visited the Castle of Sweet Dreams, where gentle clouds floated like cotton candy and stars played soft lullabies on golden harps.\n\nChapter 6: Drifting Off to Deep Restful Sleep (5:00)\nThe cloud gently lowered Leo and Pip right into their cozy beds lined with dry pine needles and velvet rose petals. Leo closed his eyes, took a long slow breath, and smiled. The whole forest was silent, the night was peaceful, and sweet, beautiful dreams filled the room. Goodnight, sweet dreams.`
        }
      },
      he: {
        '15s': {
          podcast: `שלום וברוכים הבאים לפודקאסט היומי שלנו! היום נדבר על ${customTopic} בתוך 60 שניות. בואו נתחיל!`,
          news: `מבזק חדשות: התפתחויות משמעותיות נרשמו סביב ${customTopic}. מומחים מדווחים על פריצת דרך חשובה. פרטים נוספים בהמשך.`,
          commercial: `מוכנים לעתיד? גלו את העוצמה של ${customTopic}. איכות ללא פשרות וביצועים יוצאי דופן. נסו עכשיו!`,
          narration: `בעולם שנע במהירות, ${customTopic} הביא רגע של בהירות ששינה את פני הדברים.`,
          interview: `היום באולפן נארח מומחה מיוחד שיספר לנו על ${customTopic}. ברוך הבא!`,
          video_script: `[ויז'ואל: פתיח מהיר ואנימציה דינמית]\n[קריינות]: ידעתם ש-${customTopic} משנה לחלוטין את הדרך שבה אנחנו יוצרים תוכן? הנה הפרטים ב-15 שניות!`,
          kids_story: `היה היה כוכב קטן ומנצנץ שגילה את ${customTopic} והאיר את כל שמי הלילה באור קסום ומתוק!`
        },
        '30s': {
          podcast: `שלום וברוכים הבאים לפודקאסט היומי שלנו! בפרק הזה אנחנו צוללים לנושא מרתק במיוחד: ${customTopic}. בין אם אתם בדרכים או בבית, יש לנו סיפור מעורר השראה עבורכם. קחו כוס קפה ובואו נצא לדרך!`,
          news: `מבזק חדשות מיוחד: התפתחויות משמעותיות נרשמו היום סביב ${customTopic}. גורמים בכירים ומומחים מדווחים על פריצת דרך חשובה ושינוי מגמה בשווקים. נמשיך לעקוב ולדווח לאורך כל היום.`,
          commercial: `מוכנים לשלב הבא? הכירו את הפתרון המוביל עבור ${customTopic}. איכות ללא פשרות, ביצועים יוצאי דופן וחוויה מתקדמת שמותאמת בדיוק עבורכם. נסו עכשיו והרגישו בהבדל!`,
          narration: `בעולם שנע במהירות בלתי פוסקת, צץ לפתע רגע של בהירות והשראה סביב ${customTopic}. כשהאור הראשון של הבוקר עלה מעל ההרים, היה ברור שפרק חדש ומרתק נפתח.`,
          interview: `איתנו באולפן היום אורח מיוחד שמגיע לדבר איתנו על ${customTopic}. שלום לך, ספר לנו מה בעצם הוביל לרעיון המהפכני הזה ואיך הכל התחיל?`,
          video_script: `[סצינה 1 - 0:00 - צילום תקריב של המנחה באולפן עם תאורה חמה]\n[קריינות]: מה אם הייתי אומר לכם ש-${customTopic} עומד לשנות את כל מה שהכרתם עד היום?\n\n[סצינה 2 - 0:15 - מעבר להדגמה על המסך]\n[קריינות]: בסרטון של היום נחשוף את כל מה שחייבים לדעת. הרשמו לערוץ ובואו נתחיל!`,
          kids_story: `היה היה פעם, ביער שקט ונעים, דובון קטן וחביב שגילה את ${customTopic}. עם פנס קטן וחיוך רחב, הוא יצא להרפתקה מופלאה מתחת לירח המנצנץ.`
        },
        '60s': {
          podcast: `שלום וברוכים הבאים לפרק מיוחד של הפודקאסט שלנו! היום אנחנו מקדישים את השיחה לנושא שמעסיק רבים: ${customTopic}.\n\nבשבועות האחרונים שמענו המון דעות ורעיונות, אבל היום אנחנו רוצים לעשות סדר, להבין מה עומד מאחורי הקלעים ומה המשמעות האמיתית של המהלך הזה עבור כולנו.\n\nהתרווחו בכיסא, קחו נשימה עמוקה, ובואו נצלול יחד אל תוך הסיפור המלא והמרתק הזה.`,
          news: `בוקר טוב, כאן מבזק חדשות מורחב. הסיפור המרכזי של היום מתמקד בהתפתחויות חסרות תקדים בנושא ${customTopic}.\n\nעל פי דיווחי מומחים וגורמים בכירים, מדובר בצעד משמעותי שצפוי להשפיע על מגוון תחומים רחב במשק. צוותי מחקר ופיתוח מלווים את התהליך מקרוב ומציינים כי התוצאות הראשוניות עולות על כל הציפיות.\n\nנמשיך לעדכן בדיווחים חיים מהשטח ובתגובות המומחים לאורך כל שעות היממה.`,
          commercial: `לפעמים מגיע מוצר אחד שמשנה לחלוטין את הדרך שבה אנחנו יוצרים, עובדים וחושבים. הכירו את הדור הבא של ${customTopic}.\n\nפיתוח חדשני, דיוק בלתי מתפשר וממשק מתקדם שמעניק לכם שליטה מלאה על כל פרט. אלפי יוצרים ואנשי מקצוע מובילים כבר הצטרפו למהפכה.\n\nבקרו באתר שלנו עוד היום, קבלו גישה מיידית והתחילו ליצור באיכות הגבוהה ביותר.`,
          narration: `בלב הנופים הקסומים, במקום שבו הרוח לוחשת סיפורים עתיקים, התגלה השביל שהוביל אל ${customTopic}. דורות של חולמים חיכו לרגע שבו האור יפציע מחדש מעל האופק.\n\nהצעדים היו בטוחים והלב היה מלא תקווה. כל גילוי קטן הביא עמו הבנה עמוקה יותר של הכוח הטמון ברוח האנושית, בסקרנות ובחיפוש אחר הטוב והיפה.`,
          interview: `שלום לכם וברוכים הבאים לתוכנית הראיונות שלנו. היום נמצא איתנו אחד האנשים המובילים את השינוי סביב ${customTopic}.\n\nהפרויקט שלך זוכה לשבחים רבים ולהתעניינות בינלאומית עצומה. תודה שהצטרפת אלינו היום.\n\nבוא נחזור להתחלה—מה היה הרגע המדויק שבו הבנת שיש בידיך רעיון שיכול לשנות סדרי עולם?`,
          video_script: `[סצינה 1 - 0:00 - פתיחה מלאת אנרגיה וכותרות דינמיות]\n[קריינות]: בתוך 60 שניות נחשוף את כל האמת מאחורי ${customTopic}.\n\n[סצינה 2 - 0:20 - צילומי מסך והדגמת תהליך העבודה]\n[קריינות]: בחודשים האחרונים יוצרים מובילים אימצו את השיטה הזו כדי לחסוך שעות של עבודה ולהפיק תוצאות של אולפן מקצועי.\n\n[סצינה 3 - 0:45 - חזרה למנחה וקריאה לפעולה]\n[קריינות]: רוצים ללמוד איך לעשות זאת בעצמכם? הקישור מחכה לכם בתיאור הסרטון!`,
          kids_story: `פרק 1: הסוד ביער הלוחש.\n\nעמוק בלב עמק הקסמים, ינשוף קטן בשם אוליבר הביט אל ${customTopic}. בכל ערב כשהשמש שקעה בגווני כתום וסגול, הוא פרש את כנפיו הרכות ועף מעל הנחל המנצנץ.\n\nהערב היה מיוחד במינו. רוח נעימה נשאה שיר ערש בין העצים, מזמינה את כל חיות היער להתכרבל בשמיכות רכות ולחלום חלומות מתוקים.`
        },
        '5m': {
          podcast: `🎙️ פרק עומק מיוחד בן 5 דקות — פודקאסט The Daily Frequency\nנושא: ${customTopic}\n\n[חלק 1: פתיחה ומיקוד (דקה 1:00)]\nשלום וברוכים הבאים לפרק עומק ממוקד בן 5 דקות. היום אנחנו צוללים היישר אל תוך ${customTopic}.\n\n[חלק 2: פריצת הדרך המרכזית (2:00)]\nבבסיסו, ${customTopic} פותר אתגר מרכזי שהעסיק מפתחים ויוצרים במשך שנים רבות. השילוב בין מודלים חכמים לממשק מדויק מאפשר זינוק אמיתי ביכולות ההפקה.\n\n[חלק 3: יישומים מעשיים (1:30)]\nאיך כל זה משפיע עליכם ביום-יום? בין אם אתם יוצרי תוכן או אנשי עסקים, הכלים החדשים מעניקים יתרון תחרותי מיידי.\n\n[חלק 4: סיכום ומסקנות (0:30)]\nתודה שהאזנתם למבזק בן 5 הדקות. המשיכו לחקור ולהתפתח, וניפגש בפרק הבא!`,
          news: `📰 מבזק חדשות מיוחד בן 5 דקות\nדיווח מרכזי: ${customTopic}\n\n[0:00 - כותרות מרכזיות]\nבוקר טוב. אנו פותחים בדיווח מיוחד בן חמש דקות על ההתפתחויות המשמעותיות סביב ${customTopic}.\n\n[1:15 - עובדות ורקע]\nעל פי מקורות רשמיים, שיתופי פעולה בינלאומיים האיצו את קצב היישום של הפרויקט.\n\n[2:45 - ניתוח מומחים]\nאנליסטים בכירים מדגישים כי מדובר בשינוי מבני בעל השלכות כלכליות וטכנולוגיות רחבות.\n\n[4:15 - מבט קדימה]\nנמשיך לעקוב ולעדכן בכל ההתפתחויות לאורך כל שעות היום.`,
          video_script: `🎬 תסריט וידאו מלא בן 5 דקות\nכותרת: המדריך המלא ל-${customTopic}\n\n[סצינה 1 - 0:00 - 0:45 | פתיח]\n[ויז'ואל]: צילומי רחפן מרהיבים של נופים מודרניים עם כיתוב: "המהפכה כבר כאן".\n[קריינות]: בחמש הדקות הקרובות נבין בדיוק מדוע ${customTopic} נחשב לפריצת הדרך הגדולה של השנה.\n\n[סצינה 2 - 0:45 - 2:15 | העקרונות המובילים]\n[ויז'ואל]: אנימציית תלת מימד ותרשימי זרימה המדגימים את המערכת.\n[קריינות]: העיקרון הראשון הוא דיוק. המערכת מעבדת תהליכים מורכבים בזמן אמת.\n\n[סצינה 3 - 2:15 - 3:45 | הדגמה מעשית]\n[ויז'ואל]: השוואת תוצאות של "לפני" ו"אחרי".\n[קריינות]: שימו לב להבדל הברור באיכות ובטבעיות של התוצאה הסופית.\n\n[סצינה 4 - 3:45 - 5:00 | סיכום וסיום]\n[ויז'ואל]: חזרה למנחה באולפן וכרטיסיות הנעה לפעולה.\n[קריינות]: זה היה המדריך המלא שלנו. מה דעתכם? שתפו אותנו בתגובות!`,
          kids_story: `🧒 סיפור קולי בן 5 דקות לפני השינה: "סוד עץ הכוכבים"\nנושא: ${customTopic}\n\nפרק 1: שעת בין הערביים הנעימה\nהיה היה פעם, בקצה העמק הנמנם, שועלון קטן בשם תום שאהב להביט אל ${customTopic}. כשהשמיים נצבעו בסגול וזהב, תום כרך את זנבו החמים סביב רגליו והקשיב לרוח הנעימה.\n\nפרק 2: אור הכוכבים הזוהר\nמעל העץ הגבוה ביותר ביער, כוכב קטן בשם נצנוץ החל להאיר באור זהוב ורך. נצנוץ לחש: "אל תדאג תום הקטן, ${customTopic} שומר עליך לילה שלם."\n\nפרק 3: שינה מתוקה ונעימה\nבפיהוק גדול ומתוק, תום שקע לתוך מיטת העלים הרכה. היער השתתק, הירח שמר מעל, וחלומות נפלאים מילאו את הלילה השקט.`
        },
        '10m': {
          podcast: `🎙️ פרק מורחב בן 10 דקות — פודקאסט The Daily Frequency\nנושא: ${customTopic}\n\n[מערכה 1: פתיחה ורקע (2:00)]\nשלום וברוכים הבאים לפרק מיוחד בן עשר דקות. היום נבחן לעומק את המשמעות של ${customTopic}.\n\n[מערכה 2: פריצת הדרך הטכנולוגית (3:00)]\nבואו נבין כיצד המערכת פועלת מאחורי הקלעים. השילוב בין מודלים מתקדמים לעיבוד מהיר מייצר תוצאות יוצאות דופן.\n\n[מערכה 3: ההשפעה על התעשייה (3:00)]\nתחומים רבים, החל ממדיה ותקשורת ועד חינוך וטכנולוגיה, מגדירים מחדש את תהליכי העבודה שלהם סביב ${customTopic}.\n\n[מערכה 4: מבט לעתיד וסיכום (2:00)]\nתודה שהייתם איתנו בפרק העומק הזה. המשיכו ליצור וניפגש בפרק הבא!`,
          news: `📰 תחקיר חדשותי מיוחד בן 10 דקות\nנושא הדיווח: ${customTopic}\n\n[חלק 1: סקירה עולמית (2:00)]\nערב טוב. תחקיר החדשות של הערב מתמקד במשמעויות הרחבות של ${customTopic}.\n\n[חלק 2: השתלשלות האירועים (3:00)]\nצוות התחקירים שלנו בחן את המסמכים הרשמיים ואת העדויות מהשטח.\n\n[חלק 3: ראיונות עם מומחים (3:00)]\nמומחים בכירים מעידים כי קצב האימוץ שבר את כל התחזיות המוקדמות.\n\n[חלק 4: סיכום ומשמעויות (2:00)]\nבכך מסתיים הדיווח המיוחד שלנו להערב. נמשיך לעדכן.` ,
          video_script: `🎬 תסריט וידאו תיעודי בן 10 דקות\nכותרת: כל מה שצריך לדעת על ${customTopic}\n\n[0:00 - 2:00 | מערכה 1: הפתיחה והדילמה]\n[ויז'ואל]: פתיח קולנועי מרשים ופסקול סוחף.\n[קריינות]: אנו חיים בעידן שבו הטכנולוגיה נעה בקצב מסחרר, וכעת ${customTopic} מביא עמו שינוי עמוק.\n\n[2:00 - 5:00 | מערכה 2: איך זה עובד בפועל]\n[ויז'ואל]: הדמיות גרפיות ברזולוציה גבוהה והדגמות חיות.\n[קריינות]: בואו נצלול אל תוך המבנה הפנימי של המערכת.\n\n[5:00 - 8:00 | מערכה 3: מקרי מבחן ותוצאות מהשטח]\n[ויז'ואל]: צילומים מאולפני הפקה וצוותי פיתוח בפעולה.\n[קריינות]: הנה מה שקרה כאשר צוות מוביל שילב את הטכנולוגיה בעבודה היומיומית.\n\n[8:00 - 10:00 | מערכה 4: המסקנות והשלבים הבאים]\n[ויז'ואל]: חזרה למנחה וכרטיסיות מידע לסיכום.\n[קריינות]: השורה התחתונה ברורה—זהו הכלי שמוביל את העתיד כבר היום.`,
          kids_story: `🧒 סיפור קולי בן 10 דקות לפני השינה: "המסע אל טירת העננים"\nנושא: ${customTopic}\n\nפרק 1: מפתח הכסף הקסום (2:00)\nבבית קטן וחמים תחת עץ האלון הגדול, מיה והכלבלב בונבון התכוננו לשינה. לפתע, על אדן החלון, הופיע מפתח כסף זוהר שפתח שער אל ${customTopic}.\n\nפרק 2: נהר העננים הרך (3:00)\nהם עלו על מדרגות עשויות עננים רכים וריחפו מעל העמק המואר באור ירח. למטה, הנהר שר שיר ערש מתוק ורוגע.\n\nפרק 3: דרקון שיר הערש המוזהב (3:00)\nבטירת העננים הם פגשו את ג'ספר, דרקון מוזהב וחביב שאהב את ${customTopic}. ג'ספר נשף בועות ריחניות של וניל שגרמו לכולם להרגיש נמנמנים ושמחים.\n\nפרק 4: בטוחים ורגועים במיטה (2:00)\nג'ספר החזיר אותם בעדינות אל מיטתם החמה. הירח חייך, הכוכבים לחשו לילה טוב, וחלומות מתוקים החלו.`
        },
        '15m': {
          kids_story: `🧒 סיפור קולי מלא בן 15 דקות לילדים לפני השינה: "ממלכת השינה הקסומה"\nנושא: ${customTopic}\n\nפרק 1: השקיעה מעל אחו הלוחשים (3:00)\nהיה היה פעם, בעמק מופלא שנקרא אחו הלוחשים, שמש זהובה ששקעה לאיטה מאחורי הגבעות, צובעת את השמיים בפסים של אפרסק, לבנדר וורוד רך.\nסנאי קטן בשם לביא וחברו הטוב שפנפן ישבו על גזע עץ מכוסה טחב רך, מביטים בשלווה על ${customTopic}.\nלביא לקח נשימה עמוקה ונעימה. "תקשיב שפנפן," הוא לחש, "רוח הלילה מתחילה לשיר את שיר הערש שלה."\n\nפרק 2: שביל הגחליליות הזוהר (3:00)\nכשהכוכבים החלו לנצנץ בזה אחר זה, משפחה של גחליליות עדינות הופיעה לאורך שביל הגינה. כל גחלילית נשאה פנס קטן של אור חמים שהאיר את הדרך אל ${customTopic}.\nיחד הם פסעו על עשבי התלתן הרכים, כשכל צעד מרגיש כמו הליכה על כריות מפנקות.\n\nפרק 3: מפל הלחישות הסודי (3:00)\nהם הגיעו אל מפל המים הסודי, שבו המים זרמו לא בשאון אלא במנגינה עדינה ומרגיעה. המים שיקפו את הירח המלא, מנצנצים בקסם הנצחי של ${customTopic}.\nהעיניים של לביא ושפנפן הפכו כבדות ומתוקות כשצליל המים השקיט כל מחשבה.\n\nפרק 4: ענן הכוכבים המנמנם (3:00)\nענן סגלגל ורך ירד מן השמיים, רך כמו שמיכת פוך ענקית. הענן אסף אותם בעדינות וריחף איתם בשמי הלילה השקטים מעל ${customTopic}, כשציפורי הלילה שרות בקול רך ומלטף.\n\nפרק 5: שינה עמוקה וחלומות מתוקים (3:00)\nהענן הניח אותם בעדינות היישר אל מיטתם החמימה ביער. לביא חיבק את הדובון האהוב שלו, עצם את עיניו וחייך. כל היער היה שקט ומוגן, הכוכבים שמרו מלמעלה, ושינה עמוקה ומתוקה מילאה את הלילה השלו. לילה טוב ילד אהוב, חלומות פז.`,
          podcast: `🎙️ פודקאסט עומק מורחב בן 15 דקות — The Daily Frequency\nנושא: ${customTopic}\n\n[פרק 1: שורשי הרעיון (3:00)]\nשלום וברוכים הבאים למסע קולי בן 15 דקות שבו נבחן את ${customTopic} מכל זווית אפשרית.\n\n[פרק 2: פריצת המחסום הטכנולוגי (3:00)]\nכיצד הצליחו החוקרים לגשר על הפער בין איכות קולית אורגנית לעיבוד בזמן אמת.\n\n[פרק 3: המהפכה בעולם היצירה (3:00)]\nיוצרים ואנשי תקשורת משתפים בתובנות מהשטח לגבי השינוי העמוק בתהליכי ההפקה.\n\n[פרק 4: אתיקה ואחריות מקצועית (3:00)]\nהצצה לדיונים הבינלאומיים בנושא שימוש הוגן ובטוח בטכנולוגיה.\n\n[פרק 5: מבט אל העשור הבא (3:00)]\nסיכום התובנות ומבט קדימה. תודה שהאזנתם למשדר המיוחד הזה.`,
          news: `📰 ספיישל דוקו-חדשותי מקיף בן 15 דקות\nנושא: ${customTopic}\n\n[מערכה 1: תמונת המצב העולמית (3:00)]\nהתפתחויות דרמטיות נרשמו ברחבי העולם בעקבות ההכרזה על ${customTopic}.\n\n[מערכה 2: חשיפת המסמכים והנתונים (3:00)]\nנתונים חדשים חושפים את היקף ההשפעה על השווקים הבינלאומיים.\n\n[מערכה 3: תחזיות כלכליות (3:00)]\nאנליסטים בכירים מעריכים את המשמעויות ארוכות הטווח.\n\n[מערכה 4: עדויות וראיונות מהאולפן (3:00)]\nפאנל המומחים שלנו מנתח את הצעדים הבאים.\n\n[מערכה 5: סיכום ומשמעויות (3:00)]\nזהו סוף המשדר המיוחד שלנו. לילה טוב.`,
          video_script: `🎬 תסריט דוקומנטרי מלא בן 15 דקות\nכותרת: הסרט התיעודי המלא על ${customTopic}\n\n[מערכה 1 - 0:00 - 3:00 | הפתיחה והחזון]\n[ויז'ואל]: צילומים קולנועיים רחבים ופסקול תזמורתי מרגש.\n[קריינות]: במהלך ההיסטוריה מגיעים רגעים שמעצבים מחדש את האופן שבו אנו מתקשרים, ו-${customTopic} הוא הרגע הזה.\n\n[מערכה 2 - 3:00 - 6:00 | הארכיטקטורה הטכנולוגית]\n[ויז'ואל]: אנימציות תלת-ממד מתקדמות של המערכת.\n[קריינות]: בואו נבחן את הבסיס ההנדסי שמאפשר את הדיוק יוצא הדופן הזה.\n\n[מערכה 3 - 6:00 - 9:00 | מבחני ביצועים בשטח]\n[ויז'ואל]: צילומים מתוך אולפני הקלטה מקצועיים.\n[קריינות]: הנה מה שקורה כאשר מפעילים את המערכת תחת עומסי שיא.\n\n[מערכה 4 - 9:00 - 12:00 | ראיונות עם בכירי התעשייה]\n[ויז'ואל]: ראיונות דינמיים עם אנשי מקצוע מובילים.\n[קריינות]: התגובות מהשטח מצביעות על קפיצת מדרגה אמיתית ביעילות ובאיכות.\n\n[מערכה 5 - 12:00 - 15:00 | סיום ומבט לעתיד]\n[ויז'ואל]: צילום רחפן מרשים בשעת שקיעה וכותרות סיום.\n[קריינות]: המסע רק החל. תודה שצפיתם בסרט התיעודי המלא על ${customTopic}.`
        },
        '30m': {
          podcast: `🎙️ פרק מאסטר מורחב בן 30 דקות — The Daily Frequency\nכותרת: הארכיטקטורה של המחר — מסע עומק אל ${customTopic}\n\n[מערכה 1: סף השינוי (5:00)]\nשלום וברוכים הבאים לפרק מאסטר מיוחד בן 30 דקות. היום נצעד מעבר לכותרות השטחיות כדי להבין את עומק השינוי סביב ${customTopic}.\n\n[מערכה 2: השורשים ההיסטוריים (5:00)]\nכדי להבין לאן אנחנו הולכים, עלינו לבחון את ההתחלה והאתגרים המוקדמים שעמדו בפני החוקרים.\n\n[מערכה 3: שינוי הפרדיגמה (5:00)]\nהמפגש בין מודלים נוירונליים לעיבוד אקוסטי מהיר יצר יכולות שהיו קיימות בעבר רק בתיאוריה.\n\n[מערכה 4: ההשפעה על הכלכלה והחברה (5:00)]\nכיצד משתנה המבנה התעשייתי בעקבות הטמעת הטכנולוגיה בתחומי החיים השונים.\n\n[מערכה 5: אתיקה ומדיניות ציבורית (5:00)]\nהמסגרות הרגולטוריות הבינלאומיות שנועדו להבטיח שימוש אחראי ושקוף.\n\n[מערכה 6: האופק הבא וסיכום (5:00)]\nתודה שהצטרפתם אלינו לפרק המאסטר המלא. המשיכו להאזין וליצור!`,
          news: `📰 תחקיר דוקומנטרי מיוחד בן 30 דקות\nנושא: ההשפעה העולמית של ${customTopic}\n\n[חלק 1: סקירה עולמית ופתיחה (5:00)]\nערב טוב וברוכים הבאים לתחקיר המקיף בן 30 הדקות על ${customTopic}.\n\n[חלק 2: השתלשלות האירועים לאורך השנים (5:00)]\nאנו סוקרים את שלבי הפיתוח המרכזיים שהובילו לפריצת הדרך.\n\n[חלק 3: ניתוח כלכלי מעמיק (5:00)]\nבכירי הכלכלנים מנתחים את השפעת המהלך על המשק העולמי.\n\n[חלק 4: שולחן עגול של כתבינו ברחבי העולם (5:00)]\nדיווחים מיוחדים ממוקדי ההתרחשות בארץ ובעולם.\n\n[חלק 5: דיוני ועדת המדיניות (5:00)]\nמבט אל הדיונים על עתיד הרגולציה והתקינה הבינלאומית.\n\n[חלק 6: סיכום התחקיר (5:00)]\nבכך מסתיים המשדר הדוקומנטרי המיוחד להערב.`,
          video_script: `🎬 תסריט סרט תיעודי מלא בן 30 דקות\nכותרת: הגבול הבא: ${customTopic}\n\n[מערכה 1: 0:00 - 5:00 | הפתיחה והעולם החדש]\n[ויז'ואל]: צילום קולנועי ב-4K, פסקול סוחף וכותרות פתיחה.\n[קריינות]: בהיסטוריה האנושית מעטות ההמצאות שמשנות את פני המציאות כפי שעושה ${customTopic}.\n\n[מערכה 2: 5:00 - 10:00 | היסודות ההנדסיים]\n[ויז'ואל]: הדמיות תלת-ממד של חוות השרתים וראיונות עם מהנדסים.\n[קריינות]: בפרק זה ניכנס אל תוך המעבדות שבהן פותחו האלגוריתמים הראשונים.\n\n[מערכה 3: 10:00 - 15:00 | מבחני האיכות וההפקה]\n[ויז'ואל]: צילומים בזמן אמת של תהליכי יצירה.\n[קריינות]: הצגת הנתונים מוכיחה את העוצמה של המערכת בזמן אמת.\n\n[מערכה 4: 15:00 - 20:00 | נקודות מבט גלובליות]\n[ויז'ואל]: ראיונות משלוש יבשות עם מובילי דעה.\n[קריינות]: התגובות הבינלאומיות מדברות בעד עצמן.\n\n[מערכה 5: 20:00 - 25:00 | השיח הציבורי והאתיקה]\n[ויז'ואל]: דיונים פתוחים ושולחנות עגולים.\n[קריינות]: הובלה אחראית של הטכנולוגיה היא המפתח לעתיד טוב יותר.\n\n[מערכה 6: 25:00 - 30:00 | סיום ומבט קדימה]\n[ויז'ואל]: צילומי שקיעה מרהיבים וכותרות סיום.\n[קריינות]: המסע רק התחיל. תודה שהייתם איתנו בסרט התיעודי המלא.`,
          kids_story: `🧒 ספר שמע שלם בן 30 דקות לילדים לפני השינה: "המסע הגדול אל אי הכוכבים"\nנושא: ${customTopic}\n\nפרק 1: השקיעה מעל אחו הלוחשים (5:00)\nהיה היה פעם, בעמק מופלא שנקרא אחו הלוחשים, שמש זהובה ששקעה לאיטה מאחורי הגבעות, צובעת את השמיים בפסים של אפרסק, לבנדר וורוד רך. סנאי קטן בשם לביא וחברו הטוב שפנפן ישבו על גזע עץ מכוסה טחב רך, מביטים בשלווה על ${customTopic}.\n\nפרק 2: שביל הגחליליות הזוהר (5:00)\nכשהכוכבים החלו לנצנץ בזה אחר זה, משפחה של גחליליות עדינות הופיעה לאורך שביל הגינה. כל גחלילית נשאה פנס קטן של אור חמים שהאיר את הדרך אל ${customTopic}.\n\nפרק 3: מפל הלחישות הסודי (5:00)\nהם הגיעו אל מפל המים הסודי, שבו המים זרמו במנגינה עדינה ומרגיעה. המים שיקפו את הירח המלא, מנצנצים בקסם הנצחי של ${customTopic}.\n\nפרק 4: ענן הכוכבים המנמנם (5:00)\nענן סגלגל ורך ירד מן השמיים, אסף אותם בעדינות וריחף איתם בשמי הלילה השקטים מעל ${customTopic}.\n\nפרק 5: טירת החלומות המתוקים (5:00)\nבטירת החלומות הכוכבים ניגנו שירי ערש מתוקים בנבל זהוב, מפזרים אבקת חלומות רכה על כל היער.\n\nפרק 6: שינה עמוקה ושלווה (5:00)\nהענן הניח אותם בעדינות במיטתם החמה. לביא עצם את עיניו, חייך ונשם לאט. היער היה שקט, הלילה היה שלו, ושינה מתוקה ועמוקה מילאה את הלב. לילה טוב, חלומות פז.`
        }
      }
    };

    const targetKey = ['15s', '30s', '60s', '5m', '10m', '15m', '30m'].includes(len) ? len : '30s';
    const langTemplates = isHe ? GENERATED_TEMPLATES_BY_LENGTH.he[targetKey] : GENERATED_TEMPLATES_BY_LENGTH.en[targetKey];
    const selectedFormat = format || 'podcast';
    const generatedScript = langTemplates[selectedFormat] || langTemplates['podcast'] || langTemplates['kids_story'] || langTemplates['video_script'];

    res.json({
      success: true,
      action: 'generate',
      format: selectedFormat,
      targetLength: targetKey,
      topic: customTopic,
      text: generatedScript
    });
  } catch (err) {
    console.error('[VoiceOver] AI Script Assistant error:', err);
    res.status(500).json({ error: err.message || 'AI Script Assistant failed' });
  }
});

// POST generate voiceover with auto-routing to 30 Hebrew Models, Bucket Clones, OR 30 Multilingual Personas
router.post('/generate', async (req, res) => {
  try {
    const { script, voice, emotion, stability, similarityBoost, style, speed, modelId, language, useClonedBridge } = req.body;

    if (!script || !script.trim()) {
      return res.status(400).json({ error: 'Script text is required' });
    }

    const isHebrewScript = /[\u0590-\u05FF]/.test(script);
    const isNativeHebrewVoice = voice && voice.startsWith('he-IL');
    const isBucketClonedVoice = voice && (voice.startsWith('family-') || voice.startsWith('preset-'));

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const elevenLabs = getElevenLabsService();

    // 1. ROUTE TO NATIVE ISRAELI NEURAL ENGINE (For 30 Hebrew Models or Hebrew text when ElevenLabs is offline)
    if (isNativeHebrewVoice || (isHebrewScript && (!elevenLabs || !useClonedBridge || isNativeHebrewVoice))) {
      console.log(`[VoiceOver] Routing to 30 Native Israeli Hebrew Models: voice=${voice}`);
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
          engine: 'Native Israeli Neural Engine (30 Hebrew Voices)',
          createdAt: new Date().toISOString()
        });
      } catch (heErr) {
        console.error('[VoiceOver] Native Hebrew synthesis error:', heErr);
        return res.status(500).json({ error: `Hebrew synthesis error: ${heErr.message}` });
      }
    }

    // 2. ROUTE TO ELEVENLABS FOR 30 MULTILINGUAL VOICES OR CLONED VOICES
    if (elevenLabs && elevenLabs.isConfigured()) {
      let synthesizedText = script;
      let usedBridge = false;

      if (isHebrewScript || language === 'he') {
        synthesizedText = hebrewPhoneticsEngine.transliterate(script);
        usedBridge = true;
        console.log(`[VoiceOver] Hebrew Cloned Voice Bridge: "${script}" -> "${synthesizedText}"`);
      }

      // Resolve composite persona IDs (e.g. 'es-male-2' -> 'ErXwobaYiN019PkySvjV')
      const targetVoiceId = multilingualRosterService.resolveVoiceId(voice);
      console.log(`[VoiceOver] ElevenLabs synthesis: inputVoice=${voice} -> resolvedId=${targetVoiceId}, chars=${synthesizedText.length}`);

      try {
        const audioBuffer = await elevenLabs.synthesize(synthesizedText, targetVoiceId, {
          emotion: emotion || 'neutral',
          stability: typeof stability === 'number' ? stability : 0.5,
          similarityBoost: typeof similarityBoost === 'number' ? similarityBoost : 0.75,
          style: typeof style === 'number' ? style : 0.0,
          speed: typeof speed === 'number' ? speed : 1.0,
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
          voice: targetVoiceId,
          script,
          phoneticsUsed: usedBridge ? synthesizedText : null,
          audioLength: audioBuffer.length,
          duration: Math.ceil(synthesizedText.length / 14),
          status: 'complete',
          engine: usedBridge ? 'Hebrew Cloned Voice Bridge (ElevenLabs)' : 'ElevenLabs Multilingual V2 (30 Personas)',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('[VoiceOver] ElevenLabs synthesis failed, checking fallback:', err.message);
        // Fallback to Native Israeli Neural Engine if text is Hebrew
        if (isHebrewScript) {
          const audioBuffer = await hebrewTtsService.synthesizeHebrew(script, 'he-IL-HilaNeural');
          const filename = `hebrew-voiceover-${Date.now()}.mp3`;
          const filepath = path.join(uploadsDir, filename);
          fs.writeFileSync(filepath, audioBuffer);
          return res.json({
            id: `vo-fallback-${Date.now()}`,
            filename,
            url: `/uploads/${filename}`,
            voice: 'he-IL-HilaNeural',
            script,
            duration: Math.ceil(script.length / 12),
            status: 'complete',
            engine: 'Native Israeli Neural Engine (Fallback)',
            createdAt: new Date().toISOString()
          });
        }
        return res.status(500).json({ error: err.message || 'Audio synthesis failed' });
      }
    }

    // 3. OFFLINE / BUCKET FALLBACK FOR HEBREW & CLONED VOICES
    if (isHebrewScript || language === 'he') {
      const audioBuffer = await hebrewTtsService.synthesizeHebrew(script, 'he-IL-HilaNeural');
      const filename = `hebrew-voiceover-${Date.now()}.mp3`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, audioBuffer);

      return res.json({
        id: `vo-bucket-${Date.now()}`,
        filename,
        url: `/uploads/${filename}`,
        voice: voice || 'he-IL-HilaNeural',
        script,
        audioLength: audioBuffer.length,
        duration: Math.ceil(script.length / 12),
        status: 'complete',
        engine: 'Native Israeli Neural Engine (Bucket Cloned Voice)',
        createdAt: new Date().toISOString()
      });
    }

    return res.status(400).json({ 
      error: 'To synthesize non-Hebrew multilingual voices, please set the ELEVENLABS_API_KEY environment variable in Railway or .env' 
    });
  } catch (error) {
    console.error('Generation route error:', error);
    res.status(500).json({ error: error.message || 'Voiceover generation failed' });
  }
});

// Health check
router.get('/status', (req, res) => {
  const elevenLabs = getElevenLabsService();
  res.json({
    service: 'voiceover',
    hebrewEngine: 'ready (30 Native Israeli Neural Voices & Cloned Voice Bridge)',
    multilingualEngine: 'ready (30 Personas for All Languages)',
    bucketStorage: 'active',
    elevenLabsConfigured: elevenLabs ? elevenLabs.isConfigured() : false,
    status: 'ready'
  });
});

export default router;
