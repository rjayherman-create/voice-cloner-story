import React, { useState, useEffect } from 'react';
import './VoiceLibrary.css';

export default function VoiceLibrary({ selectedVoice, onSelectVoice }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadVoiceLibrary();
  }, []);

  const loadVoiceLibrary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice-library');
      const data = await response.json();
      setPresets(data);
    } catch (err) {
      console.error('Failed to load voice library:', err);
      setError('Failed to load voice library');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !selectedVoice) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/voice-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
          emotion: selectedVoice.emotion || 'neutral',
          category: selectedVoice.category || 'professional',
          description: formData.description
        })
      });

      if (!response.ok) throw new Error('Failed to save preset');

      setFormData({ name: '', description: '' });
      setShowForm(false);
      await loadVoiceLibrary();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm('Delete this voice preset?')) return;

    try {
      const response = await fetch(`/api/voice-library/${presetId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete preset');

      await loadVoiceLibrary();
    } catch (err) {
      setError('Failed to delete preset');
    }
  };

  const handleUsePreset = async (preset) => {
    try {
      await fetch(`/api/voice-library/${preset.id}/use`, {
        method: 'POST'
      });
      
      onSelectVoice(preset);
      await loadVoiceLibrary();
    } catch (err) {
      console.error('Failed to use preset:', err);
    }
  };

  return (
    <div className="voice-library-panel">
      <div className="library-header">
        <h3>🎤 Voice Library</h3>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕' : '+ Save Voice'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form className="save-form" onSubmit={handleSavePreset}>
          <input
            type="text"
            placeholder="Preset name (e.g., 'Deep Narrator')"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-input"
            rows={2}
          />
          <button type="submit" className="save-btn">Save Preset</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : presets.length === 0 ? (
        <div className="empty-state">
          <p>No saved voices yet</p>
          <p className="hint">Save your favorite voices to use them quickly!</p>
        </div>
      ) : (
        <div className="presets-list">
          {presets
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
            .map(preset => (
              <div key={preset.id} className="preset-card">
                <div className="preset-info">
                  <p className="preset-name">{preset.name}</p>
                  <p className="preset-voice">{preset.voiceName}</p>
                  {preset.description && (
                    <p className="preset-desc">{preset.description}</p>
                  )}
                  <div className="preset-meta">
                    <span className="emotion-badge">{preset.emotion}</span>
                    <span className="usage">
                      {preset.usageCount || 0} uses
                    </span>
                  </div>
                </div>
                <div className="preset-actions">
                  <button
                    className="use-btn"
                    onClick={() => handleUsePreset(preset)}
                  >
                    Use
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePreset(preset.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
