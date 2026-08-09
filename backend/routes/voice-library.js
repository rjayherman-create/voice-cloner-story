import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import multer from 'multer';
import ElevenLabsService from '../services/elevenlab-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to dynamically get ElevenLabsService instance using ELEVENLABS_API_KEY environment variable
function getElevenLabsService() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new ElevenLabsService(apiKey.trim());
}

// Persistent Storage Bucket Directories
const BUCKET_BASE_DIR = process.env.STORAGE_BUCKET_PATH || 
                        process.env.BUCKET_PATH || 
                        process.env.RAILWAY_VOLUME_MOUNT_PATH || 
                        process.env.DATA_DIR || 
                        path.join(__dirname, '../../');

const VOICE_LIBRARY_DIR = path.join(BUCKET_BASE_DIR, 'voice-library');
const UPLOADS_CLONED_DIR = path.join(BUCKET_BASE_DIR, 'uploads/cloned-voices');

// Ensure bucket directories exist
function ensureBucketDirs() {
  if (!fs.existsSync(VOICE_LIBRARY_DIR)) {
    fs.mkdirSync(VOICE_LIBRARY_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_CLONED_DIR)) {
    fs.mkdirSync(UPLOADS_CLONED_DIR, { recursive: true });
  }
}
ensureBucketDirs();

// Multer storage configuration for audio sample uploads to bucket
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureBucketDirs();
    cb(null, UPLOADS_CLONED_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `sample-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 35 * 1024 * 1024 } // 35MB max
});

// GET bucket storage status
router.get('/voice-library/bucket-status', (req, res) => {
  try {
    ensureBucketDirs();
    const files = fs.readdirSync(VOICE_LIBRARY_DIR).filter(f => f.endsWith('.json'));
    const samples = fs.existsSync(UPLOADS_CLONED_DIR) ? fs.readdirSync(UPLOADS_CLONED_DIR) : [];
    
    let totalSizeBytes = 0;
    samples.forEach(s => {
      try {
        const stat = fs.statSync(path.join(UPLOADS_CLONED_DIR, s));
        totalSizeBytes += stat.size;
      } catch (e) {}
    });

    res.json({
      status: 'active',
      bucketLocation: VOICE_LIBRARY_DIR,
      clonedVoicesCount: files.length,
      sampleFilesCount: samples.length,
      totalStorageSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to inspect bucket: ' + err.message });
  }
});

// GET all voice presets / custom family voices from bucket
router.get('/voice-library', (req, res) => {
  try {
    ensureBucketDirs();
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
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json(presets);
  } catch (error) {
    console.error('Error getting voice library from bucket:', error);
    res.status(500).json({ error: 'Failed to get voice library' });
  }
});

// CLONE / CREATE a new family or custom voice and save in bucket
router.post('/voice-library/clone', upload.single('sampleFile'), async (req, res) => {
  try {
    ensureBucketDirs();
    const { name, description, gender, accent, style, relationship } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Voice name is required (e.g. Mom, Dad, Grandma Sarah)' });
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
    const elevenlabsService = getElevenLabsService();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (elevenlabsService && elevenlabsService.isConfigured() && req.file) {
      try {
        const formData = new FormData();
        formData.append('name', name.trim());
        if (description) formData.append('description', description);
        
        const labelsObj = {
          gender: gender || 'neutral',
          accent: accent || 'Israeli Hebrew / Cloned',
          style: style || 'Family Member Storyteller',
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
            'xi-api-key': apiKey.trim()
          },
          body: formData
        });

        if (elResponse.ok) {
          const elData = await elResponse.json();
          elevenLabsVoiceId = elData.voice_id;
          console.log(`[VoiceBucket] ElevenLabs voice cloned successfully: ID=${elevenLabsVoiceId}`);
        } else {
          const errText = await elResponse.text();
          console.warn(`[VoiceBucket] ElevenLabs API add voice response (${elResponse.status}): ${errText}`);
        }
      } catch (elErr) {
        console.error('[VoiceBucket] ElevenLabs voice clone attempt error:', elErr.message);
      }
    }

    // Voice record saved in bucket
    const voiceRecord = {
      id: presetId,
      voiceId: elevenLabsVoiceId || presetId,
      name: name.trim(),
      description: description || `${name.trim()} (${relationship || 'Family Member'}) cloned voice model saved in bucket storage.`,
      category: 'family',
      isCloned: true,
      isFamily: true,
      gender: gender || 'neutral',
      accent: accent || 'Israeli Hebrew / Cloned',
      style: style || 'Warm Storyteller',
      relationship: relationship || 'Family Member',
      previewUrl: sampleUrl,
      samplePath: samplePath,
      bucketStorage: 'active',
      labels: {
        gender: gender || 'neutral',
        accent: accent || 'Israeli Hebrew / Cloned',
        descriptive: style || 'Family Member',
        relationship: relationship || 'Family'
      },
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(voiceRecord, null, 2));

    console.log(`[VoiceBucket] Cloned voice saved to bucket: "${voiceRecord.name}" (${filepath})`);
    res.json(voiceRecord);
  } catch (error) {
    console.error('Error cloning custom voice to bucket:', error);
    res.status(500).json({ error: 'Failed to clone voice: ' + error.message });
  }
});

// CREATE a regular voice preset in bucket
router.post('/voice-library', (req, res) => {
  try {
    ensureBucketDirs();
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
      bucketStorage: 'active',
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
    console.error('Error creating voice preset in bucket:', error);
    res.status(500).json({ error: 'Failed to create voice preset' });
  }
});

// GET a specific voice preset from bucket
router.get('/voice-library/:presetId', (req, res) => {
  try {
    ensureBucketDirs();
    const { presetId } = req.params;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found in bucket' });
    }

    const preset = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json(preset);
  } catch (error) {
    console.error('Error getting voice preset from bucket:', error);
    res.status(500).json({ error: 'Failed to get voice preset' });
  }
});

// UPDATE a voice preset in bucket
router.put('/voice-library/:presetId', (req, res) => {
  try {
    ensureBucketDirs();
    const { presetId } = req.params;
    const { name, description, emotion } = req.body;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found in bucket' });
    }

    let preset = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    if (name) preset.name = name;
    if (description !== undefined) preset.description = description;
    if (emotion) preset.emotion = emotion;
    preset.updatedAt = new Date().toISOString();

    fs.writeFileSync(filepath, JSON.stringify(preset, null, 2));
    res.json(preset);
  } catch (error) {
    console.error('Error updating voice preset in bucket:', error);
    res.status(500).json({ error: 'Failed to update voice preset' });
  }
});

// DELETE a voice preset from bucket & clean up audio sample & delete from ElevenLabs API
router.delete('/voice-library/:presetId', async (req, res) => {
  try {
    ensureBucketDirs();
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

    // Delete sample audio file if saved in bucket storage
    if (voiceData && voiceData.samplePath && fs.existsSync(voiceData.samplePath)) {
      try {
        fs.unlinkSync(voiceData.samplePath);
        console.log(`[VoiceBucket] Deleted audio sample file: ${voiceData.samplePath}`);
      } catch (err) {
        console.error('[VoiceBucket] Error deleting audio sample file:', err);
      }
    }

    // Call ElevenLabs API to delete voice remotely if voiceId exists
    const elevenlabsService = getElevenLabsService();
    const remoteVoiceId = voiceData?.voiceId || presetId;
    if (elevenlabsService && elevenlabsService.isConfigured() && remoteVoiceId && !remoteVoiceId.startsWith('preset-') && !remoteVoiceId.startsWith('family-')) {
      await elevenlabsService.deleteVoice(remoteVoiceId);
    }

    // Unlink the preset json file from bucket
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    console.log(`[VoiceBucket] Voice ${presetId} deleted from bucket storage.`);
    res.json({ message: 'Voice deleted successfully from bucket and storage', id: presetId });
  } catch (error) {
    console.error('Error deleting voice preset from bucket:', error);
    res.status(500).json({ error: 'Failed to delete voice preset: ' + error.message });
  }
});

// INCREMENT usage count
router.post('/voice-library/:presetId/use', (req, res) => {
  try {
    ensureBucketDirs();
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
