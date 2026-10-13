import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Waypoint {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotX: number;
}

const WAYPOINTS: Waypoint[] = [
  { id: 'wp-plinth', name: '01 Plinth', label: 'Courtyard Plinth', x: 0, y: 15, z: -40, rotY: 0, rotX: 0.12 },
  { id: 'wp-shrine', name: '02 Shrine', label: 'Sacred Chaitya', x: -60, y: 25, z: 120, rotY: -0.45, rotX: 0.18 },
  { id: 'wp-arcade', name: '03 Arcade', label: 'Newari Colonnade', x: 80, y: 10, z: 220, rotY: 0.52, rotX: 0.08 },
  { id: 'wp-aerial', name: '04 Drone', label: 'Aerial Overview', x: 0, y: -90, z: 180, rotY: 0.15, rotX: 0.55 },
];

export const SpatialWalkthroughHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraMode, setCameraMode] = useState<'dolly' | 'lidar' | 'manual'>('dolly');
  const [activeWpIndex, setActiveWpIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [telemetry, setTelemetry] = useState({
    x: 0,
    y: 1.8,
    z: 14.2,
    velocity: 1.4,
    heading: 312,
    pitch: -2.1,
    pointsCount: '1,420,000',
    accuracy: '±4.8mm',
  });

  // State refs for animation loop
  const stateRef = useRef({
    camX: 0,
    camY: 15,
    camZ: -50,
    targetCamX: 0,
    targetCamY: 15,
    targetCamZ: -50,
    rotY: 0,
    rotX: 0.12,
    targetRotY: 0,
    targetRotX: 0.12,
    time: 0,
    isInteracting: false,
    lastMouseX: 0,
    lastMouseY: 0,
    cameraMode: 'dolly' as 'dolly' | 'lidar' | 'manual',
    isPlaying: true,
    playbackSpeed: 1.0,
    activeWpIndex: 0,
  });

  // Sync state refs
  useEffect(() => {
    stateRef.current.cameraMode = cameraMode;
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.playbackSpeed = playbackSpeed;
    stateRef.current.activeWpIndex = activeWpIndex;
  }, [cameraMode, isPlaying, playbackSpeed, activeWpIndex]);

  const selectWaypoint = useCallback((index: number) => {
    setActiveWpIndex(index);
    const wp = WAYPOINTS[index];
    stateRef.current.targetCamX = wp.x;
    stateRef.current.targetCamY = wp.y;
    stateRef.current.targetCamZ = wp.z;
    stateRef.current.targetRotY = wp.rotY;
    stateRef.current.targetRotX = wp.rotX;
  }, []);

  // 3D Canvas Rendering & Motion Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Pre-generate rich 3D architectural point clouds & structural geometry
    interface Point3D {
      x: number;
      y: number;
      z: number;
      r: number;
      g: number;
      b: number;
      size: number;
      isHighlight?: boolean;
    }

    const points: Point3D[] = [];

    // 1. Terraced Courtyard & Pavers
    for (let i = 0; i < 450; i++) {
      const u = (Math.random() - 0.5) * 480;
      const v = (Math.random() - 0.5) * 550;
      points.push({
        x: u,
        y: 60 + (Math.random() - 0.5) * 4,
        z: v,
        r: 160 + Math.random() * 30,
        g: 130 + Math.random() * 25,
        b: 105 + Math.random() * 20,
        size: 2.2,
      });
    }

    // 2. Historic Buddhist Stupa Geometry
    // Octagonal base plinth
    for (let i = 0; i < 350; i++) {
      const angle = (Math.floor(Math.random() * 8) / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radius = 100 - (Math.random() * 25);
      points.push({
        x: Math.cos(angle) * radius,
        y: 40 - Math.random() * 25,
        z: 140 + Math.sin(angle) * radius,
        r: 180 + Math.random() * 35,
        g: 140 + Math.random() * 30,
        b: 110 + Math.random() * 25,
        size: 2.6,
      });
    }

    // Hemispherical White Dome
    for (let i = 0; i < 450; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * (Math.PI / 2);
      const rad = 65;
      points.push({
        x: rad * Math.sin(phi) * Math.cos(theta),
        y: 10 - rad * Math.cos(phi),
        z: 140 + rad * Math.sin(phi) * Math.sin(theta),
        r: 235 + Math.random() * 20,
        g: 230 + Math.random() * 25,
        b: 220 + Math.random() * 25,
        size: 2.8,
      });
    }

    // Harmika Cube & Eyes of Buddha
    for (let i = 0; i < 180; i++) {
      const bx = (Math.random() - 0.5) * 32;
      const by = -60 + (Math.random() - 0.5) * 22;
      const bz = 140 + (Math.random() - 0.5) * 32;
      points.push({
        x: bx,
        y: by,
        z: bz,
        r: 225,
        g: 29,
        b: 72, // Loro signature editorial red highlights on harmika
        size: 2.5,
        isHighlight: Math.random() > 0.8,
      });
    }

    // Golden 13-tier spire
    for (let i = 0; i < 300; i++) {
      const h = Math.random() * 85;
      const taper = (1 - h / 95) * 18;
      const angle = Math.random() * Math.PI * 2;
      points.push({
        x: taper * Math.cos(angle),
        y: -75 - h,
        z: 140 + taper * Math.sin(angle),
        r: 245 + Math.random() * 10,
        g: 195 + Math.random() * 25,
        b: 45 + Math.random() * 30, // Luminous golden pinnacle
        size: 2.4,
      });
    }

    // 3. Colonnade Pillars & Arches (Flanking Left and Right)
    for (let side = -1; side <= 1; side += 2) {
      for (let pIdx = 0; pIdx < 5; pIdx++) {
        const pillarZ = -10 + pIdx * 70;
        const pillarX = side * 130;
        for (let py = -40; py <= 60; py += 6) {
          points.push({
            x: pillarX + (Math.random() - 0.5) * 8,
            y: py,
            z: pillarZ + (Math.random() - 0.5) * 8,
            r: 140 + Math.random() * 40,
            g: 90 + Math.random() * 30,
            b: 65 + Math.random() * 20,
            size: 2.5,
          });
        }
      }
    }

    // Mouse & Touch Interaction handlers
    const onMouseDown = (e: MouseEvent) => {
      stateRef.current.isInteracting = true;
      stateRef.current.lastMouseX = e.clientX;
      stateRef.current.lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isInteracting) return;
      const dx = e.clientX - stateRef.current.lastMouseX;
      const dy = e.clientY - stateRef.current.lastMouseY;
      stateRef.current.targetRotY += dx * 0.005;
      stateRef.current.targetRotX = Math.max(-0.4, Math.min(0.7, stateRef.current.targetRotX + dy * 0.005));
      stateRef.current.lastMouseX = e.clientX;
      stateRef.current.lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      stateRef.current.isInteracting = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.15;
      stateRef.current.targetCamZ = Math.max(-120, Math.min(300, stateRef.current.targetCamZ + zoomDelta));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Continuous Animation & Locomotion Render Loop
    let lastTelemetryUpdate = 0;

    const render = (currentTime: number) => {
      const state = stateRef.current;
      const dt = 0.016;
      state.time += dt * state.playbackSpeed;

      // 1. Moving Camera Path Calculation
      if (state.cameraMode === 'dolly' && state.isPlaying && !state.isInteracting) {
        // Continuous organic dolly walkthrough: camera glides smoothly forward through the courtyard,
        // weaves gently between the colonnade and rises towards the stupa dome, then smoothly loops.
        const loopDuration = 18; // seconds
        const t = (state.time % loopDuration) / loopDuration;
        const angle = t * Math.PI * 2;

        // Camera path: smooth forward dolly with subtle lateral sway & elevation rise
        state.targetCamX = Math.sin(angle) * 75;
        state.targetCamZ = -60 + Math.sin(angle * 0.5 + Math.PI * 0.25) * 160 + (t * 80);
        state.targetCamY = 12 + Math.cos(angle * 2) * 8 - (Math.sin(angle) > 0.5 ? 20 : 0);

        // Smooth camera look-ahead
        state.targetRotY = Math.sin(angle) * 0.25;
        state.targetRotX = 0.08 + Math.cos(angle) * 0.06;
      } else if (state.cameraMode === 'lidar' && state.isPlaying && !state.isInteracting) {
        // LiDAR orbiting inspection flight
        const orbitSpeed = state.time * 0.45;
        state.targetCamX = Math.cos(orbitSpeed) * 140;
        state.targetCamZ = 140 + Math.sin(orbitSpeed) * 140;
        state.targetCamY = -35 + Math.sin(orbitSpeed * 0.7) * 25;
        state.targetRotY = -orbitSpeed - Math.PI / 2;
        state.targetRotX = 0.28;
      }

      // Smooth camera interpolation (ease-out spring physics)
      state.camX += (state.targetCamX - state.camX) * 0.06;
      state.camY += (state.targetCamY - state.camY) * 0.06;
      state.camZ += (state.targetCamZ - state.camZ) * 0.06;
      state.rotY += (state.targetRotY - state.rotY) * 0.08;
      state.rotX += (state.targetRotX - state.rotX) * 0.08;

      // Update telemetry display every 150ms
      if (currentTime - lastTelemetryUpdate > 150) {
        lastTelemetryUpdate = currentTime;
        const vel = state.isPlaying ? (state.playbackSpeed * 1.4).toFixed(1) : '0.0';
        const headingDeg = Math.round(((state.rotY * 180 / Math.PI) % 360 + 360) % 360);
        setTelemetry((prev) => ({
          ...prev,
          x: parseFloat((state.camX * 0.1).toFixed(2)),
          y: parseFloat(((60 - state.camY) * 0.05).toFixed(2)),
          z: parseFloat((state.camZ * 0.1 + 14).toFixed(2)),
          velocity: parseFloat(vel),
          heading: headingDeg,
          pitch: parseFloat((-state.rotX * 20).toFixed(1)),
        }));
      }

      // 2. Render Frame
      ctx.clearRect(0, 0, width, height);

      // Deep editorial architectural backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0B0D11');
      grad.addColorStop(0.65, '#13161C');
      grad.addColorStop(1, '#1A1E26');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Camera transformation constants
      const fov = 420;
      const centerX = width / 2;
      const centerY = height / 2 + 20;

      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);

      // A. Ground Perspective Grid with Moving Laser Sweep Waves
      ctx.save();
      const gridSpacing = 40;
      const gridExt = 360;
      const groundY = 60 - state.camY;
      const sweepZ = ((state.time * 90) % 600) - 200; // continuous sweeping laser wave

      ctx.lineWidth = 1;

      // Project grid lines
      for (let gx = -gridExt; gx <= gridExt; gx += gridSpacing) {
        // Line along Z
        const p1x = gx - state.camX;
        const p1y = groundY;
        const p1z = -120 - state.camZ;

        const p2x = gx - state.camX;
        const p2y = groundY;
        const p2z = 400 - state.camZ;

        // Transform 1
        const rx1 = p1x * cosY - p1z * sinY;
        const rz1 = p1x * sinY + p1z * cosY;
        const ry1 = p1y * cosX - rz1 * sinX;
        const rz1_final = p1y * sinX + rz1 * cosX;

        // Transform 2
        const rx2 = p2x * cosY - p2z * sinY;
        const rz2 = p2x * sinY + p2z * cosY;
        const ry2 = p2y * cosX - rz2 * sinX;
        const rz2_final = p2y * sinX + rz2 * cosX;

        if (rz1_final > 20 && rz2_final > 20) {
          const s1 = fov / rz1_final;
          const s2 = fov / rz2_final;
          const sx1 = centerX + rx1 * s1;
          const sy1 = centerY + ry1 * s1;
          const sx2 = centerX + rx2 * s2;
          const sy2 = centerY + ry2 * s2;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }
      }

      // Transverse grid lines with Laser Pulse
      for (let gz = -120; gz <= 400; gz += gridSpacing) {
        const p1x = -gridExt - state.camX;
        const p1y = groundY;
        const p1z = gz - state.camZ;

        const p2x = gridExt - state.camX;
        const p2y = groundY;
        const p2z = gz - state.camZ;

        const rx1 = p1x * cosY - p1z * sinY;
        const rz1 = p1x * sinY + p1z * cosY;
        const ry1 = p1y * cosX - rz1 * sinX;
        const rz1_final = p1y * sinX + rz1 * cosX;

        const rx2 = p2x * cosY - p2z * sinY;
        const rz2 = p2x * sinY + p2z * cosY;
        const ry2 = p2y * cosX - rz2 * sinX;
        const rz2_final = p2y * sinX + rz2 * cosX;

        if (rz1_final > 20 && rz2_final > 20) {
          const s1 = fov / rz1_final;
          const s2 = fov / rz2_final;
          const sx1 = centerX + rx1 * s1;
          const sy1 = centerY + ry1 * s1;
          const sx2 = centerX + rx2 * s2;
          const sy2 = centerY + ry2 * s2;

          // Check proximity to moving laser sweep
          const distToSweep = Math.abs(gz - sweepZ);
          if (distToSweep < 35) {
            const glow = 1 - distToSweep / 35;
            ctx.strokeStyle = `rgba(225, 29, 72, ${0.15 + glow * 0.6})`;
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
          }

          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // B. Render 3D Point Cloud with Perspective & Depth Sorting
      const renderedPoints: {
        sx: number;
        sy: number;
        scale: number;
        depth: number;
        color: string;
        size: number;
      }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Translate relative to moving camera
        const dx = p.x - state.camX;
        const dy = p.y - state.camY;
        const dz = p.z - state.camZ;

        // Yaw rotation
        const rx = dx * cosY - dz * sinY;
        const rz = dx * sinY + dz * cosY;

        // Pitch rotation
        const ry = dy * cosX - rz * sinX;
        const rz_final = dy * sinX + rz * cosX;

        // Near-clip check
        if (rz_final <= 25) continue;

        const scale = fov / rz_final;
        const sx = centerX + rx * scale;
        const sy = centerY + ry * scale;

        // Screen boundary check with margin
        if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

        // Color computation depending on mode
        let color = '';
        if (state.cameraMode === 'lidar') {
          // SLAM LiDAR Elevation gradient: Purple -> Blue -> Green -> Yellow -> Red
          const elev = (p.y + 120) / 190;
          const norm = Math.max(0, Math.min(1, 1 - elev));
          const hue = norm * 260; // 0=red, 240=blue
          color = `hsla(${hue}, 85%, 55%, ${Math.min(1, scale * 1.2)})`;
        } else {
          // Photorealistic radiance splat with laser scan interference
          const distToLaser = Math.abs(p.z - sweepZ);
          if (distToLaser < 20) {
            // Laser sweep highlights
            color = `rgba(255, 80, 110, ${0.7 + (1 - distToLaser / 20) * 0.3})`;
          } else if (p.isHighlight) {
            color = `rgba(225, 29, 72, 0.9)`;
          } else {
            const alpha = Math.min(0.95, 0.4 + scale * 0.8);
            color = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
          }
        }

        renderedPoints.push({
          sx,
          sy,
          scale,
          depth: rz_final,
          color,
          size: Math.max(1.2, p.size * scale),
        });
      }

      // Sort back-to-front for proper depth stacking
      renderedPoints.sort((a, b) => b.depth - a.depth);

      for (let i = 0; i < renderedPoints.length; i++) {
        const rp = renderedPoints[i];
        ctx.fillStyle = rp.color;
        ctx.beginPath();
        ctx.arc(rp.sx, rp.sy, rp.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. Render 3D Spatial Waypoint Pins in Perspective
      WAYPOINTS.forEach((wp, idx) => {
        const dx = wp.x - state.camX;
        const dy = wp.y - 10 - state.camY;
        const dz = wp.z - state.camZ;

        const rx = dx * cosY - dz * sinY;
        const rz = dx * sinY + dz * cosY;
        const ry = dy * cosX - rz * sinX;
        const rz_final = dy * sinX + rz * cosX;

        if (rz_final > 25) {
          const scale = fov / rz_final;
          const sx = centerX + rx * scale;
          const sy = centerY + ry * scale;

          if (sx > 20 && sx < width - 20 && sy > 20 && sy < height - 20) {
            const isSelected = idx === state.activeWpIndex;
            ctx.save();
            ctx.fillStyle = isSelected ? '#E11D48' : 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(sx, sy, isSelected ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing target ring for active waypoint
            if (isSelected) {
              const pulse = (Math.sin(state.time * 4) + 1) * 3 + 7;
              ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(sx, sy, pulse, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Waypoint Text Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '10px monospace';
            ctx.fillText(wp.name, sx + 10, sy - 5);
            ctx.restore();
          }
        }
      });

      // D. Active Scanning Laser Line
      ctx.save();
      const scanPhase = (Math.sin(state.time * 1.5) + 1) * 0.5;
      const laserY = 40 + scanPhase * (height - 80);
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(30, laserY);
      ctx.lineTo(width - 30, laserY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden border border-line bg-ink shadow-2xl select-none"
    >
      {/* 1. Real-time 3D Walkthrough Viewport Canvas */}
      <div className="relative h-[380px] sm:h-[480px] md:h-[540px] w-full cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="block h-full w-full" />

        {/* Viewport Vignette & Technical Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-black/60" />

        {/* Technical Corner Brackets */}
        <div className="pointer-events-none absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-accent/80" />
        <div className="pointer-events-none absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-accent/80" />
        <div className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-accent/80" />
        <div className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-accent/80" />

        {/* 2. Top Technical Status Bar */}
        <div className="absolute top-4 inset-x-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-md bg-black/75 px-3 py-1.5 border border-white/10 text-white shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="font-semibold tracking-wider text-[11px] uppercase">
              {cameraMode === 'dolly' ? 'Live Cinematic Dolly Tour' : cameraMode === 'lidar' ? 'SLAM LiDAR Elevation Scan' : 'Manual Viewport Control'}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-300">Chilancho Stupa</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 rounded-md bg-black/75 p-1 border border-white/10">
            <button
              onClick={() => setCameraMode('dolly')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                cameraMode === 'dolly' ? 'bg-accent text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dolly Tour
            </button>
            <button
              onClick={() => setCameraMode('lidar')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                cameraMode === 'lidar' ? 'bg-accent text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              LiDAR Scan
            </button>
            <button
              onClick={() => setCameraMode('manual')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                cameraMode === 'manual' ? 'bg-accent text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Free Drag
            </button>
          </div>
        </div>

        {/* 3. Center Walkthrough HUD Watermark / Direction Reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center opacity-60">
            <div className="h-10 w-10 rounded-full border border-white/20 border-dashed animate-[spin_16s_linear_infinite]" />
            <div className="absolute h-2 w-2 rounded-full bg-accent" />
            <div className="absolute h-0.5 w-6 bg-white/30" />
            <div className="absolute h-6 w-0.5 bg-white/30" />
          </div>
        </div>

        {/* 4. Left Telemetry Readout (Aviation & Survey HUD) */}
        <div className="pointer-events-none absolute left-6 top-20 hidden md:flex flex-col gap-1 text-[11px] font-mono text-zinc-300 bg-black/75 p-2.5 rounded border border-white/10">
          <div className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider mb-0.5">
            Spatial Telemetry
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">XYZ POS</span>
            <span className="text-white font-bold">{telemetry.x}m, {telemetry.y}m, {telemetry.z}m</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">VELOCITY</span>
            <span className="text-emerald-400 font-bold">{telemetry.velocity} m/s</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">HEADING</span>
            <span className="text-white">{telemetry.heading}° NW</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">SURVEY ACC</span>
            <span className="text-accent-soft font-semibold">{telemetry.accuracy}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">SPLATS</span>
            <span className="text-zinc-200">{telemetry.pointsCount}</span>
          </div>
        </div>

        {/* 5. Bottom Waypoints Bar (Interactive Jump Points) */}
        <div className="absolute bottom-16 inset-x-6 flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 bg-black/80 p-1.5 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono uppercase text-zinc-400 px-2 font-semibold hidden sm:inline">
              Waypoints:
            </span>
            {WAYPOINTS.map((wp, idx) => (
              <button
                key={wp.id}
                onClick={() => selectWaypoint(idx)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                  activeWpIndex === idx
                    ? 'bg-white text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {wp.name}
              </button>
            ))}
          </div>

          {/* Speed & Pause Controls */}
          <div className="flex items-center gap-1.5 bg-black/80 p-1.5 rounded-lg border border-white/10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 text-xs font-mono text-zinc-200 hover:text-white rounded hover:bg-white/10"
              title={isPlaying ? 'Pause Motion' : 'Resume Motion'}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white rounded hover:bg-white/10"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* 6. Bottom Banner / Interaction Hint */}
        <div className="absolute bottom-4 inset-x-6 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-300">Continuous 60FPS Spatial Locomotion</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span>Drag or scroll to orbit &amp; steer camera</span>
            <span className="text-white">⇄</span>
          </div>
        </div>
      </div>
    </div>
  );
};
