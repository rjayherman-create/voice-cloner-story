import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Voice library directory
const VOICE_LIBRARY_DIR = path.join(__dirname, '../../voice-library');

// Ensure voice library directory exists
if (!fs.existsSync(VOICE_LIBRARY_DIR)) {
  fs.mkdirSync(VOICE_LIBRARY_DIR, { recursive: true });
}

// GET all voice presets
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

// CREATE a new voice preset
router.post('/voice-library', (req, res) => {
  try {
    const { name, voiceId, voiceName, emotion, category, description } = req.body;

    if (!name || !voiceId) {
      return res.status(400).json({ error: 'Name and voiceId are required' });
    }

    const presetId = `preset-${Date.now()}`;
    const preset = {
      id: presetId,
      name: name.trim(),
      voiceId,
      voiceName: voiceName || '',
      emotion: emotion || 'neutral',
      category: category || 'professional',
      description: description || '',
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

// DELETE a voice preset
router.delete('/voice-library/:presetId', (req, res) => {
  try {
    const { presetId } = req.params;
    const filepath = path.join(VOICE_LIBRARY_DIR, `${presetId}.json`);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    fs.unlinkSync(filepath);
    res.json({ message: 'Preset deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice preset:', error);
    res.status(500).json({ error: 'Failed to delete voice preset' });
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
