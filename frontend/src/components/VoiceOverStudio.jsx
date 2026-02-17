import React, { useState, useEffect } from 'react';
import VoiceLibrary from './VoiceLibrary';
import './VoiceOverStudio.css';

export default function VoiceOverStudio({ projectId }) {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [voices, setVoices] = useState([]);
  const [cartoonVoices, setCartoonVoices] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [voiceovers, setVoiceovers] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceTab, setVoiceTab] = useState('professional');
  const [voiceCount, setVoiceCount] = useState(0);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);

  useEffect(() => {
    loadVoicesAndEmotions();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
      loadProjectVoiceovers();
    }
  }, [projectId]);

  const loadVoicesAndEmotions = async () => {
    setVoicesLoading(true);
    try {
      const [voicesData, emotionsData, cartoonData] = await Promise.all([
        fetch('/api/voiceover/voices?category=professional').then(r => r.json()),
        fetch('/api/voiceover/emotions').then(r => r.json()),
        fetch('/api/voiceover/voices?category=cartoon').then(r => r.json()).catch(() => [])
      ]);

      setVoices(voicesData);
      setCartoonVoices(cartoonData);
      setEmotions(emotionsData);
      setVoiceCount(voicesData.length);

      if (voicesData.length > 0 && !voice) {
        setVoice(voicesData[0].id);
      }
    } catch (err) {
      console.error('Failed to load options:', err);
      setError('Failed to load voices. Check console for details.');
    } finally {
      setVoicesLoading(false);
    }
  };

  const loadProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const project = await response.json();
      setProjectName(project.name);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const loadProjectVoiceovers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/voiceovers`);
      const data = await response.json();
      setVoiceovers(data);
    } catch (err) {
      console.error('Failed to load voiceovers:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!script.trim()) {
      setError('Please enter a script');
      return;
    }

    if (!voice) {
      setError('Please select a voice');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, voice, emotion })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setGenerated(data);

      if (projectId) {
        await fetch(`/api/projects/${projectId}/voiceovers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: data.filename || `voiceover-${Date.now()}.mp3`,
            voice,
            emotion,
            script
          })
        });
        await loadProjectVoiceovers();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoiceover = async (voiceoverId) => {
    try {
      await fetch(`/api/projects/${projectId}/voiceovers/${voiceoverId}`, {
        method: 'DELETE'
      });
      await loadProjectVoiceovers();
    } catch (err) {
      setError('Failed to delete voiceover');
    }
  };

  const handleSelectVoiceFromLibrary = (preset) => {
    setVoice(preset.voiceId);
    setEmotion(preset.emotion);
    setShowVoiceLibrary(false);
  };

  const currentVoices = voiceTab === 'cartoon' ? cartoonVoices : voices;
  
  const filteredVoices = currentVoices.filter(v => {
    const searchTerm = voiceSearch.toLowerCase();
    return (
      v.name.toLowerCase().includes(searchTerm) ||
      (v.cartoonStyle && v.cartoonStyle.toLowerCase().includes(searchTerm)) ||
      (v.description && v.description.toLowerCase().includes(searchTerm))
    );
  });

  const selectedVoiceObj = currentVoices.find(v => v.id === voice);

  return (
    <div className="voice-over-studio">
      <header className="studio-header">
        <div>
          <h1>🎙️ Voice Over Studio</h1>
          <p className="project-name">Project: <strong>{projectName}</strong></p>
        </div>
        <button 
          className="library-btn"
          onClick={() => setShowVoiceLibrary(!showVoiceLibrary)}
          title="Voice Library"
        >
          🎤 Library
        </button>
      </header>

      <main className="studio-main">
        <div className="studio-grid">
          {/* Script Input */}
          <section className="script-section">
            <h2>Script</h2>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your voiceover script here..."
              rows={10}
              className="script-input"
            />
            <div className="script-stats">
              <span>Characters: {script.length}</span>
              <span>Est. Duration: {Math.ceil(script.length / 15)}s</span>
            </div>
          </section>

          {/* Controls */}
          <section className="controls-section">
            {/* Voice Category Tabs */}
            <div className="voice-tabs">
              <button
                className={`tab-btn ${voiceTab === 'professional' ? 'active' : ''}`}
                onClick={() => {
                  setVoiceTab('professional');
                  if (voices.length > 0 && !voice) {
                    setVoice(voices[0].id);
                  }
                  setVoiceSearch('');
                }}
              >
                Professional
              </button>
              <button
                className={`tab-btn ${voiceTab === 'cartoon' ? 'active' : ''}`}
                onClick={() => {
                  setVoiceTab('cartoon');
                  if (cartoonVoices.length > 0) {
                    setVoice(cartoonVoices[0].id);
                  }
                  setVoiceSearch('');
                }}
              >
                🎭 Cartoon
              </button>
            </div>

            {/* Voice Selection */}
            <div className="control-group">
              <div className="voice-header">
                <label htmlFor="voice-select">
                  {voiceTab === 'cartoon' ? '🎭 Cartoon Voice' : 'Professional Voice'}
                </label>
                <span className="voice-count">
                  {filteredVoices.length} of {currentVoices.length}
                </span>
              </div>
              
              {voicesLoading ? (
                <div className="loading-spinner">Loading voices...</div>
              ) : filteredVoices.length === 0 ? (
                <div className="no-voices">
                  {voiceSearch 
                    ? 'No voices match your search' 
                    : (voiceTab === 'cartoon' 
                      ? 'No cartoon voices available' 
                      : 'No professional voices available')}
                </div>
              ) : (
                <>
                  <div className="voice-search-container">
                    <input
                      type="text"
                      placeholder="🔍 Search voices by name, style..."
                      value={voiceSearch}
                      onChange={(e) => setVoiceSearch(e.target.value)}
                      className="voice-search"
                    />
                    {voiceSearch && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setVoiceSearch('')}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    id="voice-select"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="select-input"
                    size={Math.min(5, filteredVoices.length)}
                  >
                    {filteredVoices.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.cartoonName ? `${v.cartoonName}` : v.name}
                        {v.cartoonStyle ? ` (${v.cartoonStyle})` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedVoiceObj && (
                    <div className="voice-info">
                      <p className="voice-name">
                        {voiceTab === 'cartoon' && '🎭 '}
                        {selectedVoiceObj.cartoonName || selectedVoiceObj.name}
                      </p>
                      {selectedVoiceObj.cartoonStyle && (
                        <p className="voice-desc">{selectedVoiceObj.cartoonStyle}</p>
                      )}
                      {selectedVoiceObj.description && !selectedVoiceObj.cartoonStyle && (
                        <p className="voice-desc">{selectedVoiceObj.description}</p>
                      )}
                      {selectedVoiceObj.previewUrl && (
                        <button
                          className="preview-voice-btn"
                          onClick={() => setPreviewingVoice(selectedVoiceObj.previewUrl)}
                        >
                          🔊 Preview
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Emotion Selection */}
            <div className="control-group">
              <label htmlFor="emotion-select">Emotion</label>
              <select
                id="emotion-select"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="select-input"
              >
                {emotions.map(e => (
                  <option key={e} value={e}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !script.trim() || !voice}
              className="generate-btn"
            >
              {loading ? 'Generating...' : '🎬 Generate Voiceover'}
            </button>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}
          </section>

          {/* Preview */}
          {generated && (
            <section className="preview-section">
              <h2>Generated</h2>
              <div className="preview-card">
                <div className="preview-info">
                  <p>
                    <strong>Voice:</strong> 
                    {voiceTab === 'cartoon' && ' 🎭 '}
                    {selectedVoiceObj?.cartoonName || selectedVoiceObj?.name || voice}
                  </p>
                  <p><strong>Emotion:</strong> {generated.emotion}</p>
                  <p><strong>Duration:</strong> ~{generated.duration}s</p>
                </div>
                <div className="preview-actions">
                  {generated.url && (
                    <>
                      <audio controls className="audio-player">
                        <source src={generated.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <a href={generated.url} download className="preview-btn download-btn">
                        ⬇ Download
                      </a>
                    </>
                  )}
                  {generated.status === 'processing' && (
                    <p className="status-text">Processing...</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Voice Library Modal */}
        {showVoiceLibrary && (
          <div className="library-modal">
            <div className="library-modal-content">
              <button
                className="close-modal-btn"
                onClick={() => setShowVoiceLibrary(false)}
              >
                ✕
              </button>
              <VoiceLibrary 
                selectedVoice={selectedVoiceObj}
                onSelectVoice={handleSelectVoiceFromLibrary}
              />
            </div>
          </div>
        )}

        {/* Voice Preview Modal */}
        {previewingVoice && (
          <div className="preview-modal" onClick={() => setPreviewingVoice(null)}>
            <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-btn"
                onClick={() => setPreviewingVoice(null)}
              >
                ✕
              </button>
              <h3>Voice Preview</h3>
              <audio controls autoPlay className="preview-audio">
                <source src={previewingVoice} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p>Listen to this voice before generating</p>
            </div>
          </div>
        )}

        {/* Voiceovers History */}
        {voiceovers.length > 0 && (
          <section className="voiceovers-history">
            <h2>📁 Saved Voiceovers ({voiceovers.length})</h2>
            <div className="voiceovers-list">
              {voiceovers.map((vo, idx) => (
                <div key={idx} className="voiceover-item">
                  <div className="vo-info">
                    <p className="vo-name">{vo.name}</p>
                    <p className="vo-meta">
                      {vo.voice && `Voice: ${vo.voice}`}
                      {vo.emotion && ` • Emotion: ${vo.emotion}`}
                    </p>
                    {vo.script && <p className="vo-script">"{vo.script}"</p>}
                  </div>
                  <div className="vo-actions">
                    {vo.path && (
                      <>
                        <button className="vo-btn-play">
                          <audio controls style={{ width: '200px', height: '30px' }}>
                            <source src={vo.path} type="audio/mpeg" />
                          </audio>
                        </button>
                        <a href={vo.path} download className="vo-btn-download">⬇</a>
                      </>
                    )}
                    <button
                      className="vo-btn-delete"
                      onClick={() => handleDeleteVoiceover(vo.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
