import React, { useState } from 'react';
import './VideoStudio.css';

export default function VideoStudio() {
  const [projectName, setProjectName] = useState('Untitled Video');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const duration = 180; // 3 minutes

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(0).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="video-studio-container">
      {/* Header */}
      <div className="vs-header">
        <h1>🎥 Video Studio</h1>
        <input 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="vs-project-name"
        />
        <div className="vs-time">{formatTime(currentTime)}</div>
      </div>

      {/* Controls */}
      <div className="vs-controls">
        <button onClick={() => setCurrentTime(0)} className="vs-btn">⏮</button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className="vs-btn"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => setCurrentTime(duration)} className="vs-btn">⏭</button>
        
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="vs-timeline-slider"
        />

        <button className="vs-btn">📁</button>
        <button className="vs-btn">💾</button>
        <button className="vs-btn">📊</button>
      </div>

      {/* Main Content */}
      <div className="vs-main">
        {/* Preview */}
        <div className="vs-preview">
          <div className="vs-preview-canvas">
            <div className="vs-canvas-content">
              <h2>Video Preview</h2>
              <p>1920 × 1080</p>
              <p style={{fontSize: '3rem', marginTop: '20px'}}>🎬</p>
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div className="vs-tracks">
          <h3>Tracks</h3>
          
          <div className="vs-track">
            <div className="vs-track-label">🎬 Animation</div>
            <div className="vs-track-bar">
              <div className="vs-track-item" style={{width: '100%'}}>
                <span>Animation</span>
              </div>
            </div>
          </div>

          <div className="vs-track">
            <div className="vs-track-label">🎤 Voice</div>
            <div className="vs-track-bar">
              <div className="vs-track-placeholder">Empty</div>
            </div>
          </div>

          <div className="vs-track">
            <div className="vs-track-label">🎵 Music</div>
            <div className="vs-track-bar">
              <div className="vs-track-placeholder">Empty</div>
            </div>
          </div>

          <div className="vs-track">
            <div className="vs-track-label">🔊 Effects</div>
            <div className="vs-track-bar">
              <div className="vs-track-placeholder">Empty</div>
            </div>
          </div>

          <div className="vs-track">
            <div className="vs-track-label">📝 Text</div>
            <div className="vs-track-bar">
              <div className="vs-track-placeholder">Empty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="vs-timeline">
        <div className="vs-timeline-labels">
          <div>00:00</div>
          <div>01:00</div>
          <div>02:00</div>
          <div>03:00</div>
        </div>
        <div className="vs-timeline-bar">
          <div className="vs-timeline-progress" style={{width: `${(currentTime / duration) * 100}%`}}></div>
        </div>
      </div>

      {/* Status */}
      <div className="vs-status">
        <span>Frame: {Math.floor(currentTime * 30)}</span>
        <span>Duration: {duration}s</span>
        <span>Status: Ready ✓</span>
      </div>
    </div>
  );
}
