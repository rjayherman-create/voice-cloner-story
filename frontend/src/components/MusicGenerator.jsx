import React, { useState, useEffect } from 'react';
import './MusicGenerator.css';

const MusicGenerator = ({ onAddMusic, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [genre, setGenre] = useState('ambient');
  const [service, setService] = useState('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [styles, setStyles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/music/styles');
      const data = await response.json();
      setStyles(data);
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
      // Simulate progress
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

      // Reset form
      setPrompt('');
      setTimeout(() => setIsGenerating(false), 1000);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleAddToTimeline = (track) => {
    onAddMusic({
      id: track.id,
      name: track.name,
      url: track.url,
      duration: track.duration,
      type: 'generated-music',
      startTime: 0
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isGenerating && prompt.trim()) {
      handleGenerateMusic();
    }
  };

  return (
    <div className="music-generator-overlay">
      <div className="music-generator">
        <div className="mg-header">
          <h2>🎵 AI Music Generator</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Generator Form */}
        <div className="mg-content">
          <div className="mg-section">
            <h3>Describe Your Music</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'Upbeat electronic dance music with strong bass and synth melody', 'Calm lo-fi hip hop with rain sounds'"
              className="prompt-input"
              disabled={isGenerating}
            />
            <div className="prompt-hint">
              Be specific! Include tempo, instruments, mood, and any specific sounds you want.
            </div>
          </div>

          {/* Settings */}
          <div className="mg-settings">
            <div className="setting-group">
              <label>Duration (seconds)</label>
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

            <div className="setting-group">
              <label>Genre/Style</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={isGenerating}
                className="genre-select"
              >
                {styles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.label} - {style.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <label>Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={isGenerating}
                className="service-select"
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
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}
          <div className="mg-action">
            {!isGenerating ? (
              <button
                onClick={handleGenerateMusic}
                disabled={!prompt.trim()}
                className="generate-btn"
              >
                🎵 Generate Music
              </button>
            ) : (
              <div className="generating-state">
                <div className="spinner"></div>
                <div className="progress-info">
                  <p>Generating your music...</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="progress-percent">{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Generated Tracks */}
          {generatedTracks.length > 0 && (
            <div className="mg-tracks">
              <h3>Generated Tracks ({generatedTracks.length})</h3>
              <div className="tracks-list">
                {generatedTracks.map((track, idx) => (
                  <div key={idx} className="track-item">
                    <div className="track-header">
                      <span className="track-name">{track.name}</span>
                      <span className={`track-status ${track.status}`}>
                        {track.status === 'complete' ? '✓ Ready' : '⏳ ' + track.status}
                      </span>
                    </div>
                    <div className="track-details">
                      <span className="detail">Duration: {track.duration}s</span>
                      <span className="detail">Genre: {track.genre}</span>
                      <span className="detail">Service: {track.service}</span>
                    </div>
                    <div className="track-prompt">
                      <strong>Prompt:</strong> {track.prompt}
                    </div>
                    {track.url && (
                      <div className="track-audio">
                        <audio controls style={{ width: '100%' }}>
                          <source src={track.url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    <div className="track-actions">
                      <button
                        onClick={() => handleAddToTimeline(track)}
                        disabled={!track.url}
                        className="add-to-timeline-btn"
                      >
                        ➕ Add to Timeline
                      </button>
                      <button
                        onClick={() => {
                          if (track.url) {
                            const a = document.createElement('a');
                            a.href = track.url;
                            a.download = `${track.name}.mp3`;
                            a.click();
                          }
                        }}
                        disabled={!track.url}
                        className="download-btn"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="mg-tips">
            <h4>💡 Tips for Best Results:</h4>
            <ul>
              <li>Be specific about tempo (fast, slow, moderate)</li>
              <li>Mention key instruments (piano, guitar, drums, synth, etc.)</li>
              <li>Describe the mood (happy, sad, energetic, calm, mysterious)</li>
              <li>Include any background sounds (rain, birds, traffic)</li>
              <li>Specify the era or style (80s synthwave, modern trap, classical)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
