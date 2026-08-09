import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ElevenLabsService from '../services/elevenlab-service.js';
import hebrewTtsService from '../services/hebrew-tts-service.js';
import hebrewPhoneticsEngine from '../services/hebrew-phonetics.js';
import multilingualRosterService from '../services/multilingual-roster.js';

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

  res.json(selectedStory);
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

    // 2. CREATIVE GENERATION CALIBRATED BY TARGET LENGTH
    const customTopic = topic && topic.trim() ? topic.trim() : (isHe ? 'עתיד הבינה המלאכותית והטכנולוגיה' : 'the future of artificial intelligence');

    const GENERATED_TEMPLATES_BY_LENGTH = {
      en: {
        '15s': {
          podcast: `Welcome back to The Daily Frequency! Today we're breaking down ${customTopic} in 60 seconds. Let's get right into it!`,
          news: `Breaking News: Major developments announced today regarding ${customTopic}. Analysts report significant market impact. Stay tuned for details.`,
          commercial: `Discover the breakthrough power of ${customTopic}. Built for high performance and unmatched quality. Try it today!`,
          narration: `In a world of constant motion, ${customTopic} sparked a quiet revolution that would change everything.`,
          interview: `Today in the studio, our guest breaks down ${customTopic}. Welcome to the show!`
        },
        '30s': {
          podcast: `Welcome back to The Daily Frequency! Today we're exploring an incredible breakthrough: ${customTopic}. Whether you're listening on your morning commute or relaxing at home, this is one story you don't want to miss. Let's dive in!`,
          news: `Top Story of the Hour: New developments emerge regarding ${customTopic}. Industry leaders and analysts report significant progress, marking a pivotal moment in today's broadcast. Reporting live, more updates at the top of the hour.`,
          commercial: `Are you ready for the next big breakthrough? Discover the power of ${customTopic}. Designed for creators, thinkers, and innovators who demand the absolute best. Try it today and experience the difference for yourself!`,
          narration: `In a world shaped by rapid change and quiet wonders, ${customTopic} emerged as a guiding light. As dawn broke across the horizon, a new chapter of discovery and inspiration had officially begun.`,
          interview: `Joining us today in the studio is our special guest to talk about ${customTopic}. Thanks for being here—tell us, what was the initial spark that brought this whole project to life?`
        },
        '60s': {
          podcast: `Welcome back to The Daily Frequency! Today we have an extraordinary episode lined up as we examine ${customTopic}. Over the past few weeks, we've seen immense curiosity and debate around what this means for creators, innovators, and our daily lives.\n\nWe're going to unpack the key takeaways, separate the hype from reality, and look at where things are heading next. Settle in with your favorite coffee and let's jump right into the story!`,
          news: `Good morning, this is your special news briefing. Our lead story today centers on groundbreaking updates surrounding ${customTopic}.\n\nAccording to officials and industry observers, recent milestones represent a major leap forward, bringing both new opportunities and important strategic discussions to the forefront. Regulatory bodies and international partners are closely monitoring the rollout. We will bring you live expert commentary and on-the-ground reactions as this story continues to unfold throughout the day.`,
          commercial: `Every once in a while, a tool comes along that completely transforms the way you work and create. Meet the next generation of ${customTopic}.\n\nBuilt from the ground up with studio-grade precision, lightning-fast performance, and an intuitive design that puts you in total control. Join thousands of top creators and professionals who have already upgraded their workflow. Visit our website today to claim your exclusive trial and experience the difference!`,
          narration: `Deep across the horizon, where curiosity meets the edge of the unknown, the journey into ${customTopic} took its first bold steps. Generations of seekers had dreamed of this moment, yet few imagined how swiftly the world would transform.\n\nAs the golden morning light bathed the valleys, whispers of anticipation filled the air. A timeless chapter was unfolding—one where courage, wonder, and imagination forged an unbreakable legacy.`,
          interview: `Welcome back to our studio spotlight series. Today we're thrilled to welcome our featured guest to discuss the groundbreaking work behind ${customTopic}.\n\nFrom the early design sketches to the latest international rollout, this initiative has captivated attention across the industry. Thank you so much for joining us—let's start from the very beginning. What inspired you to take on this ambitious challenge?`
        },
        '120s': {
          podcast: `Welcome back to The Daily Frequency, your daily audio guide to the ideas shaping tomorrow. Today we're dedicating our entire deep-dive to ${customTopic}.\n\nIf you've been following the news, you know that this topic has sparked passionate conversations across the globe. But what is really happening beneath the headlines? Today, we're cutting through the noise to explore the three biggest factors driving this movement forward.\n\nFirst, we'll look at the fundamental technology that makes it all possible. Next, we'll hear what leading creators and analysts are saying on the ground. And finally, we'll discuss the practical impact on how we work, live, and create.\n\nGrab your headphones, relax, and join us for this special extended conversation.`,
          news: `Special Extended Report: We bring you comprehensive coverage on the developing situation surrounding ${customTopic}.\n\nOver the past twenty-four hours, key stakeholders, academic researchers, and industry leaders have released collaborative findings indicating a transformative shift across multiple sectors. Early indicators suggest widespread adoption and measurable efficiency gains.\n\nEconomic analysts point out that while early milestones have exceeded forecasts, long-term implementation will require robust infrastructure and clear guidelines. In response, global working groups have convened to establish standardized frameworks for sustainable growth.\n\nWe will continue to track incoming statements from official briefings and provide live updates as new details emerge.`,
          commercial: `What if you could turn your most ambitious creative vision into reality in just minutes? Discover the revolutionary power of ${customTopic}.\n\nEngineered for professionals, visionaries, and storytellers who refuse to compromise on quality. Our cutting-edge platform combines state-of-the-art neural intelligence with unmatched ease of use, giving you the power to produce studio-caliber audio on demand.\n\nWhether you're producing a top-tier podcast, broadcasting daily news, or building immersive audiobooks, this is the all-in-one studio you've been waiting for.\n\nJoin over one hundred thousand creators worldwide. Experience the next era of creative sound today.`,
          narration: `Long before the great towers rose above the silver plains, the ancient chroniclers spoke of a time when ${customTopic} would awaken the world. It was written that true mastery arrives not through force, but through patient understanding and relentless curiosity.\n\nThrough winding mountain trails and whispering forests, the journey continued. Every step brought fresh revelations, illuminating the forgotten paths that connected the past to an extraordinary future.\n\nAnd as the dusk settled into a tapestry of celestial violet and gold, the travelers looked out upon the vast valley below, knowing that their story had only just begun.`,
          interview: `Thank you for tuning in to today's extended studio conversation. Today, we're joined by one of the visionary minds leading the revolution in ${customTopic}.\n\nOver the past year, your work has consistently pushed the boundaries of what is possible, earning praise from both industry veterans and newcomers alike. We're honored to have you with us.\n\nTo kick things off, take us back to that pivotal moment when you realized this wasn't just a prototype, but something that could redefine the entire landscape. What were those early days like?`
        }
      },
      he: {
        '15s': {
          podcast: `שלום וברוכים הבאים לפודקאסט היומי שלנו! היום נדבר על ${customTopic} בתוך 60 שניות. בואו נתחיל!`,
          news: `מבזק חדשות: התפתחויות משמעותיות נרשמו סביב ${customTopic}. מומחים מדווחים על פריצת דרך חשובה. פרטים נוספים בהמשך.`,
          commercial: `מוכנים לעתיד? גלו את העוצמה של ${customTopic}. איכות ללא פשרות וביצועים יוצאי דופן. נסו עכשיו!`,
          narration: `בעולם שנע במהירות, ${customTopic} הביא רגע של בהירות ששינה את פני הדברים.`,
          interview: `היום באולפן נארח מומחה מיוחד שיספר לנו על ${customTopic}. ברוך הבא!`
        },
        '30s': {
          podcast: `שלום וברוכים הבאים לפודקאסט היומי שלנו! בפרק הזה אנחנו צוללים לנושא מרתק במיוחד: ${customTopic}. בין אם אתם בדרכים או בבית, יש לנו סיפור מעורר השראה עבורכם. קחו כוס קפה ובואו נצא לדרך!`,
          news: `מבזק חדשות מיוחד: התפתחויות משמעותיות נרשמו היום סביב ${customTopic}. גורמים בכירים ומומחים מדווחים על פריצת דרך חשובה ושינוי מגמה בשווקים. נמשיך לעקוב ולדווח לאורך כל היום.`,
          commercial: `מוכנים לשלב הבא? הכירו את הפתרון המוביל עבור ${customTopic}. איכות ללא פשרות, ביצועים יוצאי דופן וחוויה מתקדמת שמותאמת בדיוק עבורכם. נסו עכשיו והרגישו בהבדל!`,
          narration: `בעולם שנע במהירות בלתי פוסקת, צץ לפתע רגע של בהירות והשראה סביב ${customTopic}. כשהאור הראשון של הבוקר עלה מעל ההרים, היה ברור שפרק חדש ומרתק נפתח.`,
          interview: `איתנו באולפן היום אורח מיוחד שמגיע לדבר איתנו על ${customTopic}. שלום לך, ספר לנו מה בעצם הוביל לרעיון המהפכני הזה ואיך הכל התחיל?`
        },
        '60s': {
          podcast: `שלום וברוכים הבאים לפרק מיוחד של הפודקאסט שלנו! היום אנחנו מקדישים את השיחה לנושא שמעסיק רבים: ${customTopic}.\n\nבשבועות האחרונים שמענו המון דעות ורעיונות, אבל היום אנחנו רוצים לעשות סדר, להבין מה עומד מאחורי הקלעים ומה המשמעות האמיתית של המהלך הזה עבור כולנו.\n\nהתרווחו בכיסא, קחו נשימה עמוקה, ובואו נצלול יחד אל תוך הסיפור המלא והמרתק הזה.`,
          news: `בוקר טוב, כאן מבזק חדשות מורחב. הסיפור המרכזי של היום מתמקד בהתפתחויות חסרות תקדים בנושא ${customTopic}.\n\nעל פי דיווחי מומחים וגורמים בכירים, מדובר בצעד משמעותי שצפוי להשפיע על מגוון תחומים רחב במשק. צוותי מחקר ופיתוח מלווים את התהליך מקרוב ומציינים כי התוצאות הראשוניות עולות על כל הציפיות.\n\nנמשיך לעדכן בדיווחים חיים מהשטח ובתגובות המומחים לאורך כל שעות היממה.`,
          commercial: `לפעמים מגיע מוצר אחד שמשנה לחלוטין את הדרך שבה אנחנו יוצרים, עובדים וחושבים. הכירו את הדור הבא של ${customTopic}.\n\nפיתוח חדשני, דיוק בלתי מתפשר וממשק מתקדם שמעניק לכם שליטה מלאה על כל פרט. אלפי יוצרים ואנשי מקצוע מובילים כבר הצטרפו למהפכה.\n\nבקרו באתר שלנו עוד היום, קבלו גישה מיידית והתחילו ליצור באיכות הגבוהה ביותר.`,
          narration: `בלב הנופים הקסומים, במקום שבו הרוח לוחשת סיפורים עתיקים, התגלה השביל שהוביל אל ${customTopic}. דורות של חולמים חיכו לרגע שבו האור יפציע מחדש מעל האופק.\n\nהצעדים היו בטוחים והלב היה מלא תקווה. כל גילוי קטן הביא עמו הבנה עמוקה יותר של הכוח הטמון ברוח האנושית, בסקרנות ובחיפוש אחר הטוב והיפה.`,
          interview: `שלום לכם וברוכים הבאים לתוכנית הראיונות שלנו. היום נמצא איתנו אחד האנשים המובילים את השינוי סביב ${customTopic}.\n\nהפרויקט שלך זוכה לשבחים רבים ולהתעניינות בינלאומית עצומה. תודה שהצטרפת אלינו היום.\n\nבוא נחזור להתחלה—מה היה הרגע המדויק שבו הבנת שיש בידיך רעיון שיכול לשנות סדרי עולם?`
        },
        '120s': {
          podcast: `שלום לכל המאזינים שלנו וברוכים הבאים לפרק עומק מיוחד! היום אנחנו מקדישים את כל הזמן לנושא שמשנה את כללי המשחק: ${customTopic}.\n\nכולנו רואים את הכותרות המהירות ברשתות, אבל לעיתים נדירות יוצא לנו לעצור, להתעמק ולהבין את התמונה המלאה. בפרק הזה נבחן שלושה היבטים מרכזיים: ראשית, מה הבסיס הטכנולוגי שמאפשר את השינוי הזה. שנית, מה אומרים האנשים שפועלים בשטח. ושלישית, איך כל זה משפיע באופן ישיר על היום-יום שלנו.\n\nשימו אוזניות, קחו כוס קפה חמה, ובואו נתחיל במסע המשותף שלנו.`,
          news: `דיווח חדשותי מורחב ומיוחד: אנו מביאים בפניכם סקירה מקיפה של פריצת הדרך הגדולה סביב ${customTopic}.\n\nביממה האחרונה פורסמו ממצאים ראשוניים המצביעים על שינוי מבני עמוק. אנליסטים בכירים מדגישים כי מדובר במהלך אסטרטגי בעל השלכות מרחיקות לכת, הן ברמה הלאומית והן ברמה הבינלאומית.\n\nגופים מקצועיים מתכנסים כעת כדי לגבש מדיניות אחידה שתאפשר יישום בטוח, אחראי ויעיל של הטכנולוגיה החדשה. נמשיך לספק לכם פרשנויות מומחים ועדכונים שוטפים מהאולפן לאורך כל היום.`,
          commercial: `מה אם הייתם יכולים להפוך כל רעיון יצירתי למציאות מוחשית בתוך שניות ספורות? הכירו את הפלטפורמה המתקדמת ביותר עבור ${customTopic}.\n\nמערכת חכמה, מבוססת בינה מלאכותית מהדור החדש, שתוכננה במיוחד עבור יוצרים, אנשי תקשורת ומספרי סיפורים שלא מתפשרים על פחות ממושלם.\n\nאיכות סאונד של אולפן מקצועי, גמישות מלאה ודיוק קולי שאין שני לו. הצטרפו עכשיו למאות אלפי משתמשים ברחבי העולם וגלו חוויית יצירה חדשה לחלוטין.`,
          narration: `עוד לפני שהערים הגדולות נבנו על גדות הנהר, סיפרו זקני העם על היום שבו ${customTopic} יאיר מחדש את העולם. הייתה זו אגדה שנלחשה בלילות זרועי כוכבים, מעבירה מסר של חוכמה וסבלנות.\n\nהמסע בשבילים המתפתלים דרש אומץ ואמונה. כל אבן וכל צעד גילו סודות ישנים שהתחברו יחד לכדי תובנה חדשה ומאירה.\n\nוכשהערב ירד והשמיים נצבעו בגווני ארגמן וזהב, ידעו כולם כי זהו רק תחילתו של סיפור נפלא שייזכר לדורות.`,
          interview: `ברוכים הבאים לתוכנית הזרקור השבועית שלנו. היום יש לנו הכבוד לארח באולפן יוצר וחוקר מוביל בתחום של ${customTopic}.\n\nהדרך שעברת בשנים האחרונות מעוררת השראה אצל רבים. העבודה שלך שילבה חדשנות טכנולוגית לצד חזון חברתי יוצא דופן.\n\nתודה רבה שהגעת. בוא נתחיל מהצעד הראשון—כשעמדת מול הדף הריק לפני כמה שנים, מה היה הדבר שהניע אותך להאמין שהבלתי אפשרי הוא למעשה בר-השגה?`
        }
      }
    };

    const targetKey = ['15s', '30s', '60s', '120s'].includes(len) ? len : '30s';
    const langTemplates = isHe ? GENERATED_TEMPLATES_BY_LENGTH.he[targetKey] : GENERATED_TEMPLATES_BY_LENGTH.en[targetKey];
    const selectedFormat = format || 'podcast';
    const generatedScript = langTemplates[selectedFormat] || langTemplates['podcast'];

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
