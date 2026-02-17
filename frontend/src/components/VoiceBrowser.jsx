import React, { useState, useEffect } from 'react';
import './VoiceBrowser.css';

export default function VoiceBrowser({ onSelectVoice }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [expandedVoices, setExpandedVoices] = useState({});
  
  // Filters
  const [genderFilter, setGenderFilter] = useState('all');
  const [accentFilter, setAccentFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Available filter options
  const [genders, setGenders] = useState(['all']);
  const [accents, setAccents] = useState(['all']);
  const [styles, setStyles] = useState(['all']);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voiceover/voices');
      const data = await response.json();
      
      setVoices(data);

      // Extract unique filter options from voice labels
      const genderSet = new Set(['all']);
      const accentSet = new Set(['all']);
      const styleSet = new Set(['all']);

      data.forEach(voice => {
        if (voice.labels) {
          if (voice.labels.gender) genderSet.add(voice.labels.gender);
          if (voice.labels.accent) accentSet.add(voice.labels.accent);
          if (voice.labels.descriptive) styleSet.add(voice.labels.descriptive);
        }
      });

      setGenders(Array.from(genderSet).sort());
      setAccents(Array.from(accentSet).sort());
      setStyles(Array.from(styleSet).sort());
    } catch (err) {
      console.error('Failed to load voices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoices = voices.filter(voice => {
    // Gender filter
    if (genderFilter !== 'all' && voice.labels?.gender !== genderFilter) {
      return false;
    }

    // Accent filter
    if (accentFilter !== 'all' && voice.labels?.accent !== accentFilter) {
      return false;
    }

    // Style filter
    if (styleFilter !== 'all' && voice.labels?.descriptive !== styleFilter) {
      return false;
    }

    // Search filter
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

  const handleTestVoice = (voice) => {
    if (voice.previewUrl) {
      setPreviewingVoice(voice.previewUrl);
    }
  };

  const handleSelectVoice = (voice) => {
    if (onSelectVoice) {
      onSelectVoice(voice);
    }
  };

  const toggleExpanded = (voiceId) => {
    setExpandedVoices(prev => ({
      ...prev,
      [voiceId]: !prev[voiceId]
    }));
  };

  // Check if description should show "More" button (if more than 2 lines)
  const shouldShowMoreButton = (description) => {
    if (!description) return false;
    return description.length > 80;
  };

  return (
    <div className="voice-browser">
      <header className="browser-header">
        <h1>🎤 Voice Talent Library</h1>
        <p>Browse and test available voices from ElevenLabs</p>
      </header>

      <section className="filters-section">
        <h2>🎛️ Filters</h2>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="gender-filter">Gender</label>
            <select
              id="gender-filter"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="filter-select"
            >
              {genders.map(g => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Genders' : (g.charAt(0).toUpperCase() + g.slice(1))}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="accent-filter">Accent</label>
            <select
              id="accent-filter"
              value={accentFilter}
              onChange={(e) => setAccentFilter(e.target.value)}
              className="filter-select"
            >
              {accents.map(a => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All Accents' : (a.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="style-filter">Style</label>
            <select
              id="style-filter"
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="filter-select"
            >
              {styles.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Styles' : (s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search voices..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-stats">
          Showing {filteredVoices.length} of {voices.length} voices
        </div>
      </section>

      <section className="voices-section">
        {loading ? (
          <div className="loading-state">Loading voices...</div>
        ) : filteredVoices.length === 0 ? (
          <div className="empty-state">
            <p>No voices match your filters</p>
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
            {filteredVoices.map(voice => {
              const isExpanded = expandedVoices[voice.id];
              const hasMoreText = shouldShowMoreButton(voice.description);
              
              return (
                <div key={voice.id} className="voice-card">
                  <div className="card-header">
                    <h3>{voice.name}</h3>
                  </div>

                  <div className={`card-description ${isExpanded ? 'expanded' : ''}`}>
                    {voice.description}
                  </div>

                  {hasMoreText && !isExpanded && (
                    <button 
                      className="more-btn"
                      onClick={() => toggleExpanded(voice.id)}
                    >
                      More
                    </button>
                  )}

                  {hasMoreText && isExpanded && (
                    <button 
                      className="more-btn"
                      onClick={() => toggleExpanded(voice.id)}
                    >
                      Less
                    </button>
                  )}

                  {!hasMoreText && (
                    <div style={{ height: '20px' }} />
                  )}

                  <div className="card-labels">
                    {voice.labels?.gender && (
                      <span className="label gender">{voice.labels.gender}</span>
                    )}
                    {voice.labels?.age && (
                      <span className="label age">{voice.labels.age}</span>
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
                      className="test-voice-btn"
                      onClick={() => handleTestVoice(voice)}
                      disabled={!voice.previewUrl}
                    >
                      ▶ Test Voice
                    </button>
                    <button
                      className="select-voice-btn"
                      onClick={() => handleSelectVoice(voice)}
                    >
                      ✓ Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
            <h3>Voice Preview</h3>
            <audio controls autoPlay className="preview-audio">
              <source src={previewingVoice} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}
