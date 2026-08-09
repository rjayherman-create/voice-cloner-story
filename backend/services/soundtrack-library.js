// backend/services/soundtrack-library.js
// 20-Track Royalty-Free Soundtrack & Ambient Music Library for FableVoice Audio Studio

const SOUNDTRACK_CATALOG = [
  // ==========================================
  // 🌙 CATEGORY 1: BEDTIME, LULLABY & SLEEP (4 Tracks)
  // ==========================================
  {
    id: 'lullaby-harp',
    title: 'Lullaby Harp & Celestial Strings',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Slow & Gentle (60 BPM)',
    mood: 'Soothing & Calming',
    instrumentation: 'Acoustic Harp, Ambient String Quartet',
    previewNote: 'Soft soothing harp notes for restful bedtime sleep and tranquil storytelling.',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-lullaby-piano-112199.mp3'
  },
  {
    id: 'cosmic-wonder',
    title: 'Starlight Music Box & Dream Lullaby',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Calm & Dreamy (64 BPM)',
    mood: 'Magical & Peaceful',
    instrumentation: 'Music Box, Celestial Chimes, Warm Pads',
    previewNote: 'Delicate music box bells floating through starry skies for children.',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lullaby-music-box-12345.mp3'
  },
  {
    id: 'gentle-rain-piano',
    title: 'Gentle Rain & Cozy Piano',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Serene (55 BPM)',
    mood: 'Relaxing & Intimate',
    instrumentation: 'Felt Piano, Ambient Rainscape',
    previewNote: 'Warm acoustic piano chords accompanied by soft natural rainfall.',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_b287518596.mp3?filename=peaceful-piano-10707.mp3'
  },
  {
    id: 'warm-blanket-ambient',
    title: 'Warm Blanket & Lavender Sleep Wave',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Ultra Slow (48 BPM)',
    mood: 'Hypnotic & Restful',
    instrumentation: 'Deep Analog Synthesizer, Drone Pads',
    previewNote: 'Binaural-style relaxing harmonic hums designed for deep sleep.',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_026778f6ea.mp3?filename=deep-relaxation-11470.mp3'
  },

  // ==========================================
  // 🎙️ CATEGORY 2: PODCAST & TALK SHOW (4 Tracks)
  // ==========================================
  {
    id: 'lofi-chill-talk',
    title: 'Lo-Fi Coffee Shop Chill Beats',
    category: 'Podcast',
    genre: 'Podcast',
    tempo: 'Chill (78 BPM)',
    mood: 'Warm & Conversational',
    instrumentation: 'Electric Piano (Rhodes), Dusty Drum Loops',
    previewNote: 'Relaxed groove perfect for conversational podcasts and creator commentary.',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-study-112191.mp3'
  },
  {
    id: 'acoustic-morning',
    title: 'Acoustic Sunrise & Warm Strum',
    category: 'Podcast',
    genre: 'Podcast',
    tempo: 'Upbeat Mellow (85 BPM)',
    mood: 'Optimistic & Friendly',
    instrumentation: 'Acoustic Guitar, Fingerpicked Bass',
    previewNote: 'Warm acoustic morning vibes for lifestyle and interview shows.',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_34d193ef2d.mp3?filename=acoustic-guitars-ambient-9646.mp3'
  },
  {
    id: 'upbeat-indie-groove',
    title: 'Modern Creator & Podcast Pulse',
    category: 'Podcast',
    genre: 'Podcast',
    tempo: 'Mid-Tempo (100 BPM)',
    mood: 'Energetic & Inspiring',
    instrumentation: 'Indie Bassline, Shakers, Clean Electric Guitar',
    previewNote: 'Engaging pulse for technology discussions, tutorials, and YouTube intros.',
    url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_106758c0c4.mp3?filename=good-night-160166.mp3'
  },
  {
    id: 'late-night-jazz',
    title: 'Late Night Smooth Jazz Lounge',
    category: 'Podcast',
    genre: 'Podcast',
    tempo: 'Laid Back (75 BPM)',
    mood: 'Sophisticated & Classy',
    instrumentation: 'Muted Trumpet, Upright Bass, Soft Brushes',
    previewNote: 'Noir and storytelling jazz atmosphere for evening audio shows.',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smooth-waters-1159.mp3'
  },

  // ==========================================
  // 📰 CATEGORY 3: NEWS, TECH & BROADCAST (4 Tracks)
  // ==========================================
  {
    id: 'broadcast-tech-pulse',
    title: 'Tech Pulse & Modern Broadcast Underscore',
    category: 'News & Tech',
    genre: 'News',
    tempo: 'Driving (110 BPM)',
    mood: 'Analytical & Serious',
    instrumentation: 'Digital Arpeggiator, Sub Bass, Tech Ticks',
    previewNote: 'Neutral, clean electronic pacing for journalism and technology briefings.',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5f2d01db9c.mp3?filename=technology-background-10255.mp3'
  },
  {
    id: 'breaking-news-urgency',
    title: 'Global Market & Newsroom Momentum',
    category: 'News & Tech',
    genre: 'News',
    tempo: 'Urgent & Crisp (115 BPM)',
    mood: 'Authoritative & Dynamic',
    instrumentation: 'Cinematic Staccato Strings, Newsroom Synth',
    previewNote: 'High-authority background drive for fast-paced bulletins and financial reports.',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=news-corporate-14309.mp3'
  },
  {
    id: 'corporate-vision',
    title: 'Inspiring Corporate Innovation Wave',
    category: 'News & Tech',
    genre: 'Corporate',
    tempo: 'Steady (105 BPM)',
    mood: 'Confident & Forward-Looking',
    instrumentation: 'Muted Guitar Strum, Uplifting Synth Pads',
    previewNote: 'Professional presentation underscore for corporate overviews and keynote narrations.',
    url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_145625bf94.mp3?filename=corporate-motivational-111394.mp3'
  },
  {
    id: 'data-stream-synth',
    title: 'Cyber Data Stream & Neutral Ambient',
    category: 'News & Tech',
    genre: 'Tech',
    tempo: 'Minimal (95 BPM)',
    mood: 'Futuristic & Focused',
    instrumentation: 'Ambient Synth Plucks, Glitch Percussion',
    previewNote: 'Modern scientific and AI narrative background underscore.',
    url: 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_33c9444ef5.mp3?filename=cyber-ambient-8636.mp3'
  },

  // ==========================================
  // 📢 CATEGORY 4: COMMERCIALS & PROMO ADS (4 Tracks)
  // ==========================================
  {
    id: 'high-energy-hook',
    title: 'Modern Pop Electronic Ad Energy',
    category: 'Commercial',
    genre: 'Commercial',
    tempo: 'High Energy (120 BPM)',
    mood: 'Vibrant & Viral',
    instrumentation: 'Punchy Synth Chords, Claps, Dance Kick',
    previewNote: 'Immediate listener attention grabber for TikTok, Instagram Reels, and YouTube ads.',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7314a457c1.mp3?filename=uplifting-future-bass-10338.mp3'
  },
  {
    id: 'funky-summer-vibe',
    title: 'Funky Summer Commercial Groove',
    category: 'Commercial',
    genre: 'Commercial',
    tempo: 'Groovy (118 BPM)',
    mood: 'Playful & Catchy',
    instrumentation: 'Slap Bass, Brass Stabs, Funk Guitar',
    previewNote: 'Joyful, upbeat vibe for consumer product promos and lifestyle commercials.',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/05/audio_1cd5eb9687.mp3?filename=summer-funk-111867.mp3'
  },
  {
    id: 'motivational-anthem',
    title: 'Uplifting Brand Anthem & Claps',
    category: 'Commercial',
    genre: 'Commercial',
    tempo: 'Anthemic (112 BPM)',
    mood: 'Triumphant & Inspiring',
    instrumentation: 'Stomp Box, Handclaps, Electric Piano',
    previewNote: 'Empowering narrative drive for brand stories and motivational promotions.',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_d0e4056262.mp3?filename=corporate-uplifting-11475.mp3'
  },
  {
    id: 'retail-happy-acoustic',
    title: 'Cheerful Whistle & Acoustic Strum',
    category: 'Commercial',
    genre: 'Commercial',
    tempo: 'Sunny & Bright (114 BPM)',
    mood: 'Whimsical & Carefree',
    instrumentation: 'Ukulele, Whistling Melody, Glockenspiel',
    previewNote: 'Lighthearted and friendly music for family ads, retail promos, and app teasers.',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_924e2e2ca1.mp3?filename=happy-ukulele-10023.mp3'
  },

  // ==========================================
  // 🎬 CATEGORY 5: CINEMATIC, DRAMA & FANTASY (4 Tracks)
  // ==========================================
  {
    id: 'enchanted-forest',
    title: 'Enchanted Forest Whispers & Magic Flute',
    category: 'Cinematic',
    genre: 'Fantasy',
    tempo: 'Atmospheric (72 BPM)',
    mood: 'Mystical & Adventurous',
    instrumentation: 'Wooden Flute, Wind Chimes, Lush Strings',
    previewNote: 'Gentle night breeze and twinkling chimes for magical quests and fairytales.',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf73301.mp3?filename=magical-story-10339.mp3'
  },
  {
    id: 'deep-space-odyssey',
    title: 'Deep Space Orbit & Ambient Cello',
    category: 'Cinematic',
    genre: 'Sci-Fi',
    tempo: 'Vast & Cosmic (60 BPM)',
    mood: 'Awe-Inspiring & Deep',
    instrumentation: 'Solo Cello, Cosmic Reverb Swells',
    previewNote: 'Immense cosmic atmospheres for sci-fi adventures and philosophical narrations.',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_c874f63d04.mp3?filename=space-ambient-1158.mp3'
  },
  {
    id: 'epic-hero-quest',
    title: 'Cinematic Heroic Journey & Strings',
    category: 'Cinematic',
    genre: 'Adventure',
    tempo: 'Majestic (88 BPM)',
    mood: 'Noble & Epic',
    instrumentation: 'Full Symphonic Orchestra, French Horns, Timpani',
    previewNote: 'Grand orchestral swell for epic audiobooks and heroic storytelling.',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c39d8924b1.mp3?filename=epic-cinematic-112192.mp3'
  },
  {
    id: 'ancient-mystery',
    title: 'Ancient Temple Winds & Mystery Pad',
    category: 'Cinematic',
    genre: 'Mystery',
    tempo: 'Haunting (65 BPM)',
    mood: 'Mysterious & Intriguing',
    instrumentation: 'Ethnic Percussion, Bamboo Flute, Drone',
    previewNote: 'Subtle suspense and discovery underscore for investigative audio dramas.',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_65cf1f3fa1.mp3?filename=mysterious-ambient-10645.mp3'
  }
];

class SoundtrackLibraryService {
  constructor() {
    this.catalog = SOUNDTRACK_CATALOG;
  }

  // Get all 20 tracks or filter by category
  getAll(category = null) {
    if (!category || category === 'all') {
      return this.catalog;
    }
    return this.catalog.filter(t => 
      t.category.toLowerCase() === category.toLowerCase() || 
      t.genre.toLowerCase() === category.toLowerCase()
    );
  }

  // Search by query (title, mood, instrumentation, preview note)
  search(query) {
    if (!query || !query.trim()) {
      return this.catalog;
    }
    const q = query.toLowerCase().trim();
    return this.catalog.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.mood.toLowerCase().includes(q) ||
      t.previewNote.toLowerCase().includes(q) ||
      t.instrumentation.toLowerCase().includes(q)
    );
  }

  // Get single track by ID
  getById(id) {
    return this.catalog.find(t => t.id === id) || null;
  }

  // Get category list with counts
  getCategories() {
    const cats = ['all', 'Bedtime', 'Podcast', 'News & Tech', 'Commercial', 'Cinematic'];
    return cats.map(cat => ({
      name: cat,
      count: cat === 'all' ? this.catalog.length : this.catalog.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length
    }));
  }
}

const soundtrackLibraryService = new SoundtrackLibraryService();
export default soundtrackLibraryService;
