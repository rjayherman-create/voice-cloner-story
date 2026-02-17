import React, { useState } from 'react';
import './AssetManager.css';

const AssetManager = ({ onAddAsset, assets, onClose }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const asset = {
            id: `${type}-${Date.now()}-${i}`,
            name: file.name,
            imageData: event.target.result,
            width: 512,
            height: 512,
            uploadedAt: new Date().toLocaleString()
          };
          onAddAsset(type, asset);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInput = (e, type) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const asset = {
            id: `${type}-${Date.now()}-${i}`,
            name: file.name,
            imageData: event.target.result,
            width: 512,
            height: 512,
            uploadedAt: new Date().toLocaleString()
          };
          onAddAsset(type, asset);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="asset-manager-overlay">
      <div className="asset-manager">
        <div className="asset-header">
          <h2>📁 Asset Manager</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Backgrounds */}
        <div className="asset-section">
          <h3>🖼️ Backgrounds</h3>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'backgrounds')}
          >
            <p>Drag backgrounds here or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileInput(e, 'backgrounds')}
              style={{ display: 'none' }}
              id="background-input"
            />
            <label htmlFor="background-input" className="file-label">
              Choose Files
            </label>
          </div>

          <div className="asset-list">
            {assets.backgrounds.map((asset, idx) => (
              <div key={idx} className="asset-item">
                <img src={asset.imageData} alt={asset.name} />
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-meta">{asset.width}x{asset.height}</span>
                </div>
                <button className="use-btn">Use</button>
              </div>
            ))}
          </div>
        </div>

        {/* Characters */}
        <div className="asset-section">
          <h3>🧑 Characters / Sprites</h3>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'characters')}
          >
            <p>Drag character sprites here or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileInput(e, 'characters')}
              style={{ display: 'none' }}
              id="character-input"
            />
            <label htmlFor="character-input" className="file-label">
              Choose Files
            </label>
          </div>

          <div className="asset-list">
            {assets.characters.map((asset, idx) => (
              <div key={idx} className="asset-item">
                <img src={asset.imageData} alt={asset.name} />
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-meta">{asset.width}x{asset.height}</span>
                </div>
                <button className="use-btn">Use</button>
              </div>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div className="asset-section">
          <h3>✨ Effect Assets</h3>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'effects')}
          >
            <p>Drag effect sprites here (particles, etc.)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileInput(e, 'effects')}
              style={{ display: 'none' }}
              id="effect-input"
            />
            <label htmlFor="effect-input" className="file-label">
              Choose Files
            </label>
          </div>

          <div className="asset-list">
            {assets.effects.map((asset, idx) => (
              <div key={idx} className="asset-item">
                <img src={asset.imageData} alt={asset.name} />
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-meta">{asset.width}x{asset.height}</span>
                </div>
                <button className="use-btn">Use</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
