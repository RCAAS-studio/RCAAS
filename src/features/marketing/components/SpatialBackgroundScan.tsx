import React, { useEffect, useRef } from 'react';
import { startCanvasLoop } from '../lib/canvasLoop';

export const SpatialBackgroundScan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Subtle survey grid marks (crosshairs at 120px intervals)
      const step = 140;
      const pulsePhase = (Math.sin(time * 0.8) + 1) * 0.5;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
      for (let x = 40; x < width; x += step) {
        for (let y = 40; y < height; y += step) {
          // Micro crosshair
          ctx.fillRect(x - 2, y, 5, 1);
          ctx.fillRect(x, y - 2, 1, 5);
        }
      }

      // Very subtle laser beam sweep across viewport
      const sweepY = ((time * 70) % (height + 200)) - 100;
      const grad = ctx.createLinearGradient(0, sweepY - 30, 0, sweepY + 30);
      grad.addColorStop(0, 'rgba(225, 29, 72, 0)');
      grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.03)');
      grad.addColorStop(1, 'rgba(225, 29, 72, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 30, width, 60);

    };

    const stopLoop = startCanvasLoop(canvas, render);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="hidden md:block fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-60" />
    </div>
  );
};
