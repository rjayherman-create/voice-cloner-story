import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ElevenLabsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.voicesCache = null;
    this.cacheFile = path.join(__dirname, '.voices-cache.json');
  }

  getCartoonVoiceMapping() {
    return {
      'onyx': { name: 'Deep Narrator', cartoon: 'deep_voice', style: 'Narrator type voice' },
      'adam': { name: 'Action Hero', cartoon: 'action_hero', style: 'Bold, commanding' },
      'bill': { name: 'Friendly Character', cartoon: 'friendly', style: 'Warm, approachable' },
      'callum': { name: 'British Gentleman', cartoon: 'british', style: 'Posh, refined' },
      'george': { name: 'Villain', cartoon: 'villain', style: 'Deep, menacing' },
      'liam': { name: 'Irish Rogue', cartoon: 'rogue', style: 'Irish accent, witty' },
      'sam': { name: 'Sidekick', cartoon: 'sidekick', style: 'Cheerful, energetic' },
      'alice': { name: 'Smart Heroine', cartoon: 'heroine', style: 'Confident, intelligent' },
      'bella': { name: 'Young Character', cartoon: 'young', style: 'Light, youthful' },
      'charlotte': { name: 'Wise Woman', cartoon: 'wise', style: 'Warm, maternal' },
      'emily': { name: 'Energetic Girl', cartoon: 'energetic_girl', style: 'Enthusiastic, fun' },
      'iva': { name: 'Strong Woman', cartoon: 'strong', style: 'Powerful, authoritative' },
      'mimi': { name: 'Sweet Character', cartoon: 'sweet', style: 'Cute, gentle' },
      'oliver': { name: 'Mischievous Boy', cartoon: 'mischievous', style: 'Playful, cheeky' },
      'sarah': { name: 'Girl Next Door', cartoon: 'girl_next_door', style: 'Natural, friendly' }
    };
  }

  async getVoices(includeCartoonOnly = false) {
    // Fetch from API - always get fresh data to include user's custom voices
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      const cartoonMapping = this.getCartoonVoiceMapping();

      // Include ALL voices - premade, professional, and user-created
      const voices = (data.voices || []).map(voice => {
        const voiceLower = voice.name.toLowerCase();
        const cartoonInfo = cartoonMapping[voiceLower] || null;

        return {
          id: voice.voice_id,
          name: voice.name,
          category: cartoonInfo ? 'cartoon' : (voice.category || 'professional'),
          description: voice.description || '',
          previewUrl: voice.preview_url || '',
          labels: voice.labels || {},
          cartoonStyle: cartoonInfo ? cartoonInfo.style : null,
          cartoonCharacter: cartoonInfo ? cartoonInfo.cartoon : null,
          cartoonName: cartoonInfo ? cartoonInfo.name : null
        };
      });

      console.log(`Loaded ${voices.length} voices from ElevenLabs`);
      return includeCartoonOnly 
        ? this.filterCartoonVoices(voices)
        : voices;
    } catch (error) {
      console.error('Error fetching voices from ElevenLabs:', error);
      throw new Error('Failed to fetch voices from ElevenLabs');
    }
  }

  filterCartoonVoices(voices) {
    return voices.filter(v => v.category === 'cartoon');
  }

  async getVoicesByCategory(category) {
    const voices = await this.getVoices();
    return voices.filter(v => v.category === category);
  }

  async synthesize(text, voiceId, options = {}) {
    try {
      const payload = {
        text,
        model_id: options.modelId || 'eleven_turbo_v2_5',
        voice_settings: {
          stability: this.mapEmotionToStability(options.emotion || 'neutral'),
          similarity_boost: this.mapEmotionToSimilarity(options.emotion || 'neutral')
        }
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = `${response.status}`;
        try {
          const error = await response.json();
          errorMsg = error.detail?.message || JSON.stringify(error);
        } catch (e) {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(`ElevenLabs API error: ${errorMsg}`);
      }

      // Get audio as buffer
      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error('Error synthesizing audio:', error);
      throw error;
    }
  }

  mapEmotionToStability(emotion) {
    const emotionMap = {
      'neutral': 0.5,
      'happy': 0.75,
      'sad': 0.4,
      'angry': 0.3,
      'excited': 0.8,
      'calm': 0.6,
      'serious': 0.45
    };
    return emotionMap[emotion] || 0.5;
  }

  mapEmotionToSimilarity(emotion) {
    const emotionMap = {
      'neutral': 0.75,
      'happy': 0.9,
      'sad': 0.6,
      'angry': 0.8,
      'excited': 0.95,
      'calm': 0.85,
      'serious': 0.7
    };
    return emotionMap[emotion] || 0.75;
  }

  async getVoicePreview(voiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get voice preview: ${response.status}`);
      }

      const data = await response.json();
      return data.preview_url || null;
    } catch (error) {
      console.error('Error getting voice preview:', error);
      return null;
    }
  }

  isConfigured() {
    return !!this.apiKey;
  }
}

export default ElevenLabsService;
