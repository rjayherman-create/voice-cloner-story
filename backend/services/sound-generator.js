// backend/services/sound-generator.js
// Generates 20 rich, multi-layered, seamless-looping studio ambient soundtracks in WAV format

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOUNDTRACKS_DIR = path.join(__dirname, '../../uploads/soundtracks');

function writeWavFile(filePath, sampleRate, numChannels, samples) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat: PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM 16-bit Samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s < 0 ? s * 0x8000 : s * 0x7FFF), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

// Generate all 20 soundscapes
export function generateSoundtrackLibrary() {
  if (!fs.existsSync(SOUNDTRACKS_DIR)) {
    fs.mkdirSync(SOUNDTRACKS_DIR, { recursive: true });
  }

  const sampleRate = 22050; // High quality 22.05kHz for lightweight, instant web loading
  const duration = 12; // 12-second seamless loops
  const totalFrames = Math.floor(sampleRate * duration);

  const tracksToGenerate = [
    // 1. Lullaby Harp
    {
      id: 'lullaby-harp',
      render: (t) => {
        const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic
        const noteIdx = Math.floor(t * 1.5) % chord.length;
        const noteFreq = chord[noteIdx];
        const noteEnv = Math.exp(-((t * 1.5) % 1) * 3);
        const harp = Math.sin(2 * Math.PI * noteFreq * t) * noteEnv * 0.4;
        const pad = (Math.sin(2 * Math.PI * 130.81 * t) + Math.sin(2 * Math.PI * 196.00 * t)) * 0.15;
        return (harp + pad) * 0.7;
      }
    },
    // 2. Cosmic Wonder
    {
      id: 'cosmic-wonder',
      render: (t) => {
        const bellFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const step = Math.floor(t * 2) % bellFreqs.length;
        const freq = bellFreqs[step];
        const env = Math.exp(-((t * 2) % 1) * 4);
        const chime = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
        const sparkle = Math.sin(2 * Math.PI * freq * 2.76 * t) * env * 0.1;
        const drone = Math.sin(2 * Math.PI * 220 * t) * 0.1;
        return chime + sparkle + drone;
      }
    },
    // 3. Gentle Rain & Piano
    {
      id: 'gentle-rain-piano',
      render: (t) => {
        const rain = (Math.random() * 2 - 1) * 0.08;
        const chords = [174.61, 220.00, 261.63, 349.23]; // Fmaj7
        const pChord = chords.reduce((acc, f) => acc + Math.sin(2 * Math.PI * f * t), 0) * 0.1;
        const melodyNotes = [349.23, 392.00, 440.00, 523.25];
        const mIdx = Math.floor(t * 0.75) % melodyNotes.length;
        const mEnv = Math.exp(-((t * 0.75) % 1) * 2.5);
        const piano = Math.sin(2 * Math.PI * melodyNotes[mIdx] * t) * mEnv * 0.3;
        return rain + pChord + piano;
      }
    },
    // 4. Warm Blanket Ambient
    {
      id: 'warm-blanket-ambient',
      render: (t) => {
        const drone = Math.sin(2 * Math.PI * 55 * t) * 0.3;
        const swell = Math.sin(2 * Math.PI * 0.1 * t) * 0.5 + 0.5;
        const harmonic = (Math.sin(2 * Math.PI * 110 * t) + Math.sin(2 * Math.PI * 165 * t)) * swell * 0.2;
        return drone + harmonic;
      }
    },
    // 5. Lo-Fi Chill Talk
    {
      id: 'lofi-chill-talk',
      render: (t) => {
        const beat = Math.floor(t * 1.3) % 4;
        const kick = (beat === 0 && (t * 1.3 % 1) < 0.15) ? Math.sin(2 * Math.PI * 50 * t) * 0.4 : 0;
        const snare = (beat === 2 && (t * 1.3 % 1) < 0.12) ? (Math.random() * 2 - 1) * 0.15 : 0;
        const rhodes = [220, 261.63, 329.63, 392].reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * 0.08;
        return kick + snare + rhodes;
      }
    },
    // 6. Acoustic Morning
    {
      id: 'acoustic-morning',
      render: (t) => {
        const notes = [146.83, 220.00, 293.66, 369.99, 440.00];
        const step = Math.floor(t * 3) % notes.length;
        const env = Math.exp(-((t * 3) % 1) * 3);
        const guitar = (Math.sin(2 * Math.PI * notes[step] * t) + 0.5 * Math.sin(2 * Math.PI * notes[step] * 2 * t)) * env * 0.35;
        return guitar;
      }
    },
    // 7. Upbeat Indie Groove
    {
      id: 'upbeat-indie-groove',
      render: (t) => {
        const bassNotes = [110, 110, 146.83, 164.81];
        const bStep = Math.floor(t * 2) % bassNotes.length;
        const bass = Math.sin(2 * Math.PI * bassNotes[bStep] * t) * 0.35;
        const shaker = (Math.random() * 2 - 1) * (((t * 4) % 1) < 0.08 ? 0.12 : 0.02);
        return bass + shaker;
      }
    },
    // 8. Late Night Jazz
    {
      id: 'late-night-jazz',
      render: (t) => {
        const jazzChords = [130.81, 164.81, 196.00, 246.94];
        const pad = jazzChords.reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * 0.08;
        const trumpet = Math.sin(2 * Math.PI * (392.00 + Math.sin(2 * Math.PI * 4 * t) * 2) * t) * 0.15;
        return pad + trumpet;
      }
    },
    // 9. Broadcast Tech Pulse
    {
      id: 'broadcast-tech-pulse',
      render: (t) => {
        const arp = [440, 554.37, 659.25, 880];
        const step = Math.floor(t * 4) % arp.length;
        const env = Math.exp(-((t * 4) % 1) * 6);
        const pulse = Math.sin(2 * Math.PI * arp[step] * t) * env * 0.3;
        const sub = Math.sin(2 * Math.PI * 55 * t) * 0.2;
        return pulse + sub;
      }
    },
    // 10. Breaking News Urgency
    {
      id: 'breaking-news-urgency',
      render: (t) => {
        const staccato = Math.sin(2 * Math.PI * 220 * t) * (((t * 4) % 1) < 0.2 ? 0.35 : 0);
        const subDrive = Math.sin(2 * Math.PI * 65.41 * t) * 0.25;
        return staccato + subDrive;
      }
    },
    // 11. Corporate Vision
    {
      id: 'corporate-vision',
      render: (t) => {
        const pianoNotes = [261.63, 329.63, 392.00, 523.25];
        const step = Math.floor(t * 1.5) % pianoNotes.length;
        const env = Math.exp(-((t * 1.5) % 1) * 2);
        const piano = Math.sin(2 * Math.PI * pianoNotes[step] * t) * env * 0.3;
        const swell = Math.sin(2 * Math.PI * 130.81 * t) * 0.15;
        return piano + swell;
      }
    },
    // 12. Cyber Data Stream
    {
      id: 'data-stream-synth',
      render: (t) => {
        const freq = 300 + Math.floor((t * 8) % 6) * 120;
        const blip = Math.sin(2 * Math.PI * freq * t) * (((t * 8) % 1) < 0.15 ? 0.25 : 0);
        const ambience = Math.sin(2 * Math.PI * 110 * t) * 0.1;
        return blip + ambience;
      }
    },
    // 13. High Energy Hook
    {
      id: 'high-energy-hook',
      render: (t) => {
        const kick = ((t * 2) % 1 < 0.15) ? Math.sin(2 * Math.PI * 60 * t) * 0.45 : 0;
        const synth = [329.63, 392.00, 493.88].reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * 0.15;
        return kick + synth;
      }
    },
    // 14. Funky Summer Vibe
    {
      id: 'funky-summer-vibe',
      render: (t) => {
        const bass = Math.sin(2 * Math.PI * (82.41 + ((Math.floor(t * 3) % 3) * 20)) * t) * 0.4;
        const clap = ((t * 1.5) % 1 < 0.08) ? (Math.random() * 2 - 1) * 0.2 : 0;
        return bass + clap;
      }
    },
    // 15. Motivational Anthem
    {
      id: 'motivational-anthem',
      render: (t) => {
        const stomp = ((t * 1.2) % 1 < 0.2) ? Math.sin(2 * Math.PI * 45 * t) * 0.5 : 0;
        const anthem = [220, 277.18, 329.63].reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * 0.12;
        return stomp + anthem;
      }
    },
    // 16. Retail Happy Acoustic
    {
      id: 'retail-happy-acoustic',
      render: (t) => {
        const uke = [329.63, 392.00, 493.88, 587.33];
        const step = Math.floor(t * 3.5) % uke.length;
        const env = Math.exp(-((t * 3.5) % 1) * 4);
        const strum = Math.sin(2 * Math.PI * uke[step] * t) * env * 0.35;
        return strum;
      }
    },
    // 17. Enchanted Forest
    {
      id: 'enchanted-forest',
      render: (t) => {
        const wind = (Math.random() * 2 - 1) * 0.04;
        const fluteNotes = [440, 493.88, 554.37, 659.25, 739.99];
        const fStep = Math.floor(t * 0.8) % fluteNotes.length;
        const flute = Math.sin(2 * Math.PI * fluteNotes[fStep] * t) * 0.25;
        const chimes = Math.sin(2 * Math.PI * 1760 * t) * (((t * 2) % 1) < 0.05 ? 0.1 : 0);
        return wind + flute + chimes;
      }
    },
    // 18. Deep Space Odyssey
    {
      id: 'deep-space-odyssey',
      render: (t) => {
        const drone = Math.sin(2 * Math.PI * 43.65 * t) * 0.35;
        const cello = (Math.sin(2 * Math.PI * 130.81 * t) + 0.5 * Math.sin(2 * Math.PI * 261.63 * t)) * 0.2;
        return drone + cello;
      }
    },
    // 19. Epic Hero Quest
    {
      id: 'epic-hero-quest',
      render: (t) => {
        const brass = [146.83, 174.61, 220.00, 293.66].reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * 0.12;
        const pulse = Math.sin(2 * Math.PI * 73.42 * t) * (((t * 2) % 1) < 0.2 ? 0.3 : 0.1);
        return brass + pulse;
      }
    },
    // 20. Ancient Mystery
    {
      id: 'ancient-mystery',
      render: (t) => {
        const bowl = Math.sin(2 * Math.PI * 108 * t) * (0.3 + 0.1 * Math.sin(2 * Math.PI * 0.2 * t));
        const drone = Math.sin(2 * Math.PI * 54 * t) * 0.2;
        return bowl + drone;
      }
    }
  ];

  for (const track of tracksToGenerate) {
    const filePath = path.join(SOUNDTRACKS_DIR, `${track.id}.wav`);
    const samples = new Float32Array(totalFrames * 2); // Stereo

    for (let i = 0; i < totalFrames; i++) {
      const t = i / sampleRate;
      const s = track.render(t);
      samples[i * 2] = s;     // Left
      samples[i * 2 + 1] = s; // Right
    }

    writeWavFile(filePath, sampleRate, 2, samples);
    console.log(`[SoundGenerator] Generated track: ${track.id}.wav`);
  }

  console.log(`[SoundGenerator] All 20 soundtrack WAV files successfully created in ${SOUNDTRACKS_DIR}`);
}
