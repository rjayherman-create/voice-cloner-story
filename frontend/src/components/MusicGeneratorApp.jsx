import React, { useState, useEffect } from 'react';
import './MusicGeneratorApp.css';

export default function MusicGeneratorApp() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState('ambient');
  const [service, setService] = useState('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [styles, setStyles] = useState([]);
  const [error, setError] = useState('');
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/music/styles');
      if (response.ok) {
        const data = await response.json();
        setStyles(data);
      }
    } catch (err) {
      console.error('Failed to fetch styles:', err);
    }
  };

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      setError('Please enter a music description');
      return;
    }

    setError('');
    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 25, 90));
      }, 800);

      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          duration: parseInt(duration),
          genre,
          service
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate music');
      }

      const data = await response.json();
      setProgress(100);

      const newTrack = {
        id: data.trackId,
        name: prompt.substring(0, 50),
        url: data.audioUrl,
        duration,
        genre,
        service: data.service,
        prompt,
        createdAt: new Date().toLocaleString(),
        status: data.status
      };

      setGeneratedTracks([newTrack, ...generatedTracks]);
      setPrompt('');
      setTimeout(() => setIsGenerating(false), 1000);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = (track) => {
    if (track.url) {
      const a = document.createElement('a');
      a.href = track.url;
      a.download = `${track.name}.mp3`;
      a.click();
      setDownloadCount(downloadCount + 1);
    }
  };

  const handleDeleteTrack = (trackId) => {
    setGeneratedTracks(generatedTracks.filter(t => t.id !== trackId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isGenerating && prompt.trim()) {
      handleGenerateMusic();
    }
  };

  return (
    <div className="music-generator-app">
      {/* Header */}
      <div className="mga-header">
        <div className="mga-header-content">
          <h1>🎵 AI Music Generator</h1>
          <p>Create unlimited royalty-free background music for your projects</p>
        </div>
        <div className="mga-stats">
          <div className="stat">
            <span className="stat-value">{generatedTracks.length}</span>
            <span className="stat-label">Generated</span>
          </div>
          <div className="stat">
            <span className="stat-value">{downloadCount}</span>
            <span className="stat-label">Downloaded</span>
          </div>
        </div>
      </div>

      <div className="mga-container">
        {/* Left Panel - Generator */}
        <div className="mga-generator-panel">
          <div className="mga-card">
            <h2>Create New Music</h2>

            {/* Prompt Input */}
            <div className="mga-section">
              <label>📝 Music Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 'Upbeat electronic dance music with strong bass and synth melody', 'Calm lo-fi hip hop with rain sounds'"
                className="mga-textarea"
                disabled={isGenerating}
                rows="5"
              />
              <div className="prompt-hint">
                ✓ Be specific about tempo, instruments, mood, and any background sounds
              </div>
            </div>

            {/* Settings */}
            <div className="mga-settings">
              <div className="setting-group">
                <label>⏱️ Duration</label>
                <div className="duration-input">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isGenerating}
                    className="duration-slider"
                  />
                  <span className="duration-display">{duration}s</span>
                </div>
              </div>

              <div className="setting-group">
                <label>🎼 Genre/Style</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={isGenerating}
                  className="mga-select"
                >
                  {styles.map(style => (
                    <option key={style.id} value={style.id}>
                      {style.label} - {style.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label>🤖 AI Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  disabled={isGenerating}
                  className="mga-select"
                >
                  <option value="auto">Auto (Best Available)</option>
                  <option value="suno">Suno AI</option>
                  <option value="unetic">Unetic</option>
                  <option value="audiocraft">AudioCraft (Meta)</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mga-error">
                ⚠️ {error}
              </div>
            )}

            {/* Generate Button */}
            <div className="mga-action">
              {!isGenerating ? (
                <button
                  onClick={handleGenerateMusic}
                  disabled={!prompt.trim()}
                  className="mga-btn-generate"
                >
                  🎵 Generate Music
                </button>
              ) : (
                <div className="mga-generating">
                  <div className="spinner"></div>
                  <div className="generating-info">
                    <p>Generating your music...</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-percent">{Math.round(progress)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mga-tips">
              <h4>💡 Tips for Best Results:</h4>
              <ul>
                <li>✓ Be specific about tempo (fast, slow, moderate, 120 BPM)</li>
                <li>✓ Mention key instruments (piano, guitar, drums, synth, strings)</li>
                <li>✓ Describe the mood (happy, sad, energetic, calm, mysterious)</li>
                <li>✓ Include background sounds if desired (rain, birds, waves)</li>
                <li>✓ Specify era or style (80s synthwave, modern trap, classical)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Library */}
        <div className="mga-library-panel">
          <div className="mga-card">
            <h2>Music Library ({generatedTracks.length})</h2>

            {generatedTracks.length === 0 ? (
              <div className="mga-empty-state">
                <p>🎵</p>
                <p>No music generated yet</p>
                <p>Create your first track!</p>
              </div>
            ) : (
              <div className="mga-tracks-grid">
                {generatedTracks.map((track, idx) => (
                  <div key={idx} className="mga-track-card">
                    <div className="track-card-header">
                      <h4>{track.name}</h4>
                      <span className={`track-badge ${track.status}`}>
                        {track.status === 'complete' || track.url ? '✓' : '⏳'}
                      </span>
                    </div>

                    <div className="track-meta">
                      <span>📊 {track.duration}s</span>
                      <span>🎼 {track.genre}</span>
                      <span>🤖 {track.service}</span>
                    </div>

                    <div className="track-prompt">
                      <strong>Prompt:</strong>
                      <p>{track.prompt}</p>
                    </div>

                    {track.url && (
                      <div className="track-player">
                        <audio controls style={{ width: '100%' }}>
                          <source src={track.url} type="audio/mpeg" />
                          Your browser does not support audio.
                        </audio>
                      </div>
                    )}

                    <div className="track-timestamp">
                      {track.createdAt}
                    </div>

                    <div className="track-actions">
                      <button
                        onClick={() => handleDownload(track)}
                        disabled={!track.url}
                        className="btn-download"
                        title="Download MP3"
                      >
                        ⬇️ Download
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="btn-delete"
                        title="Delete track"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
