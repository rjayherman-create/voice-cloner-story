// backend/services/translation-service.js
// Neural translation service supporting all 30+ languages (English, Hebrew, Spanish, French, German, Japanese, etc.)

class TranslationService {
  /**
   * Translates text to the target language code.
   * @param {string} text - The input text to translate.
   * @param {string} targetLang - Target ISO language code (e.g. 'he', 'es', 'fr', 'de', 'en', 'ja', 'zh', 'ar', 'ru', 'pt', 'it')
   * @param {string} [sourceLang='auto'] - Source language or 'auto'
   * @returns {Promise<string>}
   */
  async translate(text, targetLang, sourceLang = 'auto') {
    if (!text || !text.trim()) return '';
    const cleanTarget = (targetLang || 'en').toLowerCase().split('-')[0];
    
    // Map standard language codes if needed (e.g. iw -> he, zh-cn -> zh)
    const langMap = {
      'he': 'iw', // Google Translate uses 'iw' for Hebrew
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
      'ru': 'ru'
    };

    const target = langMap[cleanTarget] || cleanTarget;
    const cleanSource = (sourceLang || 'auto').toLowerCase().split('-')[0];
    const source = cleanSource === 'auto' ? 'auto' : (langMap[cleanSource] || cleanSource);

    try {
      // Chunk into manageable blocks if text is very long
      const chunks = this.chunkText(text.trim(), 1200);
      const translatedChunks = [];

      for (const chunk of chunks) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(chunk)}`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });

        if (!response.ok) {
          throw new Error(`Google Translate responded with HTTP ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translatedPart = data[0].map(item => item[0]).filter(Boolean).join('');
          translatedChunks.push(translatedPart);
        } else {
          translatedChunks.push(chunk);
        }
      }

      return translatedChunks.join(' ');
    } catch (err) {
      console.error('[TranslationService] Translation error:', err.message);
      // If network fails, return original text safely
      return text;
    }
  }

  /**
   * Split long text by paragraphs or sentences
   */
  chunkText(text, maxLen = 1200) {
    if (text.length <= maxLen) return [text];
    const paragraphs = text.split('\n\n');
    const chunks = [];
    let current = '';

    for (const p of paragraphs) {
      if ((current + '\n\n' + p).length <= maxLen) {
        current = current ? current + '\n\n' + p : p;
      } else {
        if (current) chunks.push(current);
        if (p.length <= maxLen) {
          current = p;
        } else {
          // Break paragraph by sentences
          const sentences = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [p];
          let subChunk = '';
          for (const s of sentences) {
            if ((subChunk + s).length <= maxLen) {
              subChunk += s;
            } else {
              if (subChunk) chunks.push(subChunk.trim());
              subChunk = s;
            }
          }
          current = subChunk.trim();
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }
}

const translationService = new TranslationService();
export default translationService;
