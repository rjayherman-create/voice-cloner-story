import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import multer from 'multer';
import ElevenLabsService from '../services/elevenlab-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Directories
const VOICE_LIBRARY_DIR = path.join(__dirname, '../../voice-library');
const UPLOADS_CLONED_DIR = path.join(__dirname, '../../uploads/cloned-voices');

// Ensure directories exist
if (!fs.existsSync(VOICE_LIBRARY_DIR)) {
  fs.mkdirSync(VOICE_LIBRARY_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_CLONED_DIR)) {
  fs.mkdirSync(UPLOADS_CLONED_DIR, { recursive: true });
}

// Multer storage configuration for audio samples
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_CLONED_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `sample-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Initialize ElevenLabs Service
const elevenlabsService = new ElevenLabsService(process.env.ELEVENLABS_API_KEY);

// GET all voice presets / custom family voices
router.get('/voice-library', (req, res) => {
  try {
    if (!fs.existsSync(VOICE_LIBRARY_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(VOICE_LIBRARY_DIR);
    const presets = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(VOICE_LIBRARY_DIR, file);
        try {
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          return data;
        } catch (err) {
          console.error(`Error reading ${file}:`, err);
          return null;
        }
      })
      .filter(Boolean);

    res.json(presets);
  } catch (error) {
    console.error('Error getting voice library:', error);
    res.status(500).json({ error: 'Failed to get voice library' });
  }
});

// CLONE / CREATE a new family or custom voice
router.post('/voice-library/clone', upload.single('sampleFile'), async (req, res) => {
  try {
    const { name, description, gender, accent, style, relationship } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Voice name is required' });
    }

    const presetId = `family-${Date.now()}`;
    let sampleUrl = null;
    let samplePath = null;

    if (req.file) {
      samplePath = req.file.path;
      sampleUrl = `/uploads/cloned-voices/${req.file.filename}`;
    }

    let elevenLabsVoiceId = null;

    // Call ElevenLabs API to add voice clone if API key & sample file available
    if (elevenlabsService.isConfigured() && req.file) {
      try {
        const formData = new FormData();
        formData.append('name', name.trim());
        if (description) formData.append('description', description);
        
        const labelsObj = {
          gender: gender || 'neutral',
          accent: accent || 'American',
          style: style || 'Family Member',
          relationship: relationship || 'Family'
        };
        formData.append('labels', JSON.stringify(labelsObj));

        // Read file buffer and create Blob
        const fileBuffer = fs.readFileSync(req.file.path);
        const blob = new Blob([fileBuffer], { type: req.file.mimetype || 'audio/mpeg' });
        formData.append('files', blob, req.file.originalname);

        const elResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          body: formData
        });

        if (elResponse.ok) {
          const elData = await elResponse.json();
          elevenLabsVoiceId = elData.voice_id;
          console.log(`ElevenLabs voice created successfully with ID: ${elevenLabsVoiceId}`);
        } else {
          const errText = await elResponse.text();
          console.warn(`ElevenLabs API add voice warning (${elResponse.status}): ${errText}`);
        }
      } catch (elErr) {
        console.error('Error calling ElevenLabs voice clone API:', elErr);
      }
    }

    const voiceRecord = {
      id: presetId,
      voiceId: elevenLabsVoiceId || presetId,
      name: name.trim(),
      description: description || '',
      category: 'family',
      isCloned: true,
      isFamily: true,
      gender: gender || 'neutral',
      accent: accent || 'American',
      style: style || 'Conversational',
      relationship: relationship || 'Family Member',
      previewUrl: sampleUrl,
      samplePath: samplePath,
      labels: {
        gender: gender || 'neutral',
        accent: accent || 'American',
        descriptive: style || 'Family Member',
        relationship: relationship || 'Family'
      },
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(voiceRecord, null, 2));

    res.json(voiceRecord);
  } catch (error) {
    console.error('Error cloning custom voice:', error);
    res.status(500).json({ error: 'Failed to clone voice: ' + error.message });
  }
});

// CREATE a regular voice preset
router.post('/voice-library', (req, res) => {
  try {
    const { name, voiceId, voiceName, emotion, category, description, gender, accent, style, relationship } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const presetId = `preset-${Date.now()}`;
    const preset = {
      id: presetId,
      voiceId: voiceId || presetId,
      name: name.trim(),
      voiceName: voiceName || '',
      emotion: emotion || 'neutral',
      category: category || 'family',
      isCloned: category === 'family' || category === 'cloned',
      isFamily: category === 'family' || category === 'cloned',
      description: description || '',
      gender: gender || 'neutral',
      accent: accent || 'American',
      style: style || 'Professional',
      relationship: relationship || 'Family',
      labels: {
        gender: gender || 'neutral',
        accent: accent || 'American',
        descriptive: style || 'Professional'
      },
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(preset, null, 2));

    res.json(preset);
  } catch (error) {
    console.error('Error creating voice preset:', error);
    res.status(500).json({ error: 'Failed to create voice preset' });
  }
});

// GET a specific voice preset
router.get('/voice-library/:presetId', (req, res) => {
  try {
    const { presetId } = req.params;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    const preset = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json(preset);
  } catch (error) {
    console.error('Error getting voice preset:', error);
    res.status(500).json({ error: 'Failed to get voice preset' });
  }
});

// UPDATE a voice preset
router.put('/voice-library/:presetId', (req, res) => {
  try {
    const { presetId } = req.params;
    const { name, description, emotion } = req.body;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    let preset = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    if (name) preset.name = name;
    if (description !== undefined) preset.description = description;
    if (emotion) preset.emotion = emotion;
    preset.updatedAt = new Date().toISOString();

    fs.writeFileSync(filepath, JSON.stringify(preset, null, 2));
    res.json(preset);
  } catch (error) {
    console.error('Error updating voice preset:', error);
    res.status(500).json({ error: 'Failed to update voice preset' });
  }
});

// DELETE a voice preset & clean up files & delete from ElevenLabs API
router.delete('/voice-library/:presetId', async (req, res) => {
  try {
    const { presetId } = req.params;
    
    // Check if preset ID maps to a file in VOICE_LIBRARY_DIR
    const files = fs.readdirSync(VOICE_LIBRARY_DIR);
    let matchedFile = files.find(f => f === `${presetId}.json` || f.includes(presetId));

    let voiceData = null;
    let filepath = null;

    if (matchedFile) {
      filepath = path.join(VOICE_LIBRARY_DIR, matchedFile);
      try {
        voiceData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      } catch (e) {
        console.error('Error parsing preset before delete:', e);
      }
    }

    // Delete sample file if saved locally in bucket storage
    if (voiceData && voiceData.samplePath && fs.existsSync(voiceData.samplePath)) {
      try {
        fs.unlinkSync(voiceData.samplePath);
        console.log(`Deleted audio sample file: ${voiceData.samplePath}`);
      } catch (err) {
        console.error('Error deleting audio sample file:', err);
      }
    }

    // Call ElevenLabs API to delete voice remotely if voiceId exists
    const remoteVoiceId = voiceData?.voiceId || presetId;
    if (elevenlabsService.isConfigured() && remoteVoiceId && !remoteVoiceId.startsWith('preset-') && !remoteVoiceId.startsWith('family-')) {
      await elevenlabsService.deleteVoice(remoteVoiceId);
    }

    // Unlink the preset json file
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    res.json({ message: 'Voice deleted successfully from app and storage', id: presetId });
  } catch (error) {
    console.error('Error deleting voice preset:', error);
    res.status(500).json({ error: 'Failed to delete voice preset: ' + error.message });
  }
});

// INCREMENT usage count
router.post('/voice-library/:presetId/use', (req, res) => {
  try {
    const { presetId } = req.params;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    let preset = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    preset.usageCount = (preset.usageCount || 0) + 1;
    preset.lastUsedAt = new Date().toISOString();

    fs.writeFileSync(filepath, JSON.stringify(preset, null, 2));
    res.json(preset);
  } catch (error) {
    console.error('Error updating usage count:', error);
    res.status(500).json({ error: 'Failed to update usage count' });
  }
});

export default router;
