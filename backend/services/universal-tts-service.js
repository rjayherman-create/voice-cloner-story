// backend/services/universal-tts-service.js
// 100% Free Universal Neural TTS Engine for ALL 30+ Languages ($0.00 Cost)

class UniversalTtsService {
  constructor() {
    this.langMap = {
      'he': 'iw',
      'iw': 'iw',
      'en': 'en',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ja': 'ja',
      'zh': 'zh-CN',
      'ko': 'ko',
      'hi': 'hi',
      'ar': 'ar',
      'nl': 'nl',
      'ru': 'ru',
      'pl': 'pl',
      'tr': 'tr',
      'sv': 'sv',
      'id': 'id',
      'vi': 'vi',
      'tl': 'tl',
      'uk': 'uk',
      'el': 'el',
      'cs': 'cs',
      'fi': 'fi',
      'ro': 'ro',
      'da': 'da',
      'no': 'no',
      'hu': 'hu',
      'th': 'th',
      'ms': 'ms'
    };
  }

  /**
   * Split long text into natural sentence chunks
   */
  chunkText(text, maxLength = 180) {
    if (!text || text.length <= maxLength) return [text];
    const sentences = text.match(/[^.!?,\n]+[.!?,\n]*/g) || [text];
    const chunks = [];
    let current = '';

    for (const s of sentences) {
      if ((current + s).length > maxLength) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  /**
   * Synthesizes audio in ANY language using Google Neural TTS ($0.00 Free)
   * @param {string} text - The text to speak
   * @param {string} langCode - Language code ('en', 'he', 'es', 'fr', 'de', 'ja', 'zh', 'ar', etc.)
   * @param {string} voiceName - Optional voice personality identifier
   * @returns {Promise<Buffer>}
   */
  async synthesize(text, langCode = 'en', voiceName = 'Standard') {
    try {
      const cleanLang = (langCode || 'en').toLowerCase().split('-')[0];
      const targetTl = this.langMap[cleanLang] || cleanLang;
      const cleanText = text
        .replace(/\[VISUAL:[^\]]*\]/gi, '')
        .replace(/\[SCENE[^\]]*\]/gi, '')
        .replace(/\[VOICEOVER\]:?/gi, '')
        .replace(/\[ויז'ואל:[^\]]*\]/gi, '')
        .replace(/\[סצינה[^\]]*\]/gi, '')
        .replace(/\[קריינות\]:?/gi, '')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      console.log(`[UniversalTtsService] Synthesizing 100% Free Neural Audio: lang=${targetTl}, voice=${voiceName}, chars=${cleanText.length}`);

      const chunks = this.chunkText(cleanText, 180);
      const audioBuffers = [];

      for (const chunk of chunks) {
        const encodedText = encodeURIComponent(chunk);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetTl}&client=tw-ob&q=${encodedText}`;

        const response = await fetch(ttsUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/'
          }
        });

        if (!response.ok) {
          throw new Error(`Universal Free TTS service response code: ${response.status}`);
        }

        const arrayBuf = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }

      return Buffer.concat(audioBuffers);
    } catch (error) {
      console.error('[UniversalTtsService] Synthesis error:', error.message);
      throw error;
    }
  }
}

const universalTtsService = new UniversalTtsService();
export default universalTtsService;
