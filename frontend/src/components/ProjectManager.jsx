import React, { useState, useEffect } from 'react';
import './ProjectManager.css';

export default function ProjectManager({ onSelectProject, selectedProject }) {
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
      onSelectProject(newProject.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject === projectId) {
        onSelectProject(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="project-manager">
      <div className="project-header">
        <h2>📁 Projects</h2>
        <button
          className="new-project-btn"
          onClick={() => setShowNewProject(!showNewProject)}
        >
          + New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showNewProject && (
        <div className="new-project-form">
          <input
            type="text"
            placeholder="Project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="project-input"
          />
          <textarea
            placeholder="Description (optional)..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            className="project-input"
            rows={2}
          />
          <div className="form-buttons">
            <button
              className="btn-create"
              onClick={handleCreateProject}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              className="btn-cancel"
              onClick={() => setShowNewProject(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="projects-list">
        {projects.length === 0 ? (
          <p className="no-projects">No projects yet. Create one to get started!</p>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className={`project-card ${selectedProject === project.id ? 'active' : ''}`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="project-info">
                <h3>{project.name}</h3>
                {project.description && <p className="desc">{project.description}</p>}
                <div className="project-stats">
                  <span>🎙️ {project.voiceovers} voiceovers</span>
                  <span>📄 {project.files} files</span>
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
                title="Delete project"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
