import React, { useRef, useEffect } from 'react';

const VideoPreview = ({ videoProject, currentFrame, zoomLevel }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scaledWidth = (videoProject.width * zoomLevel) / 100;
    const scaledHeight = (videoProject.height * zoomLevel) / 100;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Scale context
    ctx.scale(zoomLevel / 100, zoomLevel / 100);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, videoProject.width, videoProject.height);

    // Draw animation if present
    if (videoProject.tracks.animation) {
      drawAnimationTrack(ctx, videoProject.tracks.animation, currentFrame, videoProject);
    }

    // Draw text overlays
    if (videoProject.tracks.text && videoProject.tracks.text.length > 0) {
      drawTextOverlays(ctx, videoProject.tracks.text, currentFrame, videoProject);
    }

    // Draw frame counter
    drawFrameInfo(ctx, currentFrame, videoProject);

  }, [videoProject, currentFrame, zoomLevel]);

  const drawAnimationTrack = (ctx, animation, frame, project) => {
    // Placeholder - would render the animation here
    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(100, 100, project.width - 200, project.height - 200);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#00ffff';
    ctx.font = '20px Courier New';
    ctx.fillText(`Animation: ${animation.name}`, 150, 150);
  };

  const drawTextOverlays = (ctx, textLayers, frame, project) => {
    textLayers.forEach((text, index) => {
      if (frame >= text.startFrame && frame < text.endFrame) {
        ctx.fillStyle = text.color || '#ffffff';
        ctx.font = `${text.fontSize || 40}px Arial`;
        ctx.textAlign = text.align || 'center';
        ctx.globalAlpha = text.opacity || 1;
        ctx.fillText(text.content, text.x || project.width / 2, text.y || 100);
        ctx.globalAlpha = 1;
      }
    });
  };

  const drawFrameInfo = (ctx, frame, project) => {
    const time = frame / project.fps;
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);

    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`Frame: ${frame} | ${minutes}:${String(Math.floor(seconds)).padStart(2, '0')}`, 
      project.width - 20, 30);
  };

  return (
    <div className="video-preview-container">
      <div className="preview-header">
        <h3>🎬 Video Preview</h3>
        <span className="resolution">{videoProject.width}×{videoProject.height}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="video-preview-canvas"
      />
    </div>
  );
};

export default VideoPreview;
