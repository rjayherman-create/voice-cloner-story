import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Render animation to video
router.post('/animation/render', async (req, res) => {
  try {
    const { project, format = 'mp4' } = req.body;

    if (!project) {
      return res.status(400).json({ error: 'Project data required' });
    }

    const tempDir = path.join('/tmp', `animation-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Generate frames
    const framesDir = path.join(tempDir, 'frames');
    await fs.mkdir(framesDir, { recursive: true });

    const totalFrames = project.duration * project.fps;

    // For each frame, render canvas to image
    for (let frame = 0; frame < totalFrames; frame++) {
      const frameData = await renderFrame(project, frame);
      const framePath = path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`);
      await fs.writeFile(framePath, frameData);

      if (frame % 30 === 0) {
        console.log(`Rendered frame ${frame}/${totalFrames}`);
      }
    }

    // Create video from frames using ffmpeg
    const outputPath = path.join(tempDir, `animation.${format}`);
    
    const ffmpegArgs = [
      '-framerate', String(project.fps),
      '-i', path.join(framesDir, 'frame-%06d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-y',
      outputPath
    ];

    // Add audio if present
    if (project.timeline.voiceover) {
      ffmpegArgs.push('-i', project.timeline.voiceover.audioPath);
      ffmpegArgs.push('-c:a', 'aac');
      ffmpegArgs.push('-shortest');
    }

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg: ${data}`);
      });
    });

    // Send file
    const videoBuffer = await fs.readFile(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}.${format}"`);
    res.send(videoBuffer);

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Render failed', details: error.message });
  }
});

// Render single frame (placeholder - in real implementation, use puppeteer/playwright)
async function renderFrame(project, frameNumber) {
  // This would use Puppeteer or similar to render the canvas
  // For now, returning a placeholder
  return Buffer.from('');
}

// Upload audio for voice-over
router.post('/animation/upload-audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    res.json({
      success: true,
      audioPath: req.file.path,
      filename: req.file.originalname,
      duration: req.body.duration || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get project list
router.get('/animation/projects', async (req, res) => {
  try {
    const projectsDir = path.join(process.cwd(), 'projects');
    
    try {
      const files = await fs.readdir(projectsDir);
      const projects = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const projectData = await fs.readFile(
            path.join(projectsDir, file),
            'utf-8'
          );
          projects.push(JSON.parse(projectData));
        }
      }

      res.json(projects);
    } catch (error) {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Save project
router.post('/animation/projects', async (req, res) => {
  try {
    const { project } = req.body;

    if (!project || !project.name) {
      return res.status(400).json({ error: 'Project name required' });
    }

    const projectsDir = path.join(process.cwd(), 'projects');
    await fs.mkdir(projectsDir, { recursive: true });

    const filename = `${project.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const filepath = path.join(projectsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(project, null, 2));

    res.json({
      success: true,
      projectId: filename,
      message: 'Project saved successfully'
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

export default router;
