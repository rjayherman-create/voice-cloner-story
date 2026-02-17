import React, { useState, useRef, useEffect } from 'react';
import './AnimationStudio.css';
import AnimationCanvas from './AnimationCanvas';
import TimelineEditor from './TimelineEditor';
import AssetManager from './AssetManager';
import EffectsPanel from './EffectsPanel';

const AnimationStudio = () => {
  const [project, setProject] = useState({
    name: 'Untitled Animation',
    duration: 180, // 3 minutes in seconds
    fps: 30,
    width: 1920,
    height: 1080,
    assets: {
      backgrounds: [],
      characters: [],
      effects: []
    },
    timeline: {
      background: [],
      character: [],
      effects: [],
      voiceover: null
    }
  });

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('character');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const playIntervalRef = useRef(null);

  // Auto-play timeline
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= project.duration * project.fps) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / project.fps);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, project.fps, project.duration]);

  const handleAddAsset = (type, asset) => {
    setProject(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [type]: [...prev.assets[type], asset]
      }
    }));
  };

  const handleAddKeyframe = (layer, frame, data) => {
    setProject(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        [layer]: prev.timeline[layer]
          .filter(k => k.frame !== frame)
          .concat({ frame, ...data })
          .sort((a, b) => a.frame - b.frame)
      }
    }));
  };

  const handleSetVoiceOver = (audioData) => {
    setProject(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        voiceover: audioData
      }
    }));
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/animation/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, format: 'mp4' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.mp4`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const totalFrames = project.duration * project.fps;
  const currentTime = currentFrame / project.fps;
  const minutes = Math.floor(currentTime / 60);
  const seconds = (currentTime % 60).toFixed(2);

  return (
    <div className="animation-studio">
      <header className="studio-header">
        <h1>🎬 Animation Studio</h1>
        <div className="project-info">
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Project name"
          />
          <span className="time-display">{`${minutes}:${String(Math.floor(seconds)).padStart(2, '0')}`}</span>
        </div>
      </header>

      <div className="studio-controls">
        <div className="playback-controls">
          <button onClick={() => setCurrentFrame(0)} title="Rewind">⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => setCurrentFrame(totalFrames - 1)} title="End">⏭</button>
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
            className="timeline-scrubber"
          />
        </div>

        <div className="view-controls">
          <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>🔍−</button>
          <span>{zoomLevel}%</span>
          <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>🔍+</button>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => setShowAssetManager(!showAssetManager)}
            className="btn-asset"
          >
            📁 Assets
          </button>
          <button 
            onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            className="btn-effects"
          >
            ✨ Effects
          </button>
          <button onClick={handleExport} className="btn-export">
            💾 Export Video
          </button>
        </div>
      </div>

      <div className="studio-workspace">
        {/* Asset Manager */}
        {showAssetManager && (
          <AssetManager
            onAddAsset={handleAddAsset}
            assets={project.assets}
            onClose={() => setShowAssetManager(false)}
          />
        )}

        {/* Main Canvas */}
        <div className="canvas-area">
          <AnimationCanvas
            project={project}
            currentFrame={currentFrame}
            zoomLevel={zoomLevel}
          />
        </div>

        {/* Right Panel - Layers & Properties */}
        <div className="right-panel">
          <div className="layers-panel">
            <h3>Layers</h3>
            <div className="layer-list">
              <div
                className={`layer-item ${selectedLayer === 'background' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('background')}
              >
                <span>🖼️</span>
                <span>Background</span>
              </div>
              <div
                className={`layer-item ${selectedLayer === 'character' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('character')}
              >
                <span>🧑</span>
                <span>Character</span>
              </div>
              <div
                className={`layer-item ${selectedLayer === 'effects' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('effects')}
              >
                <span>✨</span>
                <span>Effects</span>
              </div>
            </div>
          </div>

          {showEffectsPanel && (
            <EffectsPanel
              onSelectEffect={setSelectedEffect}
              selectedEffect={selectedEffect}
              currentFrame={currentFrame}
              onAddKeyframe={(data) => handleAddKeyframe('effects', currentFrame, data)}
            />
          )}
        </div>
      </div>

      {/* Timeline Editor */}
      <TimelineEditor
        project={project}
        currentFrame={currentFrame}
        onFrameChange={setCurrentFrame}
        onAddKeyframe={handleAddKeyframe}
        onSetVoiceOver={handleSetVoiceOver}
        selectedLayer={selectedLayer}
        zoomLevel={zoomLevel}
      />
    </div>
  );
};

export default AnimationStudio;
