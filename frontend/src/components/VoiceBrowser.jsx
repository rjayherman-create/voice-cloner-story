import React, { useState, useEffect } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  // Voice list states
  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);
  const [familyVoices, setFamilyVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI Expand / Collapse state for standard ElevenLabs 38+ voices
  const [isElevenLabsExpanded, setIsElevenLabsExpanded] = useState(false);

  // Audio preview & generation states
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [generatingVoice, setGeneratingVoice] = useState(null);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [testText, setTestText] = useState('Hello! This is a test of my cloned voice audio synthesis in our voice over system.');

  // Modal state for cloning new family voices
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneError, setCloneError] = useState('');
  const [cloneForm, setCloneForm] = useState({
    name: '',
    relationship: 'Family Member',
    gender: 'female',
    accent: 'American',
    style: 'Conversational',
    description: '',
    sampleFile: null
  });

  // Deletion state
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);

  // Filters for ElevenLabs catalog
  const [genderFilter, setGenderFilter] = useState('all');
  const [accentFilter, setAccentFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Dynamic filter options
  const [filterOptions, setFilterOptions] = useState({
    genders: ['all'],
    accents: ['all'],
    styles: ['all']
  });

  useEffect(() => {
    loadAllVoices();
  }, []);

  const loadAllVoices = async () => {
    setLoading(true);
    try {
      // 1. Fetch ElevenLabs catalog voices
      const elRes = await fetch('/api/voiceover/voices');
      const elData = await elRes.json();

      // 2. Fetch local / bucket cloned family voices from voice library
      const libraryRes = await fetch('/api/voice-library');
      const libraryData = await libraryRes.json();

      // Filter family/cloned voices vs standard voices
      const familyClonedList = libraryData.filter(v => v.isFamily || v.isCloned || v.category === 'family');
      
      setElevenLabsVoices(elData || []);
      setFamilyVoices(familyClonedList || []);

      // Extract unique filter options from ElevenLabs catalog
      if (Array.isArray(elData)) {
        const genders = ['all', ...new Set(elData.map(v => v.labels?.gender).filter(Boolean))];
        const accents = ['all', ...new Set(elData.map(v => v.labels?.accent).filter(Boolean))];
        const styles = ['all', ...new Set(elData.map(v => v.labels?.descriptive).filter(Boolean))];
        setFilterOptions({ genders, accents, styles });
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter ElevenLabs Catalog
  const filteredElevenLabsVoices = elevenLabsVoices.filter(voice => {
    if (genderFilter !== 'all' && voice.labels?.gender?.toLowerCase() !== genderFilter.toLowerCase()) {
      return false;
    }
    if (accentFilter !== 'all' && voice.labels?.accent?.toLowerCase() !== accentFilter.toLowerCase()) {
      return false;
    }
    if (styleFilter !== 'all' && voice.labels?.descriptive?.toLowerCase() !== styleFilter.toLowerCase()) {
      return false;
    }
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      return (
        voice.name.toLowerCase().includes(search) ||
        voice.description?.toLowerCase().includes(search) ||
        voice.labels?.descriptive?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Handle Form Input Changes for Voice Cloning
  const handleCloneFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'sampleFile') {
      setCloneForm(prev => ({ ...prev, sampleFile: files[0] || null }));
    } else {
      setCloneForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit Clone New Voice
  const handleCloneSubmit = async (e) => {
    e.preventDefault();
    if (!cloneForm.name.trim()) {
      setCloneError('Voice name is required (e.g., Mom, Dad, Sister)');
      return;
    }

    setCloneLoading(true);
    setCloneError('');

    try {
      const formData = new FormData();
      formData.append('name', cloneForm.name);
      formData.append('relationship', cloneForm.relationship);
      formData.append('gender', cloneForm.gender);
      formData.append('accent', cloneForm.accent);
      formData.append('style', cloneForm.style);
      formData.append('description', cloneForm.description);
      if (cloneForm.sampleFile) {
        formData.append('sampleFile', cloneForm.sampleFile);
      }

      const res = await fetch('/api/voice-library/clone', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to clone voice');
      }

      const newVoice = await res.json();
      setFamilyVoices(prev => [newVoice, ...prev]);

      // Reset form and close modal
      setCloneForm({
        name: '',
        relationship: 'Family Member',
        gender: 'female',
        accent: 'American',
        style: 'Conversational',
        description: '',
        sampleFile: null
      });
      setShowCloneModal(false);
    } catch (err) {
      setCloneError(err.message);
    } finally {
      setCloneLoading(false);
    }
  };

  // Handle Deleting a Cloned Voice
  const handleDeleteVoice = async (presetId, voiceName) => {
    if (!window.confirm(`Are you sure you want to delete "${voiceName}"?\n\nThis will permanently remove the voice from your app, local bucket storage, and ElevenLabs API.`)) {
      return;
    }

    setDeletingVoiceId(presetId);
    try {
      const res = await fetch(`/api/voice-library/${presetId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete voice');
      }

      // Remove from familyVoices state
      setFamilyVoices(prev => prev.filter(v => v.id !== presetId && v.voiceId !== presetId));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingVoiceId(null);
    }
  };

  // Audio Preview Handler
  const handleTestVoice = (voice) => {
    if (voice.previewUrl) {
      setPreviewingVoice(voice.previewUrl);
    } else {
      alert('No audio preview sample available for this voice.');
    }
  };

  // Generate Speech Handler
  const handleGenerateVoice = async (voice) => {
    if (!testText.trim()) {
      alert('Please enter text to generate');
      return;
    }

    const targetVoiceId = voice.voiceId || voice.id;
    setGeneratingVoice(targetVoiceId);
    try {
      const response = await fetch('/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: testText,
          voice: targetVoiceId,
          emotion: 'neutral'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedAudio(data);
      setPreviewingVoice(data.url);
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setGeneratingVoice(null);
    }
  };

  const toggleExpanded = (voiceId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [voiceId]: !prev[voiceId]
    }));
  };

  return (
    <div className="voice-browser">
      <header className="browser-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>🎙️ Voice Talent & Family Voice Studio</h1>
            <p>Persistent ElevenLabs cloned voices, local bucket storage, and TTS generation</p>
          </div>
          <button 
            className="clone-family-btn"
            onClick={() => setShowCloneModal(true)}
          >
            ✨ Clone New Family Voice
          </button>
        </div>
      </header>

      {/* Test Text Area */}
      <section className="test-section">
        <h2 style={{ marginTop: 0 }}>💬 Text-to-Speech Studio Test Line</h2>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to generate speech with any voice..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontFamily: 'inherit',
            fontSize: '14px',
            marginBottom: '8px'
          }}
        />
        <small style={{ color: '#64748b' }}>
          {testText.length} characters • Works with all family cloned voices and ElevenLabs presets
        </small>
      </section>

      {/* ==================================================================== */}
      {/* 👨‍👩‍👧‍👦 DEDICATED FAMILY & CLONED VOICE LIBRARY (ALWAYS VISIBLE)        */}
      {/* ==================================================================== */}
      <section className="family-library-section">
        <div className="family-library-header">
          <div>
            <h2>👨‍👩‍👧‍👦 Family & Cloned Voice Library</h2>
            <p className="section-subtitle">Your saved family member voices stored in persistent app & bucket storage</p>
          </div>
          <span className="family-voice-count-badge">
            {familyVoices.length} Saved {familyVoices.length === 1 ? 'Voice' : 'Voices'}
          </span>
        </div>

        {familyVoices.length === 0 ? (
          <div className="empty-family-state">
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎙️</div>
            <h3>No Family Voices Cloned Yet</h3>
            <p>Clone a family member's voice (Mom, Dad, Children, or Friends) by uploading audio samples.</p>
            <button 
              className="clone-family-btn"
              onClick={() => setShowCloneModal(true)}
              style={{ marginTop: '15px' }}
            >
              + Clone Your First Family Voice
            </button>
          </div>
        ) : (
          <div className="voices-grid">
            {familyVoices.map(voice => (
              <div key={voice.id || voice.voiceId} className="voice-card family-card">
                <div className="card-header">
                  <div>
                    <span className="badge-family">✨ Family Voice</span>
                    <h3 style={{ marginTop: '4px' }}>{voice.name}</h3>
                  </div>
                  {voice.relationship && (
                    <span className="relationship-tag">{voice.relationship}</span>
                  )}
                </div>

                <div className="card-description">
                  {voice.description || `${voice.name}'s custom cloned voice sample saved in app storage.`}
                </div>

                <div className="card-labels">
                  <span className="label gender">{voice.gender || voice.labels?.gender || 'Custom'}</span>
                  <span className="label accent">{voice.accent || voice.labels?.accent || 'American'}</span>
                  {voice.style && <span className="label style">{voice.style}</span>}
                </div>

                <div className="card-actions">
                  <button
                    className="test-voice-btn preview-btn"
                    onClick={() => handleTestVoice(voice)}
                    disabled={!voice.previewUrl}
                    title="Listen to audio sample"
                  >
                    ▶ Sample
                  </button>

                  <button
                    className="test-voice-btn generate-btn"
                    onClick={() => handleGenerateVoice(voice)}
                    disabled={generatingVoice === (voice.voiceId || voice.id) || !testText.trim()}
                    title="Generate speech with this voice"
                  >
                    {generatingVoice === (voice.voiceId || voice.id) ? '⏳ Generating...' : '🎙️ Speech'}
                  </button>

                  <button
                    className="delete-voice-btn"
                    onClick={() => handleDeleteVoice(voice.id || voice.voiceId, voice.name)}
                    disabled={deletingVoiceId === (voice.id || voice.voiceId)}
                    title="Delete voice from app & storage"
                  >
                    {deletingVoiceId === (voice.id || voice.voiceId) ? '⏳' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 📂 COLLAPSIBLE ELEVENLABS CATALOG (38+ VOICES)                      */}
      {/* ==================================================================== */}
      <section className="elevenlabs-catalog-section">
        <div className="catalog-accordion-header" onClick={() => setIsElevenLabsExpanded(!isElevenLabsExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🌐</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px' }}>
                ElevenLabs Preset Catalog ({elevenLabsVoices.length} Voices Available)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Standard premade ElevenLabs voices available for instant speech synthesis
              </p>
            </div>
          </div>

          <button className="accordion-toggle-btn">
            {isElevenLabsExpanded ? '▲ Collapse Voices' : `▼ View All (${elevenLabsVoices.length} Voices)`}
          </button>
        </div>

        {isElevenLabsExpanded && (
          <div className="catalog-content" style={{ marginTop: '20px' }}>
            {/* Filters */}
            <div className="filters-section">
              <h2>🎛️ Filter ElevenLabs Catalog</h2>
              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="gender-filter">GENDER</label>
                  <select
                    id="gender-filter"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="filter-select"
                  >
                    {filterOptions.genders.map(g => (
                      <option key={g} value={g}>
                        {g === 'all' ? 'All Genders' : g.charAt(0).toUpperCase() + g.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="accent-filter">ACCENT</label>
                  <select
                    id="accent-filter"
                    value={accentFilter}
                    onChange={(e) => setAccentFilter(e.target.value)}
                    className="filter-select"
                  >
                    {filterOptions.accents.map(a => (
                      <option key={a} value={a}>
                        {a === 'all' ? 'All Accents' : a.charAt(0).toUpperCase() + a.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="style-filter">STYLE</label>
                  <select
                    id="style-filter"
                    value={styleFilter}
                    onChange={(e) => setStyleFilter(e.target.value)}
                    className="filter-select"
                  >
                    {filterOptions.styles.map(s => (
                      <option key={s} value={s}>
                        {s === 'all' ? 'All Styles' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="search-filter">SEARCH</label>
                  <input
                    id="search-filter"
                    type="text"
                    placeholder="Search voice names..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="filter-stats">
                Showing {filteredElevenLabsVoices.length} of {elevenLabsVoices.length} ElevenLabs voices
              </div>
            </div>

            {/* Voices Grid */}
            {loading ? (
              <div className="loading-state">Loading ElevenLabs voices...</div>
            ) : filteredElevenLabsVoices.length === 0 ? (
              <div className="empty-state">
                <p>No ElevenLabs voices match your filter criteria</p>
                <button 
                  className="reset-filters-btn"
                  onClick={() => {
                    setGenderFilter('all');
                    setAccentFilter('all');
                    setStyleFilter('all');
                    setSearchFilter('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="voices-grid">
                {filteredElevenLabsVoices.map(voice => {
                  const isExpanded = expandedDescriptions[voice.id];
                  const hasMoreText = voice.description && voice.description.length > 80;

                  return (
                    <div key={voice.id} className="voice-card">
                      <div className="card-header">
                        <h3>{voice.name}</h3>
                      </div>

                      <div className={`card-description ${isExpanded ? 'expanded' : ''}`}>
                        {voice.description || 'Professional ElevenLabs preset voice'}
                      </div>

                      {hasMoreText && (
                        <button 
                          className="more-btn"
                          onClick={() => toggleExpanded(voice.id)}
                        >
                          {isExpanded ? 'Less' : 'More'}
                        </button>
                      )}

                      <div className="card-labels">
                        {voice.labels?.gender && (
                          <span className="label gender">{voice.labels.gender}</span>
                        )}
                        {voice.labels?.accent && (
                          <span className="label accent">{voice.labels.accent}</span>
                        )}
                        {voice.labels?.descriptive && (
                          <span className="label style">{voice.labels.descriptive}</span>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="test-voice-btn preview-btn"
                          onClick={() => handleTestVoice(voice)}
                          disabled={!voice.previewUrl}
                        >
                          ▶ Preview
                        </button>
                        <button
                          className="test-voice-btn generate-btn"
                          onClick={() => handleGenerateVoice(voice)}
                          disabled={generatingVoice === voice.id || !testText.trim()}
                        >
                          {generatingVoice === voice.id ? '⏳ Generating...' : '🎙️ Generate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 🚀 MODAL: CLONE NEW FAMILY VOICE                                     */}
      {/* ==================================================================== */}
      {showCloneModal && (
        <div className="clone-modal-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="clone-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowCloneModal(false)}
            >
              ✕
            </button>

            <h2>✨ Clone New Family Member Voice</h2>
            <p className="modal-subtitle">Upload audio recordings of your family member to create a persistent cloned voice in your app and bucket storage.</p>

            {cloneError && <div className="modal-error">{cloneError}</div>}

            <form onSubmit={handleCloneSubmit}>
              <div className="form-group">
                <label>Voice Name / Person *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Mom (Sarah), Dad, Uncle Joe, Grandma"
                  value={cloneForm.name}
                  onChange={handleCloneFormChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Relationship / Category</label>
                  <select
                    name="relationship"
                    value={cloneForm.relationship}
                    onChange={handleCloneFormChange}
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Child">Child</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Friend / Custom">Friend / Custom</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={cloneForm.gender}
                    onChange={handleCloneFormChange}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Accent</label>
                  <input
                    type="text"
                    name="accent"
                    placeholder="e.g., American, British, New York"
                    value={cloneForm.accent}
                    onChange={handleCloneFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Speaking Style</label>
                  <input
                    type="text"
                    name="style"
                    placeholder="e.g., Warm & Caring, Storyteller"
                    value={cloneForm.style}
                    onChange={handleCloneFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea
                  name="description"
                  placeholder="Optional details about this voice recording..."
                  value={cloneForm.description}
                  onChange={handleCloneFormChange}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>🎙️ Audio Sample File (MP3, WAV, M4A) *</label>
                <input
                  type="file"
                  name="sampleFile"
                  accept="audio/*"
                  onChange={handleCloneFormChange}
                  style={{ padding: '8px', border: '1px dashed #0052cc', borderRadius: '4px', background: '#f8fafc' }}
                />
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Clear voice recordings (1-5 minutes) produce the highest quality cloned voices.
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={cloneLoading}
                >
                  {cloneLoading ? '⏳ Saving & Cloning Voice...' : '✨ Clone & Save Voice'}
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowCloneModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewingVoice && (
        <div className="preview-modal" onClick={() => setPreviewingVoice(null)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setPreviewingVoice(null)}
            >
              ✕
            </button>
            <h3>{generatedAudio ? '🎙️ Generated Speech Audio' : '▶ Voice Sample Preview'}</h3>
            <audio controls autoPlay className="preview-audio">
              <source src={previewingVoice} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            {generatedAudio && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <a 
                  href={generatedAudio.url} 
                  download={generatedAudio.filename || 'generated-speech.mp3'}
                  className="download-audio-btn"
                >
                  ⬇ Download Audio File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
