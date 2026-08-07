/**
 * Automatic Hebrew-to-Phonetic Transliteration Engine
 * Converts Modern Hebrew text into clean, natural phonetic syllables
 * tailored specifically for ElevenLabs custom cloned voice models.
 */

class HebrewPhoneticsEngine {
  constructor() {
    this.dictionary = {
      'שלום': 'Shalom',
      'לילה': 'laila',
      'טוב': 'tov',
      'ערב': 'erev',
      'בוקר': 'boker',
      'חלומות': 'chalomot',
      'מתוקים': 'metukim',
      'פז': 'paz',
      'שינה': 'sheina',
      'מתוקה': 'metuka',
      'נעימה': 'ne\'ima',
      'נעימים': 'ne\'imim',
      'אמא': 'Ima',
      'אבא': 'Abba',
      'סבא': 'Saba',
      'סבתא': 'Savta',
      'אחות': 'achot',
      'אח': 'ach',
      'ילד': 'yeled',
      'ילדה': 'yalda',
      'ילדים': 'yeladim',
      'שלי': 'sheli',
      'שלך': 'shelcha',
      'שלנו': 'shelanu',
      'אוהב': 'ohev',
      'אוהבת': 'ohevet',
      'אותך': 'otcha',
      'מאוד': 'me\'od',
      'כוכבים': 'kochavim',
      'כוכב': 'kochav',
      'ירח': 'yare\'ach',
      'שמיים': 'shamayim',
      'שמש': 'shemesh',
      'ענן': 'anan',
      'עננים': 'ananim',
      'סיפור': 'sipur',
      'אגדה': 'agada',
      'קסום': 'kasum',
      'קסומה': 'ksuma',
      'קסם': 'kesem',
      'זהב': 'zahav',
      'מוזהב': 'muzhav',
      'נוצץ': 'notzetz',
      'נוצצים': 'notzetzim',
      'דרקון': 'drakon',
      'יער': 'ya\'ar',
      'בית': 'bayit',
      'מיטה': 'mita',
      'חם': 'cham',
      'חמימה': 'chamima',
      'שמיכה': 'smicha',
      'שקט': 'sheket',
      'שלווה': 'shalva',
      'חיבוק': 'chibuk',
      'נשיקה': 'neshika',
      'תודה': 'toda',
      'בבקשה': 'bevakasha',
      'כן': 'ken',
      'לא': 'lo',
      'מה': 'ma',
      'מי': 'mi',
      'איפה': 'eifo',
      'מתי': 'matai',
      'איך': 'eich',
      'למה': 'lama',
      'יפה': 'yafe',
      'יפהפייה': 'yefefiya',
      'גיבור': 'gibor',
      'קטן': 'katan',
      'קטנה': 'ktana',
      'גדול': 'gadol',
      'גדולה': 'gdola',
      'חבר': 'chaver',
      'חברים': 'chaverim',
      'הרפתקה': 'harpatka',
      'דרך': 'derech',
      'עולם': 'olam',
      'לב': 'lev',
      'עיניים': 'einayim',
      'שמח': 'same\'ach',
      'שמחה': 'smicha',
      'אור': 'or',
      'מנורה': 'mnora',
      'מפתח': 'mafte\'ach',
      'דלת': 'delet',
      'שער': 'sha\'ar',
      'טירה': 'tira',
      'מלך': 'melech',
      'מלכה': 'malka',
      'נסיך': 'nasich',
      'נסיכה': 'nesicha',
      'מסע': 'massa',
      'ספינה': 'sfina',
      'ים': 'yam',
      'אי': 'ee',
      'דניאל': 'Daniel',
      'יאיר': 'Yair',
      'אמה': 'Emma',
      'ליאו': 'Leo',
      'מיה': 'Maya',
      'רועי': 'Roee',
      'נועם': 'Noam'
    };

    // Character mapping for unknown Hebrew words
    this.charMap = {
      'א': 'a',
      'ב': 'b',
      'ג': 'g',
      'ד': 'd',
      'ה': 'h',
      'ו': 'v',
      'ז': 'z',
      'ח': 'ch',
      'ט': 't',
      'י': 'y',
      'כ': 'k',
      'ך': 'ch',
      'ל': 'l',
      'מ': 'm',
      'ם': 'm',
      'נ': 'n',
      'ן': 'n',
      'ס': 's',
      'ע': 'a',
      'פ': 'p',
      'ף': 'f',
      'צ': 'tz',
      'ץ': 'tz',
      'ק': 'k',
      'ר': 'r',
      'ש': 'sh',
      'ת': 't'
    };
  }

  /**
   * Transliterates a Hebrew sentence into clean, natural English phonetic syllables
   */
  transliterate(hebrewText) {
    if (!hebrewText) return '';

    // Clean directional marks
    const cleaned = hebrewText.replace(/[\u200E\u200F\u202A-\u202E\uFEFF]/g, '').trim();

    // Tokenize into words and punctuation
    const tokens = cleaned.split(/(\s+|[.,!?;:"'—–()]+)/);

    const result = tokens.map(token => {
      if (/^\s+$/.test(token) || /^[.,!?;:"'—–()]+$/.test(token)) {
        return token;
      }

      // Check dictionary match
      const lower = token.trim();
      if (this.dictionary[lower]) {
        return this.dictionary[lower];
      }

      // Handle common single-letter prefixes (ו, ה, ב, ל, כ, מ, ש)
      if (lower.length > 2) {
        const firstChar = lower[0];
        const rest = lower.slice(1);
        const prefixMap = {
          'ו': 've\'',
          'ה': 'ha\'',
          'ב': 'be\'',
          'ל': 'le\'',
          'כ': 'ke\'',
          'מ': 'mi\'',
          'ש': 'she\''
        };

        if (prefixMap[firstChar] && this.dictionary[rest]) {
          return prefixMap[firstChar] + this.dictionary[rest].toLowerCase();
        }
      }

      // Fallback: character-by-character mapping
      let phonetics = '';
      for (let i = 0; i < token.length; i++) {
        const ch = token[i];
        phonetics += this.charMap[ch] || ch;
      }

      return phonetics;
    }).join('');

    return result;
  }
}

export default new HebrewPhoneticsEngine();
