import React, { useState, useEffect, useRef } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'screenplay', 'soundtrack', 'sdk'

  // Voice list states
  const [familyVoices, setFamilyVoices] = useState([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Collapsible toggle for 38+ ElevenLabs catalog
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);

  // Studio Microphone Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBufferUrl, setAudioBufferUrl] = useState(null);
  const [audioBufferBlob, setAudioBufferBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Voice Cloning Form states
  const [voiceModelName, setVoiceModelName] = useState('');
  const [voiceRelationship, setVoiceRelationship] = useState('Family Member');
  const [voiceGender, setVoiceGender] = useState('female');
  const [voiceAccent, setVoiceAccent] = useState('American');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneMessage, setCloneMessage] = useState({ type: '', text: '' });

  // Filters for ElevenLabs catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  // TTS Synthesis Test Console states
  const [ttsText, setTtsText] = useState('Welcome to FableVoice Audio Studio. Testing active voice model text-to-speech synthesis.');
  const [generatingTts, setGeneratingTts] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // Refs for media recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    loadAllVoiceData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadAllVoiceData = async () => {
    setLoading(true);
    try {
      // Fetch ElevenLabs catalog voices & local/bucket saved family voices
      const [elRes, libRes] = await Promise.all([
        fetch('/api/voiceover/voices'),
        fetch('/api/voice-library')
      ]);

      const elData = await elRes.json();
      const libData = await libRes.json();

      // Process family / custom cloned voices
      const familyList = Array.isArray(libData) ? libData.map(v => ({
        id: v.id || v.voiceId,
        voiceId: v.voiceId || v.id,
        name: v.name,
        relationship: v.relationship || v.labels?.relationship || 'Family Member',
        gender: v.gender || v.labels?.gender || 'Custom',
        accent: v.accent || v.labels?.accent || 'American',
        description: v.description || `${v.name}'s custom cloned family voice model saved in persistent storage.`,
        previewUrl: v.previewUrl || null,
        date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/7/2026',
        isCloned: true,
        category: 'family'
      })) : [];

      // Process 38+ ElevenLabs catalog voices
      const elList = Array.isArray(elData) ? elData.map(v => ({
        id: v.id,
        voiceId: v.id,
        name: `ElevenLabs: ${v.name} - ${v.labels?.descriptive || v.description || 'Professional'}`,
        rawName: v.name,
        description: v.description || 'ElevenLabs standard voice profile',
        previewUrl: v.previewUrl || null,
        gender: v.labels?.gender || 'neutral',
        accent: v.labels?.accent || 'American',
        date: '8/7/2026',
        isCloned: false,
        category: v.category || 'elevenlabs'
      })) : [];

      setFamilyVoices(familyList);
      setElevenLabsVoices(elList);

      // Default selected voice
      if (!selectedVoiceId) {
        if (familyList.length > 0) {
          setSelectedVoiceId(familyList[0].id);
        } else if (elList.length > 0) {
          setSelectedVoiceId(elList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load voice models:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Recording Seconds as MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start Studio Microphone Recording
  const startRecording = async () => {
    try {
      setCloneMessage({ type: '', text: '' });
      setUploadedFile(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
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
      alert('Microphone access required for studio recording: ' + err.message);
    }
  };

  // Stop Studio Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Handle Audio File Selection (Alternative to Mic)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAudioBufferBlob(file);
      setAudioBufferUrl(URL.createObjectURL(file));
      setCloneMessage({ type: '', text: '' });
    }
  };

  // Clone Voice & Save to Persistent Bucket Storage & ElevenLabs
  const handleCloneVoice = async () => {
    if (!voiceModelName.trim()) {
      setCloneMessage({ type: 'error', text: 'Please enter a Voice Model Name (e.g. "Mom — Bedtime Reader")' });
      return;
    }

    if (!audioBufferBlob) {
      setCloneMessage({ type: 'error', text: 'No audio sample in buffer. Record via mic or upload an audio file.' });
      return;
    }

    setCloneLoading(true);
    setCloneMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', voiceModelName.trim());
      formData.append('relationship', voiceRelationship);
      formData.append('gender', voiceGender);
      formData.append('accent', voiceAccent);
      formData.append('description', `${voiceModelName.trim()} (${voiceRelationship}) saved in persistent app & bucket storage.`);
      
      const fileName = uploadedFile ? uploadedFile.name : `${voiceModelName.trim().replace(/\s+/g, '-')}-sample.mp3`;
      formData.append('sampleFile', audioBufferBlob, fileName);

      const res = await fetch('/api/voice-library/clone', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cloning failed');
      }

      const newModel = await res.json();

      const newFamilyVoice = {
        id: newModel.id || newModel.voiceId,
        voiceId: newModel.voiceId || newModel.id,
        name: newModel.name,
        relationship: newModel.relationship || voiceRelationship,
        gender: newModel.gender || voiceGender,
        accent: newModel.accent || voiceAccent,
        description: newModel.description || `${newModel.name}'s cloned voice model.`,
        previewUrl: newModel.previewUrl || audioBufferUrl,
        date: new Date().toLocaleDateString(),
        isCloned: true,
        category: 'family'
      };

      setFamilyVoices(prev => [newFamilyVoice, ...prev]);
      setSelectedVoiceId(newFamilyVoice.id);
      setCloneMessage({ type: 'success', text: `✨ Voice "${voiceModelName}" successfully cloned and saved to persistent app & bucket storage!` });

      // Reset form & buffer
      setVoiceModelName('');
      setAudioBufferBlob(null);
      setAudioBufferUrl(null);
      setUploadedFile(null);
      setRecordingSeconds(0);
    } catch (err) {
      setCloneMessage({ type: 'error', text: 'Cloning error: ' + err.message });
    } finally {
      setCloneLoading(false);
    }
  };

  // Delete Cloned Family Member Voice
  const handleDeleteVoice = async (e, voiceId, voiceName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${voiceName}"?\n\nThis will permanently delete the voice model from your app, local bucket storage (/uploads/cloned-voices/), and ElevenLabs API.`)) {
      return;
    }

    setDeletingVoiceId(voiceId);
    try {
      const res = await fetch(`/api/voice-library/${voiceId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete voice');
      }

      // Remove from familyVoices state
      setFamilyVoices(prev => prev.filter(v => v.id !== voiceId && v.voiceId !== voiceId));
      if (selectedVoiceId === voiceId) {
        const remaining = familyVoices.filter(v => v.id !== voiceId && v.voiceId !== voiceId);
        setSelectedVoiceId(remaining[0]?.id || elevenLabsVoices[0]?.id || null);
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingVoiceId(null);
    }
  };

  // Select Active Voice Model
  const handleSelectModel = (voice) => {
    setSelectedVoiceId(voice.id);
    if (onSelectVoice) {
      onSelectVoice(voice);
    }
  };

  // Generate TTS Synthesis
  const handleGenerateTts = async () => {
    if (!ttsText.trim() || !selectedVoiceId) return;

    setGeneratingTts(true);
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
        throw new Error(err.error || 'TTS generation failed');
      }

      const data = await res.json();
      setGeneratedAudioUrl(data.url);
    } catch (err) {
      alert('TTS Error: ' + err.message);
    } finally {
      setGeneratingTts(false);
    }
  };

  // Filter ElevenLabs catalog
  const filteredElevenLabsVoices = elevenLabsVoices.filter(v => {
    if (genderFilter !== 'all' && v.gender.toLowerCase() !== genderFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
    }
    return true;
  });

  const activeVoiceObj = familyVoices.find(v => v.id === selectedVoiceId) || elevenLabsVoices.find(v => v.id === selectedVoiceId) || familyVoices[0] || elevenLabsVoices[0];

  return (
    <div className="fable-studio-container">
      {/* ==================================================================== */}
      {/* 🚀 FABLEVOICE TOP HEADER & NAVBAR                                   */}
      {/* ==================================================================== */}
      <header className="fable-header">
        <div className="fable-brand">
          <div className="fable-logo-icon">
            <span className="logo-wave">🎙️</span>
          </div>
          <div className="fable-brand-text">
            <div className="brand-title-row">
              <span className="brand-name">FableVoice</span>
              <span className="brand-tag">AUDIO STUDIO</span>
            </div>
            <div className="brand-subtext">VOICE CLONING & STORY SOUNDTRACK CONSOLE</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="fable-nav">
          <button 
            className={`fable-nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <span className="nav-num">1.</span> Voice Studio
          </button>
          <button 
            className={`fable-nav-btn ${activeTab === 'screenplay' ? 'active' : ''}`}
            onClick={() => setActiveTab('screenplay')}
          >
            <span className="nav-num">2.</span> Screenplay Workshop
          </button>
          <button 
            className={`fable-nav-btn ${activeTab === 'soundtrack' ? 'active' : ''}`}
            onClick={() => setActiveTab('soundtrack')}
          >
            <span className="nav-num">3.</span> Soundtrack Console
          </button>
          <button 
            className={`fable-nav-btn ${activeTab === 'sdk' ? 'active' : ''}`}
            onClick={() => setActiveTab('sdk')}
          >
            &lt;/&gt; SDK Integration
          </button>
        </nav>
      </header>

      {/* ==================================================================== */}
      {/* 🎙️ TOP PANELS: CAPTURE AUDIO SAMPLE & CLONE VOICE                    */}
      {/* ==================================================================== */}
      {activeTab === 'studio' && (
        <main className="fable-main">
          <div className="studio-top-grid">
            {/* LEFT PANEL: CAPTURE AUDIO SAMPLE */}
            <div className="fable-card capture-card">
              <div className="capture-icon-header">
                <div className="amber-mic-box">
                  <span>🎙️</span>
                </div>
              </div>
              <h2 className="card-title">Capture Audio Sample</h2>
              <p className="card-subtitle">Speak clearly into your microphone for 15–30 seconds or upload an audio file.</p>

              {/* Glowing Timer Display */}
              <div className="timer-display">
                <span className={`timer-digits ${isRecording ? 'pulse-glow' : ''}`}>
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Start / Stop Recording Button */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {!isRecording ? (
                  <button className="gold-action-btn" onClick={startRecording}>
                    <span className="btn-icon">🎙️</span> START STUDIO RECORDING
                  </button>
                ) : (
                  <button className="gold-action-btn recording-active" onClick={stopRecording}>
                    <span className="btn-icon">⏹️</span> STOP RECORDING ({formatTimer(recordingSeconds)})
                  </button>
                )}

                <div className="upload-divider">OR UPLOAD SAMPLE FILE</div>
                
                <label className="file-upload-label">
                  📁 Choose MP3 / WAV File
                  <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
            </div>

            {/* RIGHT PANEL: BUFFER & ELEVENLABS CLONING ACTION */}
            <div className="fable-card clone-card">
              <div className="buffer-box">
                {audioBufferUrl ? (
                  <div className="buffer-ready">
                    <span className="buffer-icon">✅</span>
                    <div style={{ flex: 1 }}>
                      <strong>{uploadedFile ? `FILE UPLOADED: ${uploadedFile.name}` : `RECORDED SAMPLE IN BUFFER (${formatTimer(recordingSeconds)})`}</strong>
                      <audio controls src={audioBufferUrl} style={{ width: '100%', marginTop: '8px', height: '36px' }} />
                    </div>
                  </div>
                ) : (
                  <div className="buffer-empty-text">
                    NO RECORDED SAMPLE IN BUFFER. COMPLETE RECORDING OR FILE UPLOAD ON THE LEFT.
                  </div>
                )}
              </div>

              {cloneMessage.text && (
                <div className={`clone-msg ${cloneMessage.type}`}>
                  {cloneMessage.text}
                </div>
              )}

              <div className="form-row-grid">
                <div className="form-field-group" style={{ flex: 2 }}>
                  <label className="field-label">VOICE MODEL LABEL / NAME *</label>
                  <input
                    type="text"
                    className="fable-input"
                    placeholder='e.g. "Mom — Bedtime Storyteller"'
                    value={voiceModelName}
                    onChange={(e) => setVoiceModelName(e.target.value)}
                  />
                </div>

                <div className="form-field-group" style={{ flex: 1 }}>
                  <label className="field-label">RELATIONSHIP</label>
                  <select
                    className="fable-input"
                    value={voiceRelationship}
                    onChange={(e) => setVoiceRelationship(e.target.value)}
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Custom Friend">Custom Friend</option>
                  </select>
                </div>
              </div>

              <button 
                className="fable-outline-btn"
                onClick={handleCloneVoice}
                disabled={cloneLoading || !audioBufferBlob || !voiceModelName.trim()}
              >
                {cloneLoading ? '✨ CLONING & SAVING TO BUCKET...' : '✨ CLONE VOICE ON ELEVENLABS & BUCKET'}
              </button>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 👨‍👩‍👧‍👦 DEDICATED FAMILY MEMBER VOICE LIBRARY (ALWAYS VISIBLE)            */}
          {/* ==================================================================== */}
          <section className="fable-card family-library-card">
            <div className="library-section-header">
              <div className="lib-header-title">
                <span className="lib-icon">👨‍👩‍👧‍👦</span>
                <h2>Family Member & Cloned Voice Library</h2>
              </div>
              <span className="lib-count-badge family-badge-highlight">
                {familyVoices.length} SAVED FAMILY VOICES
              </span>
            </div>

            {familyVoices.length === 0 ? (
              <div className="empty-family-box">
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎙️</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>No Family Member Voices Cloned Yet</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Use the studio microphone recorder or file uploader above to clone your family member's voice!
                </p>
              </div>
            ) : (
              <div className="fable-voice-grid">
                {familyVoices.map((v) => {
                  const isSelected = v.id === selectedVoiceId;
                  return (
                    <div 
                      key={v.id} 
                      className={`fable-voice-card family-model-card ${isSelected ? 'selected-card' : ''}`}
                      onClick={() => handleSelectModel(v)}
                    >
                      <div className="fable-card-body">
                        <div className="v-title-row">
                          <div>
                            <span className="family-tag-pill">✨ {v.relationship}</span>
                            <h3 className="v-name" style={{ marginTop: '4px' }}>{v.name}</h3>
                          </div>
                          {isSelected ? (
                            <span className="selected-badge">
                              <span className="badge-dot"></span> SELECTED
                            </span>
                          ) : (
                            <button className="select-action-btn">SELECT</button>
                          )}
                        </div>

                        <p className="v-desc-text">{v.description}</p>

                        <div className="v-meta-row">
                          <span className="v-date">{v.date} (cloned bucket)</span>
                          <button 
                            className="card-del-btn"
                            onClick={(e) => handleDeleteVoice(e, v.id, v.name)}
                            disabled={deletingVoiceId === v.id}
                            title="Delete voice model permanently from app & bucket storage"
                          >
                            {deletingVoiceId === v.id ? '⏳' : '🗑️ DELETE'}
                          </button>
                        </div>

                        {v.previewUrl && (
                          <div className="v-preview-audio" onClick={(e) => e.stopPropagation()}>
                            <audio controls src={v.previewUrl} style={{ width: '100%', height: '28px', marginTop: '8px' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==================================================================== */}
          {/* 📂 COLLAPSIBLE ELEVENLABS CATALOG (38+ VOICES)                      */}
          {/* ==================================================================== */}
          <section className="fable-card catalog-accordion-card">
            <div 
              className="accordion-toggle-header"
              onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
            >
              <div className="lib-header-title">
                <span className="lib-icon">🌐</span>
                <div>
                  <h2 style={{ margin: 0 }}>ElevenLabs Preset Profiles ({elevenLabsVoices.length} Loaded)</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Standard ElevenLabs preset voice library available for instant speech synthesis
                  </p>
                </div>
              </div>

              <button className="catalog-accordion-btn">
                {isCatalogExpanded ? '▲ Collapse ElevenLabs Catalog' : `▼ View All (${elevenLabsVoices.length} Profiles)`}
              </button>
            </div>

            {isCatalogExpanded && (
              <div className="accordion-content" style={{ marginTop: '20px' }}>
                {/* Search & Filter Bar */}
                <div className="catalog-filter-bar">
                  <input
                    type="text"
                    className="fable-input"
                    placeholder="🔍 Search ElevenLabs profiles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <select
                    className="fable-input"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="all">All Genders</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                {/* Profiles Grid */}
                <div className="fable-voice-grid">
                  {filteredElevenLabsVoices.map((v) => {
                    const isSelected = v.id === selectedVoiceId;
                    return (
                      <div 
                        key={v.id} 
                        className={`fable-voice-card ${isSelected ? 'selected-card' : ''}`}
                        onClick={() => handleSelectModel(v)}
                      >
                        <div className="fable-card-body">
                          <div className="v-title-row">
                            <h3 className="v-name">{v.name}</h3>
                            {isSelected ? (
                              <span className="selected-badge">
                                <span className="badge-dot"></span> SELECTED
                              </span>
                            ) : (
                              <button className="select-action-btn">SELECT</button>
                            )}
                          </div>

                          <div className="v-meta-row">
                            <span className="v-date">{v.date} (elevenlabs)</span>
                          </div>

                          {v.previewUrl && (
                            <div className="v-preview-audio" onClick={(e) => e.stopPropagation()}>
                              <audio controls src={v.previewUrl} style={{ width: '100%', height: '28px', marginTop: '6px' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ==================================================================== */}
          {/* 🎧 LIVE TTS PREVIEW CONSOLE FOR ACTIVE VOICE MODEL                  */}
          {/* ==================================================================== */}
          {activeVoiceObj && (
            <section className="fable-card tts-console-card">
              <div className="tts-header">
                <h3>🎙️ Live Synthesis Console: {activeVoiceObj.name}</h3>
                <span className="active-model-tag">ACTIVE MODEL ID: {activeVoiceObj.voiceId || activeVoiceObj.id}</span>
              </div>

              <div className="tts-body">
                <textarea
                  className="fable-textarea"
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={3}
                  placeholder="Enter text to synthesize using active voice model..."
                />

                <div className="tts-actions">
                  <button 
                    className="gold-action-btn tts-btn"
                    onClick={handleGenerateTts}
                    disabled={generatingTts || !ttsText.trim()}
                  >
                    {generatingTts ? '⏳ SYNTHESIZING AUDIO...' : '⚡ SYNTHESIZE SPEECH'}
                  </button>

                  {generatedAudioUrl && (
                    <div className="tts-result-player">
                      <audio controls autoPlay src={generatedAudioUrl} />
                      <a href={generatedAudioUrl} download="fablevoice-speech.mp3" className="fable-download-link">
                        ⬇ Download MP3
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* Placeholders for Screenplay, Soundtrack, SDK Integration */}
      {activeTab === 'screenplay' && (
        <div className="fable-card placeholder-panel">
          <h2>📖 Screenplay Workshop</h2>
          <p>AI script generation, character dialogue prompts, and scene sequencing console.</p>
        </div>
      )}

      {activeTab === 'soundtrack' && (
        <div className="fable-card placeholder-panel">
          <h2>🎼 Soundtrack Console</h2>
          <p>Background music generation, spatial audio ambience, and voiceover audio merger.</p>
        </div>
      )}

      {activeTab === 'sdk' && (
        <div className="fable-card placeholder-panel">
          <h2>&lt;/&gt; SDK Integration</h2>
          <p>API endpoints, ElevenLabs WebSocket streaming, and Python/Node.js client SDK snippets.</p>
        </div>
      )}
    </div>
  );
}
