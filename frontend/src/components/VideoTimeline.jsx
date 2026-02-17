import React, { useState, useRef } from 'react';
import './VideoTimeline.css';

const VideoTimeline = ({
  videoProject,
  currentFrame,
  onFrameChange,
  onAddAnimation,
  onAddVoiceOver,
  onAddMusic,
  onAddSFX,
  onAddText,
  onTimelineUpdate,
  selectedTrack,
  zoomLevel
}) => {
  const [showTrackOptions, setShowTrackOptions] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleAddTrackItem = (type) => {
    const trackData = {
      name: `${type}-${Date.now()}`,
      type: type,
      duration: 5,
      timestamp: Date.now()
    };

    switch (type) {
      case 'animation':
        onAddAnimation(trackData);
        break;
      case 'voiceover':
        onAddVoiceOver(trackData);
        break;
      case 'music':
        onAddMusic(trackData);
        break;
      case 'sfx':
        onAddSFX(trackData, currentFrame);
        break;
      case 'text':
        onAddText(trackData, currentFrame, 120);
        break;
      default:
        break;
    }
    setShowTrackOptions(null);
  };

  const totalFrames = videoProject.duration * videoProject.fps;
  const pixelsPerFrame = (zoomLevel / 100) * 0.5;
  const timelineWidth = totalFrames * pixelsPerFrame;

  return (
    <div className="video-timeline">
      <div className="timeline-header">
        <h3>⏱️ Video Timeline</h3>
        <div className="timeline-controls">
          <button 
            onClick={() => setShowTrackOptions(showTrackOptions === 'animation' ? null : 'animation')}
            className="btn-add-track"
          >
            + Add Track
          </button>

          {showTrackOptions && (
            <div className="track-menu">
              <button onClick={() => handleAddTrackItem('animation')}>🎬 Animation</button>
              <button onClick={() => handleAddTrackItem('voiceover')}>🎤 Voice-Over</button>
              <button onClick={() => handleAddTrackItem('music')}>🎵 Music</button>
              <button onClick={() => handleAddTrackItem('sfx')}>🔊 Sound Effect</button>
              <button onClick={() => handleAddTrackItem('text')}>📝 Text</button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Tracks */}
      <div className="audio-mixer-section">
        <h4>🔊 Audio Tracks</h4>
        <div className="audio-tracks">
          {/* Voice-Over Track */}
          <div className="track-row">
            <div className="track-header">
              <span className="track-label">🎤 Voice-Over</span>
              <div className="volume-control">
                <input type="range" min="0" max="100" defaultValue="80" />
              </div>
            </div>
            <div className="track-content">
              {videoProject.tracks.voiceover && (
                <div 
                  className="track-item"
                  style={{ width: `${(videoProject.tracks.voiceover.duration / videoProject.duration) * 100}%` }}
                >
                  <span>{videoProject.tracks.voiceover.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Music Track */}
          <div className="track-row">
            <div className="track-header">
              <span className="track-label">🎵 Music</span>
              <div className="volume-control">
                <input type="range" min="0" max="100" defaultValue="60" />
              </div>
            </div>
            <div className="track-content">
              {videoProject.tracks.music && (
                <div 
                  className="track-item music"
                  style={{ width: `${(videoProject.tracks.music.duration / videoProject.duration) * 100}%` }}
                >
                  <span>{videoProject.tracks.music.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* SFX Track */}
          <div className="track-row">
            <div className="track-header">
              <span className="track-label">🔊 Effects</span>
            </div>
            <div className="track-content">
              {videoProject.tracks.sfx && videoProject.tracks.sfx.map((sfx, idx) => (
                <div 
                  key={idx}
                  className="track-item sfx"
                  style={{ 
                    left: `${(sfx.startFrame / totalFrames) * 100}%`,
                    width: `${(sfx.duration * videoProject.fps / totalFrames) * 100}%`
                  }}
                >
                  <span className="sfx-label">Effect</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="timeline-tracks" style={{ width: timelineWidth }}>
        {/* Animation Track */}
        <div className="timeline-track">
          <div className="track-label">🎬 Animation</div>
          <div className="track-content">
            {videoProject.tracks.animation && (
              <div
                className="timeline-item animation"
                style={{
                  left: '0px',
                  width: `${(videoProject.tracks.animation.duration / videoProject.duration) * 100}%`
                }}
              >
                <span>{videoProject.tracks.animation.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Voice-Over Track */}
        <div className="timeline-track">
          <div className="track-label">🎤 Voice</div>
          <div className="track-content">
            {videoProject.tracks.voiceover && (
              <div
                className="timeline-item voiceover"
                style={{
                  width: `${(videoProject.tracks.voiceover.duration / videoProject.duration) * 100}%`
                }}
              >
              </div>
            )}
          </div>
        </div>

        {/* Music Track */}
        <div className="timeline-track">
          <div className="track-label">🎵 Music</div>
          <div className="track-content">
            {videoProject.tracks.music && (
              <div
                className="timeline-item music"
                style={{
                  width: `${(videoProject.tracks.music.duration / videoProject.duration) * 100}%`
                }}
              >
              </div>
            )}
          </div>
        </div>

        {/* Text Track */}
        <div className="timeline-track">
          <div className="track-label">📝 Text</div>
          <div className="track-content">
            {videoProject.tracks.text && videoProject.tracks.text.map((text, idx) => (
              <div
                key={idx}
                className="timeline-item text"
                style={{
                  left: `${(text.startFrame / totalFrames) * 100}%`,
                  width: `${((text.endFrame - text.startFrame) / totalFrames) * 100}%`
                }}
              >
                <span>📝</span>
              </div>
            ))}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="playhead"
          style={{ left: `${currentFrame * pixelsPerFrame}px` }}
        />
      </div>

      {/* Timeline Scrubber */}
      <div className="timeline-scrubber-container">
        <input
          type="range"
          min="0"
          max={totalFrames - 1}
          value={currentFrame}
          onChange={(e) => onFrameChange(parseInt(e.target.value))}
          className="timeline-scrubber"
        />
      </div>

      {/* Timeline Info */}
      <div className="timeline-info">
        <span className="info-item">
          Frame: <strong>{currentFrame}</strong> / {totalFrames}
        </span>
        <span className="info-item">
          Tracks: <strong>{
            [
              videoProject.tracks.animation ? 1 : 0,
              videoProject.tracks.voiceover ? 1 : 0,
              videoProject.tracks.music ? 1 : 0,
              videoProject.tracks.sfx?.length || 0,
              videoProject.tracks.text?.length || 0
            ].reduce((a, b) => a + b, 0)
          }</strong>
        </span>
        <span className="info-item">
          Zoom: <strong>{zoomLevel}%</strong>
        </span>
      </div>
    </div>
  );
};

export default VideoTimeline;
