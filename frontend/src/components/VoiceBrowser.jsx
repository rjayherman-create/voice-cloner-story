import React, { useState, useEffect, useRef } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  // Navigation tabs
  const [activeNav, setActiveNav] = useState('studio');

  // Mode selection: 'elevenlabs' vs 'offline'
  const [mode, setMode] = useState('elevenlabs');

  // API Key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Dedicated Family Voices state
  const [familyVoices, setFamilyVoices] = useState([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal for "+ Clone New Family Voice"
  const [showFamilyCloneModal, setShowFamilyCloneModal] = useState(false);
  const [familyCloneLoading, setFamilyCloneLoading] = useState(false);
  const [familyCloneError, setFamilyCloneError] = useState('');
  const [familyForm, setFamilyForm] = useState({
    name: '',
    relationship: 'Mother',
    gender: 'female',
    accent: 'American',
    style: 'Warm & Caring Storyteller',
    description: '',
    sampleFile: null
  });

  // Studio Microphone Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBufferUrl, setAudioBufferUrl] = useState(null);
  const [audioBufferBlob, setAudioBufferBlob] = useState(null);

  // Voice cloning model label for right panel
  const [voiceModelLabel, setVoiceModelLabel] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneStatusMsg, setCloneStatusMsg] = useState({ type: '', text: '' });

  // TTS Synthesis Test state
  const [ttsText, setTtsText] = useState('Welcome to FableVoice Audio Studio. Active voice model calibration complete.');
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // Refs for recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    loadAllVoiceData();
    const existingKey = localStorage.getItem('ELEVENLABS_API_KEY') || '';
    if (existingKey) {
      setApiKeyInput(existingKey);
      setApiKeySaved(true);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        accent: v.accent || v.labels?.accent || 'American',
        style: v.style || v.labels?.descriptive || 'Conversational',
        description: v.description || `${v.name}'s custom cloned family voice model.`,
        previewUrl: v.previewUrl || null,
        date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/7/2026',
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      })) : [];

      // Process ElevenLabs catalog voices
      const elList = Array.isArray(elData) ? elData.map(v => ({
        id: v.id,
        voiceId: v.id,
        name: `ElevenLabs: ${v.name} - ${v.labels?.descriptive || v.description || 'Resonant'}`,
        rawName: v.name,
        description: v.description || 'ElevenLabs standard voice profile',
        previewUrl: v.previewUrl || null,
        gender: v.labels?.gender || 'neutral',
        accent: v.labels?.accent || 'American',
        date: '8/7/2026',
        source: 'elevenlabs',
        isCloned: false,
        category: v.category || 'elevenlabs'
      })) : [];

      setFamilyVoices(famList);
      setElevenLabsVoices(elList);

      if (!selectedVoiceId) {
        if (famList.length > 0) {
          setSelectedVoiceId(famList[0].id);
        } else if (elList.length > 0) {
          setSelectedVoiceId(elList[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading voice data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save XI-API-Key locally
  const handleSaveApiKey = (e) => {
    const val = e.target.value;
    setApiKeyInput(val);
    if (val.trim()) {
      localStorage.setItem('ELEVENLABS_API_KEY', val.trim());
      setApiKeySaved(true);
    } else {
      localStorage.removeItem('ELEVENLABS_API_KEY');
      setApiKeySaved(false);
    }
  };

  // Format Timer as MM:SS
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setCloneStatusMsg({ type: '', text: '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

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

  // Clone from Studio Rack Right Panel
  const handleCloneFromPanel = async () => {
    if (!voiceModelLabel.trim()) {
      setCloneStatusMsg({ type: 'error', text: 'Please enter a Voice Model Label (e.g. "Richard — Bedtime Reader")' });
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
      formData.append('description', 'FableVoice Calibrated Voice Model');
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
        accent: newModel.accent || 'American',
        description: 'FableVoice Cloned Family Voice Model',
        previewUrl: newModel.previewUrl || audioBufferUrl,
        date: new Date().toLocaleDateString(),
        source: 'cloned bucket',
        isCloned: true,
        category: 'family'
      };

      setFamilyVoices(prev => [newFamVoice, ...prev]);
      setSelectedVoiceId(newFamVoice.id);
      setCloneStatusMsg({ type: 'success', text: `✨ Voice "${voiceModelLabel}" cloned and added to Family Member Voice Library!` });

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

  // Submit Clone from Modal Form ("+ Clone New Family Voice")
  const handleFamilyModalSubmit = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim()) {
      setFamilyCloneError('Voice Name is required (e.g., Mom, Dad, Grandma Sarah)');
      return;
    }

    if (!familyForm.sampleFile) {
      setFamilyCloneError('Please select an audio sample file (MP3/WAV/M4A) to clone the voice.');
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
      formData.append('description', familyForm.description || `${familyForm.name} (${familyForm.relationship}) cloned family voice.`);
      formData.append('sampleFile', familyForm.sampleFile);

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

      // Reset modal form & close
      setFamilyForm({
        name: '',
        relationship: 'Mother',
        gender: 'female',
        accent: 'American',
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

  // Delete Voice Profile & Clean Bucket Storage
  const handleDeleteProfile = async (e, profileId, profileName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${profileName}"?\n\nThis will permanently delete the voice model from your app, local bucket storage (/uploads/cloned-voices/), and ElevenLabs API.`)) {
      return;
    }

    setDeletingVoiceId(profileId);
    try {
      const res = await fetch(`/api/voice-library/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setFamilyVoices(prev => prev.filter(p => p.id !== profileId && p.voiceId !== profileId));
      setElevenLabsVoices(prev => prev.filter(p => p.id !== profileId && p.voiceId !== profileId));

      if (selectedVoiceId === profileId) {
        const remaining = familyVoices.filter(p => p.id !== profileId);
        setSelectedVoiceId(remaining[0]?.id || elevenLabsVoices[0]?.id || null);
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

  // Synthesize Speech
  const handleSynthesize = async () => {
    if (!ttsText.trim() || !selectedVoiceId) return;

    setSynthesizing(true);
    try {
      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: ttsText,
          voice: selectedVoiceId,
          emotion: 'neutral'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Synthesis failed');
      }

      const data = await res.json();
      setSynthesizedAudioUrl(data.url);
    } catch (err) {
      alert('Synthesis error: ' + err.message);
    } finally {
      setSynthesizing(false);
    }
  };

  const activeVoiceObj = familyVoices.find(v => v.id === selectedVoiceId) || elevenLabsVoices.find(v => v.id === selectedVoiceId) || familyVoices[0] || elevenLabsVoices[0];

  return (
    <div className="fable-studio-page">
      {/* ==================================================================== */}
      {/* 🚀 TOP HEADER                                                       */}
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
            <div className="brand-text-sub">VOICE CLONING & STORY SOUNDTRACK CONSOLE</div>
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
      {/* 👨‍👩‍👧‍👦 DEDICATED FAMILY MEMBER VOICE LIBRARY (ALWAYS VISIBLE AT TOP)      */}
      {/* ==================================================================== */}
      <section className="fable-box dedicated-family-section">
        <div className="family-header-row">
          <div className="family-title-group">
            <span className="family-icon-glow">👨‍👩‍👧‍👦</span>
            <div>
              <h2 className="family-section-title">Dedicated Family Member Voice Library</h2>
              <p className="family-section-subtitle">Persistent cloned family voices saved locally in your app & bucket storage</p>
            </div>
          </div>

          <div className="family-header-actions">
            <span className="family-counter-badge">
              {familyVoices.length} SAVED FAMILY {familyVoices.length === 1 ? 'VOICE' : 'VOICES'}
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
            <h3 className="empty-family-title">No Family Member Voices Cloned Yet</h3>
            <p className="empty-family-desc">
              Clone your family member voices (Mom, Dad, Grandparent, Sibling) to keep them permanently available for storybooks & audiobooks.
            </p>
            <button 
              className="clone-family-gold-btn"
              style={{ marginTop: '14px' }}
              onClick={() => setShowFamilyCloneModal(true)}
            >
              + Clone Your First Family Voice
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
                        <span className="green-dot"></span> SELECTED
                      </span>
                    ) : (
                      <button className="btn-select-gold">SELECT</button>
                    )}
                  </div>

                  <p className="family-card-desc">{v.description}</p>

                  <div className="profile-card-bottom">
                    <span className="meta-date-tag">{v.date} (cloned bucket)</span>
                    <button 
                      className="del-profile-btn"
                      onClick={(e) => handleDeleteProfile(e, v.id, v.name)}
                      disabled={deletingVoiceId === v.id}
                      title="Delete voice permanently from app, bucket storage, and ElevenLabs"
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

      {/* ==================================================================== */}
      {/* 🎛️ STUDIO RACK 01 BANNER                                           */}
      {/* ==================================================================== */}
      <div className="studio-rack-banner">
        <div className="rack-info">
          <div className="rack-label">STUDIO RACK 01</div>
          <h1 className="rack-title">Voice Sample Recording & AI Trainer</h1>
          <p className="rack-subtitle">Capture a clear 15–second vocal sample to train an ElevenLabs AI voice model or store offline.</p>
        </div>

        <div className="rack-actions">
          <button 
            className={`rack-mode-btn ${mode === 'offline' ? 'active-mode' : ''}`}
            onClick={() => setMode('offline')}
          >
            <span className="btn-dot">((•))</span> Offline Mic Recording
          </button>
          <button 
            className={`rack-mode-btn ${mode === 'elevenlabs' ? 'active-gold-mode' : ''}`}
            onClick={() => setMode('elevenlabs')}
          >
            <span className="btn-key">🔑</span> ElevenLabs AI Voices
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🔑 ELEVENLABS API KEY & CLONED VOICES BANNER                         */}
      {/* ==================================================================== */}
      <div className="api-key-banner">
        <div className="api-key-label">
          <span className="key-icon">🔑</span> ELEVENLABS API KEY & CLONED VOICES
        </div>
        <div className="api-key-input-wrapper">
          <input
            type="password"
            className="api-key-input"
            placeholder="Paste XI-API-Key..."
            value={apiKeyInput}
            onChange={handleSaveApiKey}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🎙️ 2-COLUMN STUDIO PANELS                                            */}
      {/* ==================================================================== */}
      <div className="studio-two-col-grid">
        {/* LEFT PANEL: CAPTURE AUDIO SAMPLE */}
        <div className="fable-box capture-box">
          <div className="wireframe-mic-container">
            <div className="wireframe-mic-box">
              <span className="mic-symbol">🎙️</span>
            </div>
          </div>

          <h2 className="box-title">Capture Audio Sample</h2>
          <p className="box-subtitle">Speak clearly into your microphone for 15–30 seconds.</p>

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

        {/* RIGHT PANEL: ELEVENLABS AI VOICE TRAINER */}
        <div className="fable-box trainer-box">
          <div className="trainer-header-row">
            <span className="calibrator-label">VOICE CALIBRATOR</span>
            <span className="status-ready-label">STATUS: READY</span>
          </div>

          <h2 className="box-title" style={{ marginTop: '4px', marginBottom: '16px' }}>
            ElevenLabs AI Voice Trainer
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
              placeholder='e.g. "Richard — Bedtime Reader"'
              value={voiceModelLabel}
              onChange={(e) => setVoiceModelLabel(e.target.value)}
            />
          </div>

          <button 
            className="clone-action-btn"
            onClick={handleCloneFromPanel}
            disabled={cloneLoading || !audioBufferBlob || !voiceModelLabel.trim()}
          >
            {cloneLoading ? '✨ CLONING VOICE ON ELEVENLABS...' : '✨ CLONE VOICE ON ELEVENLABS'}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🗃️ ACTIVE VOICE MODEL LIBRARY GRID (ELEVENLABS PRESETS)              */}
      {/* ==================================================================== */}
      <section className="fable-box active-library-box">
        <div className="active-library-header-row">
          <div className="library-title-group">
            <span className="db-icon">🗃️</span>
            <h2 className="library-section-title">Active Voice Model Library</h2>
          </div>
          <span className="profiles-loaded-counter">
            {elevenLabsVoices.length} PROFILES LOADED
          </span>
        </div>

        {loading ? (
          <div className="loading-profiles-state">Loading ElevenLabs Voice Models...</div>
        ) : (
          <div className="three-col-profile-grid">
            {elevenLabsVoices.map((p) => {
              const isSelected = p.id === selectedVoiceId;
              return (
                <div 
                  key={p.id}
                  className={`profile-card-item ${isSelected ? 'selected-gold-card' : ''}`}
                  onClick={() => handleSelectModel(p)}
                >
                  <div className="profile-card-top">
                    <h3 className="profile-title-text">{p.name}</h3>

                    {isSelected ? (
                      <span className="badge-selected-green">
                        <span className="green-dot"></span> SELECTED
                      </span>
                    ) : (
                      <button className="btn-select-gold">SELECT</button>
                    )}
                  </div>

                  <div className="profile-card-bottom">
                    <span className="meta-date-tag">{p.date} ({p.source})</span>
                  </div>

                  {p.previewUrl && (
                    <div className="profile-preview-player" onClick={(e) => e.stopPropagation()}>
                      <audio controls src={p.previewUrl} className="profile-audio" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 🎧 LIVE TTS PREVIEW CONSOLE                                         */}
      {/* ==================================================================== */}
      {activeVoiceObj && (
        <section className="fable-box tts-console-box">
          <div className="tts-console-header">
            <h3>🎙️ Live Calibration Console: {activeVoiceObj.name}</h3>
            <span className="profile-id-tag">ID: {activeVoiceObj.voiceId || activeVoiceObj.id}</span>
          </div>

          <textarea
            className="dark-textarea"
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            rows={3}
            placeholder="Enter text to synthesize using selected voice profile..."
          />

          <div className="tts-action-row">
            <button 
              className="gold-studio-btn tts-btn"
              onClick={handleSynthesize}
              disabled={synthesizing || !ttsText.trim()}
            >
              {synthesizing ? '⏳ SYNTHESIZING SPEECH...' : '⚡ SYNTHESIZE SPEECH'}
            </button>

            {synthesizedAudioUrl && (
              <div className="synthesized-player-group">
                <audio controls autoPlay src={synthesizedAudioUrl} />
                <a href={synthesizedAudioUrl} download="fablevoice-audio.mp3" className="download-btn-blue">
                  ⬇ Download MP3
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 🚀 MODAL: "+ CLONE NEW FAMILY VOICE"                                 */}
      {/* ==================================================================== */}
      {showFamilyCloneModal && (
        <div className="modal-dark-overlay" onClick={() => setShowFamilyCloneModal(false)}>
          <div className="modal-dark-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowFamilyCloneModal(false)}>✕</button>

            <div className="modal-head">
              <span className="modal-head-icon">👨‍👩‍👧‍👦</span>
              <div>
                <h2>Clone New Family Member Voice</h2>
                <p>Upload a clear vocal recording to train a custom model and save to app & bucket storage.</p>
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
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Friend">Friend / Custom</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Gender</label>
                  <select 
                    className="dark-input-field"
                    value={familyForm.gender}
                    onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value })}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div className="modal-two-col">
                <div className="modal-form-group">
                  <label>Accent</label>
                  <input 
                    type="text"
                    placeholder="e.g. American, British, Australian"
                    className="dark-input-field"
                    value={familyForm.accent}
                    onChange={(e) => setFamilyForm({ ...familyForm, accent: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Speaking Style</label>
                  <input 
                    type="text"
                    placeholder="e.g. Warm Storyteller, Cheerful"
                    className="dark-input-field"
                    value={familyForm.style}
                    onChange={(e) => setFamilyForm({ ...familyForm, style: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>📁 Vocal Sample File (MP3 / WAV / M4A) *</label>
                <input 
                  type="file"
                  accept="audio/*"
                  className="dark-file-input"
                  onChange={(e) => setFamilyForm({ ...familyForm, sampleFile: e.target.files[0] || null })}
                  required
                />
                <small className="file-hint-text">Upload 15–60 seconds of clean speech for best cloning quality.</small>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="submit" 
                  className="gold-studio-btn"
                  disabled={familyCloneLoading}
                  style={{ flex: 2 }}
                >
                  {familyCloneLoading ? '⏳ CLONING & SAVING...' : '✨ CLONE & SAVE FAMILY VOICE'}
                </button>
                <button 
                  type="button" 
                  className="cancel-gray-btn"
                  onClick={() => setShowFamilyCloneModal(false)}
                  style={{ flex: 1 }}
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
