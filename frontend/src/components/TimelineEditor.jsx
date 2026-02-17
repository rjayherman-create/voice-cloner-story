import React, { useState, useRef, useEffect } from 'react';
import './TimelineEditor.css';

const TimelineEditor = ({ project, currentFrame, onFrameChange, onAddKeyframe, onSetVoiceOver, selectedLayer, zoomLevel }) => {
  const [voiceTrack, setVoiceTrack] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [waveformData, setWaveformData] = useState(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  // Handle voice-over upload
  const handleVoiceOverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !audioContext) return;

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    setVoiceTrack({
      name: file.name,
      duration: audioBuffer.duration,
      buffer: audioBuffer
    });

    // Generate waveform
    generateWaveform(audioBuffer);
    onSetVoiceOver({ name: file.name, duration: audioBuffer.duration });
  };

  const generateWaveform = (audioBuffer) => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 2048;
    const blockSize = Math.floor(rawData.length / samples);
    const waveform = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      waveform.push(sum / blockSize);
    }

    setWaveformData(waveform);
  };

  // Draw waveform
  useEffect(() => {
    if (!waveformData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const y = height / 2 - waveformData[i] * (height / 2) * 0.8;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw playhead
    if (voiceTrack) {
      const playheadX = (currentFrame / (project.duration * project.fps)) * width;
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [waveformData, currentFrame, voiceTrack, project]);

  const handleKeyframeClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickFrame = Math.round((x / rect.width) * (project.duration * project.fps));

    onAddKeyframe(selectedLayer, clickFrame, {
      assetIndex: 0,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1
    });
  };

  const totalFrames = project.duration * project.fps;
  const pixelsPerFrame = (zoomLevel / 100) * 0.5;
  const timelineWidth = totalFrames * pixelsPerFrame;

  // Get keyframes for current layer
  const keyframes = project.timeline[selectedLayer] || [];

  return (
    <div className="timeline-editor">
      <div className="timeline-header">
        <h3>⏱️ Timeline Editor</h3>
        <div className="voice-section">
          <label>
            🎤 Add Voice-Over:
            <input
              type="file"
              accept="audio/*"
              onChange={handleVoiceOverUpload}
              style={{ display: 'none' }}
            />
            <span className="file-input-btn">+ Upload Audio</span>
          </label>
          {voiceTrack && (
            <div className="voice-info">
              <span>{voiceTrack.name}</span>
              <span>{voiceTrack.duration.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Waveform Display */}
      {voiceTrack && (
        <div className="waveform-container">
          <canvas
            ref={canvasRef}
            width={1000}
            height={80}
            className="waveform-canvas"
            onClick={handleKeyframeClick}
            title="Click to add keyframes"
          />
        </div>
      )}

      {/* Timeline Tracks */}
      <div className="timeline-tracks" style={{ width: timelineWidth }}>
        {/* Background Track */}
        <div className="timeline-track">
          <div className="track-label">Background</div>
          <div className="track-content">
            {project.timeline.background.map((kf, idx) => (
              <div
                key={idx}
                className="keyframe-marker"
                style={{ left: `${kf.frame * pixelsPerFrame}px` }}
                title={`Frame ${kf.frame}`}
              >
                🖼️
              </div>
            ))}
          </div>
        </div>

        {/* Character Track */}
        <div className="timeline-track">
          <div className="track-label">Character</div>
          <div className="track-content">
            {project.timeline.character.map((kf, idx) => (
              <div
                key={idx}
                className="keyframe-marker"
                style={{ left: `${kf.frame * pixelsPerFrame}px` }}
                title={`Frame ${kf.frame}`}
              >
                🧑
              </div>
            ))}
          </div>
        </div>

        {/* Effects Track */}
        <div className="timeline-track">
          <div className="track-label">Effects</div>
          <div className="track-content">
            {project.timeline.effects.map((kf, idx) => (
              <div
                key={idx}
                className="keyframe-marker effect-marker"
                style={{ left: `${kf.frame * pixelsPerFrame}px` }}
                title={`${kf.type} at Frame ${kf.frame}`}
              >
                ✨
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
          style={{ width: '100%' }}
        />
      </div>

      {/* Keyframe Controls */}
      <div className="keyframe-controls">
        <button onClick={() => {
          onAddKeyframe(selectedLayer, currentFrame, {
            assetIndex: 0,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 1
          });
        }} className="btn-add-keyframe">
          + Add Keyframe at {currentFrame}
        </button>
        <span className="info-text">
          Click on waveform to add keyframes | {selectedLayer} layer selected
        </span>
      </div>
    </div>
  );
};

export default TimelineEditor;
