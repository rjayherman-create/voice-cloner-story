import React, { useEffect } from 'react';
import VoiceBrowser from './components/VoiceBrowser';
import './App.css';

function App() {
  useEffect(() => {
    document.title = '🎙️ FableVoice Studio - Voice Cloning & Audio Stories';
  }, []);

  return (
    <div className="fable-app-root">
      <VoiceBrowser />
    </div>
  );
}

export default App;
