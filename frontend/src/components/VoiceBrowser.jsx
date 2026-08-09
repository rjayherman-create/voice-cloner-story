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
  const [selectedVoiceId, setSelectedVoiceId] = useState('he-IL-HilaNeural');
  const [loading, setLoading] = useState(true);

  // Collapsible toggle for Dynamic 30-Voice Library (at bottom)
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);
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
  const [activeWorkflow, setActiveWorkflow] = useState('bedtime');
  const [voiceStability, setVoiceStability] = useState(0.80);
  const [voiceSimilarity, setVoiceSimilarity] = useState(0.85);
  const [voiceSpeed, setVoiceSpeed] = useState(0.90);

  // 🌐 Multilingual states (Hebrew positioned LAST on the list)
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState([
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
    { code: 'he', name: 'Hebrew (עברית ישראלית)', flag: '🇮🇱' }
  ]);
  const [multilingualPhrases, setMultilingualPhrases] = useState({
    en: 'Welcome to FableVoice Audio Studio. Active voice model calibrated with multilingual speech synthesis.',
    he: 'שלום, לילה טוב והמשך ערב נעים. חלומות פז ושינה מתוקה.'
  });

  // Workflow sample texts dictionary for all modes in En and He
  const WORKFLOW_PRESETS = {
    bedtime: {
      label: '🌙 Bedtime Story & Lullaby',
      desc: 'Gentle, soothing pacing with high vocal stability for restful sleep',
      stability: 0.80,
      similarity: 0.85,
      speed: 0.90,
      phrases: {
        en: 'Close your eyes, little adventurer. The moon is painting the sky in shades of silver and lavender, watching over your sweet dreams.',
        he: 'לילה טוב ילד שלי. עצום את העיניים והקשב לשיר הערש שהכוכבים שרים לך בשמיים. חלומות פז ושינה מתוקה.',
        es: 'Buenas noches mi pequeño héroe, que descanses y que las estrellas guíen tus hermosos sueños.',
        fr: 'Bonne nuit mon petit ange, dors bien et fais de très beaux rêves étoilés.'
      }
    },
    fantasy: {
      label: '✨ Fantasy Quest & Fairy Tale',
      desc: 'Expressive intonation and dynamic energy for magical adventure tales',
      stability: 0.55,
      similarity: 0.80,
      speed: 1.00,
      phrases: {
        en: 'Deep within the whispering sapphire woods, the golden star-dragon soared above the clouds, lighting up the enchanted forest with magic.',
        he: 'בלב היער הקסום, במקום שבו הציפורים שרות בלילה, מצאנו שביל של אור זוהר שהוביל אל טירת העננים הקסומה.',
        es: 'En lo profundo del bosque encantado, el dragón de las estrellas iluminó el cielo con chispas de oro y magia.',
        fr: 'Au cœur de la forêt enchantée, le dragon des étoiles illuminait la nuit d\'une merveilleuse poussière d\'or.'
      }
    },
    dialogue: {
      label: '💬 Family Character Dialogue',
      desc: 'Natural conversational cadence for playful interactions between characters',
      stability: 0.45,
      similarity: 0.75,
      speed: 1.05,
      phrases: {
        en: 'Are you ready for tonight’s big journey to the stars? Grab your compass and let’s fly together!',
        he: 'אתה מוכן למסע הגדול של הלילה אל הכוכבים? קח את המצפן ובוא נצא לדרך ביחד!',
        es: '¿Estás listo para el gran viaje de esta noche hacia las estrellas? ¡Toma tu brújula y volemos juntos!',
        fr: 'Es-tu prêt pour le grand voyage de ce soir vers les étoiles ? Prends ta boussole et partons ensemble !'
      }
    },
    toddler: {
      label: '👶 Toddler Calm & Whisper',
      desc: 'Soft, whisper-quiet cadence with maximum stability for babies and toddlers',
      stability: 0.90,
      similarity: 0.90,
      speed: 0.80,
      phrases: {
        en: 'Shh... quiet night, sweet dreams. Safe and warm in your cozy bed, fast asleep until morning sun.',
        he: 'ששש... לילה שקט ורגוע, חלומות נעימים. עטוף בשמיכה חמה, ישן בשלווה עד הבוקר.',
        es: 'Shh... noche tranquila, dulces sueños. Calientito en tu camita, durmiendo en paz.',
        fr: 'Chut... douce nuit, dors en paix mon tout-petit, bercé par les étoiles jusqu\'au matin.'
      }
    }
  };

  // 3. Multi-Sample Voice Quality Booster states
  const [sampleSlots, setSampleSlots] = useState([
    { id: 1, label: 'Sample 1: Calm Bedtime Reading', file: null, name: '' },
    { id: 2, label: 'Sample 2: Playful Dialogue', file: null, name: '' },
    { id: 3, label: 'Sample 3: Natural Conversation', file: null, name: '' }
  ]);

  // Modal for "+ Clone New Family Voice"
  const [showFamilyCloneModal, setShowFamilyCloneModal] = useState(false);
  const [familyCloneLoading, setFamilyCloneLoading] = useState(false);
  const [familyCloneError, setFamilyCloneError] = useState('');
  const [familyForm, setFamilyForm] = useState({
    name: '',
    relationship: 'Mother',
    gender: 'female',
    accent: 'Israeli Hebrew',
    style: 'Warm & Caring Storyteller',
    description: '',
    sampleFile: null
  });

  // Voice cloning model label for right panel
  const [voiceModelLabel, setVoiceModelLabel] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneStatusMsg, setCloneStatusMsg] = useState({ type: '', text: '' });

  // TTS Synthesis Test state (defaulting to clean text)
  const [ttsText, setTtsText] = useState('Welcome to FableVoice Audio Studio. Active voice model calibrated with multilingual speech synthesis.');
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState(null);
  const [synthesizedEngineUsed, setSynthesizedEngineUsed] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // 4. Screenplay Workshop (Multi-Character Story Generator) states
  const [storyTheme, setStoryTheme] = useState('bedtime');
  const [childName, setChildName] = useState('דניאל');
  const [screenplayCharacters, setScreenplayCharacters] = useState({
    Narrator: 'he-IL-AvriNeural',
    Mother: 'he-IL-HilaNeural',
    Father: 'he-IL-YonatanNeural',
    Child: 'he-IL-DanielChild',
    'Wise Elder': 'he-IL-DoronNeural'
  });
  const [screenplayScript, setScreenplayScript] = useState(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [synthesizingScreenplay, setSynthesizingScreenplay] = useState(false);
  const [screenplayAudioLines, setScreenplayAudioLines] = useState([]);

  // 5. Soundtrack Console & Ambience Mixer states
  const [soundtracks, setSoundtracks] = useState([]);
  const [selectedSoundtrack, setSelectedSoundtrack] = useState(null);
  const [soundtrackVolume, setSoundtrackVolume] = useState(0.4);
  const [autoDucking, setAutoDucking] = useState(true);
  const [playingSoundtrackId, setPlayingSoundtrackId] = useState(null);
  const soundtrackAudioRef = useRef(null);

  // Refs for recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    document.title = '🎙️ FableVoice Studio - Voice Cloning & Audio Stories';
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
          // If language changed, switch active voice to first voice of this language
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

      // Process dedicated family voices
      const famList = Array.isArray(libData) ? libData.map(v => ({
        id: v.id || v.voiceId,
        voiceId: v.voiceId || v.id,
        name: v.name,
        relationship: v.relationship || v.labels?.relationship || 'Family Member',
        gender: v.gender || v.labels?.gender || 'Custom',
        accent: v.accent || v.labels?.accent || 'Israeli Hebrew / Cloned',
        style: v.style || v.labels?.descriptive || 'Conversational',
        description: v.description || `${v.name}'s custom cloned family voice model saved in persistent bucket.`,
        previewUrl: v.previewUrl || null,
        date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/9/2026',
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      })) : [];

      const heList = Array.isArray(elData) ? elData.filter(v => v.category === 'hebrew' || v.id.startsWith('he-IL')) : [];
      const elList = Array.isArray(elData) ? elData.filter(v => v.category !== 'hebrew' && !v.id.startsWith('he-IL')) : [];

      setFamilyVoices(famList);
      if (heList.length > 0) setCurrentRosterVoices(heList);
      setElevenLabsVoices(elList);

      const defaultId = elList[0]?.id || famList[0]?.id || heList[0]?.id || 'en-fem-1';
      setSelectedVoiceId(defaultId);
    } catch (err) {
      console.error('Error loading voice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSoundtracks = async () => {
    try {
      const res = await fetch('/api/voiceover/soundtracks');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSoundtracks(data);
        if (data.length > 0) setSelectedSoundtrack(data[0]);
      }
    } catch (err) {
      console.error('Error loading soundtracks:', err);
    }
  };

  // 🔊 Instant Play & Stop Toggle for any voice
  const handleToggleVoicePreview = async (voiceObj, e) => {
    if (e) e.stopPropagation();

    // If already playing this voice, stop it
    if (playingVoiceId === voiceObj.id) {
      previewAudioRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }

    // If cached preview audio URL exists, play immediately
    if (voicePreviewAudios[voiceObj.id]) {
      previewAudioRef.current.src = voicePreviewAudios[voiceObj.id];
      previewAudioRef.current.play().catch(e => console.log('Autoplay error', e));
      setPlayingVoiceId(voiceObj.id);
      return;
    }

    // Synthesize preview sample on-the-fly for this voice
    setLoadingPreviewId(voiceObj.id);
    try {
      const demoPhrase = multilingualPhrases[selectedLanguage] || 
        `Hello, this is ${voiceObj.name}. Wishing you wonderful dreams tonight.`;

      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: demoPhrase,
          voice: voiceObj.id,
          language: selectedLanguage,
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

  // Quick switch language and load accurate phrase
  const handleSelectLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    const preset = WORKFLOW_PRESETS[activeWorkflow];
    if (preset && preset.phrases[langCode]) {
      setTtsText(preset.phrases[langCode]);
    } else if (multilingualPhrases[langCode]) {
      setTtsText(multilingualPhrases[langCode]);
    }
  };

  // Switch Studio Workflow Preset (Bedtime, Fantasy, Dialogue, Toddler)
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

  // Format Timer as MM:SS
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. Live Waveform Canvas Visualizer loop
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

  // Start Mic Recording with Live Waveform
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

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Multi-sample file slot handler
  const handleSampleSlotFile = (slotId, file) => {
    setSampleSlots(prev => prev.map(s => s.id === slotId ? { ...s, file, name: file ? file.name : '' } : s));
    if (slotId === 1 && file) {
      setAudioBufferBlob(file);
      setAudioBufferUrl(URL.createObjectURL(file));
    }
  };

  // Clone from Studio Rack Right Panel & Save in Bucket
  const handleCloneFromPanel = async () => {
    if (!voiceModelLabel.trim()) {
      setCloneStatusMsg({ type: 'error', text: 'Please enter a Voice Model Label (e.g. "Sarah — Bedtime Reader")' });
      return;
    }

    if (!audioBufferBlob) {
      setCloneStatusMsg({ type: 'error', text: 'No recorded sample in buffer. Complete recording on the left.' });
      return;
    }

    setCloneLoading(true);
    setCloneStatusMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', voiceModelLabel.trim());
      formData.append('relationship', 'Family Member');
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
        relationship: newModel.relationship || 'Family Member',
        gender: newModel.gender || 'Custom',
        accent: 'Israeli Hebrew / Cloned',
        description: 'FableVoice Cloned Family Voice Model (Bucket Storage)',
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

  // Submit Clone from Modal Form
  const handleFamilyModalSubmit = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim()) {
      setFamilyCloneError('Voice Name is required (e.g., Mom, Dad, Grandma Sarah)');
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
      formData.append('description', familyForm.description || `${familyForm.name} (${familyForm.relationship}) cloned family voice saved in bucket.`);
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
        relationship: 'Mother',
        gender: 'female',
        accent: 'Israeli Hebrew',
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

  // Delete Voice Profile from Bucket
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

  // Select Active Model
  const handleSelectModel = (profile) => {
    setSelectedVoiceId(profile.id);
    if (onSelectVoice) {
      onSelectVoice(profile);
    }
  };

  // 2. Synthesize Speech with Active Voice & Workflow Choices
  const handleSynthesize = async () => {
    if (!ttsText.trim()) return;

    setSynthesizing(true);
    setSynthesizedEngineUsed(null);

    try {
      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: ttsText,
          voice: selectedVoiceId,
          emotion: 'neutral',
          stability: voiceStability,
          similarityBoost: voiceSimilarity,
          speed: voiceSpeed,
          language: selectedLanguage,
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

  // 4. Generate AI Screenplay Script
  const handleGenerateScreenplayScript = async () => {
    setGeneratingScript(true);
    try {
      const res = await fetch('/api/voiceover/screenplay/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: storyTheme, childName, language: selectedLanguage })
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

  // 4. Synthesize Full Screenplay Multi-Character Audio
  const handleSynthesizeScreenplay = async () => {
    if (!screenplayScript || !screenplayScript.scenes) return;

    setSynthesizingScreenplay(true);
    const audioResults = [];

    try {
      for (let i = 0; i < screenplayScript.scenes.length; i++) {
        const scene = screenplayScript.scenes[i];
        const assignedVoiceId = screenplayCharacters[scene.character] || selectedVoiceId || 'he-IL-HilaNeural';

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

  // 5. Soundtrack Play / Stop toggle
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

  // Filter 30 Personas by Group (10 Males, 10 Females, 5 Girls, 5 Boys)
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
              <span className="brand-badge-yellow">AUDIO STUDIO</span>
            </div>
            <div className="brand-text-sub">VOICE CLONING & 30-PERSONA MULTILINGUAL STUDIO</div>
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
            <span className="pill-num">2.</span> Screenplay Workshop
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'soundtrack' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('soundtrack')}
          >
            <span className="pill-num">3.</span> Soundtrack Console
          </button>
          <button 
            className={`nav-pill-btn ${activeNav === 'sdk' ? 'active-pill' : ''}`}
            onClick={() => setActiveNav('sdk')}
          >
            &lt;/&gt; SDK Integration
          </button>
        </nav>
      </header>

      {/* ==================================================================== */}
      {/* TAB 1: VOICE STUDIO (TOP: RECORDER & DEDICATED FAMILY LIBRARY)       */}
      {/* ==================================================================== */}
      {activeNav === 'studio' && (
        <main className="studio-tab-content">
          {/* STUDIO RACK 01 BANNER */}
          <div className="studio-rack-banner">
            <div className="rack-info">
              <div className="rack-label">STUDIO RACK 01</div>
              <h1 className="rack-title">Voice Sample Recording & AI Voice Cloner</h1>
              <p className="rack-subtitle">Capture a 15–30 second vocal sample to clone family voices into bucket storage or synthesize with 30-voice multilingual personas.</p>
            </div>

            <div className="rack-actions">
              <button 
                className={`rack-mode-btn ${mode === 'offline' ? 'active-mode' : ''}`}
                onClick={() => setMode('offline')}
              >
                <span className="btn-dot">((•))</span> Offline Bucket Recording
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

              <h2 className="box-title">Capture Audio Sample</h2>
              <p className="box-subtitle">Speak clearly into your microphone for 15–30 seconds in any language.</p>

              {/* 1. Live Canvas Audio Waveform Visualizer */}
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
                  placeholder='e.g. "Sarah (Mom) — Bedtime Reader"'
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

          {/* DEDICATED FAMILY MEMBER VOICE LIBRARY (ALWAYS VISIBLE AT TOP) */}
          <section className="fable-box dedicated-family-section">
            <div className="family-header-row">
              <div className="family-title-group">
                <span className="family-icon-glow">👨‍👩‍👧‍👦</span>
                <div>
                  <h2 className="family-section-title">Dedicated Family Member Voice Library</h2>
                  <p className="family-section-subtitle">Persistent cloned family voices saved in storage bucket • Available across all sessions</p>
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
                  + Clone New Family Voice
                </button>
              </div>
            </div>

            {familyVoices.length === 0 ? (
              <div className="empty-family-card">
                <div className="empty-family-icon">🎙️</div>
                <h3 className="empty-family-title">No Cloned Family Voices Saved in Bucket Yet</h3>
                <p className="empty-family-desc">
                  Record a vocal clip above to clone Mom, Dad, or Grandparents and save them permanently to your bucket!
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
          {/* 🎛️ 2. UNIFIED LIVE CALIBRATION CONSOLE (WITH 30-VOICE PICKER)   */}
          {/* ================================================================ */}
          {activeVoiceObj && (
            <section className="fable-box tts-console-box" style={{ border: '2px solid #f59e0b', marginBottom: '24px', boxShadow: '0 0 24px rgba(245, 158, 11, 0.15)' }}>
              <div className="tts-console-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="brand-logo-badge" style={{ width: '38px', height: '38px' }}>
                    <span style={{ fontSize: '18px' }}>🎛️</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                      Live Calibration Console: <span style={{ color: '#f59e0b' }}>{activeVoiceObj.name}</span>
                    </h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {activeVoiceObj.relationship || activeVoiceObj.gender} • {selectedLangObj.flag} {selectedLangObj.name}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Instant Audio Preview Button in Header */}
                  <button
                    className={`preview-play-stop-btn ${playingVoiceId === activeVoiceObj.id ? 'btn-stop-preview' : 'btn-play-preview'}`}
                    onClick={(e) => handleToggleVoicePreview(activeVoiceObj, e)}
                    disabled={loadingPreviewId === activeVoiceObj.id}
                  >
                    {loadingPreviewId === activeVoiceObj.id ? '⏳ Loading...' : playingVoiceId === activeVoiceObj.id ? '⏹️ Stop Preview' : '▶️ Play Voice Preview'}
                  </button>
                </div>
              </div>

              {/* 1. DIRECT 30-VOICE & CLONED FAMILY MODEL SELECTOR INSIDE CONSOLE */}
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
                  <label className="input-label-uppercase">🎙️ 2. Active Voice Persona (30 {selectedLangObj.name.split(' ')[0]} Models & Clones)</label>
                  <select
                    className="dark-input-field lang-dropdown"
                    value={selectedVoiceId}
                    onChange={(e) => {
                      const found = allAvailableVoices.find(v => v.id === e.target.value);
                      if (found) handleSelectModel(found);
                    }}
                  >
                    {/* Cloned Family Voices */}
                    {familyVoices.length > 0 && (
                      <optgroup label="💾 Saved Cloned Family Voices (Bucket)">
                        {familyVoices.map(fv => (
                          <option key={fv.id} value={fv.id}>
                            ✨ {fv.name} ({fv.relationship || 'Family Member'})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* 10 Adult Males */}
                    <optgroup label={`👨 10 Adult Males (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'adult_male').map(v => (
                        <option key={v.id} value={v.id}>
                          👨 {v.name} ({v.relationship || 'Male'})
                        </option>
                      ))}
                    </optgroup>

                    {/* 10 Adult Females */}
                    <optgroup label={`👩 10 Adult Females (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'adult_female').map(v => (
                        <option key={v.id} value={v.id}>
                          👩 {v.name} ({v.relationship || 'Female'})
                        </option>
                      ))}
                    </optgroup>

                    {/* 5 Female Children */}
                    <optgroup label={`👧 5 Female Children (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'female_child').map(v => (
                        <option key={v.id} value={v.id}>
                          👧 {v.name} ({v.relationship || 'Girl'})
                        </option>
                      ))}
                    </optgroup>

                    {/* 5 Male Children */}
                    <optgroup label={`👦 5 Male Children (${selectedLangObj.name.split(' ')[0]})`}>
                      {currentRosterVoices.filter(v => v.group === 'male_child').map(v => (
                        <option key={v.id} value={v.id}>
                          👦 {v.name} ({v.relationship || 'Boy'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Quick Language Switch Pills with Hebrew Last */}
              <div className="quick-phrases-bar" style={{ marginBottom: '16px' }}>
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

              {/* 🎯 2. STUDIO WORKFLOW CHOICES (Bedtime, Fantasy, Dialogue, Toddler) */}
              <div className="workflow-selection-container">
                <label className="input-label-uppercase">🎯 Studio Workflow Mode (Sets Accurate Pacing & Intonation)</label>
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

              {/* 3. FINE-TUNING SLIDERS */}
              <div className="tuning-sliders-grid" style={{ marginTop: '16px' }}>
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
                </div>

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
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <span>Story Pace / Speaking Speed:</span>
                    <strong>{voiceSpeed}x</strong>
                  </div>
                  <input 
                    type="range" min="0.75" max="1.25" step="0.05"
                    className="fable-range"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Text Input for Synthesis */}
              <div style={{ marginTop: '16px' }}>
                <label className="input-label-uppercase">📝 Story Script / Test Sentence</label>
                <textarea
                  className="dark-textarea"
                  value={ttsText}
                  dir={selectedLanguage === 'he' || selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={3}
                  placeholder="Enter text to synthesize in chosen language..."
                />
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
                    <audio controls autoPlay src={synthesizedAudioUrl} />
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
                  <p className="catalog-subtitle-text">10 Adult Males • 10 Adult Females • 5 Female Children • 5 Male Children</p>
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

            {/* Collapsed Preview Bar */}
            {!isLibraryExpanded && (
              <div 
                className="catalog-collapsed-banner"
                onClick={() => setIsLibraryExpanded(true)}
              >
                <span>{selectedLangObj.flag} All 30 {selectedLangObj.name} voices are selectable in the Live Calibration Console above.</span>
                <strong className="click-to-expand-gold">Click to open full card gallery with instant Play/Stop controls →</strong>
              </div>
            )}

            {/* Expanded 30-Voice Grid with Play / Stop Buttons */}
            {isLibraryExpanded && (
              <div className="expanded-catalog-body">
                {/* Category Filter Tabs */}
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
                    👧 5 Female Children (ילדות)
                  </button>
                  <button 
                    className={`nav-pill-btn ${voiceFilter === 'male_child' ? 'active-pill' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setVoiceFilter('male_child')}
                  >
                    👦 5 Male Children (ילדים)
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

                          {/* 🔊 Play & Stop Preview Button for this voice */}
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

      {/* ==================================================================== */}
      {/* 4. 📖 TAB 2: SCREENPLAY WORKSHOP (MULTI-CHARACTER BEDTIME STORIES)   */}
      {/* ==================================================================== */}
      {activeNav === 'screenplay' && (
        <main className="screenplay-tab-content fable-box">
          <div className="screenplay-header">
            <div>
              <h2 className="screenplay-title">📖 Screenplay Workshop & Multi-Voice Story Generator</h2>
              <p className="screenplay-sub">Generate personalized stories in any language with different voices assigned to each character.</p>
            </div>
            <button 
              className="gold-studio-btn"
              onClick={handleGenerateScreenplayScript}
              disabled={generatingScript}
              style={{ maxWidth: '240px' }}
            >
              {generatingScript ? '⏳ Generating Story...' : '✨ Generate Story Script'}
            </button>
          </div>

          {/* Story Theme, Language & Child Name Controls */}
          <div className="story-controls-grid">
            <div className="control-card">
              <label className="input-label-uppercase">Story Theme</label>
              <select 
                className="dark-input-field"
                value={storyTheme}
                onChange={(e) => setStoryTheme(e.target.value)}
              >
                <option value="bedtime">🌙 המסע לאי החלומות (Bedtime Dream Voyage)</option>
                <option value="fantasy">✨ דרקון הכוכבים (Enchanted Star-Dragon)</option>
              </select>
            </div>

            <div className="control-card">
              <label className="input-label-uppercase">Story Language</label>
              <select 
                className="dark-input-field"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>

            <div className="control-card" style={{ gridColumn: 'span 2' }}>
              <label className="input-label-uppercase">Child's Name (גיבור הסיפור / Hero)</label>
              <input 
                type="text"
                className="dark-input-field"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. דניאל, יאיר, Leo, Emma"
              />
            </div>
          </div>

          {/* Character Voice Assignment Matrix */}
          <div className="character-matrix-section">
            <h3 className="section-small-title">🎭 Character Voice Assignment (Choose from 30 {selectedLangObj.name.split(' ')[0]} Personas & Cloned Voices)</h3>
            <div className="character-cards-grid">
              {['Narrator', 'Mother', 'Father', 'Child', 'Wise Elder'].map((charName) => (
                <div key={charName} className="character-assign-card">
                  <div className="char-role-badge">{charName}</div>
                  <select
                    className="dark-input-field"
                    value={screenplayCharacters[charName] || ''}
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

          {/* Generated Script Display & Synthesis Action */}
          {screenplayScript && (
            <div className="script-editor-container">
              <div className="script-title-row">
                <h3 className="story-title-highlight">📜 {screenplayScript.title}</h3>
                <button 
                  className="gold-studio-btn"
                  onClick={handleSynthesizeScreenplay}
                  disabled={synthesizingScreenplay}
                  style={{ maxWidth: '280px' }}
                >
                  {synthesizingScreenplay ? '⏳ Synthesizing Multi-Voice Story...' : '⚡ Synthesize Full Screenplay Audio'}
                </button>
              </div>

              <div className="dialogue-scenes-list">
                {screenplayScript.scenes.map((scene, idx) => (
                  <div key={idx} className="dialogue-scene-card">
                    <div className="scene-speaker-tag">
                      <strong>Scene {idx + 1}: {scene.character}</strong>
                    </div>
                    <p 
                      className="scene-dialogue-text"
                      dir={selectedLanguage === 'he' || selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    >
                      "{scene.text}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Synthesized Multi-Voice Audio Results */}
              {screenplayAudioLines.length > 0 && (
                <div className="synthesized-scenes-results">
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

      {/* ==================================================================== */}
      {/* 5. 🎼 TAB 3: SOUNDTRACK CONSOLE & AMBIENCE MIXER                    */}
      {/* ==================================================================== */}
      {activeNav === 'soundtrack' && (
        <main className="soundtrack-tab-content fable-box">
          <audio ref={soundtrackAudioRef} loop />

          <div className="soundtrack-header">
            <div>
              <h2 className="screenplay-title">🎼 Soundtrack Console & Background Ambience Mixer</h2>
              <p className="screenplay-sub">Mix calming lullabies and enchanted background tracks with your voiceovers.</p>
            </div>
          </div>

          <div className="ambience-mixer-bar">
            <div className="mixer-control-group">
              <label>Background Ambience Volume: {Math.round(soundtrackVolume * 100)}%</label>
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
                <span>✨ Voiceover Auto-Ducking (Ducks music 75% when voice speaks)</span>
              </label>
            </div>
          </div>

          <div className="soundtracks-grid">
            {soundtracks.map((st) => {
              const isPlaying = playingSoundtrackId === st.id;
              const isSelected = selectedSoundtrack?.id === st.id;
              return (
                <div key={st.id} className={`soundtrack-card ${isSelected ? 'selected-st-card' : ''}`}>
                  <div className="st-info">
                    <span className="st-cat-badge">{st.category}</span>
                    <h3 className="st-title">{st.title}</h3>
                    <p className="st-tempo">{st.tempo}</p>
                    <p className="st-note">{st.previewNote}</p>
                  </div>

                  <div className="st-actions">
                    <button 
                      className={`st-play-btn ${isPlaying ? 'st-playing' : ''}`}
                      onClick={() => toggleSoundtrackPlay(st)}
                    >
                      {isPlaying ? '⏹️ Pause Ambience' : '▶️ Play Preview'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TAB 4: SDK INTEGRATION */}
      {activeNav === 'sdk' && (
        <div className="fable-box placeholder-panel">
          <h2>&lt;/&gt; 30-Persona Multilingual & Hebrew Neural SDK Integration</h2>
          <p>Stream real-time cloned voice and 30-voice multilingual rosters directly into your applications.</p>
          <pre className="sdk-code-box">
{`// Synthesize in any of the 30 language personas
const response = await fetch("/api/voiceover/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    script: "Goodnight little star, sweet dreams and rest well.",
    voice: "en-fem-1", // 10 Adult Males, 10 Adult Females, 5 Girls, 5 Boys
    language: "en"
  })
});
const { url, engine } = await response.json();`}
          </pre>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. 🚀 MODAL: "+ CLONE NEW FAMILY VOICE"                              */}
      {/* ==================================================================== */}
      {showFamilyCloneModal && (
        <div className="modal-dark-overlay" onClick={() => setShowFamilyCloneModal(false)}>
          <div className="modal-dark-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowFamilyCloneModal(false)}>✕</button>

            <div className="modal-head">
              <span className="modal-head-icon">👨‍👩‍👧‍👦</span>
              <div>
                <h2>Clone New Family Member Voice</h2>
                <p>Upload multi-sample vocal recordings to train a custom voice model saved in bucket storage.</p>
              </div>
            </div>

            {familyCloneError && (
              <div className="modal-error-banner">{familyCloneError}</div>
            )}

            <form onSubmit={handleFamilyModalSubmit} className="modal-form">
              <div className="modal-form-group">
                <label>Voice Name / Person *</label>
                <input 
                  type="text"
                  placeholder="e.g. Mom (Sarah), Dad, Grandma Mary, Sister Emma"
                  className="dark-input-field"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-two-col">
                <div className="modal-form-group">
                  <label>Relationship</label>
                  <select 
                    className="dark-input-field"
                    value={familyForm.relationship}
                    onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                  >
                    <option value="Mother">Mother (אמא)</option>
                    <option value="Father">Father (אבא)</option>
                    <option value="Sister">Sister (אחות)</option>
                    <option value="Brother">Brother (אח)</option>
                    <option value="Child">Child (ילד/ה)</option>
                    <option value="Grandparent">Grandparent (סבא/סבתא)</option>
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
