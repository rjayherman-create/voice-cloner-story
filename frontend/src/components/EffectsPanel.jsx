import React, { useState } from 'react';
import './EffectsPanel.css';

const EffectsPanel = ({ onSelectEffect, selectedEffect, currentFrame, onAddKeyframe }) => {
  const [effectType, setEffectType] = useState('fade');
  const [effectDuration, setEffectDuration] = useState(30);
  const [effectColor, setEffectColor] = useState('#00ffff');
  const [effectIntensity, setEffectIntensity] = useState(1);

  const effectPresets = {
    fade: {
      name: 'Fade',
      icon: '🌫️',
      params: {
        startOpacity: 1,
        endOpacity: 0
      }
    },
    particles: {
      name: 'Particles',
      icon: '✨',
      params: {
        count: 50,
        size: 5
      }
    },
    shake: {
      name: 'Shake',
      icon: '📳',
      params: {
        intensity: 20
      }
    },
    glow: {
      name: 'Glow',
      icon: '💫',
      params: {
        blur: 30
      }
    },
    zoom: {
      name: 'Zoom',
      icon: '🔍',
      params: {
        startScale: 1,
        endScale: 1.5
      }
    },
    rotate: {
      name: 'Rotate',
      icon: '🔄',
      params: {
        startRotation: 0,
        endRotation: 360
      }
    },
    slide: {
      name: 'Slide',
      icon: '➡️',
      params: {
        startX: -100,
        endX: 100
      }
    },
    blur: {
      name: 'Blur',
      icon: '🌀',
      params: {
        startBlur: 0,
        endBlur: 20
      }
    }
  };

  const handleAddEffect = () => {
    const effect = {
      type: effectType,
      frame: currentFrame,
      duration: effectDuration,
      color: effectColor,
      intensity: effectIntensity,
      ...effectPresets[effectType].params
    };
    onAddKeyframe(effect);
  };

  return (
    <div className="effects-panel">
      <h3>✨ Effects Library</h3>

      {/* Effect Grid */}
      <div className="effects-grid">
        {Object.entries(effectPresets).map(([key, preset]) => (
          <button
            key={key}
            className={`effect-preset ${effectType === key ? 'selected' : ''}`}
            onClick={() => setEffectType(key)}
            title={preset.name}
          >
            <span className="effect-icon">{preset.icon}</span>
            <span className="effect-name">{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Effect Controls */}
      <div className="effect-controls">
        <div className="control-group">
          <label>Duration (frames)</label>
          <input
            type="range"
            min="1"
            max="180"
            value={effectDuration}
            onChange={(e) => setEffectDuration(parseInt(e.target.value))}
          />
          <span className="control-value">{effectDuration}f</span>
        </div>

        <div className="control-group">
          <label>Color</label>
          <input
            type="color"
            value={effectColor}
            onChange={(e) => setEffectColor(e.target.value)}
          />
          <span className="color-preview" style={{ backgroundColor: effectColor }}></span>
        </div>

        <div className="control-group">
          <label>Intensity</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={effectIntensity}
            onChange={(e) => setEffectIntensity(parseFloat(e.target.value))}
          />
          <span className="control-value">{effectIntensity.toFixed(1)}x</span>
        </div>

        <button onClick={handleAddEffect} className="btn-add-effect">
          + Add {effectPresets[effectType].name} Effect
        </button>
      </div>

      {/* Effect Descriptions */}
      <div className="effect-descriptions">
        <h4>Effect Guide</h4>
        <ul>
          <li><strong>Fade:</strong> Gradually fade in/out objects</li>
          <li><strong>Particles:</strong> Emit floating particles</li>
          <li><strong>Shake:</strong> Camera shake effect</li>
          <li><strong>Glow:</strong> Add glowing aura</li>
          <li><strong>Zoom:</strong> Scale objects in/out</li>
          <li><strong>Rotate:</strong> Spin objects</li>
          <li><strong>Slide:</strong> Move objects smoothly</li>
          <li><strong>Blur:</strong> Gaussian blur effect</li>
        </ul>
      </div>
    </div>
  );
};

export default EffectsPanel;
