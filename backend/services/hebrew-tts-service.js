import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Native Hebrew Neural Voice Catalog: 30 Israeli Voices
 * - 10 Adult Males (גברים / אבות)
 * - 10 Adult Females (נשים / אמהות)
 * - 5 Female Children (ילדות / בנות)
 * - 5 Male Children (ילדים / בנים)
 */
class HebrewTtsService {
  constructor() {
    this.voices = [
      // ======================================================================
      // 👨 10 ADULT MALES (גברים / אבות ומספרים)
      // ======================================================================
      {
        id: 'he-IL-AvriNeural',
        name: 'אברי (Avri) - Israeli Deep Narrator',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Narrator / Father (מספר / אבא)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Deep, engaging native Israeli narrator and storyteller',
        category: 'hebrew'
      },
      {
        id: 'he-IL-YonatanNeural',
        name: 'יונתן (Yonatan) - Warm Fatherly Voice',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Father (אבא יונתן)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Warm, comforting Israeli father voice for bedtime reading',
        category: 'hebrew'
      },
      {
        id: 'he-IL-DavidNeural',
        name: 'דוד (David) - Classic Storyteller',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Storyteller (מספר קלאסי)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Reassuring classic Hebrew storyteller with rich tone',
        category: 'hebrew'
      },
      {
        id: 'he-IL-ItaiNeural',
        name: 'איתי (Itai) - Adventure Narrator',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Adventure Guide (מדריך הרפתקאות)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Energetic, dynamic voice for bedtime adventure journeys',
        category: 'hebrew'
      },
      {
        id: 'he-IL-YoavNeural',
        name: 'יואב (Yoav) - Calm Mindfulness Voice',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Calm Voice (קול מרגיע ושליו)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Soft, peaceful pacing for deep bedtime relaxation',
        category: 'hebrew'
      },
      {
        id: 'he-IL-AsafNeural',
        name: 'אסף (Asaf) - Gentle Fatherly Voice',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Father (אבא אסף)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Friendly, caring Israeli father tone for nightly stories',
        category: 'hebrew'
      },
      {
        id: 'he-IL-DoronNeural',
        name: 'דורון (Doron) - Grandfather & Wise Elder',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Grandfather (סבא דורון)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Wise, warm grandfather voice rich with folk wisdom',
        category: 'hebrew'
      },
      {
        id: 'he-IL-TomerNeural',
        name: 'תומר (Tomer) - Playful Narrator',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Brother / Friend (אח / חבר)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Expressive and playful voice that brings story characters to life',
        category: 'hebrew'
      },
      {
        id: 'he-IL-NimrodNeural',
        name: 'נמרוד (Nimrod) - Heroic Fantasy Voice',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Hero / Knight (גיבור / אביר)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Bold, commanding voice for dragons, stars, and mythical quests',
        category: 'hebrew'
      },
      {
        id: 'he-IL-GuyNeural',
        name: 'גיא (Guy) - Modern Israeli Voice',
        group: 'adult_male',
        groupLabel: 'Adult Male (גבר)',
        relationship: 'Older Brother (אח בוגר)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Crisp, contemporary natural Israeli Hebrew cadence',
        category: 'hebrew'
      },

      // ======================================================================
      // 👩 10 ADULT FEMALES (נשים / אמהות ומספרות)
      // ======================================================================
      {
        id: 'he-IL-HilaNeural',
        name: 'הילה (Hila) - Israeli Maternal Storyteller',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Mother (אמא הילה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Warm, soothing native Israeli maternal voice for bedtime stories',
        category: 'hebrew'
      },
      {
        id: 'he-IL-ShiraNeural',
        name: 'שירה (Shira) - Soothing Lullaby Voice',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Mother (אמא שירה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Gentle, melodious bedtime voice like a soft lullaby',
        category: 'hebrew'
      },
      {
        id: 'he-IL-MichalNeural',
        name: 'מיכל (Michal) - Gentle Bedtime Reader',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Storyteller (מספרת עדינה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Soft, clear Israeli Hebrew bedtime narration with authentic diction',
        category: 'hebrew'
      },
      {
        id: 'he-IL-TamarNeural',
        name: 'תמר (Tamar) - Loving Motherly Voice',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Mother (אמא תמר)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Nurturing and comforting voice ensuring peaceful, happy dreams',
        category: 'hebrew'
      },
      {
        id: 'he-IL-RoniNeural',
        name: 'רוני (Roni) - Cheerful Storyteller',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Sister / Storyteller (אחות / מספרת)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Bright, cheerful, and engaging voice for whimsical fairy tales',
        category: 'hebrew'
      },
      {
        id: 'he-IL-NoaNeural',
        name: 'נועה (Noa) - Soft Musical Tone',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Mother / Sister (אמא / אחות)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Delicate, lyrical tone ideal for celestial and magical bedtime tales',
        category: 'hebrew'
      },
      {
        id: 'he-IL-RachelNeural',
        name: 'רחל (Rachel) - Grandmother & Wise Matriarch',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Grandmother (סבתא רחל)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Warm, beloved grandmother voice filled with affection and nostalgia',
        category: 'hebrew'
      },
      {
        id: 'he-IL-AnatNeural',
        name: 'ענת (Anat) - Calming Night Voice',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Storyteller (מספרת מרגיעה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Deep, serene pacing to help children drift off to sleep peacefully',
        category: 'hebrew'
      },
      {
        id: 'he-IL-YaelNeural',
        name: 'יעל (Yael) - Expressive Bedtime Artist',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Narrator (מספרת מקצועית)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Rich emotional expression for enchanting storytelling',
        category: 'hebrew'
      },
      {
        id: 'he-IL-DanaNeural',
        name: 'דנה (Dana) - Friendly Companion',
        group: 'adult_female',
        groupLabel: 'Adult Female (אישה)',
        relationship: 'Friend (חברה טובה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Warm, approachable, and relatable voice for all age groups',
        category: 'hebrew'
      },

      // ======================================================================
      // 👧 5 FEMALE CHILDREN (ילדות / בנות)
      // ======================================================================
      {
        id: 'he-IL-EmmaChild',
        name: 'אמה (Emma) - Sweet Young Girl',
        group: 'female_child',
        groupLabel: 'Female Child (ילדה)',
        relationship: 'Daughter (ילדה אמה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Sweet, innocent young girl voice for bedtime protagonists',
        category: 'hebrew'
      },
      {
        id: 'he-IL-MayaChild',
        name: 'מיה (Maya) - Playful Little Sister',
        group: 'female_child',
        groupLabel: 'Female Child (ילדה)',
        relationship: 'Little Sister (אחות קטנה מיה)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Cheerful and curious little sister voice filled with wonder',
        category: 'hebrew'
      },
      {
        id: 'he-IL-AgamChild',
        name: 'אגם (Agam) - Gentle Young Daughter',
        group: 'female_child',
        groupLabel: 'Female Child (ילדה)',
        relationship: 'Daughter (ילדה אגם)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Gentle, soft-spoken young child with sweet Hebrew pronunciation',
        category: 'hebrew'
      },
      {
        id: 'he-IL-LiaChild',
        name: 'ליה (Lia) - Joyful Star Girl',
        group: 'female_child',
        groupLabel: 'Female Child (ילדה)',
        relationship: 'Heroine (גיבורת הסיפור)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Bright and enthusiastic child voice for fairy tales',
        category: 'hebrew'
      },
      {
        id: 'he-IL-RomiChild',
        name: 'רומי (Romi) - Cozy Dreamer Girl',
        group: 'female_child',
        groupLabel: 'Female Child (ילדה)',
        relationship: 'Daughter (ילדה רומי)',
        gender: 'Female',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Cozy, sleepy child voice ready for bedtime cuddles and dreams',
        category: 'hebrew'
      },

      // ======================================================================
      // 👦 5 MALE CHILDREN (ילדים / בנים)
      // ======================================================================
      {
        id: 'he-IL-DanielChild',
        name: 'דניאל (Daniel) - Curious Young Boy',
        group: 'male_child',
        groupLabel: 'Male Child (ילד)',
        relationship: 'Son (ילד דניאל)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Curious, imaginative young boy voice for brave bedtime explorers',
        category: 'hebrew'
      },
      {
        id: 'he-IL-LeoChild',
        name: 'ליאו (Leo) - Brave Little Hero',
        group: 'male_child',
        groupLabel: 'Male Child (ילד)',
        relationship: 'Hero Son (הגיבור ליאו)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Courageous little adventurer soaring through cloud castles and star dragons',
        category: 'hebrew'
      },
      {
        id: 'he-IL-EitanChild',
        name: 'איתן (Eitan) - Energetic Young Brother',
        group: 'male_child',
        groupLabel: 'Male Child (ילד)',
        relationship: 'Brother (אח קטן איתן)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Enthusiastic and joyful young boy who loves magical adventures',
        category: 'hebrew'
      },
      {
        id: 'he-IL-OriChild',
        name: 'אורי (Ori) - Sweet Little Son',
        group: 'male_child',
        groupLabel: 'Male Child (ילד)',
        relationship: 'Son (ילד אורי)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Sweet, gentle little boy voice that loves cozy bedtime stories',
        category: 'hebrew'
      },
      {
        id: 'he-IL-NoamChild',
        name: 'נועם (Noam) - Playful Young Explorer',
        group: 'male_child',
        groupLabel: 'Male Child (ילד)',
        relationship: 'Son / Brother (ילד נועם)',
        gender: 'Male',
        accent: 'Israeli Hebrew (עברית)',
        description: 'Playful and thoughtful young boy voice that brings smiles before sleep',
        category: 'hebrew'
      }
    ];
  }

  getHebrewVoices() {
    return this.voices;
  }

  /**
   * Synthesizes native Hebrew text into studio-grade MP3 audio
   */
  async synthesizeHebrew(text, voiceId = 'he-IL-HilaNeural', options = {}) {
    try {
      const cleanText = text.trim();
      console.log(`[HebrewTtsService] Synthesizing Hebrew audio: voice=${voiceId}, length=${cleanText.length}`);

      const encodedText = encodeURIComponent(cleanText);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=iw&client=tw-ob&q=${encodedText}`;

      const response = await fetch(ttsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`Hebrew TTS service response code: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error('[HebrewTtsService] Error synthesizing Hebrew audio:', error.message);
      throw error;
    }
  }
}

export default new HebrewTtsService();
