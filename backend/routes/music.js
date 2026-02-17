import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Suno AI Music Generation
router.post('/music/generate-suno', async (req, res) => {
  try {
    const { prompt, duration = 30, style = 'ambient' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Music prompt required' });
    }

    if (!process.env.SUNO_API_KEY) {
      return res.status(400).json({ error: 'Suno API key not configured' });
    }

    const response = await fetch('https://api.suno.ai/api/custom_generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration,
        style,
        make_instrumental: false
      })
    });

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      service: 'suno',
      trackId: data.id,
      status: data.status,
      audioUrl: data.audio_url,
      prompt,
      duration,
      style
    });
  } catch (error) {
    console.error('Suno generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unetic AI Music Generation
router.post('/music/generate-unetic', async (req, res) => {
  try {
    const { prompt, duration = 30, genre = 'ambient' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Music prompt required' });
    }

    if (!process.env.UNETIC_API_KEY) {
      return res.status(400).json({ error: 'Unetic API key not configured' });
    }

    const response = await fetch('https://api.unetic.ai/v1/music/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNETIC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration,
        genre,
        quality: 'high'
      })
    });

    if (!response.ok) {
      throw new Error(`Unetic API error: ${response.statusText}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      service: 'unetic',
      trackId: data.id,
      status: data.status,
      audioUrl: data.url,
      prompt,
      duration,
      genre
    });
  } catch (error) {
    console.error('Unetic generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AudioCraft (Meta) Music Generation
router.post('/music/generate-audiocraft', async (req, res) => {
  try {
    const { prompt, duration = 30 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Music prompt required' });
    }

    if (!process.env.AUDIOCRAFT_API_KEY) {
      return res.status(400).json({ error: 'AudioCraft API key not configured' });
    }

    const response = await fetch('https://api.audiocraft.meta.com/v1/musicgen', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AUDIOCRAFT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: prompt,
        duration,
        temperature: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`AudioCraft API error: ${response.statusText}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      service: 'audiocraft',
      trackId: data.id,
      status: 'generated',
      audioUrl: data.audio_url,
      prompt,
      duration
    });
  } catch (error) {
    console.error('AudioCraft generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic music generation endpoint (automatically picks best available service)
router.post('/music/generate', async (req, res) => {
  try {
    const { prompt, duration = 30, genre = 'ambient', service = 'auto' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Music prompt required' });
    }

    let selectedService = service;

    // Auto-select service based on what's configured
    if (service === 'auto') {
      if (process.env.SUNO_API_KEY) selectedService = 'suno';
      else if (process.env.UNETIC_API_KEY) selectedService = 'unetic';
      else if (process.env.AUDIOCRAFT_API_KEY) selectedService = 'audiocraft';
      else {
        return res.status(400).json({ 
          error: 'No music generation API configured. Please add SUNO_API_KEY, UNETIC_API_KEY, or AUDIOCRAFT_API_KEY' 
        });
      }
    }

    // Route to appropriate service
    if (selectedService === 'suno') {
      return await generateSuno(prompt, duration, genre, res);
    } else if (selectedService === 'unetic') {
      return await generateUnetic(prompt, duration, genre, res);
    } else if (selectedService === 'audiocraft') {
      return await generateAudioCraft(prompt, duration, res);
    } else {
      return res.status(400).json({ error: 'Unknown service' });
    }

  } catch (error) {
    console.error('Music generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get music generation status
router.get('/music/status/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { service = 'suno' } = req.query;

    if (!trackId) {
      return res.status(400).json({ error: 'Track ID required' });
    }

    // Poll Suno for status
    if (service === 'suno' && process.env.SUNO_API_KEY) {
      const response = await fetch(`https://api.suno.ai/api/metadata/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SUNO_API_KEY}`
        }
      });

      const data = await response.json();
      return res.json({
        service: 'suno',
        trackId,
        status: data.status,
        audioUrl: data.audio_url || null,
        completed: data.status === 'complete'
      });
    }

    res.status(400).json({ error: 'Service not configured' });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List popular music styles
router.get('/music/styles', (req, res) => {
  const styles = [
    { id: 'ambient', label: 'Ambient', description: 'Calm, atmospheric background' },
    { id: 'electronic', label: 'Electronic', description: 'Digital, synth-based' },
    { id: 'cinematic', label: 'Cinematic', description: 'Epic, movie-like' },
    { id: 'lofi', label: 'Lo-Fi', description: 'Relaxed, vintage' },
    { id: 'corporate', label: 'Corporate', description: 'Professional, upbeat' },
    { id: 'jazz', label: 'Jazz', description: 'Smooth, improvised' },
    { id: 'orchestral', label: 'Orchestral', description: 'Classical, strings' },
    { id: 'folk', label: 'Folk', description: 'Acoustic, traditional' },
    { id: 'pop', label: 'Pop', description: 'Catchy, upbeat' },
    { id: 'rock', label: 'Rock', description: 'Energetic, guitar-driven' }
  ];

  res.json(styles);
});

// Helper functions
async function generateSuno(prompt, duration, genre, res) {
  try {
    const response = await fetch('https://api.suno.ai/api/custom_generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration,
        style: genre,
        make_instrumental: false
      })
    });

    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      service: 'suno',
      trackId: data.id,
      status: data.status,
      audioUrl: data.audio_url,
      prompt,
      duration,
      genre
    });
  } catch (error) {
    throw error;
  }
}

async function generateUnetic(prompt, duration, genre, res) {
  try {
    const response = await fetch('https://api.unetic.ai/v1/music/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNETIC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        duration,
        genre,
        quality: 'high'
      })
    });

    if (!response.ok) {
      throw new Error(`Unetic API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      service: 'unetic',
      trackId: data.id,
      status: data.status,
      audioUrl: data.url,
      prompt,
      duration,
      genre
    });
  } catch (error) {
    throw error;
  }
}

async function generateAudioCraft(prompt, duration, res) {
  try {
    const response = await fetch('https://api.audiocraft.meta.com/v1/musicgen', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AUDIOCRAFT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: prompt,
        duration,
        temperature: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`AudioCraft API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      service: 'audiocraft',
      trackId: data.id,
      status: 'generated',
      audioUrl: data.audio_url,
      prompt,
      duration
    });
  } catch (error) {
    throw error;
  }
}

export default router;
