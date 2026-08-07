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

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBufferUrl, setAudioBufferUrl] = useState(null);
  const [audioBufferBlob, setAudioBufferBlob] = useState(null);

  // Voice cloning model label
  const [voiceModelLabel, setVoiceModelLabel] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneStatusMsg, setCloneStatusMsg] = useState({ type: '', text: '' });

  // Voice profiles list
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // TTS Synthesis Test state
  const [ttsText, setTtsText] = useState('Welcome to FableVoice Audio Studio. Active voice model calibration complete.');
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState(null);

  // Refs for recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    loadVoiceProfiles();
    const existingKey = localStorage.getItem('ELEVENLABS_API_KEY') || '';
    if (existingKey) {
      setApiKeyInput(existingKey);
      setApiKeySaved(true);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadVoiceProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const [elRes, libRes] = await Promise.all([
        fetch('/api/voiceover/voices'),
        fetch('/api/voice-library')
      ]);

      const elData = await elRes.json();
      const libData = await libRes.json();

      const combined = [];

      // Add custom cloned voices first
      if (Array.isArray(libData)) {
        libData.forEach(v => {
          combined.push({
            id: v.id || v.voiceId,
            voiceId: v.voiceId || v.id,
            name: v.name,
            description: v.description || 'Cloned Voice Profile',
            previewUrl: v.previewUrl || null,
            date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/7/2026',
            source: 'elevenlabs',
            isCloned: true
          });
        });
      }

      // Add ElevenLabs catalog profiles
      if (Array.isArray(elData)) {
        elData.forEach(v => {
          if (!combined.some(c => c.id === v.id || c.voiceId === v.id)) {
            combined.push({
              id: v.id,
              voiceId: v.id,
              name: `ElevenLabs: ${v.name} - ${v.labels?.descriptive || v.description || 'Resonant'}`,
              rawName: v.name,
              description: v.description || 'ElevenLabs Voice Model Profile',
              previewUrl: v.previewUrl || null,
              date: '8/7/2026',
              source: 'elevenlabs',
              isCloned: false
            });
          }
        });
      }

      setProfiles(combined);
      if (combined.length > 0 && !selectedProfileId) {
        setSelectedProfileId(combined[0].id);
      }
    } catch (err) {
      console.error('Error loading voice profiles:', err);
    } finally {
      setLoadingProfiles(false);
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

  // Clone Voice on ElevenLabs
  const handleCloneVoice = async () => {
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

      const newProfile = {
        id: newModel.id || newModel.voiceId,
        voiceId: newModel.voiceId || newModel.id,
        name: `ElevenLabs: ${newModel.name}`,
        description: 'Cloned Voice Model Profile',
        previewUrl: newModel.previewUrl || audioBufferUrl,
        date: new Date().toLocaleDateString(),
        source: 'elevenlabs',
        isCloned: true
      };

      setProfiles(prev => [newProfile, ...prev]);
      setSelectedProfileId(newProfile.id);
      setCloneStatusMsg({ type: 'success', text: `✨ Voice model "${voiceModelLabel}" successfully cloned and added to Active Voice Model Library!` });

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

  // Select Profile
  const handleSelectProfile = (profile) => {
    setSelectedProfileId(profile.id);
    if (onSelectVoice) {
      onSelectVoice(profile);
    }
  };

  // Delete Cloned Profile
  const handleDeleteProfile = async (e, profileId, profileName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete profile "${profileName}" from library and ElevenLabs?`)) return;

    try {
      const res = await fetch(`/api/voice-library/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setProfiles(prev => prev.filter(p => p.id !== profileId && p.voiceId !== profileId));
      if (selectedProfileId === profileId) {
        setSelectedProfileId(profiles[0]?.id || null);
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  // Synthesize Speech
  const handleSynthesize = async () => {
    if (!ttsText.trim() || !selectedProfileId) return;

    setSynthesizing(true);
    try {
      const res = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: ttsText,
          voice: selectedProfileId,
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

  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

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
            onClick={handleCloneVoice}
            disabled={cloneLoading || !audioBufferBlob || !voiceModelLabel.trim()}
          >
            {cloneLoading ? '✨ CLONING VOICE ON ELEVENLABS...' : '✨ CLONE VOICE ON ELEVENLABS'}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🗃️ ACTIVE VOICE MODEL LIBRARY GRID                                  */}
      {/* ==================================================================== */}
      <section className="fable-box active-library-box">
        <div className="active-library-header-row">
          <div className="library-title-group">
            <span className="db-icon">🗃️</span>
            <h2 className="library-section-title">Active Voice Model Library</h2>
          </div>
          <span className="profiles-loaded-counter">
            {profiles.length} PROFILES LOADED
          </span>
        </div>

        {loadingProfiles ? (
          <div className="loading-profiles-state">Loading ElevenLabs Voice Models...</div>
        ) : (
          <div className="three-col-profile-grid">
            {profiles.map((p) => {
              const isSelected = p.id === selectedProfileId;
              return (
                <div 
                  key={p.id}
                  className={`profile-card-item ${isSelected ? 'selected-gold-card' : ''}`}
                  onClick={() => handleSelectProfile(p)}
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
                    {p.isCloned && (
                      <button 
                        className="del-profile-btn"
                        onClick={(e) => handleDeleteProfile(e, p.id, p.name)}
                        title="Delete cloned profile"
                      >
                        🗑️
                      </button>
                    )}
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
      {activeProfile && (
        <section className="fable-box tts-console-box">
          <div className="tts-console-header">
            <h3>🎙️ Live Calibration Console: {activeProfile.name}</h3>
            <span className="profile-id-tag">ID: {activeProfile.voiceId || activeProfile.id}</span>
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
    </div>
  );
}
