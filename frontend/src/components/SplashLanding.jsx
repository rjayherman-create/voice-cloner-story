// frontend/src/components/SplashLanding.jsx
// High-Converting Login Splash & Landing Page for FableVoice Audio Studio

import React, { useState, useEffect } from 'react';
import './SplashLanding.css';

export default function SplashLanding({ onOpenStudio, userPlan = 'free', onUpgradePlan }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fablevoice_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [checkoutLoading, setCheckoutLoading] = useState(null);

  // Check URL parameters for successful checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      const upgradedPlan = params.get('plan') || 'creator_pro';
      alert(`🎉 Welcome to ${upgradedPlan === 'studio_master' ? 'Studio Master' : 'Creator Pro'}! Your account is active.`);
      if (onUpgradePlan) onUpgradePlan(upgradedPlan);
    }
  }, []);

  const handleSimulatedAuth = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const userObj = {
        email: userEmail || 'creator@fablevoice.com',
        name: userEmail ? userEmail.split('@')[0] : 'Audio Creator',
        avatar: '🎙️',
        plan: userPlan || 'free'
      };
      localStorage.setItem('fablevoice_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsSubmitting(false);
      setShowAuthModal(false);
    }, 600);
  };

  const handleSocialLogin = (provider) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const userObj = {
        email: `creator.${provider.toLowerCase()}@fablevoice.com`,
        name: `${provider} Creator`,
        avatar: provider === 'Google' ? '🌐' : '🍎',
        plan: userPlan || 'free'
      };
      localStorage.setItem('fablevoice_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsSubmitting(false);
      setShowAuthModal(false);
    }, 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('fablevoice_user');
    setCurrentUser(null);
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      onOpenStudio();
      return;
    }

    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userEmail: currentUser?.email || 'guest@fablevoice.com',
          userId: currentUser?.name || 'guest_user'
        })
      });

      const data = await res.json();
      if (data.url) {
        if (data.simulated) {
          alert(`🎉 ${data.message}`);
          if (onUpgradePlan) onUpgradePlan(planId);
          onOpenStudio();
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="splash-container">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="splash-nav">
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-logo-icon">🎙️</span>
          <span className="nav-brand-title">FableVoice <span className="gold-text">Studio</span></span>
        </div>

        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#time-setter" className="nav-link">Time Setter</a>
          <a href="#languages" className="nav-link">30+ Languages</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <div className="user-profile-badge">
              <span className="user-avatar">{currentUser.avatar}</span>
              <span className="user-name">{currentUser.name}</span>
              <button className="nav-btn-text" onClick={handleSignOut} title="Sign Out">Sign Out</button>
              <button className="nav-btn-gold" onClick={onOpenStudio}>
                ⚡ Open Studio
              </button>
            </div>
          ) : (
            <>
              <button className="nav-btn-text" onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}>
                🔑 Sign In
              </button>
              <button className="nav-btn-gold" onClick={onOpenStudio}>
                ⚡ Try Free Studio
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="splash-hero">
        <div className="hero-badge">
          <span className="badge-sparkle">✨</span>
          <span>Universal 30-Language Audio & Voiceover Workstation</span>
        </div>

        <h1 className="hero-headline">
          The AI Voiceover & Story Studio with <br />
          <span className="gold-gradient-text">Exact Duration Control</span>
        </h1>

        <p className="hero-subhead">
          Set your spoken time down to the exact second (15s to 60m), generate scripts with AI, 
          translate across 30+ languages, and produce master audio layered with ambient music in under 60 seconds.
        </p>

        <div className="hero-cta-group">
          <button className="hero-primary-btn" onClick={onOpenStudio}>
            ⚡ Launch Studio Now ($0.00 Free)
          </button>
          <button className="hero-secondary-btn" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>
            🔑 Create Free Account
          </button>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <strong>30+</strong>
            <span>World Languages</span>
          </div>
          <div className="hero-stat-item">
            <strong>00:15 - 60:00</strong>
            <span>Exact Duration Setter</span>
          </div>
          <div className="hero-stat-item">
            <strong>$0.00</strong>
            <span>Free Neural Engine</span>
          </div>
          <div className="hero-stat-item">
            <strong>100%</strong>
            <span>Broadcast Master MP3</span>
          </div>
        </div>

        {/* Hero Interactive Preview Showcase */}
        <div className="hero-mockup-card">
          <div className="mockup-header">
            <div className="mockup-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="mockup-title">FableVoice Live Studio Console • Exact Duration: 04:30 (~630 words)</span>
            <span className="mockup-tag">🟢 Free Neural Active</span>
          </div>

          <div className="mockup-body">
            <div className="mockup-tool-strip">
              <div className="mockup-pill active">⏱️ Exact Time: 04:30</div>
              <div className="mockup-pill">🌐 Universal Translation</div>
              <div className="mockup-pill">🎙️ Live Mic Dictation</div>
              <div className="mockup-pill">🎵 Lullaby Harp Music</div>
              <div className="mockup-pill">🎬 Video Storyboard</div>
            </div>

            <div className="mockup-player-row">
              <button className="mockup-play-btn" onClick={onOpenStudio}>▶️ Play Live Demo</button>
              <div className="mockup-waveform">
                <span className="bar" style={{ height: '40%' }}></span>
                <span className="bar" style={{ height: '75%' }}></span>
                <span className="bar" style={{ height: '100%' }}></span>
                <span className="bar" style={{ height: '60%' }}></span>
                <span className="bar" style={{ height: '85%' }}></span>
                <span className="bar" style={{ height: '50%' }}></span>
                <span className="bar" style={{ height: '90%' }}></span>
                <span className="bar" style={{ height: '70%' }}></span>
                <span className="bar" style={{ height: '35%' }}></span>
              </div>
              <span className="mockup-timer">04:30 Target • 100% On-Time</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURES SHOWCASE GRID */}
      <section id="features" className="splash-section">
        <div className="section-header">
          <span className="section-sub">WHY CREATORS CHOOSE FABLEVOICE</span>
          <h2 className="section-title">Everything You Need for Broadcast Audio in One Screen</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">⏱️</div>
            <h3>Exact Spoken Time Setter</h3>
            <p>
              Never guess word counts again. Set exact minutes and seconds (`00:45`, `04:30`, `15:00`), 
              and the AI automatically paces and writes your story to that exact timeframe.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🌐</div>
            <h3>30+ World Languages & Translation</h3>
            <p>
              Generate studio voiceovers and translate between ANY language pair (English, Spanish, French, 
              German, Japanese, Chinese, Arabic, Hebrew, etc.) with instant neural accuracy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🧒</div>
            <h3>Children's Stories & Video Scripts</h3>
            <p>
              15-minute chaptered bedtime stories with gentle child voices, or multi-scene video scripts 
              with bracketed `[VISUAL]` cues that strip with 1 click before recording.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🎙️</div>
            <h3>Microphone Dictation & Voice Cloning</h3>
            <p>
              Dictate your ideas freely using real-time browser speech-to-text, or record your voice 
              to create personalized voice clones stored in your secure bucket.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🎵</div>
            <h3>Ambient Soundtracks & Music Ducking</h3>
            <p>
              Layer soothing harp, celestial strings, and nature atmospheres under your voiceover 
              with customizable background volume ducking.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">💰</div>
            <h3>100% Free Zero-Cost Tier ($0.00)</h3>
            <p>
              Enjoy unlimited free neural speech synthesis, bidirectional translation, and dictation 
              with zero API charges or credit card requirements.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PRICING & MEMBERSHIP PLANS */}
      <section id="pricing" className="splash-section pricing-bg">
        <div className="section-header">
          <span className="section-sub">SIMPLE & TRANSPARENT PRICING</span>
          <h2 className="section-title">Choose the Perfect Plan for Your Voice Studio</h2>
        </div>

        <div className="pricing-cards-grid">
          {/* FREE STARTER */}
          <div className="pricing-card">
            <div className="plan-badge">🟢 ZERO COST</div>
            <h3 className="plan-name">Free Starter</h3>
            <div className="plan-price">
              <span className="price-num">$0</span>
              <span className="price-period">/ forever</span>
            </div>
            <p className="plan-desc">Unlimited access to the 30+ language Free Neural Engine.</p>

            <ul className="plan-features">
              <li>✓ Universal Free Neural Audio (30+ Langs)</li>
              <li>✓ Universal Bidirectional Translation</li>
              <li>✓ Free Live Microphone Dictation</li>
              <li>✓ Standard MP3 Master Downloads</li>
              <li>✓ Community Support</li>
            </ul>

            <button className="plan-btn plan-btn-free" onClick={onOpenStudio}>
              ⚡ Launch Free Studio
            </button>
          </div>

          {/* CREATOR PRO */}
          <div className="pricing-card popular-card">
            <div className="popular-ribbon">⭐ MOST POPULAR</div>
            <div className="plan-badge gold-badge">💎 CREATOR PRO</div>
            <h3 className="plan-name">Creator Pro</h3>
            <div className="plan-price">
              <span className="price-num">$15</span>
              <span className="price-period">/ month</span>
            </div>
            <p className="plan-desc">ElevenLabs Flash HD audio with Exact Time Setter & Music Mixing.</p>

            <ul className="plan-features">
              <li>✓ <strong>Everything in Free Starter</strong></li>
              <li>✓ ElevenLabs Flash v2.5 HD Voice Synthesis</li>
              <li>✓ Interactive Exact Time Setter & Calibrator</li>
              <li>✓ Curated Ambient Soundtracks & Ducking</li>
              <li>✓ 15-Minute Chaptered Bedtime Stories</li>
              <li>✓ Full Commercial Broadcast License</li>
            </ul>

            <button 
              className="plan-btn plan-btn-gold" 
              onClick={() => handleSubscribe('creator_pro')}
              disabled={checkoutLoading === 'creator_pro'}
            >
              {checkoutLoading === 'creator_pro' ? '⏳ Connecting...' : '⚡ Upgrade to Creator Pro ($15)'}
            </button>
          </div>

          {/* STUDIO MASTER */}
          <div className="pricing-card">
            <div className="plan-badge purple-badge">👑 STUDIO MASTER</div>
            <h3 className="plan-name">Studio Master</h3>
            <div className="plan-price">
              <span className="price-num">$39</span>
              <span className="price-period">/ month</span>
            </div>
            <p className="plan-desc">Full studio power with voice cloning & 30-min master exports.</p>

            <ul className="plan-features">
              <li>✓ <strong>Everything in Creator Pro</strong></li>
              <li>✓ Custom Voice Cloning (Bucket Storage)</li>
              <li>✓ 30-Min & 60-Min Long-Form Master Exports</li>
              <li>✓ Multi-Track Stem Audio Packages</li>
              <li>✓ Priority Audio Rendering Queue</li>
              <li>✓ Dedicated 24/7 VIP Support</li>
            </ul>

            <button 
              className="plan-btn plan-btn-purple" 
              onClick={() => handleSubscribe('studio_master')}
              disabled={checkoutLoading === 'studio_master'}
            >
              {checkoutLoading === 'studio_master' ? '⏳ Connecting...' : '👑 Get Studio Master ($39)'}
            </button>
          </div>
        </div>
      </section>

      {/* 5. AUTHENTICATION MODAL (CLERK COMPATIBLE) */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setShowAuthModal(false)}>✕</button>

            <div className="auth-header">
              <span className="auth-logo">🎙️</span>
              <h3>{authMode === 'signin' ? 'Welcome Back to FableVoice' : 'Create Your Voice Studio Account'}</h3>
              <p>{authMode === 'signin' ? 'Sign in to access your saved voices & productions' : 'Get instant access to 30+ languages & duration tools'}</p>
            </div>

            <div className="social-auth-group">
              <button className="social-btn google-btn" onClick={() => handleSocialLogin('Google')}>
                🌐 Continue with Google
              </button>
              <button className="social-btn apple-btn" onClick={() => handleSocialLogin('Apple')}>
                🍎 Continue with Apple
              </button>
            </div>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleSimulatedAuth} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="dark-input-field" 
                  placeholder="creator@fablevoice.com" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="dark-input-field" 
                  placeholder="••••••••" 
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? '⏳ Signing In...' : authMode === 'signin' ? '🔑 Sign In' : '⚡ Create Free Account'}
              </button>
            </form>

            <div className="auth-footer-toggle">
              {authMode === 'signin' ? (
                <p>Don't have an account? <button onClick={() => setAuthMode('signup')}>Sign up free</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setAuthMode('signin')}>Sign in</button></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. FOOTER */}
      <footer className="splash-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🎙️</span>
            <strong>FableVoice Audio Studio</strong>
            <p>The Global AI Voiceover & Multilingual Storytelling Workstation.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button onClick={onOpenStudio} className="footer-link-btn">Launch Studio</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FableVoice Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
