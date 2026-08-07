import React, { useState, useEffect, useRef } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'screenplay', 'soundtrack', 'sdk'

  // Voice list states
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Studio Microphone Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBufferUrl, setAudioBufferUrl] = useState(null);
  const [audioBufferBlob, setAudioBufferBlob] = useState(null);

  // Cloning form states
  const [voiceModelName, setVoiceModelName] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneMessage, setCloneMessage] = useState({ type: '', text: '' });

  // TTS Test Text State
  const [ttsText, setTtsText] = useState('Welcome to FableVoice Audio Studio. This is a live synthesis preview of your active voice model.');
  const [generatingTts, setGeneratingTts] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // Refs for media recording & timer
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    loadAllVoiceModels();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadAllVoiceModels = async () => {
    setLoading(true);
    try {
      // Fetch ElevenLabs voices & saved cloned models
      const [elRes, libRes] = await Promise.all([
        fetch('/api/voiceover/voices'),
        fetch('/api/voice-library')
      ]);

      const elData = await elRes.json();
      const libData = await libRes.json();

      const combined = [];

      // Add local/cloned custom models first
      if (Array.isArray(libData)) {
        libData.forEach(v => {
          combined.push({
            id: v.id || v.voiceId,
            voiceId: v.voiceId || v.id,
            name: v.name,
            description: v.description || v.style || 'Custom Cloned Voice Model',
            previewUrl: v.previewUrl || null,
            date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '8/7/2026',
            source: 'custom',
            isCloned: true,
            category: 'cloned'
          });
        });
      }

      // Add ElevenLabs preset catalog voices
      if (Array.isArray(elData)) {
        elData.forEach(v => {
          // Avoid duplicate IDs if custom voice was synced
          if (!combined.some(c => c.id === v.id || c.voiceId === v.id)) {
            combined.push({
              id: v.id,
              voiceId: v.id,
              name: `ElevenLabs: ${v.name} - ${v.labels?.descriptive || v.description || 'Professional'}`,
              description: v.description || 'ElevenLabs standard voice profile',
              previewUrl: v.previewUrl || null,
              date: '8/7/2026',
              source: 'elevenlabs',
              isCloned: v.isCloned || false,
              category: v.category || 'elevenlabs'
            });
          }
        });
      }

      setVoices(combined);
      if (combined.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(combined[0].id);
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

  // Start Studio Recording
  const startRecording = async () => {
    try {
      setCloneMessage({ type: '', text: '' });
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
      alert('Microphone access required: ' + err.message);
    }
  };

  // Stop Studio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Clone Voice on ElevenLabs / Save to Bucket
  const handleCloneVoice = async () => {
    if (!voiceModelName.trim()) {
      setCloneMessage({ type: 'error', text: 'Please enter a Voice Model Name (e.g. "Richard — Bedtime Reader")' });
      return;
    }

    if (!audioBufferBlob) {
      setCloneMessage({ type: 'error', text: 'No audio sample in buffer. Complete studio recording first.' });
      return;
    }

    setCloneLoading(true);
    setCloneMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', voiceModelName.trim());
      formData.append('description', 'FableVoice Audio Studio Cloned Model');
      formData.append('relationship', 'Cloned Voice');
      formData.append('sampleFile', audioBufferBlob, `${voiceModelName.trim().replace(/\s+/g, '-')}-sample.mp3`);

      const res = await fetch('/api/voice-library/clone', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cloning failed');
      }

      const newModel = await res.json();

      const newVoiceObj = {
        id: newModel.id || newModel.voiceId,
        voiceId: newModel.voiceId || newModel.id,
        name: newModel.name,
        description: 'FableVoice Cloned Model',
        previewUrl: newModel.previewUrl || audioBufferUrl,
        date: new Date().toLocaleDateString(),
        source: 'custom',
        isCloned: true
      };

      setVoices(prev => [newVoiceObj, ...prev]);
      setSelectedVoiceId(newVoiceObj.id);
      setCloneMessage({ type: 'success', text: `✨ Voice model "${voiceModelName}" successfully cloned and saved to app & bucket!` });

      // Reset buffer & input
      setVoiceModelName('');
      setAudioBufferBlob(null);
      setAudioBufferUrl(null);
      setRecordingSeconds(0);
    } catch (err) {
      setCloneMessage({ type: 'error', text: 'Cloning error: ' + err.message });
    } finally {
      setCloneLoading(false);
    }
  };

  // Select Active Voice Model
  const handleSelectModel = (voice) => {
    setSelectedVoiceId(voice.id);
    if (onSelectVoice) {
      onSelectVoice(voice);
    }
  };

  // Delete Cloned Model
  const handleDeleteModel = async (e, voiceId, voiceName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${voiceName}" from FableVoice studio, bucket storage, and ElevenLabs API?`)) {
      return;
    }

    setDeletingVoiceId(voiceId);
    try {
      const res = await fetch(`/api/voice-library/${voiceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete voice model');

      setVoices(prev => prev.filter(v => v.id !== voiceId && v.voiceId !== voiceId));
      if (selectedVoiceId === voiceId) {
        setSelectedVoiceId(voices[0]?.id || null);
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingVoiceId(null);
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

  const selectedVoiceObj = voices.find(v => v.id === selectedVoiceId) || voices[0];

  return (
    <div className="fable-studio-container">
      {/* ==================================================================== */}
      {/* 🚀 FABLEVOICE TOP HEADER & NAVBAR                                   */}
      {/* ==================================================================== */}
      <header className="fable-header">
        <div className="fable-brand">
          <div className="fable-logo-icon">
            <span className="logo-ring"></span>
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
              <p className="card-subtitle">Speak clearly into your microphone for 15–30 seconds.</p>

              {/* Glowing Timer Display */}
              <div className="timer-display">
                <span className={`timer-digits ${isRecording ? 'pulse-glow' : ''}`}>
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Start / Stop Recording Button */}
              {!isRecording ? (
                <button className="gold-action-btn" onClick={startRecording}>
                  <span className="btn-icon">🎙️</span> START STUDIO RECORDING
                </button>
              ) : (
                <button className="gold-action-btn recording-active" onClick={stopRecording}>
                  <span className="btn-icon">⏹️</span> STOP RECORDING ({formatTimer(recordingSeconds)})
                </button>
              )}
            </div>

            {/* RIGHT PANEL: BUFFER & ELEVENLABS CLONING ACTION */}
            <div className="fable-card clone-card">
              <div className="buffer-box">
                {audioBufferUrl ? (
                  <div className="buffer-ready">
                    <span className="buffer-icon">✅</span>
                    <div>
                      <strong>RECORDED SAMPLE READY ({formatTimer(recordingSeconds)})</strong>
                      <audio controls src={audioBufferUrl} style={{ width: '100%', marginTop: '8px', height: '36px' }} />
                    </div>
                  </div>
                ) : (
                  <div className="buffer-empty-text">
                    NO RECORDED SAMPLE IN BUFFER. COMPLETE RECORDING ON THE LEFT.
                  </div>
                )}
              </div>

              {cloneMessage.text && (
                <div className={`clone-msg ${cloneMessage.type}`}>
                  {cloneMessage.text}
                </div>
              )}

              <div className="form-field-group">
                <label className="field-label">VOICE MODEL LABEL / NAME</label>
                <input
                  type="text"
                  className="fable-input"
                  placeholder='e.g. "Richard — Bedtime Reader"'
                  value={voiceModelName}
                  onChange={(e) => setVoiceModelName(e.target.value)}
                />
              </div>

              <button 
                className="fable-outline-btn"
                onClick={handleCloneVoice}
                disabled={cloneLoading || !audioBufferBlob || !voiceModelName.trim()}
              >
                {cloneLoading ? '✨ CLONING VOICE ON ELEVENLABS...' : '✨ CLONE VOICE ON ELEVENLABS'}
              </button>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* 🗃️ BOTTOM PANEL: ACTIVE VOICE MODEL LIBRARY                         */}
          {/* ==================================================================== */}
          <section className="fable-card library-section">
            <div className="library-section-header">
              <div className="lib-header-title">
                <span className="lib-icon">🗃️</span>
                <h2>Active Voice Model Library</h2>
              </div>
              <span className="lib-count-badge">{voices.length} PROFILES LOADED</span>
            </div>

            {loading ? (
              <div className="fable-loading">Loading FableVoice Model Profiles...</div>
            ) : (
              <div className="fable-voice-grid">
                {voices.map((v) => {
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
                          <span className="v-date">{v.date} ({v.source})</span>
                          {v.isCloned && (
                            <button 
                              className="card-del-btn"
                              onClick={(e) => handleDeleteModel(e, v.id, v.name)}
                              disabled={deletingVoiceId === v.id}
                              title="Delete voice model"
                            >
                              🗑️
                            </button>
                          )}
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
            )}
          </section>

          {/* ==================================================================== */}
          {/* 🎧 LIVE TTS PREVIEW CONSOLE FOR SELECTED MODEL                       */}
          {/* ==================================================================== */}
          {selectedVoiceObj && (
            <section className="fable-card tts-console-card">
              <div className="tts-header">
                <h3>🎙️ Live Synthesis Console: {selectedVoiceObj.name}</h3>
                <span className="active-model-tag">ACTIVE MODEL ID: {selectedVoiceObj.voiceId || selectedVoiceObj.id}</span>
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
