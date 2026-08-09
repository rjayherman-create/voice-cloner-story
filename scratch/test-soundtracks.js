// scratch/test-soundtracks.js
import fetch from 'node-fetch';
import soundtrackLibraryService from '../backend/services/soundtrack-library.js';

async function testAllTracks() {
  const tracks = soundtrackLibraryService.getAll();
  console.log(`Testing ${tracks.length} soundtracks...`);

  const results = [];
  for (const t of tracks) {
    try {
      const res = await fetch(t.url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`[${res.status}] ${t.id} - ${t.title} (${res.headers.get('content-type')})`);
      results.push({ id: t.id, status: res.status, ok: res.ok, type: res.headers.get('content-type') });
    } catch (err) {
      console.log(`[ERR] ${t.id} - ${err.message}`);
      results.push({ id: t.id, ok: false, error: err.message });
    }
  }

  const failing = results.filter(r => !r.ok);
  console.log(`\nSummary: ${results.length - failing.length}/${results.length} tracks OK. Failing: ${failing.length}`);
}

testAllTracks();
