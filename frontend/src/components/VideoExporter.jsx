import React, { useState } from 'react';
import './VideoExporter.css';

const VideoExporter = ({ videoProject, onExport, onClose }) => {
  const [exportSettings, setExportSettings] = useState({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    bitrate: '5000k',
    audioCodec: 'aac',
    videoCodec: 'h264',
    fps: 30,
    includeSubtitles: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExportStart = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const response = await fetch('/api/video/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: videoProject,
          settings: exportSettings
        })
      });

      if (response.ok) {
        // Simulate progress
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return prev;
            }
            return prev + Math.random() * 20;
          });
        }, 500);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoProject.name}.${exportSettings.format}`;
        a.click();

        setProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          onExport();
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const formatPresets = {
    mp4: { codec: 'h264', audio: 'aac' },
    webm: { codec: 'vp9', audio: 'opus' },
    mov: { codec: 'prores', audio: 'aac' },
    avi: { codec: 'mpeg4', audio: 'libmp3lame' }
  };

  const qualitySettings = {
    low: { crf: 28, bitrate: '1000k' },
    medium: { crf: 23, bitrate: '3000k' },
    high: { crf: 18, bitrate: '5000k' },
    ultra: { crf: 12, bitrate: '8000k' }
  };

  return (
    <div className="exporter-overlay">
      <div className="exporter-modal">
        <div className="exporter-header">
          <h2>💾 Export Video</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {!isExporting ? (
          <div className="exporter-content">
            {/* Format Selection */}
            <div className="section">
              <h3>Format</h3>
              <div className="option-grid">
                {['mp4', 'webm', 'mov', 'avi'].map(format => (
                  <button
                    key={format}
                    className={`format-btn ${exportSettings.format === format ? 'selected' : ''}`}
                    onClick={() => setExportSettings(prev => ({ ...prev, format }))}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="section">
              <h3>Quality</h3>
              <div className="option-grid">
                {['low', 'medium', 'high', 'ultra'].map(quality => (
                  <button
                    key={quality}
                    className={`quality-btn ${exportSettings.quality === quality ? 'selected' : ''}`}
                    onClick={() => setExportSettings(prev => ({ 
                      ...prev, 
                      quality,
                      bitrate: qualitySettings[quality].bitrate
                    }))}
                  >
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="section">
              <h3>Resolution</h3>
              <select 
                value={exportSettings.resolution}
                onChange={(e) => setExportSettings(prev => ({ ...prev, resolution: e.target.value }))}
                className="resolution-select"
              >
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="1440p">1440p (2K)</option>
                <option value="2160p">2160p (4K)</option>
              </select>
            </div>

            {/* Advanced Options */}
            <div className="section">
              <h3>Advanced</h3>
              <div className="advanced-options">
                <label>
                  <span>Video Codec:</span>
                  <select 
                    value={exportSettings.videoCodec}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, videoCodec: e.target.value }))}
                  >
                    <option value="h264">H.264</option>
                    <option value="h265">H.265 (HEVC)</option>
                    <option value="vp9">VP9</option>
                  </select>
                </label>

                <label>
                  <span>Audio Codec:</span>
                  <select 
                    value={exportSettings.audioCodec}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, audioCodec: e.target.value }))}
                  >
                    <option value="aac">AAC</option>
                    <option value="mp3">MP3</option>
                    <option value="opus">Opus</option>
                  </select>
                </label>

                <label>
                  <span>Frame Rate:</span>
                  <select 
                    value={exportSettings.fps}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                  >
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </label>

                <label className="checkbox">
                  <input 
                    type="checkbox"
                    checked={exportSettings.includeSubtitles}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, includeSubtitles: e.target.checked }))}
                  />
                  Include Subtitles/Captions
                </label>
              </div>
            </div>

            {/* Export Info */}
            <div className="export-info">
              <h4>📊 Export Details</h4>
              <ul>
                <li>Format: <strong>{exportSettings.format.toUpperCase()}</strong></li>
                <li>Resolution: <strong>{exportSettings.resolution}</strong></li>
                <li>Quality: <strong>{exportSettings.quality}</strong></li>
                <li>Bitrate: <strong>{exportSettings.bitrate}</strong></li>
                <li>Duration: <strong>{videoProject.duration}s</strong></li>
                <li>Estimated Size: <strong>~{Math.round((parseInt(exportSettings.bitrate) * videoProject.duration) / (8 * 1024))} MB</strong></li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={onClose} className="btn-cancel">Cancel</button>
              <button onClick={handleExportStart} className="btn-export-start">🎬 Start Export</button>
            </div>
          </div>
        ) : (
          <div className="exporting-state">
            <div className="spinner"></div>
            <h3>🎬 Exporting Video...</h3>
            <p>Please wait while your video is being rendered</p>

            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>

            <div className="export-steps">
              <div className="step completed">✓ Rendering frames</div>
              <div className={`step ${progress > 40 ? 'completed' : ''}`}>
                {progress > 40 ? '✓' : '○'} Encoding video
              </div>
              <div className={`step ${progress > 70 ? 'completed' : ''}`}>
                {progress > 70 ? '✓' : '○'} Mixing audio
              </div>
              <div className={`step ${progress > 90 ? 'completed' : ''}`}>
                {progress > 90 ? '✓' : '○'} Finalizing
              </div>
            </div>

            <p className="estimate">
              Estimated time remaining: ~{Math.max(1, Math.round((100 - progress) / 20))} seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoExporter;
