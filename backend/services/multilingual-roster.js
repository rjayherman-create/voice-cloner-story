/**
 * Dynamic 30-Persona Multilingual Voice Catalog Engine
 * Generates and serves a curated 30-persona voice roster for any selected language:
 * - 10 Adult Males (Fathers, Grandfathers, Deep Narrators, Adventure Guides)
 * - 10 Adult Females (Mothers, Grandmothers, Lullaby Whisperers, Bedtime Storytellers)
 * - 5 Female Children (Sweet Daughters, Playful Sisters, Story Heroines)
 * - 5 Male Children (Curious Boys, Brave Little Heroes, Little Brothers)
 */

class MultilingualRosterService {
  constructor() {
    this.voiceBasePresets = [
      // 10 Adult Males ElevenLabs Voice ID fallbacks
      { idSuffix: 'male-1', elId: 'AZnzlk1XvdvUeBnXmlld', baseName: 'David / Avri' },
      { idSuffix: 'male-2', elId: 'ErXwobaYiN019PkySvjV', baseName: 'Yonatan / Oliver' },
      { idSuffix: 'male-3', elId: 'TxGEqnHWrfWFTfGW9XjX', baseName: 'William / Mateo' },
      { idSuffix: 'male-4', elId: 'VR6AewLTigWG4xSOukaG', baseName: 'Lucas / Gabriel' },
      { idSuffix: 'male-5', elId: 'pNInz6obpgDQGcFmaJgB', baseName: 'Yoav / Arthur' },
      { idSuffix: 'male-6', elId: 'yoZ06aMxZJJ28mfd3POQ', baseName: 'Asaf / Javier' },
      { idSuffix: 'male-7', elId: 'g5CIjZEefAph4nQFvHAz', baseName: 'Doron / Grandfather' },
      { idSuffix: 'male-8', elId: 'flq6f7yk4E4fJM5XTYuZ', baseName: 'Tomer / Lucas' },
      { idSuffix: 'male-9', elId: 'onwK4e9ZLuTAKqWW03F9', baseName: 'Nimrod / Alexandre' },
      { idSuffix: 'male-10', elId: 'N2lVS1w4EtoT3dr4eOWO', baseName: 'Guy / Nicolas' },

      // 10 Adult Females ElevenLabs Voice ID fallbacks
      { idSuffix: 'fem-1', elId: '21m00Tcm4TlvDq8ikWAM', baseName: 'Rachel / Hila' },
      { idSuffix: 'fem-2', elId: 'EXAVITQu4vr4xnSDxMaL', baseName: 'Shira / Charlotte' },
      { idSuffix: 'fem-3', elId: 'MF3mGyEYCl7XYWbV9V6O', baseName: 'Michal / Sophia' },
      { idSuffix: 'fem-4', elId: 'ThT5KcBeYPX3keUQqHPh', baseName: 'Tamar / Amelia' },
      { idSuffix: 'fem-5', elId: 'XB0fDUnXU5powFXDhCwa', baseName: 'Roni / Olivia' },
      { idSuffix: 'fem-6', elId: 'pFZP5JQG7iQjIQuC4Bku', baseName: 'Noa / Isabella' },
      { idSuffix: 'fem-7', elId: 'jsCqWAovK2LkecY7zXl4', baseName: 'Rachel / Grandmother' },
      { idSuffix: 'fem-8', elId: 'oWAxZDxBAtYILmPmfvL5', baseName: 'Anat / Grace' },
      { idSuffix: 'fem-9', elId: 'z9fAnlkpzviPz146aGWa', baseName: 'Yael / Victoria' },
      { idSuffix: 'fem-10', elId: 'LcfcDJNUP1GQjkzn1xUU', baseName: 'Dana / Ava' },

      // 5 Female Children
      { idSuffix: 'girl-1', elId: 'jBpfuIE2acCO8z3wKNLl', baseName: 'Emma / Lily' },
      { idSuffix: 'girl-2', elId: 'AZnzlk1XvdvUeBnXmlld', baseName: 'Maya / Mia' },
      { idSuffix: 'girl-3', elId: 'EXAVITQu4vr4xnSDxMaL', baseName: 'Agam / Chloe' },
      { idSuffix: 'girl-4', elId: 'MF3mGyEYCl7XYWbV9V6O', baseName: 'Lia / Zoe' },
      { idSuffix: 'girl-5', elId: '21m00Tcm4TlvDq8ikWAM', baseName: 'Romi / Ruby' },

      // 5 Male Children
      { idSuffix: 'boy-1', elId: 'TxGEqnHWrfWFTfGW9XjX', baseName: 'Daniel / Leo' },
      { idSuffix: 'boy-2', elId: 'VR6AewLTigWG4xSOukaG', baseName: 'Leo / Noah' },
      { idSuffix: 'boy-3', elId: 'ErXwobaYiN019PkySvjV', baseName: 'Eitan / Jack' },
      { idSuffix: 'boy-4', elId: 'pNInz6obpgDQGcFmaJgB', baseName: 'Ori / Theo' },
      { idSuffix: 'boy-5', elId: 'yoZ06aMxZJJ28mfd3POQ', baseName: 'Noam / Charlie' }
    ];

    // Fast mapping lookup from persona ID suffix -> valid ElevenLabs ID
    this.voiceIdMap = {};
    this.voiceBasePresets.forEach(p => {
      this.voiceIdMap[p.idSuffix] = p.elId;
    });

    this.languageRosters = {
      // 🇺🇸 English (US / UK)
      en: {
        languageName: 'English (US / UK)',
        flag: '🇺🇸',
        males: [
          { name: 'James - Classic Storyteller', rel: 'Father / Narrator', desc: 'Deep, engaging narrator with warm bedtime cadence' },
          { name: 'Oliver - Warm Fatherly Voice', rel: 'Father Oliver', desc: 'Gentle, comforting father voice for bedtime tales' },
          { name: 'William - Rich Voice Artist', rel: 'Grandfather / Storyteller', desc: 'Reassuring classic voice with melodic depth' },
          { name: 'Lucas - Adventure Guide', rel: 'Adventure Guide', desc: 'Energetic, dynamic voice for magical fantasy quests' },
          { name: 'Ethan - Calm Mindfulness Voice', rel: 'Calm Voice', desc: 'Peaceful, slow-paced bedtime relaxation voice' },
          { name: 'Arthur - Grandfather & Wise Elder', rel: 'Grandfather Arthur', desc: 'Wise, beloved grandfather voice rich with timeless stories' },
          { name: 'Henry - Playful Storyteller', rel: 'Storyteller', desc: 'Expressive and animated character voice for bedtime fun' },
          { name: 'Alexander - Heroic Knight', rel: 'Hero / Knight', desc: 'Bold, inspiring voice for dragon and star journeys' },
          { name: 'Mason - Gentle Father', rel: 'Father Mason', desc: 'Warm, reassuring tone ensuring cozy bedtime sleep' },
          { name: 'Liam - Contemporary Narrator', rel: 'Narrator Liam', desc: 'Crisp, modern, and engaging conversational tone' }
        ],
        females: [
          { name: 'Emma - Maternal Bedtime Storyteller', rel: 'Mother Emma', desc: 'Warm, soothing maternal voice for gentle bedtime stories' },
          { name: 'Charlotte - Soothing Lullaby Voice', rel: 'Mother Charlotte', desc: 'Delicate, whisper-soft tone like a sweet lullaby' },
          { name: 'Sophia - Gentle Bedtime Reader', rel: 'Storyteller Sophia', desc: 'Soft, clear, and reassuring bedtime narration' },
          { name: 'Amelia - Loving Motherly Voice', rel: 'Mother Amelia', desc: 'Nurturing voice ensuring peaceful, happy dreams' },
          { name: 'Olivia - Cheerful Storyteller', rel: 'Sister / Storyteller', desc: 'Bright, joyful voice for whimsical fairy tales' },
          { name: 'Isabella - Soft Musical Tone', rel: 'Storyteller Isabella', desc: 'Melodic, lyrical tone for celestial starry journeys' },
          { name: 'Eleanor - Grandmother & Wise Matriarch', rel: 'Grandmother Eleanor', desc: 'Warm, beloved grandmother voice filled with affection' },
          { name: 'Grace - Calming Night Voice', rel: 'Calm Voice Grace', desc: 'Serene, rhythmic pacing to help children drift off easily' },
          { name: 'Victoria - Expressive Voice Artist', rel: 'Narrator Victoria', desc: 'Rich emotional depth for enchanted bedtime adventures' },
          { name: 'Ava - Friendly Story Companion', rel: 'Friend Ava', desc: 'Warm, approachable, and comforting voice for all ages' }
        ],
        girls: [
          { name: 'Lily - Sweet Young Girl', rel: 'Daughter Lily', desc: 'Sweet, innocent young girl voice for bedtime heroines' },
          { name: 'Mia - Playful Little Sister', rel: 'Little Sister Mia', desc: 'Curious, cheerful little sister filled with wonder' },
          { name: 'Chloe - Gentle Young Daughter', rel: 'Daughter Chloe', desc: 'Soft-spoken, sweet young child voice' },
          { name: 'Zoe - Joyful Star Girl', rel: 'Heroine Zoe', desc: 'Enthusiastic and bright child voice for fairy tales' },
          { name: 'Ruby - Cozy Dreamer Girl', rel: 'Daughter Ruby', desc: 'Sleepy, cozy child voice ready for bedtime dreams' }
        ],
        boys: [
          { name: 'Leo - Brave Little Hero', rel: 'Hero Son Leo', desc: 'Courageous young boy soaring through star dragons' },
          { name: 'Noah - Curious Young Boy', rel: 'Son Noah', desc: 'Imaginative young boy ready for cozy bedtime quests' },
          { name: 'Jack - Energetic Little Brother', rel: 'Brother Jack', desc: 'Joyful, playful young boy full of wonder' },
          { name: 'Theo - Sweet Little Son', rel: 'Son Theo', desc: 'Gentle, sweet little boy who loves bedtime cuddles' },
          { name: 'Charlie - Playful Young Explorer', rel: 'Son Charlie', desc: 'Thoughtful, smiling young boy voice before sleep' }
        ]
      },

      // 🇪🇸 Spanish (Español)
      es: {
        languageName: 'Spanish (Español)',
        flag: '🇪🇸',
        males: [
          { name: 'Mateo - Narrador Clásico', rel: 'Padre / Narrador', desc: 'Voz profunda y cálida para cuentos infantiles de buenas noches' },
          { name: 'Santiago - Voz Paternal Cálida', rel: 'Papá Santiago', desc: 'Tono reconfortante y suave para dormir tranquilo' },
          { name: 'Alejandro - Guía de Aventuras', rel: 'Guía de Fantasía', desc: 'Voz dinámica para viajes mágicos a las estrellas' },
          { name: 'Diego - Voz Serena y Tranquila', rel: 'Voz Serena', desc: 'Ritmo pausado para una relajación profunda' },
          { name: 'Javier - Padre Protector', rel: 'Padre Javier', desc: 'Tono cariñoso y seguro para toda la familia' },
          { name: 'Abuelo Manuel - Sabio Abuelo', rel: 'Abuelo Manuel', desc: 'Voz sabia y entrañable llena de ternura' },
          { name: 'Lucas - Narrador Alegre', rel: 'Cuentacuentos', desc: 'Voz expresiva que da vida a personajes mágicos' },
          { name: 'Carlos - Héroe Legendario', rel: 'Héroe Carlos', desc: 'Voz valiente para historias de caballeros y castillos' },
          { name: 'Gabriel - Cuentacuentos Mágico', rel: 'Narrador Gabriel', desc: 'Tono melódico para mundos de fantasía' },
          { name: 'Nicolás - Voz Contemporánea', rel: 'Hermano Mayor', desc: 'Cadencia natural y moderna en español' }
        ],
        females: [
          { name: 'Sofía - Madre Afectuosa', rel: 'Mamá Sofía', desc: 'Voz materna dulce y reconfortante para dormir' },
          { name: 'Valentina - Nana Suave', rel: 'Mamá Valentina', desc: 'Tono delicado como una canción de cuna' },
          { name: 'Camila - Lectora Nocturna', rel: 'Narradora Camila', desc: 'Dicción clara y relajante para niños' },
          { name: 'Lucía - Madre Amorosa', rel: 'Mamá Lucía', desc: 'Voz protectora que guía hacia dulces sueños' },
          { name: 'Martina - Cuentacuentos Alegre', rel: 'Hermana Martina', desc: 'Voz alegre y chispeante para hadas y bosques' },
          { name: 'Elena - Tono Melódico', rel: 'Narradora Elena', desc: 'Elegancia y suavidad para relatos estelares' },
          { name: 'Abuela Rosa - Abuela Sabia', rel: 'Abuela Rosa', desc: 'Voz dulce y nostálgica con gran cariño' },
          { name: 'Isabella - Voz Nocturna Serena', rel: 'Voz Serena', desc: 'Paz y tranquilidad para antes de dormir' },
          { name: 'Daniela - Narradora Expresiva', rel: 'Narradora Daniela', desc: 'Emoción y calidez en cada palabra' },
          { name: 'Paula - Compañera de Sueños', rel: 'Amiga Paula', desc: 'Tono cercano y reconfortante' }
        ],
        girls: [
          { name: 'Emma - Niña Dulce', rel: 'Hija Emma', desc: 'Voz inocente y dulce para pequeñas heroínas' },
          { name: 'Mía - Hermanita Juguetona', rel: 'Hermanita Mía', desc: 'Alegre y llena de curiosidad' },
          { name: 'Luciana - Hija Tierna', rel: 'Hija Luciana', desc: 'Voz suave para historias de fantasía' },
          { name: 'Valeria - Niña Estrella', rel: 'Heroína Valeria', desc: 'Brillante y entusiasta para cuentos de hadas' },
          { name: 'Sara - Pequeña Soñadora', rel: 'Hija Sara', desc: 'Voz acogedora lista para soñar' }
        ],
        boys: [
          { name: 'Leo - Pequeño Héroe', rel: 'Hijo Leo', desc: 'Niño valiente que vuela con dragones' },
          { name: 'Daniel - Niño Curioso', rel: 'Hijo Daniel', desc: 'Voz imaginativa y alegre' },
          { name: 'Mateo Jr - Hermanito Alegre', rel: 'Hermano Mateo', desc: 'Energético y lleno de sonrisas' },
          { name: 'Thiago - Hijo Cariñoso', rel: 'Hijo Thiago', desc: 'Tono dulce y tierno para la noche' },
          { name: 'Sebastián - Pequeño Explorador', rel: 'Hijo Sebastián', desc: 'Voz reflexiva y dulce antes de dormir' }
        ]
      },

      // 🇫🇷 French (Français)
      fr: {
        languageName: 'French (Français)',
        flag: '🇫🇷',
        males: [
          { name: 'Gabriel - Conteur Classique', rel: 'Père / Conteur', desc: 'Voix chaude et profonde pour histoires du soir' },
          { name: 'Louis - Père Chaleureux', rel: 'Papa Louis', desc: 'Ton rassurant et doux pour faire de beaux rêves' },
          { name: 'Raphaël - Guide d\'Aventure', rel: 'Guide Féerique', desc: 'Voix dynamique pour châteaux de nuages' },
          { name: 'Arthur - Voix Calme et Sereine', rel: 'Voix Paisible', desc: 'Rythme apaisant pour s\'endormir paisiblement' },
          { name: 'Jules - Père Protecteur', rel: 'Papa Jules', desc: 'Chaleur et tendresse pour les enfants' },
          { name: 'Grand-père Henri - Sage Ancien', rel: 'Papy Henri', desc: 'Voix aimante pleine de sagesse et de souvenirs' },
          { name: 'Lucas - Conteur Espiègle', rel: 'Conteur Lucas', desc: 'Voix enjouée qui enchante les tout-petits' },
          { name: 'Alexandre - Héros Fantastique', rel: 'Héros Alexandre', desc: 'Voix noble pour contes de fées magiques' },
          { name: 'Hugo - Conteur Poétique', rel: 'Poète Hugo', desc: 'Cadence douce et élégante' },
          { name: 'Paul - Voix Contemporaine', rel: 'Grand Frère', desc: 'Voix claire et naturelle' }
        ],
        females: [
          { name: 'Emma - Mère Bienveillante', rel: 'Maman Emma', desc: 'Voix maternelle douce et apaisante' },
          { name: 'Léa - Berceuse Céleste', rel: 'Maman Léa', desc: 'Ton mélodieux comme un murmure d\'étoiles' },
          { name: 'Chloé - Lectrice du Soir', rel: 'Conteuse Chloé', desc: 'Douceur et diction parfaite en français' },
          { name: 'Manon - Maman Aimante', rel: 'Maman Manon', desc: 'Cocon d\'amour pour la nuit' },
          { name: 'Camille - Conteuse Joyeuse', rel: 'Sœur Camille', desc: 'Pétillante pour forêts enchantées' },
          { name: 'Juliette - Ton Lyrique', rel: 'Conteuse Juliette', desc: 'Voix musicale et poétique' },
          { name: 'Grand-mère Jeanne - Sage Aïeule', rel: 'Mamie Jeanne', desc: 'Tendresse infinie et bienveillance' },
          { name: 'Inès - Nuit Paisible', rel: 'Voix Apaisante', desc: 'Sérénité pour s\'endormir en douceur' },
          { name: 'Sarah - Conteuse Émotionnelle', rel: 'Conteuse Sarah', desc: 'Richesse et expressivité' },
          { name: 'Louise - Compagne Douce', rel: 'Amie Louise', desc: 'Voix chaleureuse pour tous les âges' }
        ],
        girls: [
          { name: 'Jade - Petite Fille Douce', rel: 'Fille Jade', desc: 'Voix innocente pour petites héroïnes' },
          { name: 'Rose - Petite Sœur Espiègle', rel: 'Petite Sœur Rose', desc: 'Curieuse et pleine d\'émerveillement' },
          { name: 'Mila - Fille Tendre', rel: 'Fille Mila', desc: 'Voix câline pour histoires du soir' },
          { name: 'Alice - Fille des Étoiles', rel: 'Héroïne Alice', desc: 'Brillante pour contes enchantés' },
          { name: 'Léna - Petite Rêveuse', rel: 'Fille Léna', desc: 'Prête à s\'envoler au pays des rêves' }
        ],
        boys: [
          { name: 'Léo - Petit Héros', rel: 'Fils Léo', desc: 'Courageux petit voyageur des étoiles' },
          { name: 'Gaspard - Garçon Curieux', rel: 'Fils Gaspard', desc: 'Voix pleine d\'imagination' },
          { name: 'Noah - Petit Frère Énergique', rel: 'Frère Noah', desc: 'Joyeux et souriant' },
          { name: 'Sacha - Fils Adorable', rel: 'Fils Sacha', desc: 'Douceur pour les câlins du soir' },
          { name: 'Tom - Petit Explorateur', rel: 'Fils Tom', desc: 'Voix tendre avant de dormir' }
        ]
      }
    };
  }

  /**
   * Resolves any composite persona ID (e.g. 'es-male-2', 'fr-fem-1') into a genuine ElevenLabs Voice ID
   */
  resolveVoiceId(rawId) {
    if (!rawId) return '21m00Tcm4TlvDq8ikWAM';

    // If it is already a 20-character ElevenLabs ID, return it directly
    if (rawId.length >= 20 && !rawId.includes('-')) {
      return rawId;
    }

    // If it matches pattern [lang]-[category]-[index] (e.g. 'es-male-2' or 'male-2')
    const parts = rawId.split('-');
    if (parts.length >= 2) {
      const suffix = parts.slice(-2).join('-'); // e.g. 'male-2' or 'fem-1' or 'girl-3'
      if (this.voiceIdMap[suffix]) {
        return this.voiceIdMap[suffix];
      }
    }

    // Default fallback to standard maternal storyteller
    return '21m00Tcm4TlvDq8ikWAM';
  }

  /**
   * Returns a complete 30-voice persona roster for ANY requested language code
   */
  getRosterForLanguage(langCode = 'en') {
    const code = (langCode || 'en').toLowerCase();

    if (this.languageRosters[code]) {
      return this.formatRoster(code, this.languageRosters[code]);
    }

    // Default template dynamically adapted to any language code
    const langNames = {
      de: { name: 'German (Deutsch)', flag: '🇩🇪', prefix: 'de' },
      it: { name: 'Italian (Italiano)', flag: '🇮🇹', prefix: 'it' },
      pt: { name: 'Portuguese (Português)', flag: '🇵🇹', prefix: 'pt' },
      ja: { name: 'Japanese (日本語)', flag: '🇯🇵', prefix: 'ja' },
      zh: { name: 'Mandarin (中文)', flag: '🇨🇳', prefix: 'zh' },
      ko: { name: 'Korean (한국어)', flag: '🇰🇷', prefix: 'ko' },
      hi: { name: 'Hindi (हिन्दी)', flag: '🇮🇳', prefix: 'hi' },
      ar: { name: 'Arabic (العربية)', flag: '🇸🇦', prefix: 'ar' },
      nl: { name: 'Dutch (Nederlands)', flag: '🇳🇱', prefix: 'nl' },
      ru: { name: 'Russian (Русский)', flag: '🇷🇺', prefix: 'ru' }
    };

    const target = langNames[code] || { name: `${code.toUpperCase()} Multilingual`, flag: '🌐', prefix: code };
    return this.generateGenericRoster(code, target);
  }

  generateGenericRoster(code, target) {
    const maleNames = ['Alexander', 'Daniel', 'Marcus', 'Gabriel', 'Julian', 'Grandfather Stefan', 'Lucas', 'Oliver', 'Leon', 'Felix'];
    const femaleNames = ['Elena', 'Sophie', 'Clara', 'Maria', 'Amelia', 'Grandmother Anna', 'Hanna', 'Laura', 'Victoria', 'Julia'];
    const girlNames = ['Emma', 'Mia', 'Chloe', 'Zoe', 'Lily'];
    const boyNames = ['Leo', 'Noah', 'Theo', 'Lucas', 'Elias'];

    const rosterData = {
      languageName: target.name,
      flag: target.flag,
      males: maleNames.map((name, i) => ({
        name: `${name} - ${target.name} Voice`,
        rel: i === 5 ? 'Grandfather' : (i < 3 ? 'Father' : 'Narrator'),
        desc: `Authentic ${target.name} male voice model calibrated for bedtime stories & dialogue`
      })),
      females: femaleNames.map((name, i) => ({
        name: `${name} - ${target.name} Voice`,
        rel: i === 5 ? 'Grandmother' : (i < 3 ? 'Mother' : 'Storyteller'),
        desc: `Authentic ${target.name} female voice model with soothing bedtime intonation`
      })),
      girls: girlNames.map(name => ({
        name: `${name} - Young Girl`,
        rel: 'Daughter / Heroine',
        desc: `Sweet young girl voice in ${target.name} for fairy tale protagonists`
      })),
      boys: boyNames.map(name => ({
        name: `${name} - Young Boy`,
        rel: 'Son / Explorer',
        desc: `Curious and brave young boy voice in ${target.name} for bedtime adventures`
      }))
    };

    return this.formatRoster(code, rosterData);
  }

  formatRoster(langCode, data) {
    const full30 = [];

    // 10 Adult Males
    data.males.forEach((m, idx) => {
      const preset = this.voiceBasePresets[idx];
      full30.push({
        id: `${langCode}-male-${idx + 1}`,
        voiceId: preset.elId,
        name: m.name,
        group: 'adult_male',
        groupLabel: 'Adult Male (10 גברים / אבות)',
        relationship: m.rel,
        gender: 'Male',
        accent: `${data.flag} ${data.languageName}`,
        description: m.desc,
        category: 'multilingual',
        language: langCode
      });
    });

    // 10 Adult Females
    data.females.forEach((f, idx) => {
      const preset = this.voiceBasePresets[10 + idx];
      full30.push({
        id: `${langCode}-fem-${idx + 1}`,
        voiceId: preset.elId,
        name: f.name,
        group: 'adult_female',
        groupLabel: 'Adult Female (10 נשים / אמהות)',
        relationship: f.rel,
        gender: 'Female',
        accent: `${data.flag} ${data.languageName}`,
        description: f.desc,
        category: 'multilingual',
        language: langCode
      });
    });

    // 5 Female Children
    data.girls.forEach((g, idx) => {
      const preset = this.voiceBasePresets[20 + idx];
      full30.push({
        id: `${langCode}-girl-${idx + 1}`,
        voiceId: preset.elId,
        name: g.name,
        group: 'female_child',
        groupLabel: 'Female Child (5 ילדות / בנות)',
        relationship: g.rel,
        gender: 'Female',
        accent: `${data.flag} ${data.languageName}`,
        description: g.desc,
        category: 'multilingual',
        language: langCode
      });
    });

    // 5 Male Children
    data.boys.forEach((b, idx) => {
      const preset = this.voiceBasePresets[25 + idx];
      full30.push({
        id: `${langCode}-boy-${idx + 1}`,
        voiceId: preset.elId,
        name: b.name,
        group: 'male_child',
        groupLabel: 'Male Child (5 ילדים / בנים)',
        relationship: b.rel,
        gender: 'Male',
        accent: `${data.flag} ${data.languageName}`,
        description: b.desc,
        category: 'multilingual',
        language: langCode
      });
    });

    return {
      language: langCode,
      languageName: data.languageName,
      flag: data.flag,
      voices: full30
    };
  }
}

export default new MultilingualRosterService();
