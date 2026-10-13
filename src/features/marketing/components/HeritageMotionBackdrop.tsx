import React, { useEffect, useRef } from 'react';
import { IMG } from '../data/images';
import { startCanvasLoop } from '../lib/canvasLoop';

export const HeritageMotionBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);

    // Stupa wireframe contours and aerial drone points
    interface DronePoint {
      x: number;
      y: number;
      z: number;
      size: number;
      alpha: number;
    }

    const points: DronePoint[] = [];
    for (let i = 0; i < 350; i++) {
      points.push({
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 220,
        z: (Math.random() - 0.5) * 300,
        size: 1.5 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.7; // Position toward right side of banner
      const cy = height * 0.5;

      const rotY = time * 0.4;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Render drifting drone points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;

        const depth = 400 + rz;
        if (depth <= 10) continue;

        const scale = 350 / depth;
        const sx = cx + rx * scale;
        const sy = cy + p.y * scale;

        ctx.fillStyle = `rgba(225, 29, 72, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Connect select neighbors
        if (i % 6 === 0) {
          ctx.strokeStyle = 'rgba(200, 200, 210, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 30 * scale, sy - 15 * scale);
          ctx.stroke();
        }
      }

      // Faint sweeping radar arc
      const radarAngle = time * 0.8;
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(radarAngle) * 160, cy + Math.sin(radarAngle) * 160);
      ctx.stroke();

    };

    const stopLoop = startCanvasLoop(canvas, render);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <img loading="lazy" decoding="async"
        src={IMG['heritage-motion-backdrop/3d-model-of-chilancho-stupa']}
        alt="3D model of Chilancho Stupa"
        className="h-full w-full object-cover opacity-12 filter grayscale scale-105 animate-[pulse_8s_ease-in-out_infinite]"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-transparent" />
    </div>
  );
};
