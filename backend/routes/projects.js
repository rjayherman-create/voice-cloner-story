import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Projects directory
const PROJECTS_DIR = path.join(__dirname, '../../projects');

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// GET all projects
router.get('/projects', (req, res) => {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) {
      return res.json([]);
    }

    const projects = fs.readdirSync(PROJECTS_DIR).map(projectName => {
      const projectPath = path.join(PROJECTS_DIR, projectName);
      const metaPath = path.join(projectPath, 'project.json');
      
      let metadata = {
        id: projectName,
        name: projectName,
        createdAt: new Date().toISOString(),
        voiceovers: 0,
        files: 0
      };

      if (fs.existsSync(metaPath)) {
        metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      }

      // Count files
      const filesPath = path.join(projectPath, 'files');
      if (fs.existsSync(filesPath)) {
        metadata.files = fs.readdirSync(filesPath).length;
      }

      // Count voiceovers
      const voiceoversPath = path.join(projectPath, 'voiceovers');
      if (fs.existsSync(voiceoversPath)) {
        metadata.voiceovers = fs.readdirSync(voiceoversPath).length;
      }

      return metadata;
    });

    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// CREATE a new project
router.post('/projects', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const projectPath = path.join(PROJECTS_DIR, projectId);

    // Check if project already exists
    if (fs.existsSync(projectPath)) {
      return res.status(400).json({ error: 'Project already exists' });
    }

    // Create project directory structure
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'files'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'voiceovers'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'drafts'), { recursive: true });

    // Create project metadata file
    const metadata = {
      id: projectId,
      name: name.trim(),
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      voiceovers: 0,
      files: 0,
      status: 'active'
    };

    fs.writeFileSync(
      path.join(projectPath, 'project.json'),
      JSON.stringify(metadata, null, 2)
    );

    res.json(metadata);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET a specific project
router.get('/projects/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const metaPath = path.join(projectPath, 'project.json');

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let metadata = {};
    if (fs.existsSync(metaPath)) {
      metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }

    // Get files
    const filesPath = path.join(projectPath, 'files');
    const files = fs.existsSync(filesPath) 
      ? fs.readdirSync(filesPath).map(file => ({
          name: file,
          path: `/uploads/projects/${projectId}/files/${file}`,
          size: fs.statSync(path.join(filesPath, file)).size,
          uploadedAt: new Date().toISOString()
        }))
      : [];

    // Get voiceovers
    const voiceoversPath = path.join(projectPath, 'voiceovers');
    const voiceovers = fs.existsSync(voiceoversPath)
      ? fs.readdirSync(voiceoversPath).map(file => ({
          name: file,
          path: `/uploads/projects/${projectId}/voiceovers/${file}`,
          size: fs.statSync(path.join(voiceoversPath, file)).size,
          uploadedAt: new Date().toISOString()
        }))
      : [];

    res.json({
      ...metadata,
      files,
      voiceovers
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// UPDATE project metadata
router.put('/projects/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const metaPath = path.join(projectPath, 'project.json');

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    
    if (name) metadata.name = name;
    if (description !== undefined) metadata.description = description;
    if (status) metadata.status = status;
    metadata.updatedAt = new Date().toISOString();

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    res.json(metadata);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE a project
router.delete('/projects/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove directory and all contents
    fs.rmSync(projectPath, { recursive: true, force: true });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ADD file to project
router.post('/projects/:projectId/files', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const filesPath = path.join(projectPath, 'files');

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // This is a placeholder - actual file upload handled by multer middleware
    // File will be saved to filesPath by the upload middleware

    res.json({ message: 'File upload endpoint ready' });
  } catch (error) {
    console.error('Error adding file:', error);
    res.status(500).json({ error: 'Failed to add file' });
  }
});

// DELETE file from project
router.delete('/projects/:projectId/files/:fileName', (req, res) => {
  try {
    const { projectId, fileName } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const filePath = path.join(projectPath, 'files', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// GET project voiceovers
router.get('/projects/:projectId/voiceovers', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const voiceoversPath = path.join(projectPath, 'voiceovers');

    if (!fs.existsSync(voiceoversPath)) {
      return res.json([]);
    }

    const voiceovers = fs.readdirSync(voiceoversPath).map(file => ({
      id: file.split('.')[0],
      name: file,
      path: `/uploads/projects/${projectId}/voiceovers/${file}`,
      size: fs.statSync(path.join(voiceoversPath, file)).size,
      createdAt: new Date().toISOString()
    }));

    res.json(voiceovers);
  } catch (error) {
    console.error('Error getting voiceovers:', error);
    res.status(500).json({ error: 'Failed to get voiceovers' });
  }
});

// SAVE voiceover to project
router.post('/projects/:projectId/voiceovers', (req, res) => {
  try {
    const { projectId } = req.params;
    const { audioData, filename, voice, emotion, script } = req.body;
    const projectPath = path.join(PROJECTS_DIR, projectId);
    const voiceoversPath = path.join(projectPath, 'voiceovers');

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!fs.existsSync(voiceoversPath)) {
      fs.mkdirSync(voiceoversPath, { recursive: true });
    }

    // Save audio file (placeholder - real audio data would be a blob)
    const audioFilename = filename || `voiceover-${Date.now()}.mp3`;
    const audioPath = path.join(voiceoversPath, audioFilename);

    // Save metadata
    const metadata = {
      id: audioFilename.split('.')[0],
      filename: audioFilename,
      voice,
      emotion,
      script,
      createdAt: new Date().toISOString(),
      size: audioData ? audioData.length : 0
    };

    const metaPath = path.join(voiceoversPath, `${audioFilename}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    res.json(metadata);
  } catch (error) {
    console.error('Error saving voiceover:', error);
    res.status(500).json({ error: 'Failed to save voiceover' });
  }
});

export default router;
