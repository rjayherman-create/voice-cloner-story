import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import voiceoverRoutes from './routes/voiceover.js';
import projectsRoutes from './routes/projects.js';
import voiceLibraryRoutes from './routes/voice-library.js';
import billingRoutes from './routes/billing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../projects')));

// API Routes
app.use('/api/voiceover', voiceoverRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api', projectsRoutes);
app.use('/api', voiceLibraryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'voice-over-system', 
    features: ['voiceover', 'projects', 'voice-library'],
    timestamp: new Date().toISOString() 
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🎙️ Voice Over System running at http://localhost:${PORT}`);
  console.log(`📁 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`🎤 Voice Library: http://localhost:${PORT}/api/voice-library`);
  console.log(`✅ ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? 'LOADED (' + process.env.ELEVENLABS_API_KEY.substring(0, 10) + '...)' : 'NOT FOUND'}`);
});
