// backend/services/soundtrack-library.js
// 20-Track Royalty-Free Soundtrack & Ambient Music Library for FableVoice Audio Studio

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSoundtrackLibrary } from './sound-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOUNDTRACKS_DIR = path.join(__dirname, '../../uploads/soundtracks');

const SOUNDTRACK_CATALOG = [
  // ==========================================
  // 🌙 CATEGORY 1: BEDTIME, LULLABY & SLEEP (13 Tracks)
  // ==========================================
  {
    id: 'lullaby-harp',
    title: 'Lullaby Harp & Celestial Strings',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Slow & Gentle (54 BPM)',
    mood: 'Soothing & Calming',
    instrumentation: 'Acoustic Concert Harp, Muted Cello, Celesta',
    previewNote: 'Soft soothing harp notes for restful bedtime sleep and tranquil storytelling.',
    url: '/uploads/soundtracks/lullaby-harp.wav'
  },
  {
    id: 'cosmic-wonder',
    title: 'Starlight Music Box & Dream Lullaby',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Calm & Dreamy (58 BPM)',
    mood: 'Magical & Peaceful',
    instrumentation: 'Vintage Music Box, Ethereal Ambient Synth Pads',
    previewNote: 'Delicate music box bells floating through starry skies for children.',
    url: '/uploads/soundtracks/cosmic-wonder.wav'
  },
  {
    id: 'gentle-rain-piano',
    title: 'Gentle Rain & Cozy Piano',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Serene (52 BPM)',
    mood: 'Relaxing & Intimate',
    instrumentation: 'Felt Piano, Wooden Pan Flute, Ambient Rainscape',
    previewNote: 'Warm acoustic piano chords accompanied by soft natural rainfall.',
    url: '/uploads/soundtracks/gentle-rain-piano.wav'
  },
  {
    id: 'warm-blanket-ambient',
    title: 'Warm Blanket & 432Hz Lavender Sleep Wave',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Ultra Slow (46 BPM)',
    mood: 'Hypnotic & Restful',
    instrumentation: '432Hz Analog Synthesizer, Deep Sleep Drone',
    previewNote: 'Binaural-style relaxing harmonic hums tuned to 432Hz for deep sleep.',
    url: '/uploads/soundtracks/warm-blanket-ambient.wav'
  },
  {
    id: 'cloud-ship-musicbox',
    title: 'Floating Cloud Ship & Starry Music Box',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Dreamy (58 BPM)',
    mood: 'Magical & Serene',
    instrumentation: 'Vintage Swiss Music Box, Ambient Pad, Glockenspiel',
    previewNote: 'Sailing across moonlit clouds with twinkling bells for sweet dreams.',
    url: '/uploads/soundtracks/cloud-ship-musicbox.wav'
  },
  {
    id: 'cozy-burrow-flute',
    title: 'Cozy Burrow Rain & Wooden Flute',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Intimate (52 BPM)',
    mood: 'Fairytale & Cozy',
    instrumentation: 'Wooden Pan Flute, Felt Piano, Soft Evening Rain',
    previewNote: 'Forest animals snuggling in their dry burrow while gentle rain falls.',
    url: '/uploads/soundtracks/cozy-burrow-flute.wav'
  },
  {
    id: 'fairy-garden-chimes',
    title: 'Moonlit Fairy Garden & Plucked Strings',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Gentle (60 BPM)',
    mood: 'Whimsical & Enchanting',
    instrumentation: 'Pizzicato Strings, Celtic Harp, Wind Chimes',
    previewNote: 'Fireflies dancing over flowers and fairy creatures whispering goodnight.',
    url: '/uploads/soundtracks/fairy-garden-chimes.wav'
  },
  {
    id: 'whale-ocean-lullaby',
    title: 'The Gentle Whale & Ocean Lullaby',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Weightless (48 BPM)',
    mood: 'Tranquil & Rhythmic',
    instrumentation: 'Solo Expressive Cello, Ocean Surf Soundscape',
    previewNote: 'Floating weightlessly on calm warm sea waves under a full moon.',
    url: '/uploads/soundtracks/whale-ocean-lullaby.wav'
  },
  {
    id: 'golden-blanket-delta',
    title: 'The Golden Blanket & 528Hz Delta Sleep',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Delta Wave (46 BPM)',
    mood: 'Restorative & Deep',
    instrumentation: 'Nylon Acoustic Guitar, 528Hz Solfeggio Harmonic Drone',
    previewNote: 'Hypnotic sleep wave for uninterrupted, deeply restorative rest.',
    url: '/uploads/soundtracks/golden-blanket-delta.wav'
  },
  {
    id: 'dreamland-train',
    title: 'The Little Train to Dreamland',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Hypnotic Rocking (56 BPM)',
    mood: 'Comforting & Rhythmic',
    instrumentation: 'Brushed Snare Rhythm, Acoustic Guitar, Upright Bass',
    previewNote: 'Magical bedtime steam train gliding gently across starry rainbow tracks.',
    url: '/uploads/soundtracks/dreamland-train.wav'
  },
  {
    id: 'treehouse-woodwinds',
    title: 'Moonlit Treehouse & Woodwind Trio',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Acoustic Warmth (55 BPM)',
    mood: 'Whimsical & Nostalgic',
    instrumentation: 'Wooden Oboe, Classical Clarinet, Nylon Guitar',
    previewNote: 'Winnie-the-Pooh style cozy treehouse bedtime story score.',
    url: '/uploads/soundtracks/treehouse-woodwinds.wav'
  },
  {
    id: 'wishing-star-glockenspiel',
    title: 'The Wishing Star & Crystal Glockenspiel',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Celestial (50 BPM)',
    mood: 'Pure Wonder & Magic',
    instrumentation: 'Crystal Glockenspiel, Orchestral String Bed, Celesta',
    previewNote: 'Making a secret wish upon the evening star as stardust sparkles.',
    url: '/uploads/soundtracks/wishing-star-glockenspiel.wav'
  },
  {
    id: 'fireplace-grandma-story',
    title: 'Grandmother’s Fireplace Story & Cello',
    category: 'Bedtime',
    genre: 'Bedtime',
    tempo: 'Comforting (52 BPM)',
    mood: 'Cherished & Safe',
    instrumentation: 'Solo Stradivarius Cello, Felt Upright Piano, Hearth Crackle',
    previewNote: 'Feeling deeply protected listening to an ancient bedtime tale by the fire.',
    url: '/uploads/soundtracks/fireplace-grandma-story.wav'
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
    url: '/uploads/soundtracks/lofi-chill-talk.wav'
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
    url: '/uploads/soundtracks/acoustic-morning.wav'
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
    url: '/uploads/soundtracks/upbeat-indie-groove.wav'
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
    url: '/uploads/soundtracks/late-night-jazz.wav'
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
    url: '/uploads/soundtracks/broadcast-tech-pulse.wav'
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
    url: '/uploads/soundtracks/breaking-news-urgency.wav'
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
    url: '/uploads/soundtracks/corporate-vision.wav'
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
    url: '/uploads/soundtracks/data-stream-synth.wav'
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
    url: '/uploads/soundtracks/high-energy-hook.wav'
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
    url: '/uploads/soundtracks/funky-summer-vibe.wav'
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
    url: '/uploads/soundtracks/motivational-anthem.wav'
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
    url: '/uploads/soundtracks/retail-happy-acoustic.wav'
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
    url: '/uploads/soundtracks/enchanted-forest.wav'
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
    url: '/uploads/soundtracks/deep-space-odyssey.wav'
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
    url: '/uploads/soundtracks/epic-hero-quest.wav'
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
    url: '/uploads/soundtracks/ancient-mystery.wav'
  }
];

const CUSTOM_SOUNDTRACKS_FILE = path.join(SOUNDTRACKS_DIR, 'custom-soundtracks.json');

class SoundtrackLibraryService {
  constructor() {
    this.catalog = [...SOUNDTRACK_CATALOG];
    this.customTracks = [];
    this.ensureAudioFilesExist();
    this.loadCustomTracks();
  }

  // Load custom tracks from persistent JSON file and auto-discover audio files in storage
  loadCustomTracks() {
    try {
      if (fs.existsSync(CUSTOM_SOUNDTRACKS_FILE)) {
        const raw = fs.readFileSync(CUSTOM_SOUNDTRACKS_FILE, 'utf8');
        this.customTracks = JSON.parse(raw);
      } else {
        this.customTracks = [];
      }

      // Auto-Discovery: Scan directory for any uploaded audio files not yet in catalog
      if (fs.existsSync(SOUNDTRACKS_DIR)) {
        const filesOnDisk = fs.readdirSync(SOUNDTRACKS_DIR);
        const knownFilenames = new Set([
          ...this.catalog.map(t => path.basename(t.url.split('?')[0])),
          ...this.customTracks.map(t => path.basename(t.url.split('?')[0]))
        ]);

        for (const file of filesOnDisk) {
          if (file.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i) && !knownFilenames.has(file)) {
            const cleanTitle = file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            const newDiscoveredTrack = {
              id: `discovered-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
              category: 'Custom',
              genre: 'Custom',
              tempo: 'Medium (90 BPM)',
              mood: 'Custom Audio',
              instrumentation: 'Uploaded Audio File',
              previewNote: `Custom soundtrack file: ${file}`,
              url: `/uploads/soundtracks/${file}`,
              isCustom: true,
              createdAt: new Date().toISOString()
            };
            this.customTracks.push(newDiscoveredTrack);
            console.log(`[SoundtrackLibrary] Auto-discovered custom audio file on disk: ${file}`);
          }
        }
      }

      this.saveCustomTracks();
    } catch (e) {
      console.error('[SoundtrackLibrary] Error loading custom tracks:', e.message);
      this.customTracks = [];
    }
  }

  // Save custom tracks to persistent JSON file
  saveCustomTracks() {
    try {
      fs.writeFileSync(CUSTOM_SOUNDTRACKS_FILE, JSON.stringify(this.customTracks, null, 2), 'utf8');
    } catch (e) {
      console.error('[SoundtrackLibrary] Error saving custom tracks:', e.message);
    }
  }

  // Add a new custom uploaded track
  addCustomTrack({ title, category = 'Custom', tempo = 'Medium (90 BPM)', mood = 'Custom Soundscape', instrumentation = 'Custom Audio', previewNote = 'User uploaded audio track.', filename }) {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTrack = {
      id,
      title: title || 'Custom Soundtrack',
      category: category || 'Custom',
      genre: category || 'Custom',
      tempo: tempo || 'Medium (90 BPM)',
      mood: mood || 'Custom Soundscape',
      instrumentation: instrumentation || 'Custom Audio Upload',
      previewNote: previewNote || 'Custom uploaded audio track.',
      url: `/uploads/soundtracks/${filename}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    this.customTracks.unshift(newTrack);
    this.saveCustomTracks();
    return newTrack;
  }

  // Delete a custom uploaded track
  deleteCustomTrack(id) {
    const track = this.customTracks.find(t => t.id === id);
    if (!track) return false;

    // Remove file from disk if it exists
    const filename = path.basename(track.url);
    const filePath = path.join(SOUNDTRACKS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    this.customTracks = this.customTracks.filter(t => t.id !== id);
    this.saveCustomTracks();
    return true;
  }

  // Ensure all soundtrack WAV files in catalog are generated and ready on disk
  ensureAudioFilesExist() {
    try {
      const hasMissingFiles = this.catalog.some(t => {
        const targetPath = path.join(SOUNDTRACKS_DIR, path.basename(t.url.split('?')[0]));
        return !fs.existsSync(targetPath);
      });

      if (hasMissingFiles) {
        console.log('[SoundtrackLibrary] Generating all missing soundtrack audio files...');
        generateSoundtrackLibrary();
      }
    } catch (e) {
      console.error('[SoundtrackLibrary] Error ensuring audio files:', e.message);
    }
  }

  // Get full combined catalog (Built-in + Custom Uploads)
  getCombinedCatalog() {
    return [...this.customTracks, ...this.catalog];
  }

  // Get all tracks or filter by category
  getAll(category = null) {
    const all = this.getCombinedCatalog();
    if (!category || category === 'all') {
      return all;
    }
    return all.filter(t => 
      t.category.toLowerCase() === category.toLowerCase() || 
      (t.genre && t.genre.toLowerCase() === category.toLowerCase())
    );
  }

  // Search by query (title, mood, instrumentation, preview note)
  search(query) {
    const all = this.getCombinedCatalog();
    if (!query || !query.trim()) {
      return all;
    }
    const q = query.toLowerCase().trim();
    return all.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.mood && t.mood.toLowerCase().includes(q)) ||
      (t.previewNote && t.previewNote.toLowerCase().includes(q)) ||
      (t.instrumentation && t.instrumentation.toLowerCase().includes(q))
    );
  }

  // Get single track by ID
  getById(id) {
    const all = this.getCombinedCatalog();
    return all.find(t => t.id === id) || null;
  }

  // Get category list with counts
  getCategories() {
    const all = this.getCombinedCatalog();
    const cats = ['all', 'Custom', 'Bedtime', 'Podcast', 'News & Tech', 'Commercial', 'Cinematic'];
    return cats.map(cat => ({
      name: cat,
      count: cat === 'all' ? all.length : all.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length
    })).filter(c => c.name !== 'Custom' || c.count > 0);
  }
}

const soundtrackLibraryService = new SoundtrackLibraryService();
export default soundtrackLibraryService;
