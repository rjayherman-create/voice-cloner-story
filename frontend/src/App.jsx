import React, { useState, useEffect } from 'react';
import VoiceBrowser from './components/VoiceBrowser';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState('');

  // Voice chooser page states
  const [allVoices, setAllVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState('');
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [previewPlaying, setPreviewPlaying] = useState(null);



  // Projects states
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectError, setProjectError] = useState('');

  // Audio Merger states
  const [audioFiles, setAudioFiles] = useState([
    { id: 1, name: 'Intro - Adam Voice', duration: '0:15', voice: 'Adam', generatedAt: '2 hours ago' },
    { id: 2, name: 'Main Content - Bella Voice', duration: '1:23', voice: 'Bella', generatedAt: '1 day ago' },
    { id: 3, name: 'Conclusion - Charlotte Voice', duration: '0:30', voice: 'Charlotte', generatedAt: '3 days ago' }
  ]);
  const [selectedAudioFiles, setSelectedAudioFiles] = useState([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState('');

  // Dashboard stats
  const [dashboardStats] = useState({
    totalVoiceOvers: 24,
    voiceOversThisMonth: 8,
    projectsCreated: 5,
    favoritedVoices: 3
  });

  // Load voices and projects on mount
  React.useEffect(() => {
    loadVoices();
    loadProjects();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/voiceover/voices?category=professional');
      const data = await response.json();
      setVoices(data);
      if (data.length > 0 && !selectedVoice) {
        setSelectedVoice(data[0].name || data[0].id);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjectError('Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setProjectError('Project name is required');
      return;
    }

    setLoading(true);
    setProjectError('');
    try {
      const response = await fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create project');
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProjectForm(false);
    } catch (err) {
      setProjectError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      setProjectError(err.message);
    }
  };

  const loadAllVoices = async () => {
    if (allVoices.length > 0) {
      setCurrentPage('choose-voice');
      return;
    }

    setVoicesLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/voiceover/voices');
      const data = await response.json();
      setAllVoices(data);
      setCurrentPage('choose-voice');
    } catch (err) {
      console.error('Failed to load all voices:', err);
      setError('Failed to load voices from ElevenLabs');
    } finally {
      setVoicesLoading(false);
    }
  };



  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!script.trim()) {
      setError('Please enter text to convert');
      return;
    }

    if (!selectedVoice) {
      setError('Please select a voice');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/voiceover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          voice: selectedVoice,
          emotion: 'neutral'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setGenerated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioFileToggle = (fileId) => {
    setSelectedAudioFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleMergeAudio = async () => {
    if (selectedAudioFiles.length < 2) {
      setMergeError('Select at least 2 files to merge');
      return;
    }

    setMergeLoading(true);
    setMergeError('');
    try {
      const selectedFiles = audioFiles.filter(f => selectedAudioFiles.includes(f.id));
      const response = await fetch('http://localhost:5001/api/voiceover/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: selectedFiles.map(f => f.id),
          outputName: 'merged-audio'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Merge failed');
      }

      const data = await response.json();
      alert('Audio files merged successfully! Download your merged file.');
      setSelectedAudioFiles([]);
    } catch (err) {
      setMergeError(err.message);
    } finally {
      setMergeLoading(false);
    }
  };

  const filteredVoices = allVoices.filter(voice =>
    voice.name.toLowerCase().includes(voiceFilter.toLowerCase()) ||
    (voice.description && voice.description.toLowerCase().includes(voiceFilter.toLowerCase()))
  );



  const handleSelectVoice = (voice) => {
    setSelectedVoice(voice.id || voice.name);
    setCurrentPage('home');
  };

  const playPreview = async (voiceId) => {
    try {
      setPreviewPlaying(voiceId);
      const response = await fetch(`http://localhost:5001/api/voiceover/voices/${voiceId}/preview`);
      const data = await response.json();
      setSelectedPreview(data.previewUrl);
    } catch (err) {
      console.error('Failed to play preview:', err);
      setError('Failed to load voice preview');
    } finally {
      setPreviewPlaying(null);
    }
  };

  return (
    <div className="app">
      {/* Header Navigation */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">VoiceOver Studio</span>
          </div>

          <nav className="nav-menu">
            <button 
              className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              🎙️ Quick Voice
            </button>
            <button 
              className={`nav-item ${currentPage === 'voice-browser' ? 'active' : ''}`}
              onClick={() => setCurrentPage('voice-browser')}
            >
              🎤 Browse Voices
            </button>
            <button 
              className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`}
              onClick={() => setCurrentPage('projects')}
            >
              📁 Projects
            </button>
            <button 
              className={`nav-item ${currentPage === 'audio-merger' ? 'active' : ''}`}
              onClick={() => setCurrentPage('audio-merger')}
            >
              🎵 Audio Merger
            </button>
            <button 
              className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentPage === 'audio-merger' && (
          <div className="page-audio-merger">
            <div className="merger-header">
              <div>
                <h1>🎵 Audio Merger</h1>
                <p>Combine multiple voice-over clips into a single MP3 file</p>
              </div>
            </div>

            <div className="merger-info-banner">
              <div className="info-item">
                <span className="info-icon">💡</span>
                <div>
                  <strong>Multi-part Narrations</strong>
                  <p>Generate different sections separately, then merge them into one continuous audio</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎭</span>
                <div>
                  <strong>Different Voices</strong>
                  <p>Create dialogues with multiple voice personas, then combine them seamlessly</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📦</span>
                <div>
                  <strong>Batch Production</strong>
                  <p>Generate multiple clips and merge them for final delivery</p>
                </div>
              </div>
            </div>

            <div className="merger-content">
              <div className="merger-section">
                <h2>Available Audio Files</h2>
                {mergeError && <div className="error-message">{mergeError}</div>}
                <div className="audio-files-container">
                  {audioFiles.map(file => (
                    <div key={file.id} className="audio-file-item">
                      <div className="file-checkbox">
                        <input 
                          type="checkbox" 
                          id={`file${file.id}`}
                          checked={selectedAudioFiles.includes(file.id)}
                          onChange={() => handleAudioFileToggle(file.id)}
                        />
                      </div>
                      <div className="file-info">
                        <h4>{file.name}</h4>
                        <p>Duration: {file.duration} • Generated: {file.generatedAt}</p>
                      </div>
                      <div className="file-preview">
                        <audio controls>
                          <source src="" type="audio/mpeg" />
                        </audio>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="merger-section">
                <h2>Merge Order</h2>
                <p className="section-description">Selected files will be merged in this order</p>
                <div className="merge-order-list">
                  {selectedAudioFiles.length === 0 ? (
                    <div className="order-placeholder">
                      <p>Select 2 or more files above to create merge order</p>
                    </div>
                  ) : (
                    selectedAudioFiles.map((fileId, index) => {
                      const file = audioFiles.find(f => f.id === fileId);
                      return (
                        <div key={fileId} className="order-item">
                          <span className="order-number">{index + 1}</span>
                          <span className="order-name">{file.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="merger-actions">
                <button 
                  className="merge-btn"
                  disabled={selectedAudioFiles.length < 2 || mergeLoading}
                  onClick={handleMergeAudio}
                >
                  {mergeLoading ? '⏳ Merging...' : '🔗 Merge Selected'}
                </button>
                <p className="action-hint">
                  {selectedAudioFiles.length === 0 
                    ? 'Select 2 or more files to enable merging'
                    : `${selectedAudioFiles.length} file${selectedAudioFiles.length > 1 ? 's' : ''} selected`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'projects' && (
          <div className="page-projects">
            {/* Projects page content - same as before */}
            <div className="projects-header">
              <div>
                <h1>📁 My Projects</h1>
                <p>Manage and organize all your voice-over projects</p>
              </div>
              <button 
                className="create-project-btn"
                onClick={() => setShowNewProjectForm(!showNewProjectForm)}
              >
                + New Project
              </button>
            </div>

            {projectError && <div className="error-message">{projectError}</div>}

            {showNewProjectForm && (
              <div className="new-project-card">
                <h3>Create New Project</h3>
                <form onSubmit={handleCreateProject} className="project-form">
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      placeholder="Enter project name..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="text-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      placeholder="Describe your project..."
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="text-input"
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowNewProjectForm(false);
                        setNewProjectName('');
                        setNewProjectDesc('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {projectsLoading ? (
              <div className="loading-spinner">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to get started</p>
                <button 
                  className="create-project-btn"
                  onClick={() => setShowNewProjectForm(true)}
                >
                  + Create Project
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </div>

                    {project.description && (
                      <p className="project-desc">{project.description}</p>
                    )}

                    <div className="project-stats">
                      <div className="stat">
                        <span className="stat-icon">🎙️</span>
                        <span className="stat-text">{project.voiceovers || 0} voice-overs</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">📄</span>
                        <span className="stat-text">{project.files || 0} files</span>
                      </div>
                    </div>

                    <div className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>

                    <button className="open-project-btn">
                      Open Project →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'home' && (
          <div className="page-home">
            <div className="quick-generation-section">
              <h1>Quick Voice Generation</h1>
              <p>Generate voice overs quickly with your preferred voice and settings</p>

              <form onSubmit={handleGenerate} className="generation-form">
                <div className="form-group">
                  <label>Text to Convert</label>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    rows={8}
                    className="text-input"
                  />
                  <div className="char-count">{script.length} characters</div>
                </div>

                <div className="form-group">
                  <label>Selected Voice</label>
                  <div className="voice-selection">
                    <input
                      type="text"
                      value={selectedVoice}
                      readOnly
                      className="voice-input"
                      placeholder="Click 'Choose Voice' to select a voice"
                    />
                    <button 
                      type="button"
                      onClick={loadAllVoices}
                      className="change-voice-btn"
                    >
                      Change Voice
                    </button>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button 
                  type="submit" 
                  disabled={loading || !script.trim() || !selectedVoice}
                  className="generate-btn"
                >
                  {loading ? 'Generating...' : 'Generate Speech'}
                </button>
              </form>

              {generated && (
                <div className="generated-section">
                  <h2>Generated Speech</h2>
                  {generated.url && (
                    <div className="audio-player-container">
                      <audio controls className="audio-player">
                        <source src={generated.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <a href={generated.url} download className="download-btn">
                        ⬇ Download
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}



        {currentPage === 'voice-browser' && (
          <VoiceBrowser onSelectVoice={handleSelectVoice} />
        )}

        {currentPage === 'choose-voice' && (
          <div className="page-choose-voice">
            <div className="voice-chooser-header">
              <div>
                <h1>🎵 Choose Voice from ElevenLabs</h1>
                <p>Select a professional voice to use for text-to-speech generation</p>
              </div>
            </div>

            <div className="voice-chooser-search">
              <input
                type="text"
                placeholder="🔍 Search voices by name..."
                value={voiceFilter}
                onChange={(e) => setVoiceFilter(e.target.value)}
                className="voice-filter-input"
              />
              {voiceFilter && (
                <button 
                  className="clear-filter"
                  onClick={() => setVoiceFilter('')}
                >
                  ✕
                </button>
              )}
              <div className="voice-count-badge">{filteredVoices.length} voices</div>
            </div>

            {voicesLoading ? (
              <div className="loading-spinner">Loading voices from ElevenLabs...</div>
            ) : filteredVoices.length === 0 ? (
              <div className="no-voices">
                {voiceFilter ? 'No voices match your search' : 'No voices available'}
              </div>
            ) : (
              <div className="voices-selection-grid">
                {filteredVoices.map((voice) => (
                  <div 
                    key={voice.id} 
                    className={`voice-selection-card ${selectedVoice === voice.id ? 'selected' : ''}`}
                  >
                    <div className="voice-selection-header">
                      <h3>{voice.name}</h3>
                      {voice.accent && <span className="accent-badge">{voice.accent}</span>}
                    </div>

                    {voice.description && (
                      <p className="voice-selection-desc">{voice.description}</p>
                    )}

                    <div className="voice-selection-actions">
                      {voice.preview_url && (
                        <button 
                          type="button"
                          onClick={() => playPreview(voice.id)}
                          disabled={previewPlaying === voice.id}
                          className="preview-btn"
                        >
                          {previewPlaying === voice.id ? '⏳ Loading...' : '🔊 Preview'}
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => handleSelectVoice(voice)}
                        className={`select-btn ${selectedVoice === voice.id ? 'selected' : ''}`}
                      >
                        {selectedVoice === voice.id ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedPreview && (
              <div className="preview-modal-overlay" onClick={() => setSelectedPreview(null)}>
                <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="close-preview"
                    onClick={() => setSelectedPreview(null)}
                  >
                    ✕
                  </button>
                  <h3>Voice Preview</h3>
                  <audio controls autoPlay className="preview-audio">
                    <source src={selectedPreview} type="audio/mpeg" />
                  </audio>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="page-dashboard">
            <div className="dashboard-header">
              <h1>📊 Dashboard</h1>
              <p>Overview of your voice generation activity</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎙️</div>
                <div className="stat-content">
                  <div className="stat-label">Total Voice-Overs</div>
                  <div className="stat-number">{dashboardStats.totalVoiceOvers}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-label">This Month</div>
                  <div className="stat-number">{dashboardStats.voiceOversThisMonth}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <div className="stat-label">Projects Created</div>
                  <div className="stat-number">{dashboardStats.projectsCreated}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-label">Favorite Voices</div>
                  <div className="stat-number">{dashboardStats.favoritedVoices}</div>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <div className="activity-title">Generated voice-over with Adam voice</div>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <div className="activity-title">Created new project "Commercial Ads"</div>
                    <div className="activity-time">5 hours ago</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <div className="activity-title">Generated voice-over with Bella voice</div>
                    <div className="activity-time">1 day ago</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <div className="activity-title">Downloaded 3 audio files</div>
                    <div className="activity-time">2 days ago</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">✓</div>
                  <div className="activity-content">
                    <div className="activity-title">Added Charlotte voice to favorites</div>
                    <div className="activity-time">3 days ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => setCurrentPage('home')}>
                  <span className="action-icon">🎙️</span>
                  <span className="action-text">Quick Voice</span>
                </button>
                <button className="quick-action-btn" onClick={() => setCurrentPage('choose-voice')}>
                  <span className="action-icon">🎵</span>
                  <span className="action-text">Choose Voice</span>
                </button>

                <button className="quick-action-btn" onClick={() => setCurrentPage('projects')}>
                  <span className="action-icon">📁</span>
                  <span className="action-text">My Projects</span>
                </button>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="dashboard-section">
              <h2>Usage This Month</h2>
              <div className="usage-chart">
                <div className="usage-bar">
                  <div className="usage-label">Voice-Overs Generated</div>
                  <div className="usage-progress">
                    <div className="usage-fill" style={{ width: '32%' }}></div>
                  </div>
                  <div className="usage-text">8 / 25 (32%)</div>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Characters Used</div>
                  <div className="usage-progress">
                    <div className="usage-fill" style={{ width: '45%' }}></div>
                  </div>
                  <div className="usage-text">4,500 / 10,000 (45%)</div>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Projects Created</div>
                  <div className="usage-progress">
                    <div className="usage-fill" style={{ width: '50%' }}></div>
                  </div>
                  <div className="usage-text">5 / 10 (50%)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="page-placeholder">
            <h1>⚙️ Settings</h1>
            <p>Settings feature coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
