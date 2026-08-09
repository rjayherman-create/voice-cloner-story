import React, { useState, useEffect, useRef } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  // Navigation tabs: 'studio', 'screenplay', 'soundtrack', 'sdk'
  const [activeNav, setActiveNav] = useState('studio');

  // Mode selection: 'elevenlabs' vs 'offline'
  const [mode, setMode] = useState('elevenlabs');

  // Dedicated Family Voices & Catalog presets
  const [familyVoices, setFamilyVoices] = useState([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);
  const [currentRosterVoices, setCurrentRosterVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('en-fem-1');
  const [loading, setLoading] = useState(true);

  // Collapsible toggles
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);
  const [isTuningExpanded, setIsTuningExpanded] = useState(false);
  const [isStoriesExpanded, setIsStoriesExpanded] = useState(false);

  const [voiceFilter, setVoiceFilter] = useState('all');
  const [voiceSearch, setVoiceSearch] = useState('');

  // 🔊 Instant Play & Stop state for all 30 voices
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState(null);
  const [voicePreviewAudios, setVoicePreviewAudios] = useState({});
  const previewAudioRef = useRef(new Audio());

  // 1. Live Audio Waveform Visualizer states & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBufferUrl, setAudioBufferUrl] = useState(null);
  const [audioBufferBlob, setAudioBufferBlob] = useState(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 2. Voice Tuning Sliders states & Workflow Choices
  const [activeWorkflow, setActiveWorkflow] = useState('podcast');
  const [voiceStability, setVoiceStability] = useState(0.50);
  const [voiceSimilarity, setVoiceSimilarity] = useState(0.80);
  const [voiceSpeed, setVoiceSpeed] = useState(1.05);

  // ⏱️ Target Script Length State ('15s', '30s', '60s', '5m', '10m', '15m', '30m')
  const [targetLength, setTargetLength] = useState('30s');

  // 🤖 AI Script Assistant & Creative Generator States
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [aiFormat, setAiFormat] = useState('podcast');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [translating, setTranslating] = useState(false);
  const [sourceTranslateLang, setSourceTranslateLang] = useState('auto');
  const [isDictating, setIsDictating] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(1);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [engineMode, setEngineMode] = useState('free');
  const recognitionRef = useRef(null);

  // 🌐 Full 30+ Global World Languages (Hebrew positioned LAST on the list)
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([
    { code: 'en', name: 'English (US / UK / AU)', flag: '🇺🇸' },
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
    { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
    { code: 'nl', name: 'Dutch (Nederlands)', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish (Polski)', flag: '🇵🇱' },
    { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
    { code: 'sv', name: 'Swedish (Svenska)', flag: '🇸🇪' },
    { code: 'id', name: 'Indonesian (Bahasa Indonesia)', flag: '🇮🇩' },
    { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
    { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
    { code: 'uk', name: 'Ukrainian (Українська)', flag: '🇺🇦' },
    { code: 'el', name: 'Greek (Ελληνικά)', flag: '🇬🇷' },
    { code: 'cs', name: 'Czech (Čeština)', flag: '🇨🇿' },
    { code: 'fi', name: 'Finnish (Suomi)', flag: '🇫🇮' },
    { code: 'ro', name: 'Romanian (Română)', flag: '🇷🇴' },
    { code: 'da', name: 'Danish (Dansk)', flag: '🇩🇰' },
    { code: 'no', name: 'Norwegian (Norsk)', flag: '🇳🇴' },
    { code: 'hu', name: 'Hungarian (Magyar)', flag: '🇭🇺' },
    { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭' },
    { code: 'ms', name: 'Malay (Bahasa Melayu)', flag: '🇲🇾' },
    { code: 'he', name: 'Hebrew (עברית ישראלית)', flag: '🇮🇱' }
  ]);
  const [multilingualPhrases, setMultilingualPhrases] = useState({
    en: 'Welcome to FableVoice Audio Studio. Active voice model calibrated for podcasts, news, narrations, and creative audio.',
    he: 'שלום וברוכים הבאים לאולפן ההקלטות. מודל הקול מכויל לקריינות, פודקאסטים, חדשות ויצירה קולית מתקדמת.'
  });

  // Workflow sample texts dictionary for all modes in En and He
  const WORKFLOW_PRESETS = {
    podcast: {
      label: '🎙️ Podcast & Audio Show',
      desc: 'Engaging conversational pacing with warm vocal presence for interviews & hosts',
      stability: 0.50,
      similarity: 0.80,
      speed: 1.05,
      phrases: {
        en: 'Welcome back to The Daily Frequency! Today we have an incredible episode breaking down the future of creative AI and storytelling. Let’s jump right in.',
        he: 'שלום וברוכים הבאים לפודקאסט היומי שלנו! היום נדבר על עתיד הבינה המלאכותית ויצירת תוכן קולי. קחו כוס קפה ובואו נתחיל.',
        es: '¡Bienvenidos de nuevo a nuestro podcast! Hoy tenemos un episodio increíble sobre el futuro de la tecnología.',
        fr: 'Bienvenue dans notre podcast du jour ! Aujourd\'hui, nous explorons les grandes innovations de demain.'
      }
    },
    news: {
      label: '📰 News & Broadcast Bulletin',
      desc: 'Crisp, articulate delivery with balanced clarity for journalism & reports',
      stability: 0.70,
      similarity: 0.85,
      speed: 1.00,
      phrases: {
        en: 'Top Story of the Hour: Tech leaders announce major breakthroughs in clean energy systems, signaling a pivotal shift across global markets. More details coming up.',
        he: 'מבזק חדשות מיוחד: פריצת דרך משמעותית נרשמה היום בתחום האנרגיה הירוקה. מומחים מדווחים על שינוי מגמה בשווקים הבינלאומיים.',
        es: 'Boletín de última hora: Importantes avances en tecnología energética marcan la jornada de hoy.',
        fr: 'Flash info : De nouvelles avancées majeures viennent d\'être annoncées aujourd\'hui par les experts.'
      }
    },
    video: {
      label: '🎬 Video & YouTube Storyboard',
      desc: 'Dynamic pacing with cues for on-screen B-roll, motion graphics, and audio sync',
      stability: 0.55,
      similarity: 0.80,
      speed: 1.05,
      phrases: {
        en: '[SCENE 1: Studio Shot] What if you could produce complete audio documentaries in seconds? [SCENE 2: Cut to B-Roll] Today we reveal the revolutionary workflow.',
        he: '[סצינה 1: צילום אולפן] מה אם הייתם יכולים ליצור סרטי שמע ודוקו בתוך דקות? [סצינה 2: מעבר להדגמה] היום נחשוף את שיטת העבודה המלאה.',
        es: '[ESCENA 1: En estudio] ¿Qué pasaría si pudieras crear audio profesional en segundos? Hoy te mostramos cómo.',
        fr: '[SCÈNE 1 : En studio] Et si vous pouviez produire des documentaires audio en quelques secondes ? Découvrez la méthode.'
      }
    },
    bedtime: {
      label: '🧒 15-Min Kids Bedtime Story',
      desc: 'Gentle, soothing pacing with chaptered lullabies for peaceful sleep',
      stability: 0.80,
      similarity: 0.85,
      speed: 0.90,
      phrases: {
        en: 'Chapter 1: The Whispering Meadow. Close your eyes, little adventurer. The moon is painting the sky in shades of silver and lavender, watching over your sweet dreams.',
        he: 'פרק 1: אחו הלוחשים. לילה טוב ילד שלי. עצום את העיניים והקשב לשיר הערש שהכוכבים שרים לך בשמיים. חלומות פז ושינה מתוקה.',
        es: 'Capítulo 1: El bosque susurrante. Buenas noches mi pequeño héroe, que descanses y que las estrellas guíen tus hermosos sueños.',
        fr: 'Chapitre 1 : La prairie magique. Bonne nuit mon petit ange, dors bien et fais de très beaux rêves étoilés.'
      }
    },
    commercial: {
      label: '📢 Commercial & Promo Ad',
      desc: 'High-energy, punchy hook designed for announcements and product promos',
      stability: 0.40,
      similarity: 0.75,
      speed: 1.10,
      phrases: {
        en: 'Are you ready for the ultimate creative breakthrough? Experience studio-grade AI voiceovers in seconds. Try it today and elevate your content!',
        he: 'מוכנים לפריצת הדרך הגדולה שלכם? גלו את פלטפורמת הקול המובילה בעולם ליצירת תוכן מקצועי. התחילו עכשיו!',
        es: '¿Estás listo para el siguiente nivel? Descubre la mejor experiencia de voz con inteligencia artificial.',
        fr: 'Prêt pour l\'innovation ? Découvrez dès aujourd\'hui la nouvelle référence du studio vocal par IA.'
      }
    }
  };

  // 3. Multi-Sample Voice Quality Booster states
  const [sampleSlots, setSampleSlots] = useState([
    { id: 1, label: 'Sample 1: Studio Reading / Voice Clip', file: null, name: '' },
    { id: 2, label: 'Sample 2: Dynamic Dialogue', file: null, name: '' },
    { id: 3, label: 'Sample 3: Conversational Tone', file: null, name: '' }
  ]);

  // Modal for "+ Clone New Voice"
  const [showFamilyCloneModal, setShowFamilyCloneModal] = useState(false);
  const [familyCloneLoading, setFamilyCloneLoading] = useState(false);
  const [familyCloneError, setFamilyCloneError] = useState('');
  const [familyForm, setFamilyForm] = useState({
    name: '',
    relationship: 'Podcast Host',
    gender: 'female',
    accent: 'Israeli Hebrew / English',
    style: 'Warm & Dynamic Storyteller',
    description: '',
    sampleFile: null
  });

  // Voice cloning model label for right panel
  const [voiceModelLabel, setVoiceModelLabel] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneStatusMsg, setCloneStatusMsg] = useState({ type: '', text: '' });

  // TTS Synthesis Test state (defaulting to clean text)
  const [ttsText, setTtsText] = useState('Welcome back to The Daily Frequency! Today we have an incredible episode breaking down the future of creative AI and storytelling. Let’s jump right in.');
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState(null);
  const [synthesizedEngineUsed, setSynthesizedEngineUsed] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // 4. Multi-Voice Screenplay & Dialogue Workshop states
  const [screenplayFormat, setScreenplayFormat] = useState('story'); // 'story' | 'podcast' | 'news' | 'commercial' | 'cinematic'
  const [screenplayTopic, setScreenplayTopic] = useState('');
  const [storyTheme, setStoryTheme] = useState('bedtime');
  const [childName, setChildName] = useState('Leo');
  const [screenplayCharacters, setScreenplayCharacters] = useState({
    Narrator: 'en-male-1',
    Mother: 'en-fem-1',
    Father: 'en-male-2',
    Child: 'en-girl-1',
    'Wise Elder': 'en-male-6',
    Host: 'en-male-1',
    'Co-Host': 'en-fem-2',
    Guest: 'en-male-3',
    Anchor: 'en-fem-1',
    Reporter: 'en-male-2',
    Analyst: 'en-fem-3',
    Announcer: 'en-male-1',
    'Customer A': 'en-fem-1',
    'Customer B': 'en-male-4'
  });
  const [screenplayScript, setScreenplayScript] = useState(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [synthesizingScreenplay, setSynthesizingScreenplay] = useState(false);
  const [screenplayAudioLines, setScreenplayAudioLines] = useState([]);

  // 5. Soundtrack Console & Ambience Mixer states (20-Track Library)
  const [soundtracks, setSoundtracks] = useState([]);
  const [selectedSoundtrack, setSelectedSoundtrack] = useState(null);
  const [soundtrackCategory, setSoundtrackCategory] = useState('all');
  const [soundtrackSearch, setSoundtrackSearch] = useState('');
  const [soundtrackCategories, setSoundtrackCategories] = useState([]);
  const [soundtrackVolume, setSoundtrackVolume] = useState(0.35);
  const [autoDucking, setAutoDucking] = useState(true);
  const [playingSoundtrackId, setPlayingSoundtrackId] = useState(null);
  const soundtrackAudioRef = useRef(null);

  // 6. Sound Studio Multi-Track Mixer & Master DAW states (Auto & Manual)
  const [mixerMode, setMixerMode] = useState('auto'); // 'auto' | 'manual'
  const [mixerVoiceGain, setMixerVoiceGain] = useState(1.0);
  const [mixerMusicGain, setMixerMusicGain] = useState(0.25);
  const [mixerAutoDucking, setMixerAutoDucking] = useState(true);
  const [mixerIntroDelay, setMixerIntroDelay] = useState(1.5);
  const [mixerOutroPad, setMixerOutroPad] = useState(2.5);
  const [isRenderingMix, setIsRenderingMix] = useState(false);
  const [mixedMasterAudioUrl, setMixedMasterAudioUrl] = useState(null);
  const [mixedMasterDetails, setMixedMasterDetails] = useState(null);

  // Refs for recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    document.title = '🎙️ FableVoice Studio - AI Voice Cloning & Universal Audio Studio';
    loadAllVoiceData();
    loadSoundtracks();
    loadLanguageData();

    const currentAudio = previewAudioRef.current;
    currentAudio.onended = () => {
      setPlayingVoiceId(null);
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (currentAudio) currentAudio.pause();
    };
  }, []);

  // Fetch 30-voice roster whenever language changes
  useEffect(() => {
    loadRosterForLanguage(selectedLanguage);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPlayingVoiceId(null);
    }
  }, [selectedLanguage]);

  const loadLanguageData = async () => {
    try {
      const res = await fetch('/api/voiceover/languages');
      const data = await res.json();
      if (data.languages) setSupportedLanguages(data.languages);
      if (data.phrases) setMultilingualPhrases(data.phrases);
    } catch (err) {
      console.error('Error loading languages:', err);
    }
  };

  const loadRosterForLanguage = async (langCode) => {
    try {
      const res = await fetch(`/api/voiceover/roster/${langCode}`);
      const data = await res.json();
      if (data && Array.isArray(data.voices)) {
        setCurrentRosterVoices(data.voices);
        if (data.voices.length > 0 && (!selectedVoiceId || !selectedVoiceId.startsWith(langCode))) {
          setSelectedVoiceId(data.voices[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading roster for language:', err);
    }
  };

  const loadAllVoiceData = async () => {
    setLoading(true);
    try {
      const [elRes, libRes] = await Promise.all([
        fetch('/api/voiceover/voices'),
        fetch('/api/voice-library')
      ]);

      const elData = await elRes.json();
      const libData = await libRes.json();

      const famList = Array.isArray(libData) ? libData.map(v => ({
        id: v.id || v.voiceId,
        voiceId: v.voiceId || v.id,
        name: v.name,
        relationship: v.relationship || v.labels?.relationship || 'Voice Model',
        gender: v.gender || v.labels?.gender || 'Custom',
        accent: v.accent || v.labels?.accent || 'Israeli Hebrew / Cloned',
        style: v.style || v.labels?.descriptive || 'Conversational',
        description: v.description || `${v.name}'s custom cloned voice model saved in persistent bucket.`,
        previewUrl: v.previewUrl || null,
        date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/9/2026',
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      })) : [];

      const heList = Array.isArray(elData) ? elData.filter(v => v.category === 'hebrew' || v.id.startsWith('he-IL')) : [];
      const elList = Array.isArray(elData) ? elData.filter(v => v.category !== 'hebrew' && !v.id.startsWith('he-IL')) : [];

      setFamilyVoices(famList);
      setElevenLabsVoices(elList);

      if (selectedLanguage === 'he' && heList.length > 0) {
        setCurrentRosterVoices(heList);
        setSelectedVoiceId('he-IL-HilaNeural');
      } else {
        loadRosterForLanguage(selectedLanguage || 'en');
        setSelectedVoiceId('en-fem-1');
      }
    } catch (err) {
      console.error('Error loading voice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSoundtracks = async (cat = 'all', query = '') => {
    try {
      const url = `/api/voiceover/soundtracks?category=${encodeURIComponent(cat)}${query ? '&search=' + encodeURIComponent(query) : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.soundtracks || []);
      setSoundtracks(list);
      if (data.categories) setSoundtrackCategories(data.categories);
      if (list.length > 0 && !selectedSoundtrack) setSelectedSoundtrack(list[0]);
    } catch (err) {
      console.error('Error loading soundtracks:', err);
    }
  };

  const handleSelectSoundtrackCategory = (cat) => {
    setSoundtrackCategory(cat);
    loadSoundtracks(cat, soundtrackSearch);
  };

  const handleSearchSoundtracks = (query) => {
    setSoundtrackSearch(query);
    loadSoundtracks(soundtrackCategory, query);
  };

  // 🤖 AI Script Assistant Handlers with Target Length & Exact Time Setter Support
  const handleAiGenerate = async (formatKey, lenKey, customSecs) => {
    const chosenFormat = formatKey || aiFormat;
    const chosenLength = lenKey || targetLength;
    const exactSecs = typeof customSecs === 'number' ? customSecs : ((customMinutes * 60) + customSeconds);
    setAiLoading(true);
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/voiceover/ai-script-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          format: chosenFormat,
          targetLength: chosenLength,
          targetSeconds: exactSecs,
          topic: aiPromptTopic,
          language: selectedLanguage
        })
      });
      const data = await res.json();
      if (data.text) {
        setTtsText(data.text);
        const mins = Math.floor(exactSecs / 60);
        const secs = exactSecs % 60;
        const timeLabel = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins} Min`) : `${secs}s`;
        setAiSuccessMsg(`✨ Written to exact length: ${timeLabel} (${data.topic || chosenFormat})!`);
      }
    } catch (err) {
      alert('AI Assistant error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiEdit = async (toneKey, customSecs) => {
    if (!ttsText.trim()) return;
    const exactSecs = typeof customSecs === 'number' ? customSecs : ((customMinutes * 60) + customSeconds);
    setAiLoading(true);
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/voiceover/ai-script-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          tone: toneKey,
          targetLength: targetLength,
          targetSeconds: exactSecs,
          currentText: ttsText,
          language: selectedLanguage
        })
      });
      const data = await res.json();
      if (data.text) {
        setTtsText(data.text);
        const mins = Math.floor(exactSecs / 60);
        const secs = exactSecs % 60;
        const timeLabel = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins} Min`) : `${secs}s`;
        setAiSuccessMsg(`✨ Script calibrated to exact length: ${timeLabel}!`);
      }
    } catch (err) {
      alert('AI Editing error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Quick Preset Setter
  const applyTimePreset = (mins, secs, label) => {
    setCustomMinutes(mins);
    setCustomSeconds(secs);
    if (label) setTargetLength(label);
  };

  // 🎬 Strip [VISUAL: ...] cues from video scripts for clean audio recording
  const handleStripVisualCues = () => {
    const cleaned = ttsText
      .replace(/\[VISUAL:[^\]]*\]/gi, '')
      .replace(/\[SCENE[^\]]*\]/gi, '')
      .replace(/\[VOICEOVER\]:?/gi, '')
      .replace(/\[ויז'ואל:[^\]]*\]/gi, '')
      .replace(/\[סצינה[^\]]*\]/gi, '')
      .replace(/\[קריינות\]:?/gi, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    setTtsText(cleaned);
    setAiSuccessMsg('🎙️ Visual directions removed. Clean voiceover ready for synthesis!');
  };

  // 🎙️ Live Microphone Speech-to-Text Dictation
  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. For best results, please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
      setAiSuccessMsg('🎙️ Microphone dictation stopped.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const speechLangMap = {
        'he': 'he-IL',
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-BR',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'ko': 'ko-KR',
        'hi': 'hi-IN',
        'ar': 'ar-SA',
        'ru': 'ru-RU',
        'nl': 'nl-NL'
      };

      recognition.lang = speechLangMap[selectedLanguage] || 'en-US';

      recognition.onstart = () => {
        setIsDictating(true);
        const targetName = supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
        setAiSuccessMsg(`🔴 Listening... speak into your microphone in ${targetName}!`);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setTtsText(prev => {
            const current = (prev || '').trim();
            return current ? `${current} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser bar.');
        }
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting dictation:', err);
      alert('Could not start microphone: ' + err.message);
      setIsDictating(false);
    }
  };

  // 🔊 Instant Play & Stop Toggle for any voice
  const handleToggleVoicePreview = async (voiceObj, e) => {
    if (e) e.stopPropagation();

    if (playingVoiceId === voiceObj.id) {
      previewAudioRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (voicePreviewAudios[voiceObj.id]) {
      previewAudioRef.current.src = voicePreviewAudios[voiceObj.id];
      previewAudioRef.current.play().catch(e => console.log('Autoplay error', e));
      setPlayingVoiceId(voiceObj.id);
      return;
    }

    setLoadingPreviewId(voiceObj.id);
    try {
      const demoPhrase = multilingualPhrases[selectedLanguage] || 
        `Hello, this is ${voiceObj.name}. Ready for voiceover recording.`;

      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: demoPhrase,
          voice: voiceObj.id,
          language: selectedLanguage,
          engineMode: engineMode,
          useClonedBridge: true
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Preview failed');
      }

      const data = await res.json();
      setVoicePreviewAudios(prev => ({ ...prev, [voiceObj.id]: data.url }));

      previewAudioRef.current.src = data.url;
      previewAudioRef.current.play().catch(e => console.log('Autoplay error', e));
      setPlayingVoiceId(voiceObj.id);
    } catch (err) {
      alert(`Preview error for ${voiceObj.name}: ${err.message}`);
    } finally {
      setLoadingPreviewId(null);
    }
  };

  // 🌐 Neural Bidirectional Translation for Script Content
  const handleBidirectionalTranslate = async (targetLang, sourceLang = 'auto') => {
    if (!ttsText || !ttsText.trim()) return;
    setTranslating(true);
    const targetLangObj = supportedLanguages.find(l => l.code === targetLang) || { name: targetLang };
    const sourceLangObj = supportedLanguages.find(l => l.code === sourceLang) || { name: 'Auto' };
    setAiSuccessMsg(`🌐 Translating (${sourceLangObj.name} ➔ ${targetLangObj.name})...`);
    try {
      const res = await fetch('/api/voiceover/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang
        })
      });
      const data = await res.json();
      if (data && data.translatedText) {
        setTtsText(data.translatedText);
        setSelectedLanguage(targetLang);
        setAiSuccessMsg(`✅ Translated (${sourceLangObj.name} ➔ ${targetLangObj.name})!`);
      }
    } catch (err) {
      console.error('Translation error:', err);
      alert('Translation error: ' + err.message);
    } finally {
      setTranslating(false);
    }
  };

  // ⇄ Swap Languages & Translate (English <-> Hebrew / Spanish / etc.)
  const handleSwapTranslate = async () => {
    if (!ttsText || !ttsText.trim()) return;
    const isCurrentlyHebrew = selectedLanguage === 'he' || /[\u0590-\u05FF]/.test(ttsText);
    const isCurrentlyEnglish = selectedLanguage === 'en';

    if (isCurrentlyEnglish) {
      // English -> Hebrew
      await handleBidirectionalTranslate('he', 'en');
    } else if (isCurrentlyHebrew) {
      // Hebrew -> English
      await handleBidirectionalTranslate('en', 'he');
    } else {
      // Other language -> English
      await handleBidirectionalTranslate('en', selectedLanguage);
    }
  };

  const handleSelectLanguage = async (langCode) => {
    setSelectedLanguage(langCode);

    // If user has written or generated text, automatically translate it to the newly selected language!
    if (ttsText && ttsText.trim()) {
      await handleBidirectionalTranslate(langCode, 'auto');
    } else {
      const preset = WORKFLOW_PRESETS[activeWorkflow];
      if (preset && preset.phrases[langCode]) {
        setTtsText(preset.phrases[langCode]);
      } else if (multilingualPhrases[langCode]) {
        setTtsText(multilingualPhrases[langCode]);
      }
    }
  };

  const handleSelectWorkflow = (wfKey) => {
    setActiveWorkflow(wfKey);
    const preset = WORKFLOW_PRESETS[wfKey];
    if (preset) {
      setVoiceStability(preset.stability);
      setVoiceSimilarity(preset.similarity);
      setVoiceSpeed(preset.speed);
      if (preset.phrases[selectedLanguage]) {
        setTtsText(preset.phrases[selectedLanguage]);
      } else if (preset.phrases['en']) {
        setTtsText(preset.phrases['en']);
      }
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const drawWaveform = (analyser, canvas) => {
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#fbbf24');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };
    render();
  };

  const startRecording = async () => {
    try {
      setCloneStatusMsg({ type: '', text: '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      if (canvasRef.current) {
        drawWaveform(analyser, canvasRef.current);
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioBufferBlob(blob);
        setAudioBufferUrl(url);
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioCtx) audioCtx.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone recording error: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSampleSlotFile = (slotId, file) => {
    setSampleSlots(prev => prev.map(s => s.id === slotId ? { ...s, file, name: file ? file.name : '' } : s));
    if (slotId === 1 && file) {
      setAudioBufferBlob(file);
      setAudioBufferUrl(URL.createObjectURL(file));
    }
  };

  const handleCloneFromPanel = async () => {
    if (!voiceModelLabel.trim()) {
      setCloneStatusMsg({ type: 'error', text: 'Please enter a Voice Model Label' });
      return;
    }

    if (!audioBufferBlob) {
      setCloneStatusMsg({ type: 'error', text: 'No recorded sample in buffer.' });
      return;
    }

    setCloneLoading(true);
    setCloneStatusMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', voiceModelLabel.trim());
      formData.append('relationship', 'Voice Model');
      formData.append('description', 'FableVoice Calibrated Voice Model saved in persistent bucket storage.');
      formData.append('sampleFile', audioBufferBlob, `${voiceModelLabel.trim().replace(/\s+/g, '-')}-sample.mp3`);

      const res = await fetch('/api/voice-library/clone', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cloning failed');
      }

      const newModel = await res.json();

      const newFamVoice = {
        id: newModel.id || newModel.voiceId,
        voiceId: newModel.voiceId || newModel.id,
        name: newModel.name,
        relationship: newModel.relationship || 'Custom Model',
        gender: newModel.gender || 'Custom',
        accent: 'Israeli Hebrew / Cloned',
        description: 'FableVoice Cloned Voice Model (Bucket Storage)',
        previewUrl: newModel.previewUrl || audioBufferUrl,
        date: new Date().toLocaleDateString(),
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      };

      setFamilyVoices(prev => [newFamVoice, ...prev]);
      setSelectedVoiceId(newFamVoice.id);
      setCloneStatusMsg({ type: 'success', text: `✨ Voice "${voiceModelLabel}" cloned & saved to persistent bucket storage!` });

      setVoiceModelLabel('');
      setAudioBufferBlob(null);
      setAudioBufferUrl(null);
      setRecordingSeconds(0);
    } catch (err) {
      setCloneStatusMsg({ type: 'error', text: 'Cloning error: ' + err.message });
    } finally {
      setCloneLoading(false);
    }
  };

  const handleFamilyModalSubmit = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim()) {
      setFamilyCloneError('Voice Name is required');
      return;
    }

    const primarySample = familyForm.sampleFile || sampleSlots.find(s => s.file)?.file;
    if (!primarySample) {
      setFamilyCloneError('Please upload at least 1 audio sample recording.');
      return;
    }

    setFamilyCloneLoading(true);
    setFamilyCloneError('');

    try {
      const formData = new FormData();
      formData.append('name', familyForm.name.trim());
      formData.append('relationship', familyForm.relationship);
      formData.append('gender', familyForm.gender);
      formData.append('accent', familyForm.accent);
      formData.append('style', familyForm.style);
      formData.append('description', familyForm.description || `${familyForm.name} cloned voice saved in bucket.`);
      formData.append('sampleFile', primarySample);

      const res = await fetch('/api/voice-library/clone', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cloning failed');
      }

      const newModel = await res.json();

      const newFamVoice = {
        id: newModel.id || newModel.voiceId,
        voiceId: newModel.voiceId || newModel.id,
        name: newModel.name,
        relationship: newModel.relationship || familyForm.relationship,
        gender: newModel.gender || familyForm.gender,
        accent: newModel.accent || familyForm.accent,
        style: newModel.style || familyForm.style,
        description: newModel.description,
        previewUrl: newModel.previewUrl || null,
        date: new Date().toLocaleDateString(),
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      };

      setFamilyVoices(prev => [newFamVoice, ...prev]);
      setSelectedVoiceId(newFamVoice.id);

      setFamilyForm({
        name: '',
        relationship: 'Podcast Host',
        gender: 'female',
        accent: 'Israeli Hebrew / English',
        style: 'Warm & Caring Storyteller',
        description: '',
        sampleFile: null
      });
      setShowFamilyCloneModal(false);
    } catch (err) {
      setFamilyCloneError(err.message);
    } finally {
      setFamilyCloneLoading(false);
    }
  };

  const handleDeleteProfile = async (e, profileId, profileName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${profileName}" from bucket storage?`)) {
      return;
    }

    setDeletingVoiceId(profileId);
    try {
      const res = await fetch(`/api/voice-library/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setFamilyVoices(prev => prev.filter(p => p.id !== profileId && p.voiceId !== profileId));
      if (selectedVoiceId === profileId) {
        setSelectedVoiceId('en-fem-1');
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingVoiceId(null);
    }
  };

  const handleSelectModel = (profile) => {
    setSelectedVoiceId(profile.id);
    if (onSelectVoice) {
      onSelectVoice(profile);
    }
  };

  const handleSynthesize = async () => {
    if (!ttsText.trim()) return;

    setSynthesizing(true);
    setSynthesizedEngineUsed(null);

    // Auto-clean visual cues if synthesizing raw audio
    const scriptToSynthesize = ttsText
      .replace(/\[VISUAL:[^\]]*\]/gi, '')
      .replace(/\[SCENE[^\]]*\]/gi, '')
      .replace(/\[VOICEOVER\]:?/gi, '')
      .replace(/\[ויז'ואל:[^\]]*\]/gi, '')
      .replace(/\[סצינה[^\]]*\]/gi, '')
      .replace(/\[קריינות\]:?/gi, '')
      .trim();

    try {
      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptToSynthesize,
          voice: selectedVoiceId,
          emotion: 'neutral',
          stability: voiceStability,
          similarityBoost: voiceSimilarity,
          speed: voiceSpeed,
          language: selectedLanguage,
          engineMode: engineMode,
          useClonedBridge: true
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Synthesis failed');
      }

      const data = await res.json();
      setSynthesizedAudioUrl(data.url);
      setSynthesizedEngineUsed(data.engine || 'Neural Audio Engine');
    } catch (err) {
      alert('Synthesis error: ' + err.message);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleGenerateScreenplayScript = async (fmtKey, customTopic) => {
    setGeneratingScript(true);
    const chosenFormat = fmtKey || screenplayFormat;
    const chosenTopic = typeof customTopic === 'string' ? customTopic : screenplayTopic;
    try {
      const res = await fetch('/api/voiceover/screenplay/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: chosenFormat,
          topic: chosenTopic,
          theme: storyTheme,
          childName,
          language: selectedLanguage
        })
      });
      const data = await res.json();
      setScreenplayScript(data);
      setScreenplayAudioLines([]);
    } catch (err) {
      alert('Script generation error: ' + err.message);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleUpdateSceneText = (idx, newText) => {
    if (!screenplayScript || !screenplayScript.scenes) return;
    const updatedScenes = [...screenplayScript.scenes];
    updatedScenes[idx].text = newText;
    setScreenplayScript({ ...screenplayScript, scenes: updatedScenes });
  };

  const handleUpdateSceneCharacter = (idx, newChar) => {
    if (!screenplayScript || !screenplayScript.scenes) return;
    const updatedScenes = [...screenplayScript.scenes];
    updatedScenes[idx].character = newChar;
    setScreenplayScript({ ...screenplayScript, scenes: updatedScenes });
  };

  const handleAddSceneLine = () => {
    if (!screenplayScript || !screenplayScript.scenes) return;
    const newScene = {
      character: 'Narrator',
      text: selectedLanguage === 'he' ? 'שורה חדשה בדיאלוג...' : 'New dialogue line...'
    };
    setScreenplayScript({
      ...screenplayScript,
      scenes: [...screenplayScript.scenes, newScene]
    });
  };

  const handleRemoveSceneLine = (idx) => {
    if (!screenplayScript || !screenplayScript.scenes) return;
    const updated = screenplayScript.scenes.filter((_, i) => i !== idx);
    setScreenplayScript({ ...screenplayScript, scenes: updated });
  };

  const handleSynthesizeScreenplay = async () => {
    if (!screenplayScript || !screenplayScript.scenes) return;

    setSynthesizingScreenplay(true);
    const audioResults = [];

    try {
      for (let i = 0; i < screenplayScript.scenes.length; i++) {
        const scene = screenplayScript.scenes[i];
        const assignedVoiceId = screenplayCharacters[scene.character] || selectedVoiceId || 'en-fem-1';

        const res = await fetch('/api/voiceover/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: scene.text,
            voice: assignedVoiceId,
            stability: voiceStability,
            similarityBoost: voiceSimilarity,
            speed: voiceSpeed,
            language: selectedLanguage,
            engineMode: engineMode,
            useClonedBridge: true
          })
        });

        if (res.ok) {
          const data = await res.json();
          audioResults.push({
            sceneIndex: i + 1,
            character: scene.character,
            text: scene.text,
            url: data.url
          });
        }
      }
      setScreenplayAudioLines(audioResults);
    } catch (err) {
      alert('Screenplay synthesis error: ' + err.message);
    } finally {
      setSynthesizingScreenplay(false);
    }
  };

  const toggleSoundtrackPlay = (st) => {
    if (playingSoundtrackId === st.id) {
      if (soundtrackAudioRef.current) soundtrackAudioRef.current.pause();
      setPlayingSoundtrackId(null);
    } else {
      setSelectedSoundtrack(st);
      setPlayingSoundtrackId(st.id);
      if (soundtrackAudioRef.current) {
        soundtrackAudioRef.current.src = st.url;
        soundtrackAudioRef.current.volume = soundtrackVolume;
        soundtrackAudioRef.current.play().catch(e => console.log('Audio autoplay prevented'));
      }
    }
  };

  // 🎛️ Sound Studio Multi-Track Mixer Handler (Auto & Manual Modes)
  const handleRenderMasterMix = async (overrideMode) => {
    const activeMode = overrideMode || mixerMode;
    setIsRenderingMix(true);
    try {
      const soundtrackToUse = selectedSoundtrack?.id || 'lullaby-harp';
      const res = await fetch('/api/voiceover/mix-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceUrl: synthesizedAudioUrl,
          soundtrackId: soundtrackToUse,
          mode: activeMode,
          voiceVolume: activeMode === 'auto' ? 1.0 : mixerVoiceGain,
          musicVolume: activeMode === 'auto' ? 0.25 : mixerMusicGain,
          autoDucking: activeMode === 'auto' ? true : mixerAutoDucking,
          introDelaySec: activeMode === 'auto' ? 1.5 : mixerIntroDelay,
          outroPadSec: activeMode === 'auto' ? 2.5 : mixerOutroPad
        })
      });

      const data = await res.json();
      if (data.mixedUrl) {
        setMixedMasterAudioUrl(data.mixedUrl);
        setMixedMasterDetails(data);
        setAiSuccessMsg(`🎉 Master Audio Mix rendered successfully (${data.durationSeconds}s) with ${data.soundtrackTitle}!`);
      } else {
        alert(data.error || 'Failed to render mix');
      }
    } catch (err) {
      alert('Mixing error: ' + err.message);
    } finally {
      setIsRenderingMix(false);
    }
  };

  const filteredRosterVoices = currentRosterVoices.filter(v => {
    const matchesFilter = voiceFilter === 'all' || v.group === voiceFilter;
    const matchesSearch = !voiceSearch.trim() || 
      v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || 
      (v.description && v.description.toLowerCase().includes(voiceSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const selectedLangObj = supportedLanguages.find(l => l.code === selectedLanguage) || { name: 'Language', flag: '🌐' };
  const activeVoiceObj = familyVoices.find(v => v.id === selectedVoiceId) || currentRosterVoices.find(v => v.id === selectedVoiceId) || elevenLabsVoices.find(v => v.id === selectedVoiceId) || currentRosterVoices[0] || familyVoices[0];
  const allAvailableVoices = [...familyVoices, ...currentRosterVoices, ...elevenLabsVoices];

  // Live real-time audio length calculation
  const wordCount = ttsText.trim() ? ttsText.trim().split(/\s+/).length : 0;
  const charCount = ttsText.length;
  const rawSeconds = Math.max(1, Math.round(wordCount / (2.4 * voiceSpeed)));
  
  const formatAudioTime = (secs) => {
    if (secs < 60) return `~${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `~${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  const targetSecondsMap = {
    '15s': 15,
    '30s': 30,
    '60s': 60,
    '5m': 300,
    '10m': 600,
    '15m': 900,
    '30m': 1800
  };
  const targetSeconds = targetSecondsMap[targetLength] || 30;
  const isDurationOnTarget = Math.abs(rawSeconds - targetSeconds) <= (targetSeconds > 120 ? 120 : 10);
  const isVideoScriptFormat = /\[VISUAL:|\[SCENE|\[ויז'ואל:|\[סצינה/i.test(ttsText);

  return (
    <div className="fable-studio-page">
      {/* ==================================================================== */}
      {/* 1. 🚀 TOP HEADER & NAVIGATION BAR                                   */}
      {/* ==================================================================== */}
      <header className="fable-header-bar">
        <div className="fable-brand-group">
          <div className="brand-logo-badge">
            <span className="logo-icon-inner">🎙️</span>
          </div>
          <div className="brand-titles">
            <div className="brand-title-line">
              <span className="brand-text-main">FableVoice</span>
              <span className="brand-badge-yellow">STUDIO</span>
            </div>
            <div className="brand-text-sub">UNIVERSAL AI AUDIO • VIDEO SCRIPTS • 15-MIN KIDS STORIES • PODCASTS • NEWS</div>
          </div>
        </div>

        <nav className="fable-nav-pills">
          <button 
            className={`nav-pill-btn ${activeNav === 'studio' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('studio')}
          >
            <span className="pill-num">1.</span> Voice Studio
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'screenplay' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('screenplay')}
          >
            <span className="pill-num">2.</span> Multi-Voice Workshop
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'soundtrack' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('soundtrack')}
          >
            <span className="pill-num">3.</span> Ambience Library
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'mixer' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('mixer')}
          >
            <span className="pill-num">4.</span> 🎛️ Sound Studio (Mixer)
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'sdk' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('sdk')}
          >
            &lt;/&gt; API / SDK
          </button>
        </nav>
      </header>

      {/* ==================================================================== */}
      {/* TAB 1: UNIVERSAL VOICE STUDIO                                        */}
      {/* ==================================================================== */}
      {activeNav === 'studio' && (
        <main className="studio-tab-content">
          {/* STUDIO RACK 01 BANNER */}
          <div className="studio-rack-banner">
            <div className="rack-info">
              <div className="rack-label">UNIVERSAL AUDIO & VIDEO STUDIO</div>
              <h1 className="rack-title">Voice Cloner & Full-Length Audio Production</h1>
              <p className="rack-subtitle">Create short promo hooks, 5-minute video scripts, 10-minute news specials, 15-minute children stories, or full 30-minute podcast deep-dives.</p>
            </div>

            <div className="rack-actions">
              <button 
                className={`rack-mode-btn ${mode === 'offline' ? 'active-mode' : ''}`}
                onClick={() => setMode('offline')}
              >
                <span className="btn-dot">((•))</span> Bucket Storage
              </button>
              <button 
                className={`rack-mode-btn ${mode === 'elevenlabs' ? 'active-gold-mode' : ''}`}
                onClick={() => setMode('elevenlabs')}
              >
                <span className="btn-key">{selectedLangObj.flag}</span> 30 {selectedLangObj.name.split(' ')[0]} Voices
              </button>
            </div>
          </div>

          {/* 2-COLUMN STUDIO PANELS: CAPTURE & AI VOICE TRAINER */}
          <div className="studio-two-col-grid">
            {/* LEFT PANEL: CAPTURE AUDIO SAMPLE WITH LIVE WAVEFORM */}
            <div className="fable-box capture-box">
              <div className="wireframe-mic-container">
                <div className="wireframe-mic-box">
                  <span className="mic-symbol">🎙️</span>
                </div>
              </div>

              <h2 className="box-title">Capture Vocal Sample</h2>
              <p className="box-subtitle">Record 15–30 seconds of clear speech to clone custom voice models into bucket storage.</p>

              {/* Live Canvas Audio Waveform Visualizer */}
              <div className="waveform-container">
                <canvas ref={canvasRef} width="280" height="40" className="waveform-canvas" />
              </div>

              <div className="digital-timer-display">
                <span className={`timer-text ${isRecording ? 'pulse-glow' : ''}`}>
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {!isRecording ? (
                <button className="gold-studio-btn" onClick={startRecording}>
                  <span className="key-icon">🔑</span> START STUDIO RECORDING
                </button>
              ) : (
                <button className="gold-studio-btn recording" onClick={stopRecording}>
                  <span className="key-icon">⏹️</span> STOP RECORDING ({formatTimer(recordingSeconds)})
                </button>
              )}
            </div>

            {/* RIGHT PANEL: AI VOICE TRAINER */}
            <div className="fable-box trainer-box">
              <div className="trainer-header-row">
                <span className="calibrator-label">VOICE CALIBRATOR</span>
                <span className="status-ready-label">STATUS: PERSISTENT BUCKET READY</span>
              </div>

              <h2 className="box-title" style={{ marginTop: '4px', marginBottom: '16px' }}>
                AI Voice Cloner & Bucket Storage
              </h2>

              <div className="dashed-buffer-container">
                {audioBufferUrl ? (
                  <div className="buffer-ready-content">
                    <span className="check-icon">✅</span>
                    <div style={{ flex: 1 }}>
                      <div className="buffer-ready-text">RECORDED SAMPLE IN BUFFER ({formatTimer(recordingSeconds)})</div>
                      <audio controls src={audioBufferUrl} className="buffer-audio-player" />
                    </div>
                  </div>
                ) : (
                  <div className="buffer-empty-msg">
                    NO RECORDED SAMPLE IN BUFFER. COMPLETE RECORDING ON THE LEFT.
                  </div>
                )}
              </div>

              {cloneStatusMsg.text && (
                <div className={`status-msg-banner ${cloneStatusMsg.type}`}>
                  {cloneStatusMsg.text}
                </div>
              )}

              <div className="input-group-container">
                <label className="input-label-uppercase">VOICE MODEL LABEL / NAME</label>
                <input
                  type="text"
                  className="dark-input-field"
                  placeholder='e.g. "Alex — Podcast Host" or "Sarah (Reporter)"'
                  value={voiceModelLabel}
                  onChange={(e) => setVoiceModelLabel(e.target.value)}
                />
              </div>

              <button 
                className="clone-action-btn"
                onClick={handleCloneFromPanel}
                disabled={cloneLoading || !audioBufferBlob || !voiceModelLabel.trim()}
              >
                {cloneLoading ? '✨ CLONING VOICE MODEL...' : '💾 CLONE & SAVE TO BUCKET'}
              </button>
            </div>
          </div>

          {/* DEDICATED PERSISTENT VOICE LIBRARY */}
          <section className="fable-box dedicated-family-section">
            <div className="family-header-row">
              <div className="family-title-group">
                <span className="family-icon-glow">👥</span>
                <div>
                  <h2 className="family-section-title">Saved Voice Models (Persistent Bucket Storage)</h2>
                  <p className="family-section-subtitle">Custom cloned voices and narration profiles saved in storage bucket • Available across all sessions</p>
                </div>
              </div>

              <div className="family-header-actions">
                <span className="family-counter-badge">
                  💾 {familyVoices.length} BUCKET {familyVoices.length === 1 ? 'VOICE' : 'VOICES'}
                </span>
                <button 
                  className="clone-family-gold-btn"
                  onClick={() => setShowFamilyCloneModal(true)}
                >
                  + Clone New Voice
                </button>
              </div>
            </div>

            {familyVoices.length === 0 ? (
              <div className="empty-family-card">
                <div className="empty-family-icon">🎙️</div>
                <h3 className="empty-family-title">No Custom Cloned Voices in Bucket Yet</h3>
                <p className="empty-family-desc">
                  Record a 15-second vocal clip above to clone your voice, hosts, or family members into permanent bucket storage!
                </p>
                <button 
                  className="clone-family-gold-btn"
                  style={{ marginTop: '14px' }}
                  onClick={() => setShowFamilyCloneModal(true)}
                >
                  + Clone Your First Voice
                </button>
              </div>
            ) : (
              <div className="three-col-profile-grid">
                {familyVoices.map((v) => {
                  const isSelected = v.id === selectedVoiceId;
                  return (
                    <div 
                      key={v.id}
                      className={`profile-card-item family-card-highlight ${isSelected ? 'selected-gold-card' : ''}`}
                      onClick={() => handleSelectModel(v)}
                    >
                      <div className="profile-card-top">
                        <div>
                          <span className="relationship-tag-pill">✨ {v.relationship}</span>
                          <h3 className="profile-title-text" style={{ marginTop: '4px' }}>{v.name}</h3>
                        </div>

                        {isSelected ? (
                          <span className="badge-selected-green">
                            <span className="green-dot"></span> ACTIVE IN CONSOLE
                          </span>
                        ) : (
                          <button className="btn-select-gold">LOAD IN CONSOLE</button>
                        )}
                      </div>

                      <p className="family-card-desc">{v.description}</p>

                      <div className="profile-card-bottom">
                        <span className="meta-date-tag">💾 {v.date} (Bucket Storage)</span>
                        <button 
                          className="del-profile-btn"
                          onClick={(e) => handleDeleteProfile(e, v.id, v.name)}
                          disabled={deletingVoiceId === v.id}
                          title="Delete voice permanently from bucket"
                        >
                          {deletingVoiceId === v.id ? '⏳' : '🗑️ DELETE'}
                        </button>
                      </div>

                      {v.previewUrl && (
                        <div className="profile-preview-player" onClick={(e) => e.stopPropagation()}>
                          <audio controls src={v.previewUrl} className="profile-audio" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ================================================================ */}
          {/* 🎛️ 2. UNIFIED LIVE CALIBRATION CONSOLE (WITH AI SCRIPT ASSISTANT) */}
          {/* ================================================================ */}
          {activeVoiceObj && (
            <section className="fable-box tts-console-box" style={{ border: '2px solid #f59e0b', marginBottom: '24px', boxShadow: '0 0 24px rgba(245, 158, 11, 0.15)' }}>
              <div className="tts-console-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="brand-logo-badge" style={{ width: '38px', height: '38px' }}>
                    <span style={{ fontSize: '18px' }}>🎛️</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                      Live Studio Console: <span style={{ color: '#f59e0b' }}>{activeVoiceObj.name}</span>
                    </h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {activeVoiceObj.relationship || activeVoiceObj.gender} • {selectedLangObj.flag} {selectedLangObj.name}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className={`preview-play-stop-btn ${playingVoiceId === activeVoiceObj.id ? 'btn-stop-preview' : 'btn-play-preview'}`}
                    onClick={(e) => handleToggleVoicePreview(activeVoiceObj, e)}
                    disabled={loadingPreviewId === activeVoiceObj.id}
                  >
                    {loadingPreviewId === activeVoiceObj.id ? '⏳ Loading...' : playingVoiceId === activeVoiceObj.id ? '⏹️ Stop Preview' : '▶️ Play Voice Preview'}
                  </button>
                </div>
              </div>

              {/* 💰 3 FREE ZERO-COST TOOLS ACTIVE FOR ALL LANGUAGES + ENGINE SWITCHER */}
              <div className="zero-cost-engine-banner" style={{ marginBottom: '16px' }}>
                <div className="zero-cost-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="zero-cost-icon">💰</span>
                    <strong style={{ fontSize: '12.5px', color: '#10b981' }}>
                      3 Free Zero-Cost Tools Active for ALL 30+ Languages ($0.00):
                    </strong>
                  </div>

                  {/* Engine Mode Toggle */}
                  <div className="engine-toggle-pills">
                    <button 
                      className={`engine-pill-btn ${engineMode === 'free' ? 'active-free-pill' : ''}`}
                      onClick={() => setEngineMode('free')}
                      title="100% Free Google Neural Engine for all languages ($0.00 cost, zero API credits consumed)"
                    >
                      🟢 100% Free Neural Mode ($0.00)
                    </button>
                    <button 
                      className={`engine-pill-btn ${engineMode === 'elevenlabs' ? 'active-studio-pill' : ''}`}
                      onClick={() => setEngineMode('elevenlabs')}
                      title="Studio ElevenLabs Flash v2.5 (50% cheaper character rate with instant caching)"
                    >
                      💎 ElevenLabs Studio Flash (50% Off)
                    </button>
                  </div>
                </div>

                <div className="zero-cost-pills-row" style={{ marginTop: '8px' }}>
                  <div className="zero-feature-pill">
                    <span className="pill-check">✓</span> <strong>Free Neural Audio ($0.00):</strong> Unlimited speech in {selectedLangObj.name.split(' ')[0]} & all 30+ languages
                  </div>
                  <div className="zero-feature-pill">
                    <span className="pill-check">✓</span> <strong>Free Neural Translation ($0.00):</strong> Instant bidirectional translation across 30+ languages
                  </div>
                  <div className="zero-feature-pill">
                    <span className="pill-check">✓</span> <strong>Free Microphone Dictation ($0.00):</strong> Native device speech recognition
                  </div>
                </div>
              </div>

              {/* 1. DIRECT 30-VOICE & CLONED FAMILY MODEL SELECTOR */}
              <div className="console-voice-selector-grid">
                {/* A. Language Selector (Hebrew placed LAST) */}
                <div className="lang-picker-group">
                  <label className="input-label-uppercase">🌐 1. Spoken Language (Selects 30 Personas)</label>
                  <select 
                    className="dark-input-field lang-dropdown"
                    value={selectedLanguage}
                    onChange={(e) => handleSelectLanguage(e.target.value)}
                  >
                    {supportedLanguages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* B. Integrated 30-Voice + Cloned Family Model Picker */}
                <div className="lang-picker-group" style={{ flex: 1.5 }}>
                  <label className="input-label-uppercase">🎙️ 2. Active Voice Model (30 {selectedLangObj.name.split(' ')[0]} Personas & Clones)</label>
                  <select
                    className="dark-input-field lang-dropdown"
                    value={selectedVoiceId}
                    onChange={(e) => {
                      const found = allAvailableVoices.find(v => v.id === e.target.value);
                      if (found) handleSelectModel(found);
                    }}
                  >
                    {familyVoices.length > 0 && (
                      <optgroup label="💾 Saved Cloned Voice Models (Bucket)">
                        {familyVoices.map(fv => (
                          <option key={fv.id} value={fv.id}>
                            ✨ {fv.name} ({fv.relationship || 'Custom Voice'})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label={`👨 10 Adult Males (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'adult_male').map(v => (
                        <option key={v.id} value={v.id}>
                          👨 {v.name} ({v.relationship || 'Male'})
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`👩 10 Adult Females (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'adult_female').map(v => (
                        <option key={v.id} value={v.id}>
                          👩 {v.name} ({v.relationship || 'Female'})
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`👧 5 Female Youth / Children (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'female_child').map(v => (
                        <option key={v.id} value={v.id}>
                          👧 {v.name} ({v.relationship || 'Youth'})
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={`👦 5 Male Youth / Children (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'male_child').map(v => (
                        <option key={v.id} value={v.id}>
                          👦 {v.name} ({v.relationship || 'Youth'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* ⏱️ INTERACTIVE EXACT TIME SETTER */}
              <div className="time-setter-studio-card" style={{ marginTop: '10px', marginBottom: '12px' }}>
                <div className="time-setter-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⏱️</span>
                    <strong style={{ fontSize: '13px', color: '#f59e0b' }}>Audio Length & Time Setter:</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Set exact spoken time & AI will write to that precise length</span>
                  </div>

                  <div className="time-target-badge-pill">
                    🎯 Set Time: <span className="time-highlight">{String(customMinutes).padStart(2, '0')}:{String(customSeconds).padStart(2, '0')}</span> (~{Math.round(((customMinutes * 60) + customSeconds) * (140 / 60))} words)
                  </div>
                </div>

                {/* Quick Duration Preset Pills */}
                <div className="duration-pill-buttons" style={{ marginTop: '8px' }}>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 0 && customSeconds === 15 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(0, 15, '15s')}
                  >
                    ⚡ 15s
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 0 && customSeconds === 30 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(0, 30, '30s')}
                  >
                    ⏱️ 30s
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 1 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(1, 0, '60s')}
                  >
                    ⏳ 1 Min
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 3 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(3, 0, '3m')}
                  >
                    🎬 3 Min
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 5 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(5, 0, '5m')}
                  >
                    🎬 5 Min
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 10 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(10, 0, '10m')}
                  >
                    📻 10 Min
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 15 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(15, 0, '15m')}
                  >
                    🧒 15 Min (Kids Story)
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 30 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(30, 0, '30m')}
                  >
                    🎙️ 30 Min (Master)
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 45 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(45, 0, '45m')}
                  >
                    🎙️ 45 Min
                  </button>
                  <button 
                    className={`duration-pill-btn ${customMinutes === 60 && customSeconds === 0 ? 'active-duration-pill' : ''}`}
                    onClick={() => applyTimePreset(60, 0, '60m')}
                  >
                    🎙️ 60 Min
                  </button>
                </div>

                {/* Exact Minutes & Seconds Custom Steppers + Continuous Slider */}
                <div className="time-setter-stepper-row" style={{ marginTop: '10px' }}>
                  <div className="stepper-box">
                    <span className="stepper-label">Min:</span>
                    <button className="stepper-btn" onClick={() => setCustomMinutes(Math.max(0, customMinutes - 1))}>-</button>
                    <input 
                      type="number" 
                      min="0" 
                      max="120" 
                      className="dark-input-field stepper-input"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                    <button className="stepper-btn" onClick={() => setCustomMinutes(customMinutes + 1)}>+</button>
                  </div>

                  <div className="stepper-box">
                    <span className="stepper-label">Sec:</span>
                    <button className="stepper-btn" onClick={() => setCustomSeconds(Math.max(0, customSeconds - 5))}>-</button>
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      className="dark-input-field stepper-input"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    />
                    <button className="stepper-btn" onClick={() => setCustomSeconds(Math.min(59, customSeconds + 5))}>+</button>
                  </div>

                  <div className="slider-group" style={{ flex: 1, minWidth: '150px' }}>
                    <input 
                      type="range"
                      min="15"
                      max="1800"
                      step="15"
                      value={(customMinutes * 60) + customSeconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCustomMinutes(Math.floor(val / 60));
                        setCustomSeconds(val % 60);
                      }}
                      className="fable-range"
                    />
                  </div>

                  {/* One-Click Action: Fit Current Text to this set length */}
                  <button 
                    className="ai-tool-btn highlight-tool-btn"
                    onClick={() => handleAiEdit('fit_exact', (customMinutes * 60) + customSeconds)}
                    disabled={aiLoading || !ttsText.trim()}
                    title="Scale/expand existing text to fit this exact duration"
                  >
                    📐 Fit Text to {String(customMinutes).padStart(2, '0')}:{String(customSeconds).padStart(2, '0')}
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* 🤖 2. UNIVERSAL AI SCRIPT ASSISTANT (VIDEO, KIDS, PODCASTS) */}
              {/* ============================================================ */}
              <div className="ai-script-assistant-card" style={{ marginBottom: '14px' }}>
                <div className="ai-assistant-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🤖</span>
                    <strong style={{ fontSize: '13px', color: '#f59e0b' }}>Universal AI Creative Assistant</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>• Video Scripts, Long-Form Audio, Stories & News</span>
                  </div>

                  {aiSuccessMsg && (
                    <span className="ai-status-pill">{aiSuccessMsg}</span>
                  )}
                </div>

                {/* Creative Format Ideas */}
                <div className="ai-formats-row" style={{ marginTop: '10px' }}>
                  <span className="ai-mini-label">💡 Format:</span>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'video_script' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('video_script'); handleAiGenerate('video_script', targetLength); }}
                    disabled={aiLoading}
                  >
                    🎬 Video Script (Visual Cues + VO)
                  </button>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'kids_story' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('kids_story'); handleAiGenerate('kids_story', targetLength); }}
                    disabled={aiLoading}
                  >
                    🧒 Kids Bedtime Story
                  </button>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'podcast' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('podcast'); handleAiGenerate('podcast', targetLength); }}
                    disabled={aiLoading}
                  >
                    🎙️ Podcast Episode
                  </button>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'news' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('news'); handleAiGenerate('news', targetLength); }}
                    disabled={aiLoading}
                  >
                    📰 News Bulletin
                  </button>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'commercial' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('commercial'); handleAiGenerate('commercial', targetLength); }}
                    disabled={aiLoading}
                  >
                    📢 Commercial / Promo
                  </button>
                  <button 
                    className={`ai-format-pill ${aiFormat === 'narration' ? 'active-ai-pill' : ''}`}
                    onClick={() => { setAiFormat('narration'); handleAiGenerate('narration', targetLength); }}
                    disabled={aiLoading}
                  >
                    📖 Narration & Audiobooks
                  </button>
                </div>

                {/* Custom Brainstorm Prompt Input */}
                <div className="ai-custom-prompt-row" style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    className="dark-input-field ai-prompt-input"
                    placeholder={`Enter any topic (e.g. "The Magic Star Dragon", "Tech in 2030", "Morning Financial News")...`}
                    value={aiPromptTopic}
                    onChange={(e) => setAiPromptTopic(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAiGenerate(aiFormat, targetLength); }}
                  />
                  <button 
                    className="ai-gen-btn"
                    onClick={() => handleAiGenerate(aiFormat, targetLength)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? '⏳ Generating...' : `✨ Generate ${targetLength} ${aiFormat.replace('_', ' ')}`}
                  </button>
                </div>

                {/* Smart Polishing & Editing Tools */}
                <div className="ai-edit-tools-row" style={{ marginTop: '10px' }}>
                  <span className="ai-mini-label">⚡ Tools:</span>
                  <button className="ai-tool-btn" onClick={() => handleAiEdit('polish')} disabled={aiLoading}>
                    ✨ Polish & Flow
                  </button>
                  <button className="ai-tool-btn" onClick={() => handleAiEdit('conversational')} disabled={aiLoading}>
                    🎙️ Make Conversational
                  </button>
                  <button className="ai-tool-btn" onClick={() => handleAiEdit('news')} disabled={aiLoading}>
                    📰 News Bulletin Tone
                  </button>
                  {isVideoScriptFormat && (
                    <button className="ai-tool-btn fit-btn" onClick={handleStripVisualCues} title="Removes bracketed camera & scene directions before audio recording">
                      🎙️ Strip [Visual Cues]
                    </button>
                  )}
                  <button className="ai-tool-btn" onClick={() => handleAiEdit('pauses')} disabled={aiLoading}>
                    ⚡ Add Natural Pauses
                  </button>
                </div>
              </div>

              {/* 🌐 2. UNIVERSAL BIDIRECTIONAL TRANSLATION STRIP (ALL 30+ WORLD LANGUAGES) */}
              <div className="bidirectional-translation-card" style={{ marginBottom: '14px' }}>
                <div className="translation-strip-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🌐</span>
                    <strong style={{ fontSize: '12px', color: '#60a5fa' }}>Universal Neural Translation (30+ World Languages):</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Translate between ANY language pair instantly ($0.00 Free)</span>
                  </div>

                  {/* 1-Click Common Translation Quick Pills */}
                  <div className="quick-translate-actions">
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('es', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into Spanish"
                    >
                      🇪🇸 Spanish
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('fr', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into French"
                    >
                      🇫🇷 French
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('de', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into German"
                    >
                      🇩🇪 German
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('ja', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into Japanese"
                    >
                      🇯🇵 Japanese
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('zh', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into Chinese"
                    >
                      🇨🇳 Chinese
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('ar', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into Arabic"
                    >
                      🇸🇦 Arabic
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('he', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into Hebrew"
                    >
                      🇮🇱 Hebrew
                    </button>
                    <button 
                      className="quick-trans-btn"
                      onClick={() => handleBidirectionalTranslate('en', 'auto')}
                      disabled={translating || !ttsText.trim()}
                      title="Translate script into English"
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                {/* Full 30-Language Pair Selector & Live Swap */}
                <div className="custom-lang-pair-row" style={{ marginTop: '8px' }}>
                  <div className="pair-select-group">
                    <span className="pair-label">From:</span>
                    <select 
                      className="dark-input-field mini-lang-dropdown"
                      value={sourceTranslateLang}
                      onChange={(e) => setSourceTranslateLang(e.target.value)}
                    >
                      <option value="auto">✨ Auto-Detect</option>
                      {supportedLanguages.map(l => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    className="pair-swap-icon-btn"
                    onClick={() => {
                      const prevSource = sourceTranslateLang === 'auto' ? 'en' : sourceTranslateLang;
                      const prevTarget = selectedLanguage;
                      setSourceTranslateLang(prevTarget);
                      setSelectedLanguage(prevSource);
                      handleBidirectionalTranslate(prevSource, prevTarget);
                    }}
                    title="Swap From and To languages and translate"
                  >
                    ⇄ Swap
                  </button>

                  <div className="pair-select-group">
                    <span className="pair-label">To:</span>
                    <select 
                      className="dark-input-field mini-lang-dropdown"
                      value={selectedLanguage}
                      onChange={(e) => handleBidirectionalTranslate(e.target.value, sourceTranslateLang)}
                    >
                      {supportedLanguages.map(l => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    className="btn-do-translate"
                    onClick={() => handleBidirectionalTranslate(selectedLanguage, sourceTranslateLang)}
                    disabled={translating || !ttsText.trim()}
                  >
                    {translating ? '⏳ Translating...' : `⚡ Translate Text`}
                  </button>
                </div>
              </div>

              {/* 📝 3. DEDICATED AI SCRIPT & STORY EDITOR DOCK WITH MICROPHONE DICTATION */}
              <div className="ai-script-editor-dock" style={{ marginBottom: '16px' }}>
                {/* Editor Header with Live Audio Meter & Action Buttons */}
                <div className="editor-dock-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px' }}>📝</span>
                    <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                      Script & Story Editor ({targetLength} Target)
                    </strong>

                    {/* Live Duration & Word Count Meter */}
                    <span className={`live-meter-badge ${isDurationOnTarget ? 'meter-good' : 'meter-warn'}`}>
                      ⏱️ Est. Audio: {formatAudioTime(rawSeconds)} ({wordCount} words • {charCount} chars)
                    </span>

                    {isVideoScriptFormat && (
                      <span className="video-format-tag">
                        🎬 Video Storyboard Mode Active
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* 🎙️ LIVE MICROPHONE SPEECH-TO-TEXT DICTATION BUTTON */}
                    <button 
                      className={`dictate-mic-btn ${isDictating ? 'listening-pulse' : ''}`}
                      onClick={toggleDictation}
                      title="Dictate text directly using your microphone (Speech-to-Text)"
                    >
                      {isDictating ? '🔴 Listening... Click to Stop' : '🎙️ Dictate with Mic'}
                    </button>

                    <button 
                      className="editor-sub-btn"
                      onClick={() => setTtsText('')}
                      disabled={!ttsText.trim()}
                      title="Clear text input"
                    >
                      🗑️ Clear
                    </button>

                    <button 
                      className="toggle-text-btn"
                      onClick={() => setIsStoriesExpanded(!isStoriesExpanded)}
                    >
                      {isStoriesExpanded ? '▲ Hide Templates' : '📚 Templates ▼'}
                    </button>
                  </div>
                </div>

                {/* 🤖 AI Story & Script Writer Bar (Directly Above Text Area) */}
                <div className="ai-dock-writer-bar">
                  <div className="ai-dock-format-pills">
                    <span className="ai-mini-label">✨ AI Writer:</span>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'kids_story' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('kids_story'); handleAiGenerate('kids_story', targetLength); }}
                      disabled={aiLoading}
                    >
                      🧒 Kids Bedtime Story
                    </button>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'podcast' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('podcast'); handleAiGenerate('podcast', targetLength); }}
                      disabled={aiLoading}
                    >
                      🎙️ Podcast
                    </button>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'video_script' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('video_script'); handleAiGenerate('video_script', targetLength); }}
                      disabled={aiLoading}
                    >
                      🎬 Video Script
                    </button>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'news' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('news'); handleAiGenerate('news', targetLength); }}
                      disabled={aiLoading}
                    >
                      📰 News
                    </button>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'commercial' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('commercial'); handleAiGenerate('commercial', targetLength); }}
                      disabled={aiLoading}
                    >
                      📢 Commercial
                    </button>
                    <button 
                      className={`ai-format-pill ${aiFormat === 'narration' ? 'active-ai-pill' : ''}`}
                      onClick={() => { setAiFormat('narration'); handleAiGenerate('narration', targetLength); }}
                      disabled={aiLoading}
                    >
                      📖 Narration
                    </button>
                  </div>

                  <div className="ai-prompt-input-group" style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      className="dark-input-field ai-dock-prompt-input"
                      placeholder={`Type any story or script idea (e.g. "A magical bedtime story about a curious bunny", "A 1-minute tech podcast")...`}
                      value={aiPromptTopic}
                      onChange={(e) => setAiPromptTopic(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAiGenerate(aiFormat, targetLength); }}
                    />
                    <button 
                      className="ai-gen-gold-btn"
                      onClick={() => handleAiGenerate(aiFormat, targetLength, (customMinutes * 60) + customSeconds)}
                      disabled={aiLoading}
                      title={`Write complete ${aiFormat.replace('_', ' ')} calibrated to exactly ${customMinutes}m ${customSeconds}s`}
                    >
                      {aiLoading ? '⏳ Writing...' : `✨ Write Story to Exact Length (${String(customMinutes).padStart(2, '0')}:${String(customSeconds).padStart(2, '0')})`}
                    </button>
                  </div>
                </div>

                {/* 🪄 AI In-Place Editing Tools Toolbar */}
                <div className="ai-inplace-tools-bar">
                  <span className="ai-mini-label">🪄 AI In-Place Edits:</span>
                  <button 
                    className="ai-tool-btn highlight-tool-btn" 
                    onClick={() => handleAiEdit('expand')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Continue the story with an additional chapter/scene"
                  >
                    ✨ Expand Story +
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('rephrase')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Rewrite with richer, more evocative storytelling vocabulary"
                  >
                    🪄 Rephrase & Enhance
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('conversational')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Make tone casual, warm and conversational for podcasts"
                  >
                    🎙️ Conversational
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('kids')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Adapt tone into a calming bedtime story for children"
                  >
                    🧒 Kids Bedtime Tone
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('news')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Format into an authoritative news bulletin"
                  >
                    📰 News Bulletin
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('video_cues')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Embed storyboard visual camera directions and voiceover cues"
                  >
                    🎬 Add Video Cues
                  </button>
                  {isVideoScriptFormat && (
                    <button 
                      className="ai-tool-btn fit-btn" 
                      onClick={handleStripVisualCues} 
                      title="Removes bracketed camera & scene directions before audio recording"
                    >
                      🎙️ Strip [Visual Cues]
                    </button>
                  )}
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit('pauses')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Add natural commas and ellipses for studio cadence"
                  >
                    ⚡ Natural Pauses
                  </button>
                  <button 
                    className="ai-tool-btn" 
                    onClick={() => handleAiEdit(targetLength === '15s' ? 'fit_15s' : 'fit_30s')} 
                    disabled={aiLoading || !ttsText.trim()}
                    title="Trim sentences to fit current target duration"
                  >
                    ✂️ Fit Duration
                  </button>
                </div>

                {/* Main Script Textarea */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    className={`dark-textarea dock-textarea ${isDictating ? 'dictation-active-border' : ''}`}
                    value={ttsText}
                    dir={selectedLanguage === 'he' || selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows={targetLength === '15m' || targetLength === '30m' ? 12 : targetLength === '5m' || targetLength === '10m' ? 8 : 6}
                    placeholder="Type your story/script here, click '🎙️ Dictate with Mic' to speak into your microphone, or use '✨ Write Story with AI' above..."
                  />
                  {isDictating && (
                    <div className="live-dictating-overlay-badge">
                      🔴 Live Speech-to-Text Active: Speak into your mic...
                    </div>
                  )}
                </div>
              </div>

              {/* COLLAPSIBLE SCRIPT & STORY TEMPLATES DRAWER */}
              {isStoriesExpanded && (
                <div className="collapsible-templates-box" style={{ marginBottom: '16px' }}>
                  <div className="templates-grid">
                    {Object.keys(WORKFLOW_PRESETS).map(wfKey => {
                      const wf = WORKFLOW_PRESETS[wfKey];
                      const phrase = wf.phrases[selectedLanguage] || wf.phrases['en'];
                      return (
                        <div key={wfKey} className="template-card" onClick={() => { setTtsText(phrase); handleSelectWorkflow(wfKey); }}>
                          <span className="template-title">{wf.label}</span>
                          <p className="template-snippet">{phrase}</p>
                          <button className="btn-use-template">Use This Script</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Language Switch Pills with Hebrew Last */}
              <div className="quick-phrases-bar" style={{ marginBottom: '14px' }}>
                <span className="quick-label">⚡ Fast Switch Language:</span>
                <div className="quick-pill-buttons">
                  {['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'ru', 'he'].map(code => {
                    const lObj = supportedLanguages.find(l => l.code === code);
                    if (!lObj) return null;
                    return (
                      <button 
                        key={code}
                        className={`quick-lang-pill ${selectedLanguage === code ? 'active-lang-pill' : ''}`}
                        onClick={() => handleSelectLanguage(code)}
                      >
                        {lObj.flag} {lObj.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🎯 3. STUDIO WORKFLOW CHOICES (One-Click Presets) */}
              <div className="workflow-selection-container" style={{ marginBottom: '14px' }}>
                <label className="input-label-uppercase">🎯 Studio Workflow Preset (Sets Pacing & Intonation)</label>
                <div className="workflow-cards-row">
                  {Object.keys(WORKFLOW_PRESETS).map(wfKey => {
                    const wf = WORKFLOW_PRESETS[wfKey];
                    const isWfActive = activeWorkflow === wfKey;
                    return (
                      <button
                        key={wfKey}
                        className={`workflow-select-btn ${isWfActive ? 'active-wf-btn' : ''}`}
                        onClick={() => handleSelectWorkflow(wfKey)}
                      >
                        <span className="wf-title">{wf.label}</span>
                        <span className="wf-desc">{wf.desc}</span>
                        <span className="wf-specs">Speed: {wf.speed}x • Stability: {Math.round(wf.stability * 100)}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================ */}
              {/* ⚙️ 4. COLLAPSIBLE VOICE TUNING DRAWER WITH EXPLANATIONS      */}
              {/* ============================================================ */}
              <div className="collapsible-tuning-container" style={{ marginBottom: '16px' }}>
                <div 
                  className="tuning-summary-header clickable-accordion-header"
                  onClick={() => setIsTuningExpanded(!isTuningExpanded)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚙️</span>
                    <strong style={{ fontSize: '12px', color: '#f8fafc' }}>Voice Fine-Tuning Controls</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      (Stability: <span style={{ color: '#f59e0b' }}>{Math.round(voiceStability * 100)}%</span> • Clarity: <span style={{ color: '#f59e0b' }}>{Math.round(voiceSimilarity * 100)}%</span> • Pace: <span style={{ color: '#f59e0b' }}>{voiceSpeed}x</span>)
                    </span>
                  </div>

                  <button className="tuning-expand-pill-btn">
                    {isTuningExpanded ? '▲ Hide Sliders & Guide' : '▼ Fine-Tune Sliders & Explanations'}
                  </button>
                </div>

                {isTuningExpanded && (
                  <div className="tuning-expanded-drawer" style={{ marginTop: '12px' }}>
                    <div className="tuning-sliders-grid">
                      {/* Stability Slider + Guide */}
                      <div className="slider-item">
                        <div className="slider-label-row">
                          <span>Voice Stability (Consistency):</span>
                          <strong>{Math.round(voiceStability * 100)}%</strong>
                        </div>
                        <input 
                          type="range" min="0.1" max="1.0" step="0.05"
                          className="fable-range"
                          value={voiceStability}
                          onChange={(e) => setVoiceStability(parseFloat(e.target.value))}
                        />
                        <div className="slider-explanation-box">
                          ℹ️ <strong>Higher (75–90%)</strong>: Calm, steady, soothing tone for bedtime & narrations.<br />
                          ℹ️ <strong>Lower (35–55%)</strong>: Dynamic emotional range for lively podcast & character dialogue.
                        </div>
                      </div>

                      {/* Clarity / Similarity Slider + Guide */}
                      <div className="slider-item">
                        <div className="slider-label-row">
                          <span>Clarity & Character Similarity:</span>
                          <strong>{Math.round(voiceSimilarity * 100)}%</strong>
                        </div>
                        <input 
                          type="range" min="0.1" max="1.0" step="0.05"
                          className="fable-range"
                          value={voiceSimilarity}
                          onChange={(e) => setVoiceSimilarity(parseFloat(e.target.value))}
                        />
                        <div className="slider-explanation-box">
                          ℹ️ <strong>Higher (80–95%)</strong>: Crisp consonant clarity & exact likeness to original voice model.<br />
                          ℹ️ <strong>Lower (50–70%)</strong>: Softer acoustic timbre, smoothing out background breath sounds.
                        </div>
                      </div>

                      {/* Speaking Speed Slider + Guide */}
                      <div className="slider-item">
                        <div className="slider-label-row">
                          <span>Speaking Pace / Speed:</span>
                          <strong>{voiceSpeed}x</strong>
                        </div>
                        <input 
                          type="range" min="0.75" max="1.25" step="0.05"
                          className="fable-range"
                          value={voiceSpeed}
                          onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        />
                        <div className="slider-explanation-box">
                          ℹ️ <strong>Slower (0.80–0.90x)</strong>: Relaxed pacing for meditation & sleep induction.<br />
                          ℹ️ <strong>Brisk (1.05–1.15x)</strong>: Energetic delivery for news, promos, and podcasts.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action synthesis row */}
              <div className="tts-action-row">
                <button 
                  className="gold-studio-btn tts-btn"
                  onClick={handleSynthesize}
                  disabled={synthesizing || !ttsText.trim()}
                >
                  {synthesizing ? `⏳ SYNTHESIZING ${selectedLangObj.name.toUpperCase()} AUDIO...` : `⚡ SYNTHESIZE ${selectedLangObj.name.split(' ')[0].toUpperCase()} SPEECH`}
                </button>

                {synthesizedAudioUrl && (
                  <div className="synthesized-player-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <audio 
                      controls 
                      autoPlay 
                      src={synthesizedAudioUrl} 
                      onPlay={(e) => { e.currentTarget.playbackRate = voiceSpeed; }}
                    />
                    {synthesizedEngineUsed && (
                      <span className="badge-selected-green" style={{ fontSize: '11px', padding: '6px 10px' }}>
                        ✨ {synthesizedEngineUsed}
                      </span>
                    )}
                    <a href={synthesizedAudioUrl} download="fablevoice-audio.mp3" className="download-btn-blue">
                      ⬇ Download MP3
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* 🌐 DYNAMIC 30-VOICE ROSTER ACCORDION (EXPANDABLE AT BOTTOM)       */}
          {/* ================================================================ */}
          <section className="fable-box active-library-box collapsible-catalog-box" style={{ border: '1.5px solid #3b82f6', marginBottom: '20px' }}>
            <div 
              className="active-library-header-row clickable-accordion-header"
              onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            >
              <div className="library-title-group">
                <span className="db-icon">{selectedLangObj.flag}</span>
                <div>
                  <h2 className="library-section-title">30 {selectedLangObj.name} Voice Roster</h2>
                  <p className="catalog-subtitle-text">10 Adult Males • 10 Adult Females • 5 Female Youth • 5 Male Youth</p>
                </div>
              </div>

              <div className="catalog-header-right">
                <span className="profiles-loaded-counter" style={{ background: '#1e3a8a', borderColor: '#3b82f6' }}>
                  {currentRosterVoices.length} {selectedLangObj.name.split(' ')[0].toUpperCase()} VOICES
                </span>
                <button className="accordion-toggle-pill-btn">
                  {isLibraryExpanded ? `▲ Collapse ${selectedLangObj.name.split(' ')[0]} Roster` : `▼ Browse Full 30-Voice Grid (${currentRosterVoices.length} Voices)`}
                </button>
              </div>
            </div>

            {!isLibraryExpanded && (
              <div 
                className="catalog-collapsed-banner"
                onClick={() => setIsLibraryExpanded(true)}
              >
                <span>{selectedLangObj.flag} All 30 {selectedLangObj.name} voices are selectable in the Live Console above.</span>
                <strong className="click-to-expand-gold">Click to open full card gallery with instant Play/Stop controls →</strong>
              </div>
            )}

            {isLibraryExpanded && (
              <div className="expanded-catalog-body">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'all' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('all')}
                  >
                    🌟 All 30 Voices (הכל)
                  </button>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'adult_male' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('adult_male')}
                  >
                    👨 10 Adult Males (גברים)
                  </button>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'adult_female' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('adult_female')}
                  >
                    👩 10 Adult Females (נשים)
                  </button>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'female_child' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('female_child')}
                  >
                    👧 5 Female Youth (צעירות)
                  </button>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'male_child' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('male_child')}
                  >
                    👦 5 Male Youth (צעירים)
                  </button>

                  <div style={{ marginLeft: 'auto', minWidth: '220px' }}>
                    <input
                      type="text"
                      placeholder={`🔍 Search ${selectedLangObj.name.split(' ')[0]} voices...`}
                      className="dark-input-field"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      value={voiceSearch}
                      onChange={(e) => setVoiceSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="three-col-profile-grid">
                  {filteredRosterVoices.map((v) => {
                    const isSelected = v.id === selectedVoiceId;
                    const isPlaying = playingVoiceId === v.id;
                    const isLoadingPreview = loadingPreviewId === v.id;

                    return (
                      <div 
                        key={v.id}
                        className={`profile-card-item family-card-highlight ${isSelected ? 'selected-gold-card' : ''}`}
                        onClick={() => handleSelectModel(v)}
                      >
                        <div className="profile-card-top">
                          <div>
                            <span className="relationship-tag-pill" style={{ background: '#1d4ed8' }}>{selectedLangObj.flag} {v.relationship}</span>
                            <h3 className="profile-title-text" style={{ marginTop: '4px' }}>{v.name}</h3>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {isSelected && (
                              <span className="badge-selected-green" style={{ padding: '3px 8px', fontSize: '10px' }}>
                                <span className="green-dot"></span> ACTIVE
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="family-card-desc">{v.description}</p>

                        <div className="profile-card-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span className="meta-date-tag">{v.groupLabel || v.gender}</span>

                          <button
                            className={`preview-play-stop-btn ${isPlaying ? 'btn-stop-preview' : 'btn-play-preview'}`}
                            onClick={(e) => handleToggleVoicePreview(v, e)}
                            disabled={isLoadingPreview}
                            title={isPlaying ? "Stop Preview Audio" : "Play Voice Preview Audio"}
                          >
                            {isLoadingPreview ? (
                              '⏳ Loading...'
                            ) : isPlaying ? (
                              '⏹️ Stop Preview'
                            ) : (
                              '▶️ Play Preview'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* TAB 2: MULTI-VOICE WORKSHOP */}
      {activeNav === 'screenplay' && (
        <main className="screenplay-tab-content fable-box">
          <div className="screenplay-header">
            <div>
              <h2 className="screenplay-title">🎭 Multi-Voice Character Workshop</h2>
              <p className="screenplay-sub">Assign different voices to multiple characters for audio drama, podcast banter, news panels, and commercials.</p>
            </div>
            <button 
              className="gold-studio-btn"
              onClick={() => handleGenerateScreenplayScript(screenplayFormat, screenplayTopic)}
              disabled={generatingScript}
              style={{ maxWidth: '280px' }}
            >
              {generatingScript ? '⏳ Writing Dialogue...' : '✨ Write Dialogue with AI'}
            </button>
          </div>

          {/* 🤖 UNIVERSAL AI MULTI-VOICE SCRIPT WRITER DOCK */}
          <div className="ai-script-assistant-card" style={{ marginBottom: '16px' }}>
            <div className="ai-assistant-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🤖</span>
                <strong style={{ fontSize: '13px', color: '#f59e0b' }}>AI Multi-Voice Script Assistant</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>• Stories, Podcast Banter, News Panels & Commercials</span>
              </div>
            </div>

            {/* Format Selection Pills */}
            <div className="ai-formats-row" style={{ marginTop: '10px' }}>
              <span className="ai-mini-label">💡 Format:</span>
              <button 
                className={`ai-format-pill ${screenplayFormat === 'story' ? 'active-ai-pill' : ''}`}
                onClick={() => { setScreenplayFormat('story'); handleGenerateScreenplayScript('story', screenplayTopic); }}
                disabled={generatingScript}
              >
                🧒 Kids & Bedtime Story
              </button>
              <button 
                className={`ai-format-pill ${screenplayFormat === 'podcast' ? 'active-ai-pill' : ''}`}
                onClick={() => { setScreenplayFormat('podcast'); handleGenerateScreenplayScript('podcast', screenplayTopic); }}
                disabled={generatingScript}
              >
                🎙️ Podcast Banter (Host + Guest)
              </button>
              <button 
                className={`ai-format-pill ${screenplayFormat === 'news' ? 'active-ai-pill' : ''}`}
                onClick={() => { setScreenplayFormat('news'); handleGenerateScreenplayScript('news', screenplayTopic); }}
                disabled={generatingScript}
              >
                📰 News Panel (Anchor + Reporter)
              </button>
              <button 
                className={`ai-format-pill ${screenplayFormat === 'commercial' ? 'active-ai-pill' : ''}`}
                onClick={() => { setScreenplayFormat('commercial'); handleGenerateScreenplayScript('commercial', screenplayTopic); }}
                disabled={generatingScript}
              >
                📢 Commercial Dialogue Ad
              </button>
            </div>

            {/* Creative Prompt Input */}
            <div className="ai-prompt-input-group" style={{ marginTop: '10px' }}>
              <input
                type="text"
                className="dark-input-field ai-dock-prompt-input"
                placeholder={
                  screenplayFormat === 'podcast' ? 'Type podcast topic (e.g. "Two tech hosts debating the future of AI and audio")...' :
                  screenplayFormat === 'news' ? 'Type news headline (e.g. "Breaking economic report with field correspondent")...' :
                  screenplayFormat === 'commercial' ? 'Type product promo (e.g. "A fun coffee brand with an announcer and two sleepy friends")...' :
                  'Type story idea (e.g. "A magical bedtime story about a curious bunny and a wise owl")...'
                }
                value={screenplayTopic}
                onChange={(e) => setScreenplayTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateScreenplayScript(screenplayFormat, screenplayTopic); }}
              />
              <button 
                className="ai-gen-gold-btn"
                onClick={() => handleGenerateScreenplayScript(screenplayFormat, screenplayTopic)}
                disabled={generatingScript}
              >
                {generatingScript ? '⏳ Writing...' : '✨ Generate Multi-Voice Script'}
              </button>
            </div>
          </div>

          {/* Character Voice Matrix (Assignable from 30 Personas) */}
          <div className="character-matrix-section" style={{ marginBottom: '16px' }}>
            <h3 className="section-small-title">🎭 Character Voice Assignment (Select from 30 {selectedLangObj.name.split(' ')[0]} Personas & Clones)</h3>
            <div className="character-cards-grid">
              {['Narrator', 'Mother', 'Father', 'Child', 'Host', 'Co-Host', 'Guest', 'Anchor', 'Reporter', 'Announcer', 'Customer A'].map((charName) => (
                <div key={charName} className="character-assign-card">
                  <div className="char-role-badge">{charName}</div>
                  <select
                    className="dark-input-field"
                    value={screenplayCharacters[charName] || selectedVoiceId}
                    onChange={(e) => setScreenplayCharacters({ ...screenplayCharacters, [charName]: e.target.value })}
                  >
                    {allAvailableVoices.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.relationship || v.category})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Editable Dialogue Scenes */}
          {screenplayScript && (
            <div className="script-editor-container">
              <div className="script-title-row">
                <h3 className="story-title-highlight">📜 {screenplayScript.title}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="editor-sub-btn"
                    onClick={handleAddSceneLine}
                  >
                    ➕ Add Dialogue Line
                  </button>
                  <button 
                    className="gold-studio-btn"
                    onClick={handleSynthesizeScreenplay}
                    disabled={synthesizingScreenplay}
                    style={{ maxWidth: '280px' }}
                  >
                    {synthesizingScreenplay ? '⏳ Synthesizing Audio...' : '⚡ Synthesize Multi-Voice Audio'}
                  </button>
                </div>
              </div>

              <div className="dialogue-scenes-list">
                {screenplayScript.scenes.map((scene, idx) => (
                  <div key={idx} className="dialogue-scene-card" style={{ marginBottom: '10px' }}>
                    <div className="scene-speaker-tag" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="scene-num-badge">Scene {idx + 1}</span>
                        <select
                          className="dark-input-field mini-lang-dropdown"
                          value={scene.character}
                          onChange={(e) => handleUpdateSceneCharacter(idx, e.target.value)}
                        >
                          {['Narrator', 'Mother', 'Father', 'Child', 'Host', 'Co-Host', 'Guest', 'Anchor', 'Reporter', 'Announcer', 'Customer A', 'Customer B', 'Wise Elder'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        className="del-profile-btn"
                        onClick={() => handleRemoveSceneLine(idx)}
                        title="Delete this scene line"
                      >
                        🗑️ Remove
                      </button>
                    </div>

                    <textarea 
                      className="dark-textarea"
                      style={{ marginTop: '8px', minHeight: '60px', width: '100%' }}
                      dir={selectedLanguage === 'he' || selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                      value={scene.text}
                      onChange={(e) => handleUpdateSceneText(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {screenplayAudioLines.length > 0 && (
                <div className="synthesized-scenes-results" style={{ marginTop: '16px' }}>
                  <h4 className="audio-results-header">🎧 Multi-Voice Generated Audio Clips ({screenplayAudioLines.length} Scenes Ready)</h4>
                  <div className="scenes-audio-grid">
                    {screenplayAudioLines.map((line, i) => (
                      <div key={i} className="scene-audio-card">
                        <span className="scene-num-badge">Scene {line.sceneIndex}: {line.character}</span>
                        <audio controls src={line.url} style={{ width: '100%', marginTop: '6px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* TAB 3: AMBIENCE CONSOLE (20-TRACK MUSIC LIBRARY) */}
      {activeNav === 'soundtrack' && (
        <main className="soundtrack-tab-content fable-box">
          <audio ref={soundtrackAudioRef} loop />

          <div className="soundtrack-header">
            <div>
              <h2 className="screenplay-title">🎼 20-Track Royalty-Free Music & Ambience Library</h2>
              <p className="screenplay-sub">Layer calming bedtime lullabies, lo-fi podcast grooves, broadcast tech pulses, and cinematic strings under your voiceovers.</p>
            </div>
            {selectedSoundtrack && (
              <span className="badge-selected-green" style={{ fontSize: '12px', padding: '6px 12px' }}>
                🎵 Active Soundtrack: {selectedSoundtrack.title}
              </span>
            )}
          </div>

          {/* Category Filter Pills & Search Bar */}
          <div className="soundtrack-filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px', background: '#0b1120', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {[
                { key: 'all', label: '🌟 All 20 Tracks' },
                { key: 'Bedtime', label: '🌙 Bedtime & Sleep' },
                { key: 'Podcast', label: '🎙️ Podcast & Talk Show' },
                { key: 'News & Tech', label: '📰 News & Tech' },
                { key: 'Commercial', label: '📢 Commercial & Ads' },
                { key: 'Cinematic', label: '🎬 Cinematic & Fantasy' }
              ].map(cat => (
                <button
                  key={cat.key}
                  className={`nav-pill-btn ${soundtrackCategory === cat.key ? 'active-pill' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                  onClick={() => handleSelectSoundtrackCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ minWidth: '240px' }}>
              <input
                type="text"
                className="dark-input-field"
                placeholder="🔍 Search mood, instrument, genre..."
                style={{ padding: '6px 12px', fontSize: '11.5px', width: '100%' }}
                value={soundtrackSearch}
                onChange={(e) => handleSearchSoundtracks(e.target.value)}
              />
            </div>
          </div>

          {/* Volume & Ducking Bar */}
          <div className="ambience-mixer-bar" style={{ marginBottom: '20px' }}>
            <div className="mixer-control-group">
              <label>Background Ambience Volume: <strong style={{ color: '#f59e0b' }}>{Math.round(soundtrackVolume * 100)}%</strong></label>
              <input 
                type="range" min="0.05" max="1.0" step="0.05"
                className="fable-range"
                value={soundtrackVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setSoundtrackVolume(vol);
                  if (soundtrackAudioRef.current) soundtrackAudioRef.current.volume = vol;
                }}
              />
            </div>

            <div className="mixer-control-group auto-duck-toggle">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={autoDucking}
                  onChange={(e) => setAutoDucking(e.target.checked)}
                />
                <span>✨ Voiceover Auto-Ducking (Ducks music 75% during speech)</span>
              </label>
            </div>
          </div>

          {/* 20-Track Music Grid */}
          <div className="soundtracks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {soundtracks.map((st) => {
              const isPlaying = playingSoundtrackId === st.id;
              const isSelected = selectedSoundtrack?.id === st.id;
              return (
                <div 
                  key={st.id} 
                  className={`soundtrack-card ${isSelected ? 'selected-st-card' : ''}`}
                  style={{ background: '#0f172a', border: isSelected ? '2px solid #f59e0b' : '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div className="st-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="st-cat-badge" style={{ background: '#1e293b', color: '#f59e0b', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800 }}>
                        {st.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{st.tempo}</span>
                    </div>

                    <h3 className="st-title" style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{st.title}</h3>
                    {st.instrumentation && (
                      <p style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>
                        🎻 {st.instrumentation}
                      </p>
                    )}
                    <p className="st-note" style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '14px' }}>{st.previewNote}</p>
                  </div>

                  <div className="st-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className={`st-play-btn ${isPlaying ? 'st-playing' : ''}`}
                      onClick={() => toggleSoundtrackPlay(st)}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: isPlaying ? '#ef4444' : '#1e293b', color: '#ffffff', border: '1px solid #334155' }}
                    >
                      {isPlaying ? '⏹️ Stop Ambience' : '▶️ Play Preview'}
                    </button>

                    <button 
                      className="btn-use-template"
                      onClick={() => {
                        setSelectedSoundtrack(st);
                        setAiSuccessMsg(`🎵 Background track set to: ${st.title}`);
                      }}
                      style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', background: isSelected ? '#10b981' : '#f59e0b', color: '#000000', border: 'none' }}
                    >
                      {isSelected ? '✓ Active Track' : '⚡ Use Track'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TAB 4: SOUND STUDIO & MULTI-TRACK AUDIO MIXER */}
      {activeNav === 'mixer' && (
        <main className="soundtrack-tab-content fable-box">
          <div className="soundtrack-header">
            <div>
              <h2 className="screenplay-title">🎛️ Sound Studio: Multi-Track Mixer & Master DAW</h2>
              <p className="screenplay-sub">Automatically or manually blend voiceovers with background soundtracks, smart auto-ducking, and intro/outro music fades.</p>
            </div>

            <button 
              className="gold-studio-btn"
              onClick={() => handleRenderMasterMix('auto')}
              disabled={isRenderingMix}
              style={{ maxWidth: '280px' }}
            >
              {isRenderingMix ? '⏳ Rendering Mix...' : '✨ 1-Click Auto-Mix Master'}
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="zero-cost-engine-banner" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎚️</span>
                <strong style={{ fontSize: '13px', color: '#f8fafc' }}>Sound Studio Mixing Mode:</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`nav-pill-btn ${mixerMode === 'auto' ? 'active-pill' : ''}`}
                  onClick={() => setMixerMode('auto')}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  ✨ 1-Click Auto-Mix (AI Balanced)
                </button>
                <button
                  className={`nav-pill-btn ${mixerMode === 'manual' ? 'active-pill' : ''}`}
                  onClick={() => setMixerMode('manual')}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  🎛️ Manual Multi-Track Console
                </button>
              </div>
            </div>
          </div>

          {/* 2-TRACK MIXER CONSOLE BOARD */}
          <div className="two-track-mixer-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px', marginBottom: '22px' }}>
            {/* TRACK 1: VOICEOVER STEM */}
            <div className="soundtrack-card" style={{ background: '#0b1120', border: '1.5px solid #3b82f6', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="st-cat-badge" style={{ background: '#1e3a8a', color: '#60a5fa' }}>TRACK 1</span>
                <strong style={{ fontSize: '14px', color: '#f8fafc' }}>🎙️ Voiceover Stem</strong>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Active Model: <strong style={{ color: '#f59e0b' }}>{activeVoiceObj ? activeVoiceObj.name : 'Studio Voice'}</strong> ({selectedLangObj.flag} {selectedLangObj.name})
              </p>

              {mixerMode === 'manual' && (
                <div className="mixer-control-group" style={{ marginBottom: '14px' }}>
                  <label>Voiceover Gain Level: <strong style={{ color: '#38bdf8' }}>{Math.round(mixerVoiceGain * 100)}%</strong></label>
                  <input 
                    type="range" min="0.2" max="1.5" step="0.05"
                    className="fable-range"
                    value={mixerVoiceGain}
                    onChange={(e) => setMixerVoiceGain(parseFloat(e.target.value))}
                  />
                </div>
              )}

              {synthesizedAudioUrl ? (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', display: 'block', marginBottom: '4px' }}>✓ Voiceover Audio Ready</span>
                  <audio controls src={synthesizedAudioUrl} style={{ width: '100%' }} />
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px dashed #334155', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>ℹ️ Generate speech in Tab 1, or mix will use studio demo sample.</span>
                </div>
              )}
            </div>

            {/* TRACK 2: BACKGROUND MUSIC STEM */}
            <div className="soundtrack-card" style={{ background: '#0b1120', border: '1.5px solid #f59e0b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="st-cat-badge" style={{ background: '#78350f', color: '#fbbf24' }}>TRACK 2</span>
                <strong style={{ fontSize: '14px', color: '#f8fafc' }}>🎵 Soundtrack Stem</strong>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="input-label-uppercase" style={{ fontSize: '11px' }}>Select Background Track (20 Tracks)</label>
                <select 
                  className="dark-input-field"
                  style={{ width: '100%', marginTop: '4px' }}
                  value={selectedSoundtrack ? selectedSoundtrack.id : 'lullaby-harp'}
                  onChange={(e) => {
                    const st = soundtracks.find(t => t.id === e.target.value);
                    if (st) setSelectedSoundtrack(st);
                  }}
                >
                  {soundtracks.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.title} ({t.tempo})
                    </option>
                  ))}
                </select>
              </div>

              {mixerMode === 'manual' && (
                <>
                  <div className="mixer-control-group" style={{ marginBottom: '12px' }}>
                    <label>Soundtrack Volume: <strong style={{ color: '#f59e0b' }}>{Math.round(mixerMusicGain * 100)}%</strong></label>
                    <input 
                      type="range" min="0.05" max="0.8" step="0.05"
                      className="fable-range"
                      value={mixerMusicGain}
                      onChange={(e) => setMixerMusicGain(parseFloat(e.target.value))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div className="mixer-control-group">
                      <label style={{ fontSize: '11px' }}>Intro Music Lead: {mixerIntroDelay}s</label>
                      <input 
                        type="range" min="0.0" max="4.0" step="0.5"
                        className="fable-range"
                        value={mixerIntroDelay}
                        onChange={(e) => setMixerIntroDelay(parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="mixer-control-group">
                      <label style={{ fontSize: '11px' }}>Outro Music Fade: {mixerOutroPad}s</label>
                      <input 
                        type="range" min="0.5" max="6.0" step="0.5"
                        className="fable-range"
                        value={mixerOutroPad}
                        onChange={(e) => setMixerOutroPad(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="mixer-control-group auto-duck-toggle">
                    <label className="toggle-label" style={{ fontSize: '12px' }}>
                      <input 
                        type="checkbox" 
                        checked={mixerAutoDucking}
                        onChange={(e) => setMixerAutoDucking(e.target.checked)}
                      />
                      <span>✨ Smart Auto-Ducking (75% music attenuation under voice)</span>
                    </label>
                  </div>
                </>
              )}

              {selectedSoundtrack && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#fbbf24', display: 'block', marginBottom: '4px' }}>Preview Soundtrack Stem:</span>
                  <audio controls src={selectedSoundtrack.url} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          </div>

          {/* MASTER MIX RENDER & STEM EXPORT SECTION */}
          <div className="fable-box" style={{ background: '#030712', border: '2px solid #10b981', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>
              🎛️ Master Studio Render Console
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '650px', margin: '0 auto 18px' }}>
              Render a clean, broadcast-normalized master audio mix combining speech narration with the ambient soundtrack, calibrated intro/outro fades, and auto-ducking.
            </p>

            <button 
              className="gold-studio-btn"
              onClick={() => handleRenderMasterMix()}
              disabled={isRenderingMix}
              style={{ maxWidth: '340px', margin: '0 auto', fontSize: '15px', padding: '14px 28px' }}
            >
              {isRenderingMix ? '⏳ Rendering Master Audio Mix...' : `⚡ Render ${mixerMode === 'auto' ? 'Auto-Balanced' : 'Custom'} Master Mix`}
            </button>

            {mixedMasterAudioUrl && (
              <div style={{ marginTop: '24px', background: '#0b1120', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span className="badge-selected-green" style={{ fontSize: '13px', padding: '6px 14px' }}>
                    🎉 MASTER BROADCAST MIX READY ({mixedMasterDetails?.durationSeconds}s)
                  </span>
                </div>

                <audio controls autoPlay src={mixedMasterAudioUrl} style={{ width: '100%', maxWidth: '600px', margin: '0 auto 16px', display: 'block' }} />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a 
                    href={mixedMasterAudioUrl} 
                    download="fablevoice-master-mix.wav" 
                    className="gold-studio-btn"
                    style={{ textDecoration: 'none', display: 'inline-block', maxWidth: '260px' }}
                  >
                    ⬇️ Download Master Mixed Audio
                  </a>

                  {synthesizedAudioUrl && (
                    <a 
                      href={synthesizedAudioUrl} 
                      download="voiceover-stem.mp3" 
                      className="download-btn-blue"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      🎙️ Voiceover Stem Only
                    </a>
                  )}

                  {selectedSoundtrack && (
                    <a 
                      href={selectedSoundtrack.url} 
                      download={`${selectedSoundtrack.id}.wav`} 
                      className="download-btn-blue"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      🎵 Music Stem Only
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* TAB 5: SDK INTEGRATION */}
      {activeNav === 'sdk' && (
        <div className="fable-box placeholder-panel">
          <h2>&lt;/&gt; Universal AI Voice & Multilingual API Integration</h2>
          <p>Stream real-time cloned voices, podcasts, news briefings, and 30-voice personas into your applications.</p>
          <pre className="sdk-code-box">
{`// Synthesize in any language with custom stability, clarity, and speed
const response = await fetch("/api/voiceover/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    script: "Welcome back to today's broadcast. Breaking updates coming in live.",
    voice: "en-fem-1",
    stability: 0.70,
    speed: 1.05,
    language: "en"
  })
});
const { url, engine } = await response.json();`}
          </pre>
        </div>
      )}

      {/* MODAL: CLONE NEW VOICE */}
      {showFamilyCloneModal && (
        <div className="modal-dark-overlay" onClick={() => setShowFamilyCloneModal(false)}>
          <div className="modal-dark-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowFamilyCloneModal(false)}>✕</button>

            <div className="modal-head">
              <span className="modal-head-icon">🎙️</span>
              <div>
                <h2>Clone New Voice Model</h2>
                <p>Upload multi-sample vocal recordings to train a custom voice model saved in persistent bucket storage.</p>
              </div>
            </div>

            {familyCloneError && (
              <div className="modal-error-banner">{familyCloneError}</div>
            )}

            <form onSubmit={handleFamilyModalSubmit} className="modal-form">
              <div className="modal-form-group">
                <label>Voice Model Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Alex (Podcast Host), Sarah, David (Reporter)"
                  className="dark-input-field"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-two-col">
                <div className="modal-form-group">
                  <label>Role / Persona</label>
                  <select 
                    className="dark-input-field"
                    value={familyForm.relationship}
                    onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                  >
                    <option value="Host / Narrator">Host / Narrator</option>
                    <option value="Podcast Host">Podcast Host</option>
                    <option value="News Reporter">News Reporter</option>
                    <option value="Commercial Speaker">Commercial Speaker</option>
                    <option value="Family Member">Family Member</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Gender</label>
                  <select 
                    className="dark-input-field"
                    value={familyForm.gender}
                    onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value })}
                  >
                    <option value="female">Female (נקבה)</option>
                    <option value="male">Male (זכר)</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-group">
                <label>🗂️ Multi-Sample Voice Booster (Upload 1–3 Audio Clips to Bucket)</label>
                <div className="sample-slots-grid">
                  {sampleSlots.map((slot) => (
                    <div key={slot.id} className="sample-slot-card">
                      <span className="slot-title">{slot.label}</span>
                      <input 
                        type="file"
                        accept="audio/*"
                        className="slot-file-input"
                        onChange={(e) => handleSampleSlotFile(slot.id, e.target.files[0] || null)}
                      />
                      {slot.name && <span className="slot-filename">✅ {slot.name}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="submit" 
                  className="gold-studio-btn"
                  disabled={familyCloneLoading}
                  style={{ flex: 2 }}
                >
                  {familyCloneLoading ? '⏳ CLONING & SAVING...' : '💾 CLONE & SAVE TO BUCKET'}
                </button>
                <button 
                  type="button" 
                  className="cancel-gray-btn"
                  onClick={() => setShowFamilyCloneModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
