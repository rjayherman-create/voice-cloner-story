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

      const voices = (data.voices || []).map(voice => {
        const voiceLower = voice.name.toLowerCase();
        const cartoonInfo = cartoonMapping[voiceLower] || null;
        const isCloned = voice.category === 'cloned' || voice.category === 'generated' || voice.category === 'custom' || voice.category === 'family';

        return {
          id: voice.voice_id,
          name: voice.name,
          category: isCloned ? 'family' : (cartoonInfo ? 'cartoon' : 'professional'),
          description: voice.description || (cartoonInfo ? cartoonInfo.style : 'High quality voice model'),
          previewUrl: voice.previewUrl || voice.preview_url,
          isCloned: isCloned,
          cartoonStyle: cartoonInfo ? cartoonInfo.cartoon : null,
          labels: voice.labels || {
            gender: voice.name.toLowerCase().includes('girl') || voice.name.toLowerCase().includes('woman') ? 'Female' : 'Male',
            accent: 'Multilingual',
            descriptive: cartoonInfo ? cartoonInfo.style : 'Professional'
          },
          samples: voice.samples || []
        };
      });

      return includeCartoonOnly ? this.filterCartoonVoices(voices) : voices;
    } catch (error) {
      console.error('Error fetching voices from ElevenLabs API:', error);
      throw error;
    }
  }

  async deleteVoice(voiceId) {
    try {
      if (!this.apiKey) return false;

      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (response.ok) {
        console.log(`Successfully deleted voice ${voiceId} from ElevenLabs.`);
        return true;
      } else {
        const err = await response.text();
        console.warn(`ElevenLabs delete voice response (${response.status}): ${err}`);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting voice ${voiceId} from ElevenLabs:`, error);
      return false;
    }
  }

  filterCartoonVoices(voices) {
    return voices.filter(v => v.category === 'cartoon');
  }

  async getVoicesByCategory(category) {
    const voices = await this.getVoices();
    return voices.filter(v => v.category === category);
  }

  /**
   * Cleans text to ensure high-fidelity pronunciation in ElevenLabs
   * Removes unsupported unicode control characters and ensures standard UTF-8 Modern Hebrew
   */
  normalizeTextForTTS(text) {
    if (!text) return '';
    let cleaned = text.normalize('NFC');
    // Remove invisible directional marks (RLM, LRM) and control characters
    cleaned = cleaned.replace(/[\u200E\u200F\u202A-\u202E\uFEFF]/g, '');
    return cleaned.trim();
  }

  /**
   * Detects if the string contains Hebrew characters
   */
  isHebrewText(text) {
    return /[\u0590-\u05FF]/.test(text);
  }

  async synthesize(text, voiceId, options = {}) {
    try {
      const cleanText = this.normalizeTextForTTS(text);
      const isHebrew = this.isHebrewText(cleanText);

      // Resolve valid ElevenLabs voice ID
      let targetVoiceId = voiceId;
      if (!targetVoiceId || targetVoiceId.startsWith('default-') || targetVoiceId === 'undefined') {
        // Fallback to standard universal ElevenLabs Rachel voice if invalid ID
        targetVoiceId = '21m00Tcm4TlvDq8ikWAM';
      }

      const stabilityVal = typeof options.stability === 'number' 
        ? options.stability 
        : this.mapEmotionToStability(options.emotion || 'neutral');

      const similarityVal = typeof options.similarityBoost === 'number' 
        ? options.similarityBoost 
        : this.mapEmotionToSimilarity(options.emotion || 'neutral');

      const styleVal = typeof options.style === 'number' ? options.style : 0.0;
      const speedVal = typeof options.speed === 'number' ? Math.max(0.7, Math.min(1.25, options.speed)) : 1.0;

      // eleven_flash_v2_5 cuts character costs in half with ultra-fast latency (~75ms)
      const modelId = options.modelId || process.env.ELEVENLABS_DEFAULT_MODEL || 'eleven_flash_v2_5';

      // Strict schema compliance for ElevenLabs API
      const payload = {
        text: cleanText,
        model_id: modelId,
        voice_settings: {
          stability: isHebrew ? Math.max(0.45, stabilityVal) : stabilityVal,
          similarity_boost: similarityVal,
          style: styleVal,
          use_speaker_boost: true,
          speed: speedVal
        }
      };

      console.log(`[ElevenLabsService] Synthesizing: voiceId=${targetVoiceId}, isHebrew=${isHebrew}, model=${modelId}, textLength=${cleanText.length}`);

      const response = await fetch(`${this.baseUrl}/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`, {
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
          const errorJson = await response.json();
          errorMsg = errorJson.detail?.message || JSON.stringify(errorJson);
        } catch (e) {
          const textErr = await response.text();
          errorMsg = textErr || errorMsg;
        }
        console.error(`[ElevenLabsService] ElevenLabs API error (${response.status}):`, errorMsg);
        throw new Error(`ElevenLabs API error (${response.status}): ${errorMsg}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error('Error synthesizing audio in ElevenLabsService:', error.message);
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
      const voices = await this.getVoices();
      const voice = voices.find(v => v.id === voiceId);
      return voice ? voice.previewUrl : null;
    } catch (error) {
      console.error('Error getting voice preview:', error);
      return null;
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }
}

export default ElevenLabsService;
