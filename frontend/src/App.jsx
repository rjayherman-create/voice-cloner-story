// frontend/src/App.jsx
// Main App Component with Splash / Landing Page & Studio Routing

import React, { useState, useEffect } from 'react';
import VoiceBrowser from './components/VoiceBrowser';
import SplashLanding from './components/SplashLanding';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('studio') === 'true' || params.get('checkout') === 'success') ? 'studio' : 'splash';
  });

  const [userPlan, setUserPlan] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fablevoice_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.plan || 'free';
      }
      return 'free';
    } catch (e) {
      return 'free';
    }
  });

  useEffect(() => {
    document.title = currentView === 'studio' 
      ? '🎙️ FableVoice Studio - Live Multilingual Voiceover Workstation'
      : '🎙️ FableVoice Audio Studio - AI Voiceover & Story Workstation';
  }, [currentView]);

  const handleUpgradePlan = (newPlan) => {
    setUserPlan(newPlan);
    try {
      const savedUser = localStorage.getItem('fablevoice_user');
      const u = savedUser ? JSON.parse(savedUser) : { name: 'Audio Creator', email: 'creator@fablevoice.com' };
      u.plan = newPlan;
      localStorage.setItem('fablevoice_user', JSON.stringify(u));
    } catch (e) {}
  };

  return (
    <div className="fable-app-root">
      {currentView === 'splash' ? (
        <SplashLanding 
          onOpenStudio={() => setCurrentView('studio')}
          userPlan={userPlan}
          onUpgradePlan={handleUpgradePlan}
        />
      ) : (
        <div className="studio-wrapper">
          {/* Top Bar to Switch Back to Splash or View Pricing */}
          <header className="studio-top-nav">
            <div className="studio-nav-brand" onClick={() => setCurrentView('splash')}>
              <span className="studio-logo">🎙️</span>
              <span className="studio-brand-name">FableVoice <span className="gold-accent">Studio</span></span>
              <span className="studio-plan-badge">
                {userPlan === 'studio_master' ? '👑 STUDIO MASTER' : userPlan === 'creator_pro' ? '💎 CREATOR PRO' : '🟢 FREE STARTER'}
              </span>
            </div>

            <div className="studio-nav-actions">
              <button className="studio-nav-btn" onClick={() => setCurrentView('splash')}>
                🏠 Splash & Pricing
              </button>
              {userPlan === 'free' && (
                <button className="studio-upgrade-btn" onClick={() => setCurrentView('splash')}>
                  ⚡ Upgrade to Pro ($15)
                </button>
              )}
            </div>
          </header>

          <VoiceBrowser />
        </div>
      )}
    </div>
  );
}

export default App;
