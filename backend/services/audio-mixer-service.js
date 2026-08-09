// backend/services/audio-mixer-service.js
// Multi-Track Studio Audio Mixer for FableVoice Audio Studio
// Automatically and manually blends Voiceover + Ambient Soundtrack with Smart Ducking

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import soundtrackLibraryService from './soundtrack-library.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16-bit

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

function readWavSamples(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 44) return null;

  const numChannels = buffer.readUInt16LE(22);
  const sampleRate = buffer.readUInt32LE(24);
  const bitsPerSample = buffer.readUInt16LE(34);

  // Find 'data' chunk
  let dataOffset = 12;
  while (dataOffset < buffer.length - 8) {
    const chunkId = buffer.toString('utf8', dataOffset, dataOffset + 4);
    const chunkSize = buffer.readUInt32LE(dataOffset + 4);
    if (chunkId === 'data') {
      dataOffset += 8;
      const numSamples = Math.floor(chunkSize / 2);
      const samples = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const val = buffer.readInt16LE(dataOffset + i * 2);
        samples[i] = val / 0x8000;
      }
      return { samples, sampleRate, numChannels };
    }
    dataOffset += 8 + chunkSize;
  }
  return null;
}

class AudioMixerService {
  /**
   * Mix voiceover audio with a background soundtrack.
   * Supports Auto-Ducking, Custom Gain, and Intro/Outro padding.
   */
  async mixTracks({
    voiceFilePath,
    soundtrackId,
    mode = 'auto',
    voiceVolume = 1.0,
    musicVolume = 0.25,
    autoDucking = true,
    introDelaySec = 1.5,
    outroPadSec = 2.5
  }) {
    const trackInfo = soundtrackLibraryService.getById(soundtrackId) || soundtrackLibraryService.getAll()[0];
    const musicFilePath = path.join(SOUNDTRACKS_DIR, `${trackInfo.id}.wav`);

    const musicData = readWavSamples(musicFilePath);
    if (!musicData) {
      throw new Error(`Soundtrack audio not found: ${soundtrackId}`);
    }

    let voiceData = null;
    if (voiceFilePath && fs.existsSync(voiceFilePath)) {
      voiceData = readWavSamples(voiceFilePath);
    }

    const sampleRate = musicData.sampleRate || 22050;
    const numChannels = 2; // Stereo output

    // Calculate total duration
    const voiceFrames = voiceData ? Math.floor(voiceData.samples.length / voiceData.numChannels) : sampleRate * 10;
    const introFrames = Math.floor(introDelaySec * sampleRate);
    const outroFrames = Math.floor(outroPadSec * sampleRate);
    const totalFrames = introFrames + voiceFrames + outroFrames;

    const mixedSamples = new Float32Array(totalFrames * 2);
    const musicFramesCount = Math.floor(musicData.samples.length / musicData.numChannels);

    // Apply Smart Ducking & Volume Balancing
    const duckingFactor = autoDucking ? 0.4 : 1.0;

    for (let f = 0; f < totalFrames; f++) {
      // 1. Calculate Music Level
      const musicIdx = (f % musicFramesCount);
      let mLeft = musicData.samples[musicIdx * musicData.numChannels] || 0;
      let mRight = musicData.samples[musicIdx * musicData.numChannels + (musicData.numChannels > 1 ? 1 : 0)] || mLeft;

      let currentMusicVol = musicVolume;

      // Auto-duck during voiceover
      if (f >= introFrames && f < introFrames + voiceFrames) {
        currentMusicVol = musicVolume * duckingFactor;
      }

      // Fade in & Fade out
      if (f < introFrames) {
        currentMusicVol *= Math.min(1, (f + 1) / (introFrames * 0.75));
      } else if (f >= totalFrames - outroFrames) {
        const remaining = totalFrames - f;
        currentMusicVol *= Math.max(0, remaining / outroFrames);
      }

      let mixedL = mLeft * currentMusicVol;
      let mixedR = mRight * currentMusicVol;

      // 2. Add Voiceover
      if (voiceData && f >= introFrames && f < introFrames + voiceFrames) {
        const vf = f - introFrames;
        const vLeft = voiceData.samples[vf * voiceData.numChannels] || 0;
        const vRight = voiceData.samples[vf * voiceData.numChannels + (voiceData.numChannels > 1 ? 1 : 0)] || vLeft;

        mixedL += vLeft * voiceVolume;
        mixedR += vRight * voiceVolume;
      }

      // Soft Limiter / Compression to prevent clipping
      mixedSamples[f * 2] = Math.tanh(mixedL);
      mixedSamples[f * 2 + 1] = Math.tanh(mixedR);
    }

    // Save Master Mixed WAV to uploads
    const mixedFilename = `master-mix-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.wav`;
    const outputPath = path.join(UPLOADS_DIR, mixedFilename);

    writeWavFile(outputPath, sampleRate, numChannels, mixedSamples);

    return {
      mixedUrl: `/uploads/${mixedFilename}`,
      soundtrackTitle: trackInfo.title,
      mode,
      durationSeconds: (totalFrames / sampleRate).toFixed(1),
      voiceVolume,
      musicVolume,
      autoDucking
    };
  }
}

const audioMixerService = new AudioMixerService();
export default audioMixerService;
