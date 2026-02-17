import React, { useState } from 'react';
import './MainMenu.css';
import VideoStudio from './VideoStudio';
import MusicGeneratorApp from './MusicGeneratorApp';

export default function MainMenu() {
  const [currentApp, setCurrentApp] = useState('home'); // 'home', 'video', 'music'

  return (
    <div className="main-menu-container">
      {/* Left Sidebar Menu */}
      <div className="sidebar-menu">
        <div className="sidebar-header">
          <h1>🎬 CardHugs</h1>
          <p>Studio</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentApp === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentApp('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </button>

          <button
            className={`nav-item ${currentApp === 'video' ? 'active' : ''}`}
            onClick={() => setCurrentApp('video')}
          >
            <span className="nav-icon">🎥</span>
            <span className="nav-label">Video Studio</span>
          </button>

          <button
            className={`nav-item ${currentApp === 'music' ? 'active' : ''}`}
            onClick={() => setCurrentApp('music')}
          >
            <span className="nav-icon">🎵</span>
            <span className="nav-label">Music Gen</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>v1.0.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {currentApp === 'home' && (
          <div className="home-screen">
            <div className="home-content">
              <div className="home-header">
                <h1>Welcome to CardHugs Studio</h1>
                <p>Creative Tools for Content Creation</p>
              </div>

              <div className="home-grid">
                {/* Video Studio Card */}
                <div 
                  className="home-card video-card"
                  onClick={() => setCurrentApp('video')}
                >
                  <div className="card-icon">🎥</div>
                  <h2>Video Studio</h2>
                  <p>Create animated videos with professional tools</p>
                  <div className="card-features">
                    <span>✓ Animation</span>
                    <span>✓ Timeline Editor</span>
                    <span>✓ Effects & Transitions</span>
                  </div>
                  <button className="card-button">Open →</button>
                </div>

                {/* Music Generator Card */}
                <div 
                  className="home-card music-card"
                  onClick={() => setCurrentApp('music')}
                >
                  <div className="card-icon">🎵</div>
                  <h2>Music Generator</h2>
                  <p>Create unlimited AI-powered background music</p>
                  <div className="card-features">
                    <span>✓ AI Generation</span>
                    <span>✓ 30+ Styles</span>
                    <span>✓ Royalty-Free</span>
                  </div>
                  <button className="card-button">Open →</button>
                </div>
              </div>

              <div className="home-footer">
                <p>Build & Hosted with ❤️ by CardHugs</p>
              </div>
            </div>
          </div>
        )}

        {currentApp === 'video' && (
          <div className="app-content">
            <VideoStudio />
          </div>
        )}

        {currentApp === 'music' && (
          <div className="app-content">
            <MusicGeneratorApp />
          </div>
        )}
      </div>
    </div>
  );
}
