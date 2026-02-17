# Custom Voice Implementation Guide

## Backend API Endpoints (Already Exist)

The backend already has all the routes you need in `/backend/routes/voice-library.js`:

- `GET /api/voice-library` - Get all custom voices
- `POST /api/voice-library` - Create a new custom voice
- `GET /api/voice-library/:presetId` - Get a specific voice
- `PUT /api/voice-library/:presetId` - Update a voice
- `DELETE /api/voice-library/:presetId` - Delete a voice
- `POST /api/voice-library/:presetId/use` - Increment usage count

## Frontend Implementation Steps

### 1. Add Custom Voice State (in App.jsx)

```javascript
// After the audio merger states, add:
const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
const [customVoices, setCustomVoices] = useState([]);
const [customVoicesLoading, setCustomVoicesLoading] = useState(false);
const [newCustomVoice, setNewCustomVoice] = useState({
  name: '',
  voiceName: '',
  gender: 'female',
  accent: 'American',
  style: 'Professional',
  description: '',
  speed: 'normal',
  pitch: 'normal'
});
const [customVoiceError, setCustomVoiceError] = useState('');
```

### 2. Add useEffect to Load Custom Voices

```javascript
// In your main useEffect, add:
const loadCustomVoices = async () => {
  setCustomVoicesLoading(true);
  try {
    const response = await fetch('http://localhost:5001/api/voice-library');
    const data = await response.json();
    setCustomVoices(data);
  } catch (err) {
    console.error('Failed to load custom voices:', err);
  } finally {
    setCustomVoicesLoading(false);
  }
};

// Call it in useEffect:
React.useEffect(() => {
  loadVoices();
  loadProjects();
  loadCustomVoices();
}, []);
```

### 3. Add Custom Voice Handler Functions

```javascript
const handleCreateCustomVoice = async (e) => {
  e.preventDefault();
  
  if (!newCustomVoice.name.trim()) {
    setCustomVoiceError('Voice name is required');
    return;
  }

  setLoading(true);
  setCustomVoiceError('');
  
  try {
    const response = await fetch('http://localhost:5001/api/voice-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomVoice)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create custom voice');
    }

    const voiceData = await response.json();
    setCustomVoices([...customVoices, voiceData]);
    
    // Reset form
    setNewCustomVoice({
      name: '',
      voiceName: '',
      gender: 'female',
      accent: 'American',
      style: 'Professional',
      description: '',
      speed: 'normal',
      pitch: 'normal'
    });
    setShowCustomVoiceModal(false);
  } catch (err) {
    setCustomVoiceError(err.message);
  } finally {
    setLoading(false);
  }
};

const handleDeleteCustomVoice = async (presetId) => {
  if (!window.confirm('Delete this custom voice?')) return;

  try {
    const response = await fetch(`http://localhost:5001/api/voice-library/${presetId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete voice');
    
    setCustomVoices(customVoices.filter(v => v.id !== presetId));
  } catch (err) {
    setCustomVoiceError(err.message);
  }
};
```

### 4. Add Custom Voice Modal JSX

Update the "+ Create Custom Voice" button to show a modal:

```javascript
<button 
  className="create-custom-btn"
  onClick={() => setShowCustomVoiceModal(true)}
>
  + Create Custom Voice
</button>

// Add this after the voice library section:
{showCustomVoiceModal && (
  <div className="custom-voice-modal-overlay" onClick={() => setShowCustomVoiceModal(false)}>
    <div className="custom-voice-modal" onClick={(e) => e.stopPropagation()}>
      <button 
        className="modal-close-btn"
        onClick={() => setShowCustomVoiceModal(false)}
      >
        ✕
      </button>
      
      <h2>Create Custom Voice</h2>
      <p>Design your own unique voice for text-to-speech generation</p>

      {customVoiceError && <div className="error-message">{customVoiceError}</div>}

      <form onSubmit={handleCreateCustomVoice}>
        <div className="voice-form-group">
          <label>Voice Name *</label>
          <input
            type="text"
            placeholder="e.g., My Professional Voice"
            value={newCustomVoice.name}
            onChange={(e) => setNewCustomVoice({...newCustomVoice, name: e.target.value})}
          />
        </div>

        <div className="voice-form-group">
          <label>Description</label>
          <textarea
            placeholder="Describe your voice... (e.g., Deep and authoritative)"
            value={newCustomVoice.description}
            onChange={(e) => setNewCustomVoice({...newCustomVoice, description: e.target.value})}
          />
        </div>

        <div className="form-row">
          <div className="voice-form-group">
            <label>Gender</label>
            <select
              value={newCustomVoice.gender}
              onChange={(e) => setNewCustomVoice({...newCustomVoice, gender: e.target.value})}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="voice-form-group">
            <label>Accent</label>
            <select
              value={newCustomVoice.accent}
              onChange={(e) => setNewCustomVoice({...newCustomVoice, accent: e.target.value})}
            >
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="Australian">Australian</option>
              <option value="Canadian">Canadian</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="voice-form-group">
            <label>Style</label>
            <select
              value={newCustomVoice.style}
              onChange={(e) => setNewCustomVoice({...newCustomVoice, style: e.target.value})}
            >
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
              <option value="Authoritative">Authoritative</option>
              <option value="Conversational">Conversational</option>
            </select>
          </div>

          <div className="voice-form-group">
            <label>Base Voice</label>
            <select
              value={newCustomVoice.voiceName}
              onChange={(e) => setNewCustomVoice({...newCustomVoice, voiceName: e.target.value})}
            >
              <option value="">Select a voice</option>
              {allVoices.map(voice => (
                <option key={voice.id} value={voice.name}>{voice.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="submit"
            className="modal-btn modal-btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : '✨ Create Custom Voice'}
          </button>
          <button 
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowCustomVoiceModal(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

### 5. Display Custom Voices in Voice Library

Add a section to show custom voices:

```javascript
<div className="custom-voices-section">
  <h2>My Custom Voices</h2>
  {customVoices.length === 0 ? (
    <p className="no-custom-voices">No custom voices yet. Create one to get started!</p>
  ) : (
    <div className="voices-grid">
      {customVoices.map((voice) => (
        <div key={voice.id} className="voice-card custom-voice-card">
          <div className="custom-voice-badge">⭐ Custom</div>
          <h3 className="voice-name">{voice.name}</h3>
          <div className="voice-details">
            {voice.description && (
              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{voice.description}</span>
              </div>
            )}
            {voice.voiceName && (
              <div className="detail-item">
                <span className="detail-label">Base:</span>
                <span className="detail-value">{voice.voiceName}</span>
              </div>
            )}
          </div>
          <div className="custom-voice-actions">
            <button 
              className="test-voice-btn"
              onClick={() => setSelectedVoice(voice.id)}
            >
              ▶ Use This Voice
            </button>
            <button 
              className="delete-voice-btn"
              onClick={() => handleDeleteCustomVoice(voice.id)}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

## CSS to Add

Add to App.css:

```css
.custom-voice-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.custom-voice-card {
  position: relative;
}

.custom-voice-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.delete-voice-btn {
  flex: 0;
  padding: 0.7rem;
  background: #fee;
  color: #c33;
  border: 1px solid #c33;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-voice-btn:hover {
  background: #fdd;
}

.no-custom-voices {
  text-align: center;
  color: #999;
  padding: 2rem;
}
```

## How to Implement

1. Copy the custom voice state declarations into your App.jsx useState section
2. Add the useEffect call to load custom voices
3. Add the handler functions (handleCreateCustomVoice, handleDeleteCustomVoice)
4. Add the custom voice modal JSX in the voice-library page section
5. Add the custom voices display section below the main voices grid
6. Add the CSS styles to App.css

This gives you a complete custom voice system with:
✅ Create custom voices
✅ View all custom voices  
✅ Use custom voices for generation
✅ Delete custom voices
✅ Persistent storage (saved to JSON files)
✅ Full API integration
