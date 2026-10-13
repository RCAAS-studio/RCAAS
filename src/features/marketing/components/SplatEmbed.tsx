import React, { useState, useEffect, useRef } from 'react';
import { IMG } from '../data/images';
import { startCanvasLoop } from '../lib/canvasLoop';

interface SplatEmbedProps {
  initialDemo?: 'chilancho' | 'basera' | 'nepathya' | 'madan';
  autoStart?: boolean;
}

interface DemoSpace {
  id: 'chilancho' | 'basera' | 'nepathya' | 'madan';
  name: string;
  location: string;
  tag: string;
  clientGoal: string;
  coords: string;
  poster: string;
  waypoints: { name: string; rotY: number; rotX: number; zoom: number; camY: number }[];
}

const DEMO_SPACES: DemoSpace[] = [
  {
    id: 'chilancho',
    name: 'Chilancho Stupa',
    location: 'Kirtipur, Kathmandu Valley',
    tag: 'Cultural Heritage',
    clientGoal: 'Preserve sacred medieval Newari architecture and share with global researchers and pilgrims.',
    coords: '27°40\'58.4"N 85°16\'41.2"E',
    poster: IMG['splat-embed/chilancho-stupa'],
    waypoints: [
      { name: 'Courtyard Approach', rotY: 0, rotX: 0.25, zoom: 0.9, camY: 0 },
      { name: 'Sacred Chaitya', rotY: 1.2, rotX: 0.35, zoom: 1.3, camY: 20 },
      { name: 'Golden Spire Ascent', rotY: 2.8, rotX: 0.55, zoom: 1.6, camY: -50 },
      { name: 'Aerial Drone Survey', rotY: 4.5, rotX: 0.85, zoom: 0.7, camY: -90 },
    ],
  },
  {
    id: 'basera',
    name: 'Basera Boutique Hotel',
    location: 'Kathmandu, Nepal',
    tag: 'Hospitality',
    clientGoal: 'Let international travelers explore suites and traditional wood-carved courtyards before booking.',
    coords: '27°41\'24.8"N 85°19\'12.5"E',
    poster: IMG['splat-embed/basera-boutique-hotel'],
    waypoints: [
      { name: 'Traditional Courtyard', rotY: 0.4, rotX: 0.2, zoom: 1.0, camY: 0 },
      { name: 'Heritage Suites', rotY: 1.8, rotX: 0.3, zoom: 1.4, camY: -20 },
      { name: 'Carved Colonnade', rotY: 3.2, rotX: 0.15, zoom: 1.2, camY: 10 },
    ],
  },
  {
    id: 'nepathya',
    name: 'Nepathya School & College',
    location: 'Kathmandu, Nepal',
    tag: 'Education',
    clientGoal: 'Allow prospective students and parents to tour modern classrooms and laboratories from anywhere.',
    coords: '27°42\'10.1"N 85°20\'33.0"E',
    poster: IMG['splat-embed/nepathya-school-college'],
    waypoints: [
      { name: 'Academic Quad', rotY: 0, rotX: 0.3, zoom: 0.9, camY: 0 },
      { name: 'Science Labs', rotY: 2.1, rotX: 0.25, zoom: 1.3, camY: 15 },
      { name: 'Auditorium Bay', rotY: 4.0, rotX: 0.4, zoom: 1.1, camY: -30 },
    ],
  },
  {
    id: 'madan',
    name: 'Madan Ashrit Polytechnic',
    location: 'Nepal',
    tag: 'Vocational Campus',
    clientGoal: 'Showcase specialized engineering bays, robotic workshops, and vocational facilities.',
    coords: '27°38\'44.2"N 85°18\'02.7"E',
    poster: IMG['splat-embed/madan-ashrit-polytechnic'],
    waypoints: [
      { name: 'Robotics Workshop', rotY: 0.5, rotX: 0.2, zoom: 1.1, camY: 0 },
      { name: 'Fabrication Hall', rotY: 2.4, rotX: 0.35, zoom: 1.3, camY: 10 },
      { name: 'Polytechnic Quad', rotY: 4.2, rotX: 0.5, zoom: 0.8, camY: -40 },
    ],
  },
];

export const SplatEmbed: React.FC<SplatEmbedProps> = ({ initialDemo = 'chilancho', autoStart = false }) => {
  const [isLoaded, setIsLoaded] = useState(autoStart);
  const [activeSpaceId, setActiveSpaceId] = useState<'chilancho' | 'basera' | 'nepathya' | 'madan'>(initialDemo);
  const [renderMode, setRenderMode] = useState<'splat' | 'lidar' | 'wireframe'>('splat');
  const [motionMode, setMotionMode] = useState<'flythrough' | 'walk' | 'orbit'>('flythrough');
  const [activeWpIndex, setActiveWpIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const facadeCanvasRef = useRef<HTMLCanvasElement>(null);

  const activeSpace = DEMO_SPACES.find((s) => s.id === activeSpaceId) || DEMO_SPACES[0];

  // Motion & Locomotion State Refs
  const motionRef = useRef({
    rotX: 0.35,
    rotY: 0.0,
    targetRotX: 0.35,
    targetRotY: 0.0,
    zoom: 1.0,
    targetZoom: 1.0,
    camX: 0,
    camY: 0,
    targetCamX: 0,
    targetCamY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    time: 0,
    laserY: 0,
  });

  // Facade Animated Motion Preview Engine (Runs when not yet loaded)
  useEffect(() => {
    if (isLoaded || !facadeCanvasRef.current) return;

    const canvas = facadeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const renderFacade = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Sweeping Laser Scan Line across poster (2x slower)
      const scanPhase = (Math.sin(time * 0.75) + 1) * 0.5;
      const scanY = scanPhase * height;

      // Laser Glow
      const grad = ctx.createLinearGradient(0, scanY - 24, 0, scanY + 24);
      grad.addColorStop(0, 'rgba(225, 29, 72, 0)');
      grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.45)');
      grad.addColorStop(1, 'rgba(225, 29, 72, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 24, width, 48);

      // Laser line
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Floating Survey Markers
      const cx = width / 2;
      const cy = height / 2;
      const driftX = Math.sin(time * 0.8) * 30;
      const driftY = Math.cos(time * 0.7) * 20;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx + driftX, cy + driftY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(225, 29, 72, 0.7)';
      ctx.beginPath();
      ctx.arc(cx + driftX, cy + driftY, 14, 0, Math.PI * 2);
      ctx.stroke();

    };

    const stopLoop = startCanvasLoop(canvas, renderFacade);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  // Main 3D Canvas Orbit & Flythrough Locomotion Engine
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Procedural Point Cloud Generation
    interface Point3D {
      x: number;
      y: number;
      z: number;
      r: number;
      g: number;
      b: number;
      size: number;
      opacity: number;
    }

    const points: Point3D[] = [];
    const count = 1100;

    const seedPoints = () => {
      points.length = 0;
      if (activeSpaceId === 'chilancho') {
        // Terraced plinths
        for (let i = 0; i < 350; i++) {
          const level = Math.floor(Math.random() * 3);
          const size = 200 - level * 35;
          const u = (Math.random() - 0.5) * size;
          const v = (Math.random() - 0.5) * size;
          points.push({
            x: u,
            y: 80 - level * 18,
            z: v,
            r: 165 + Math.random() * 35,
            g: 135 + Math.random() * 30,
            b: 105 + Math.random() * 20,
            size: 3.6,
            opacity: 0.88,
          });
        }
        // Dome
        for (let i = 0; i < 400; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * (Math.PI / 2);
          const rad = 80;
          points.push({
            x: rad * Math.sin(phi) * Math.cos(theta),
            y: 35 - rad * Math.cos(phi),
            z: rad * Math.sin(phi) * Math.sin(theta),
            r: 230 + Math.random() * 25,
            g: 220 + Math.random() * 30,
            b: 205 + Math.random() * 30,
            size: 4.2,
            opacity: 0.92,
          });
        }
        // Spire & Harmika
        for (let i = 0; i < 350; i++) {
          const h = Math.random() * 95;
          const taper = (1 - h / 100) * 24;
          const angle = Math.random() * Math.PI * 2;
          points.push({
            x: taper * Math.cos(angle),
            y: -40 - h,
            z: taper * Math.sin(angle),
            r: 245 + Math.random() * 10,
            g: 190 + Math.random() * 30,
            b: 45 + Math.random() * 30,
            size: 3.2,
            opacity: 0.95,
          });
        }
      } else if (activeSpaceId === 'basera') {
        for (let i = 0; i < count; i++) {
          const wall = Math.floor(Math.random() * 4);
          const h = (Math.random() - 0.5) * 180;
          let px = 0, pz = 0;
          const dist = 120;
          if (wall === 0) { px = (Math.random() - 0.5) * 240; pz = -dist; }
          else if (wall === 1) { px = (Math.random() - 0.5) * 240; pz = dist; }
          else if (wall === 2) { px = -dist; pz = (Math.random() - 0.5) * 240; }
          else { px = dist; pz = (Math.random() - 0.5) * 240; }
          points.push({
            x: px,
            y: h,
            z: pz,
            r: 185 + Math.random() * 50,
            g: 115 + Math.random() * 40,
            b: 65 + Math.random() * 20,
            size: 3.8,
            opacity: 0.88,
          });
        }
      } else {
        for (let i = 0; i < count; i++) {
          const bx = (Math.random() - 0.5) * 260;
          const by = (Math.random() - 0.5) * 140;
          const bz = (Math.random() - 0.5) * 200;
          points.push({
            x: bx,
            y: by,
            z: bz,
            r: 145 + Math.random() * 40,
            g: 150 + Math.random() * 40,
            b: 160 + Math.random() * 40,
            size: 3.4,
            opacity: 0.85,
          });
        }
      }
    };

    seedPoints();

    // Pointer handlers: one pointer orbits (mouse, finger or pen); two fingers pinch to zoom.
    // The canvas uses touch-action: pan-y, so vertical swipes still scroll the page.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    const pinchDistance = () => {
      const [a, b] = Array.from(pointers.values());
      return Math.hypot(a.x - b.x, a.y - b.y) || 1;
    };
    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture?.(e.pointerId);
      if (pointers.size === 1) {
        motionRef.current.isDragging = true;
        motionRef.current.lastMouseX = e.clientX;
        motionRef.current.lastMouseY = e.clientY;
      } else if (pointers.size === 2) {
        motionRef.current.isDragging = false;
        pinchStartDistance = pinchDistance();
        pinchStartZoom = motionRef.current.targetZoom;
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        motionRef.current.targetZoom = Math.max(0.4, Math.min(2.5, pinchStartZoom * (pinchDistance() / pinchStartDistance)));
        return;
      }
      if (!motionRef.current.isDragging) return;
      const dx = e.clientX - motionRef.current.lastMouseX;
      const dy = e.clientY - motionRef.current.lastMouseY;
      motionRef.current.targetRotY += dx * 0.008;
      motionRef.current.targetRotX = Math.max(-1.1, Math.min(1.1, motionRef.current.targetRotX + dy * 0.008));
      motionRef.current.lastMouseX = e.clientX;
      motionRef.current.lastMouseY = e.clientY;
    };
    const onPointerEnd = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        motionRef.current.isDragging = false;
      } else if (pointers.size === 1) {
        // Back to one finger: carry on orbiting from where it is.
        const [rest] = Array.from(pointers.values());
        motionRef.current.isDragging = true;
        motionRef.current.lastMouseX = rest.x;
        motionRef.current.lastMouseY = rest.y;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      motionRef.current.targetZoom = Math.max(0.4, Math.min(2.5, motionRef.current.targetZoom - e.deltaY * 0.0015));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let lastTime = performance.now();
    let frameCount = 0;

    const render = (time: number) => {
      frameCount++;
      if (time - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = time;
      }

      const m = motionRef.current;
      m.time += 0.016;

      // 1. Camera Locomotion / Flythrough Calculation
      if (motionMode === 'flythrough' && !m.isDragging) {
        // Continuous organic cinematic flythrough around the digital twin
        m.targetRotY += 0.005;
        m.targetRotX = 0.28 + Math.sin(m.time * 0.4) * 0.12;
        m.targetZoom = 1.05 + Math.sin(m.time * 0.25) * 0.2;
        m.targetCamY = Math.cos(m.time * 0.35) * 18;
      } else if (motionMode === 'orbit' && !m.isDragging) {
        m.targetRotY += 0.003;
      }

      // Smooth easing
      m.rotY += (m.targetRotY - m.rotY) * 0.08;
      m.rotX += (m.targetRotX - m.rotX) * 0.08;
      m.zoom += (m.targetZoom - m.zoom) * 0.08;
      m.camY += (m.targetCamY - m.camY) * 0.08;
      m.camX += (m.targetCamX - m.camX) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Deep monochromatic space
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, width, height);

      // Sweeping Laser Scan Line in 3D (2x slower)
      const scanPhase = (Math.sin(m.time * 0.8) + 1) * 0.5;
      const laserZ = (scanPhase - 0.5) * 360;

      // Floor Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 160;
      const gridStep = 32;
      const cx = width / 2 + m.camX;
      const cy = height / 2 + 50 * m.zoom + m.camY;

      ctx.beginPath();
      for (let g = -gridSize; g <= gridSize; g += gridStep) {
        const p1X = g * Math.cos(m.rotY) - (-gridSize) * Math.sin(m.rotY);
        const p1Z = g * Math.sin(m.rotY) + (-gridSize) * Math.cos(m.rotY);
        const p2X = g * Math.cos(m.rotY) - (gridSize) * Math.sin(m.rotY);
        const p2Z = g * Math.sin(m.rotY) + (gridSize) * Math.cos(m.rotY);

        const s1 = 320 / (320 + p1Z * 0.4);
        const s2 = 320 / (320 + p2Z * 0.4);

        if (s1 > 0 && s2 > 0) {
          ctx.moveTo(cx + p1X * s1 * m.zoom, cy + 90 * s1 * m.zoom);
          ctx.lineTo(cx + p2X * s2 * m.zoom, cy + 90 * s2 * m.zoom);
        }
      }
      ctx.stroke();

      // Render 3D Points with Motion & Depth
      const cosX = Math.cos(m.rotX);
      const sinX = Math.sin(m.rotX);
      const cosY = Math.cos(m.rotY);
      const sinY = Math.sin(m.rotY);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Orbit around origin
        const rx1 = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;

        const ry2 = p.y * cosX - rz1 * sinX;
        const rz2 = p.y * sinX + rz1 * cosX;

        const camDist = 320;
        const depth = camDist + rz2 * 0.65;
        if (depth <= 20) continue;

        const scale = (camDist / depth) * m.zoom;
        const screenX = cx + rx1 * scale;
        const screenY = cy + ry2 * scale;

        if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) continue;

        if (renderMode === 'splat') {
          // Radiance Splat with Moving Laser Fringe highlight
          const distToLaser = Math.abs(rz1 - laserZ);
          if (distToLaser < 25) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
          } else {
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity * Math.min(1, scale)})`;
          }

          const splatW = Math.max(1.5, p.size * scale);
          const splatH = Math.max(1.2, p.size * scale * 0.7);

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(rx1 * 0.005);
          ctx.beginPath();
          ctx.ellipse(0, 0, splatW, splatH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (renderMode === 'lidar') {
          // SLAM LiDAR false-color elevation
          const elevNorm = (p.y + 100) / 200;
          const lr = Math.floor(255 * (1 - elevNorm));
          const lg = Math.floor(255 * (elevNorm > 0.5 ? 2 * (1 - elevNorm) : 2 * elevNorm));
          const lb = Math.floor(255 * elevNorm);

          ctx.fillStyle = `rgba(${lr}, ${lg}, ${lb}, 0.9)`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, Math.max(1.5, 2.2 * scale), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX - 2 * scale, screenY - 2 * scale, 4 * scale, 4 * scale);
        }
      }

    };

    const stopLoop = startCanvasLoop(canvas, render);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerEnd);
      canvas.removeEventListener('pointercancel', onPointerEnd);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [isLoaded, activeSpaceId, renderMode, motionMode]);

  // Locomotion Walk Pad Handlers (Physically walks/steps through 3D space)
  const stepForward = () => {
    motionRef.current.targetZoom = Math.min(2.5, motionRef.current.targetZoom + 0.25);
  };
  const stepBack = () => {
    motionRef.current.targetZoom = Math.max(0.4, motionRef.current.targetZoom - 0.25);
  };
  const panLeft = () => {
    motionRef.current.targetRotY -= 0.25;
  };
  const panRight = () => {
    motionRef.current.targetRotY += 0.25;
  };
  const moveUp = () => {
    motionRef.current.targetCamY -= 25;
  };
  const moveDown = () => {
    motionRef.current.targetCamY += 25;
  };

  const jumpToWaypoint = (idx: number) => {
    setActiveWpIndex(idx);
    const wp = activeSpace.waypoints[idx];
    if (wp) {
      motionRef.current.targetRotY = wp.rotY;
      motionRef.current.targetRotX = wp.rotX;
      motionRef.current.targetZoom = wp.zoom;
      motionRef.current.targetCamY = wp.camY;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-[#0E0E12] shadow-2xl ${
        isFullscreen ? 'h-dvh rounded-none' : 'h-[520px]'
      }`}
    >
      {!isLoaded ? (
        /* Facade Mode with Active Kinetic Scanner */
        <div className="relative h-full w-full">
          <img
            src={activeSpace.poster}
            alt={`Preview of the interactive 3D model of ${activeSpace.name}`}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-black/40 to-black/20" />

          {/* Active Canvas Scanlines & Reticles */}
          <div className="absolute inset-0 pointer-events-none">
            <canvas ref={facadeCanvasRef} className="h-full w-full" />
          </div>

          {/* Interactive Trigger Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <button
              onClick={() => setIsLoaded(true)}
              className="loro-btn-primary flex items-center gap-3 px-7 py-3.5 text-sm font-semibold"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <svg className="h-3.5 w-3.5 fill-current text-white ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>Step inside</span>
            </button>

            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-300 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Opens in your browser · No app needed</span>
            </div>

            <button
              onClick={() => {
                setIsLoaded(true);
                setTimeout(toggleFullscreen, 100);
              }}
              className="mt-3 text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Open full screen</span>
              <span>↗</span>
            </button>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 bg-gradient-to-t from-ink to-transparent z-10">
            <div>
              <div className="text-[11px] font-mono text-accent-soft uppercase tracking-wider">
                {activeSpace.tag} · {activeSpace.location}
              </div>
              <h3 className="text-xl font-bold text-surface font-display mt-1">
                {activeSpace.name}
              </h3>
              <p className="mt-1 text-xs text-zinc-300 max-w-lg">
                {activeSpace.clientGoal}
              </p>
            </div>

            <div className="text-right text-xs text-zinc-400 font-mono">
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive 3D Canvas Walkthrough Mode */
        <div className="relative h-full w-full select-none">
          <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing touch-pan-y select-none" />

          {/* Top Control Bar */}
          <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
            
            {/* Space Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-md bg-ink/90 border border-zinc-800 pointer-events-auto">
              {DEMO_SPACES.map((space) => (
                <button
                  key={space.id}
                  onClick={() => setActiveSpaceId(space.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
                    activeSpaceId === space.id
                      ? 'bg-accent text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {space.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Viewport & Motion Modes */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Motion Mode (Flythrough / Walk / Orbit) */}
              <div className="flex items-center p-1 rounded-md bg-ink/90 border border-zinc-800">
                <button
                  onClick={() => setMotionMode('flythrough')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                    motionMode === 'flythrough' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Cinematic Dolly Flythrough"
                >
                  ✈ Flythrough
                </button>
                <button
                  onClick={() => setMotionMode('walk')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                    motionMode === 'walk' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Interactive Walk Mode"
                >
                  🚶 Walk Mode
                </button>
                <button
                  onClick={() => setMotionMode('orbit')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                    motionMode === 'orbit' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="360 Orbit"
                >
                  ↻ Orbit
                </button>
              </div>

              {/* Render Modes */}
              <div className="hidden sm:flex items-center p-1 rounded-md bg-ink/90 border border-zinc-800">
                <button
                  onClick={() => setRenderMode('splat')}
                  className={`px-2 py-1 text-[11px] font-mono rounded ${
                    renderMode === 'splat' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Splats
                </button>
                <button
                  onClick={() => setRenderMode('lidar')}
                  className={`px-2 py-1 text-[11px] font-mono rounded ${
                    renderMode === 'lidar' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  LiDAR
                </button>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-md border border-zinc-800 bg-ink/90 text-xs text-zinc-300 hover:text-white"
                title="Toggle Fullscreen"
              >
                ⛶
              </button>
            </div>
          </div>

          {/* On-Screen Locomotion Navigation Pad (Move / Walk through Space) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-1 bg-black/85 p-2 rounded-xl border border-white/10 z-20 pointer-events-auto">
            <span className="text-[9px] font-mono uppercase text-zinc-400 mb-0.5">Locomotion</span>
            <div className="flex gap-1">
              <button
                onClick={moveUp}
                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center justify-center font-bold"
                title="Elevate Camera Up"
              >
                ⇡
              </button>
              <button
                onClick={stepForward}
                className="w-8 h-8 rounded bg-accent hover:bg-accent-strong text-white text-xs flex items-center justify-center font-bold shadow"
                title="Step Forward into Space"
              >
                ▲
              </button>
              <button
                onClick={moveDown}
                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center justify-center font-bold"
                title="Lower Camera Down"
              >
                ⇣
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={panLeft}
                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center justify-center font-bold"
                title="Turn Left"
              >
                ◀
              </button>
              <button
                onClick={stepBack}
                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center justify-center font-bold"
                title="Step Backward"
              >
                ▼
              </button>
              <button
                onClick={panRight}
                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center justify-center font-bold"
                title="Turn Right"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Waypoints Tour Bar */}
          <div className="absolute bottom-16 inset-x-4 flex items-center gap-2 overflow-x-auto pb-1 z-20 pointer-events-auto">
            <div className="flex items-center gap-1 bg-ink/90 p-1.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase hidden sm:inline">
                Tour Views:
              </span>
              {activeSpace.waypoints.map((wp, idx) => (
                <button
                  key={wp.name}
                  onClick={() => jumpToWaypoint(idx)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                    activeWpIndex === idx
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {wp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom HUD Overlay */}
          <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 pointer-events-none z-20">
            <div className="p-3 rounded-md bg-ink/90 border border-zinc-800 pointer-events-auto max-w-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                <span className="text-xs font-semibold text-white font-display">{activeSpace.name}</span>
                <span className="text-[11px] text-accent-soft font-mono">({activeSpace.tag})</span>
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                {activeSpace.clientGoal}
              </p>
              <div className="mt-2 text-[11px] font-mono text-zinc-400 flex items-center gap-3">
                <span>Live preview</span>
                <span>·</span>
                <span>{fps} FPS</span>
                <span>·</span>
                <span>Drag to Look Around</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-ink/90 border border-zinc-800 font-mono text-[11px] text-right text-zinc-400 pointer-events-auto">
              <div>{activeSpace.coords}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
