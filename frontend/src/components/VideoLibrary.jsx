import React, { useState } from 'react';
import './VideoLibrary.css';

const VideoLibrary = ({ onAddAnimation, onAddVoiceOver, onAddMusic, onClose }) => {
  const [activeTab, setActiveTab] = useState('animations');
  const [libraries] = useState({
    animations: [
      { id: 1, name: 'Intro Animation', duration: 3, preview: '🎬' },
      { id: 2, name: 'Character Idle', duration: 5, preview: '🧑' },
      { id: 3, name: 'Scene Transition', duration: 2, preview: '✨' },
      { id: 4, name: 'Action Sequence', duration: 8, preview: '💥' }
    ],
    voiceovers: [
      { id: 1, name: 'Professional Male', duration: 180, preview: '🎤' },
      { id: 2, name: 'Friendly Female', duration: 180, preview: '🎤' },
      { id: 3, name: 'Narrator Deep', duration: 180, preview: '🎙️' }
    ],
    music: [
      { id: 1, name: 'Upbeat Background', duration: 180, preview: '🎵' },
      { id: 2, name: 'Cinematic Drama', duration: 180, preview: '🎼' },
      { id: 3, name: 'Corporate Ambient', duration: 180, preview: '🎶' },
      { id: 4, name: 'Epic Adventure', duration: 180, preview: '🎺' }
    ]
  });

  return (
    <div className="library-overlay">
      <div className="library-modal">
        <div className="library-header">
          <h2>📁 Asset Library</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="library-tabs">
          <button 
            className={`tab ${activeTab === 'animations' ? 'active' : ''}`}
            onClick={() => setActiveTab('animations')}
          >
            🎬 Animations
          </button>
          <button 
            className={`tab ${activeTab === 'voiceovers' ? 'active' : ''}`}
            onClick={() => setActiveTab('voiceovers')}
          >
            🎤 Voice-Overs
          </button>
          <button 
            className={`tab ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            🎵 Music
          </button>
        </div>

        <div className="library-content">
          {activeTab === 'animations' && (
            <div className="library-grid">
              {libraries.animations.map(item => (
                <div key={item.id} className="library-item">
                  <div className="item-preview">{item.preview}</div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.duration}s</p>
                  </div>
                  <button 
                    onClick={() => {
                      onAddAnimation({ ...item, type: 'animation' });
                      onClose();
                    }}
                    className="btn-add"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'voiceovers' && (
            <div className="library-grid">
              {libraries.voiceovers.map(item => (
                <div key={item.id} className="library-item">
                  <div className="item-preview">{item.preview}</div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.duration}s</p>
                  </div>
                  <button 
                    onClick={() => {
                      onAddVoiceOver({ ...item, type: 'voiceover' });
                      onClose();
                    }}
                    className="btn-add"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'music' && (
            <div className="library-grid">
              {libraries.music.map(item => (
                <div key={item.id} className="library-item">
                  <div className="item-preview">{item.preview}</div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.duration}s</p>
                  </div>
                  <button 
                    onClick={() => {
                      onAddMusic({ ...item, type: 'music' });
                      onClose();
                    }}
                    className="btn-add"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLibrary;
