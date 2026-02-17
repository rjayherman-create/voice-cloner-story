import React, { useRef, useEffect } from 'react';

const AnimationCanvas = ({ project, currentFrame, zoomLevel }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scaledWidth = (project.width * zoomLevel) / 100;
    const scaledHeight = (project.height * zoomLevel) / 100;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);

    // Scale context for zoom
    ctx.scale(zoomLevel / 100, zoomLevel / 100);

    // Draw background
    const bgKeyframes = project.timeline.background;
    const bgState = interpolateKeyframes(bgKeyframes, currentFrame);
    if (bgState && project.assets.backgrounds[bgState.assetIndex]) {
      drawBackground(ctx, project.assets.backgrounds[bgState.assetIndex], bgState, project);
    }

    // Draw character
    const charKeyframes = project.timeline.character;
    const charState = interpolateKeyframes(charKeyframes, currentFrame);
    if (charState && project.assets.characters[charState.assetIndex]) {
      drawCharacter(ctx, project.assets.characters[charState.assetIndex], charState, project);
    }

    // Draw effects
    const effectsKeyframes = project.timeline.effects;
    effectsKeyframes.forEach(keyframe => {
      if (currentFrame >= keyframe.frame) {
        drawEffect(ctx, keyframe, currentFrame, project);
      }
    });

  }, [project, currentFrame, zoomLevel]);

  const interpolateKeyframes = (keyframes, frame) => {
    if (keyframes.length === 0) return null;

    // Find surrounding keyframes
    const before = keyframes.filter(k => k.frame <= frame).pop();
    const after = keyframes.find(k => k.frame > frame);

    if (!before) return keyframes[0];
    if (!after) return before;

    // Linear interpolation
    const progress = (frame - before.frame) / (after.frame - before.frame);
    
    return {
      assetIndex: before.assetIndex,
      x: before.x + (after.x - before.x) * progress,
      y: before.y + (after.y - before.y) * progress,
      scaleX: before.scaleX + (after.scaleX - before.scaleX) * progress,
      scaleY: before.scaleY + (after.scaleY - before.scaleY) * progress,
      rotation: before.rotation + (after.rotation - before.rotation) * progress,
      opacity: before.opacity + (after.opacity - before.opacity) * progress
    };
  };

  const drawBackground = (ctx, bgAsset, state, project) => {
    if (!bgAsset.imageData) return;

    const img = new Image();
    img.onload = () => {
      ctx.globalAlpha = state.opacity;
      ctx.drawImage(img, state.x, state.y, project.width, project.height);
      ctx.globalAlpha = 1;
    };
    img.src = bgAsset.imageData;
  };

  const drawCharacter = (ctx, charAsset, state, project) => {
    if (!charAsset.imageData) return;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = state.opacity;
      ctx.translate(state.x + charAsset.width / 2, state.y + charAsset.height / 2);
      ctx.rotate((state.rotation * Math.PI) / 180);
      ctx.scale(state.scaleX, state.scaleY);
      ctx.drawImage(img, -charAsset.width / 2, -charAsset.height / 2, charAsset.width, charAsset.height);
      ctx.restore();
    };
    img.src = charAsset.imageData;
  };

  const drawEffect = (ctx, effect, frame, project) => {
    const progress = Math.min(1, (frame - effect.frame) / (effect.duration || 30));

    ctx.save();

    switch (effect.type) {
      case 'fade':
        ctx.globalAlpha = effect.startOpacity - (effect.startOpacity - effect.endOpacity) * progress;
        ctx.fillStyle = effect.color || '#ffffff';
        ctx.fillRect(0, 0, project.width, project.height);
        break;

      case 'particles':
        drawParticles(ctx, effect, progress, project);
        break;

      case 'shake':
        const shakeAmount = effect.intensity * (1 - progress);
        ctx.translate(
          Math.random() * shakeAmount - shakeAmount / 2,
          Math.random() * shakeAmount - shakeAmount / 2
        );
        break;

      case 'glow':
        ctx.shadowColor = effect.color || '#00ffff';
        ctx.shadowBlur = effect.blur * progress;
        break;
    }

    ctx.restore();
  };

  const drawParticles = (ctx, effect, progress, project) => {
    const particleCount = effect.count || 20;
    
    for (let i = 0; i < particleCount; i++) {
      const seed = i * 12345;
      const x = (project.width / 2 + Math.sin(seed) * 200) * progress;
      const y = (project.height / 2 + Math.cos(seed) * 200) * progress;
      
      ctx.fillStyle = effect.color || '#00ffff';
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.arc(x, y, effect.size || 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  return (
    <div className="animation-canvas-container">
      <canvas
        ref={canvasRef}
        className="animation-canvas"
      />
    </div>
  );
};

export default AnimationCanvas;
