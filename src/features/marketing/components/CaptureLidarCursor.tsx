import React, { useEffect, useRef, useState } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// LiDAR elevation color palette (Greyscale for more subtle 3D point cloud)
const LIDAR_COLORS = [
  '#E4E4E7', // Zinc 200
  '#D4D4D8', // Zinc 300
  '#A1A1AA', // Zinc 400
  '#71717A', // Zinc 500
  '#52525B', // Zinc 600
  '#3F3F46', // Zinc 700
  '#27272A', // Zinc 800
];

export const CaptureLidarCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // Position references for smooth 60fps animation without re-render thrash
  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const velocityRef = useRef({ vx: 0, vy: 0, speed: 0 });
  const rotAngleRef = useRef({ ax: 0, ay: 0, az: 0 });
  const pointsRef = useRef<Point3D[]>([]);
  const trailPointsRef = useRef<Array<{ x: number; y: number; z: number; color: string; alpha: number }>>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect mobile / touch only devices
    if (window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) {
      setIsCoarsePointer(true);
      return;
    }

    // Initialize 3D LiDAR point cloud orbiting swarm (simulating 3D laser scan beam)
    const initialPoints: Point3D[] = [];
    const NUM_ORBIT_POINTS = 32;
    for (let i = 0; i < NUM_ORBIT_POINTS; i++) {
      // Golden spiral distribution on a sphere
      const phi = Math.acos(-1 + (2 * i) / NUM_ORBIT_POINTS);
      const theta = Math.sqrt(NUM_ORBIT_POINTS * Math.PI) * phi;
      const radius = 12 + (i % 5) * 3; // Radii from 12px to 24px

      initialPoints.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        color: LIDAR_COLORS[i % LIDAR_COLORS.length],
        size: 0.9 + (i % 3) * 0.4,
        alpha: 0.6 + Math.random() * 0.4,
        life: 1,
        maxLife: 1,
      });
    }
    pointsRef.current = initialPoints;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        posRef.current.x = e.clientX;
        posRef.current.y = e.clientY;
      }

      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if hovering clickable/interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, input, select, textarea, [role="button"], .loro-card, .interactive-hover');
        if (interactive) {
          setIsHovered(true);
          const tag = interactive.getAttribute('data-cursor') || 
                      interactive.getAttribute('aria-label') || 
                      interactive.textContent?.trim().slice(0, 16) || 
                      'TARGET';
          setHoverLabel(tag);
        } else {
          setIsHovered(false);
          setHoverLabel('');
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Canvas render loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth position interpolation (LERP)
      const prevX = posRef.current.x;
      const prevY = posRef.current.y;
      posRef.current.x += (posRef.current.targetX - posRef.current.x) * 0.22;
      posRef.current.y += (posRef.current.targetY - posRef.current.y) * 0.22;

      const vx = posRef.current.x - prevX;
      const vy = posRef.current.y - prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      velocityRef.current = { vx, vy, speed };

      // Rotate point cloud based on cursor motion + continuous slow drift
      rotAngleRef.current.ay += 0.02 + vx * 0.005;
      rotAngleRef.current.ax += 0.01 + vy * 0.005;
      rotAngleRef.current.az += 0.008;

      const cosY = Math.cos(rotAngleRef.current.ay);
      const sinY = Math.sin(rotAngleRef.current.ay);
      const cosX = Math.cos(rotAngleRef.current.ax);
      const sinX = Math.sin(rotAngleRef.current.ax);

      // Clear canvas
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (posRef.current.x > 0 && posRef.current.y > 0) {
        // Emit dynamic trail LiDAR points when moving
        if (speed > 1.2) {
          const spawnCount = Math.min(Math.floor(speed * 0.5), 3);
          for (let s = 0; s < spawnCount; s++) {
            const spread = 4;
            trailPointsRef.current.push({
              x: posRef.current.x + (Math.random() - 0.5) * spread - vx * 0.5,
              y: posRef.current.y + (Math.random() - 0.5) * spread - vy * 0.5,
              z: (Math.random() - 0.5) * 30,
              color: LIDAR_COLORS[Math.floor(Math.random() * LIDAR_COLORS.length)],
              alpha: 0.85,
            });
          }
        }

        // Render & age trail LiDAR points
        const nextTrail: typeof trailPointsRef.current = [];
        ctx.save();
        ctx.scale(dpr, dpr);

        for (let i = 0; i < trailPointsRef.current.length; i++) {
          const tp = trailPointsRef.current[i];
          tp.alpha -= dt * 1.8; // Fade over ~0.5s
          if (tp.alpha > 0.05) {
            nextTrail.push(tp);
            ctx.fillStyle = tp.color;
            ctx.globalAlpha = Math.max(0, tp.alpha * 0.7);
            
            // Draw square/diamond point typical of raw LiDAR point clouds
            const pSize = 1.2;
            ctx.fillRect(tp.x - pSize / 2, tp.y - pSize / 2, pSize, pSize);
          }
        }
        trailPointsRef.current = nextTrail.slice(-60); // Cap max active trail points

        // Render 3D orbiting LiDAR constellation around capture mark
        const cx = posRef.current.x;
        const cy = posRef.current.y;
        const FOV = 110; // Perspective focal length

        // Draw faint LiDAR range radar ring
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(161, 161, 170, 0.25)'; // Grey faint ring
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer range tick ring
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(9, 9, 11, 0.08)';
        ctx.lineWidth = 0.75;
        ctx.arc(cx, cy, 27, 0, Math.PI * 2);
        ctx.stroke();

        // Project and sort 3D points by z-depth for correct rendering
        const projectedPoints: Array<{
          px: number;
          py: number;
          pz: number;
          size: number;
          color: string;
          alpha: number;
        }> = [];

        for (let i = 0; i < pointsRef.current.length; i++) {
          const pt = pointsRef.current[i];

          // 3D Rotation
          // Rotate around Y
          const x1 = pt.x * cosY + pt.z * sinY;
          const z1 = -pt.x * sinY + pt.z * cosY;

          // Rotate around X
          const y2 = pt.y * cosX - z1 * sinX;
          const z2 = pt.y * sinX + z1 * cosX;

          // Perspective projection
          const scale = FOV / (FOV + z2);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;

          projectedPoints.push({
            px,
            py,
            pz: z2,
            size: Math.max(1, pt.size * scale),
            color: pt.color,
            alpha: Math.min(1, Math.max(0.2, (scale * 0.8))),
          });
        }

        // Sort back-to-front
        projectedPoints.sort((a, b) => a.pz - b.pz);

        // Draw connection web lines between nearest neighbor LiDAR points
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projectedPoints.length; i++) {
          for (let j = i + 1; j < projectedPoints.length; j++) {
            const p1 = projectedPoints[i];
            const p2 = projectedPoints[j];
            const distSq = (p1.px - p2.px) ** 2 + (p1.py - p2.py) ** 2;
            if (distSq < 14 * 14) {
              const alpha = (1 - Math.sqrt(distSq) / 14) * 0.18;
              ctx.strokeStyle = p1.color;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }

        // Render point cloud points
        for (let i = 0; i < projectedPoints.length; i++) {
          const p = projectedPoints[i];
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;

          // Draw small circular or square LiDAR points
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glow for prominent grey points
          if (p.color === '#A1A1AA') {
            ctx.shadowColor = '#A1A1AA';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Connect cursor center to 3 nearest points with laser scan traces
        for (let k = 0; k < Math.min(3, projectedPoints.length); k++) {
          const pt = projectedPoints[k];
          ctx.strokeStyle = '#71717A';
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pt.px, pt.py);
          ctx.stroke();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateCanvasSize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible]);

  if (isCoarsePointer) {
    return null; // Don't show custom cursor on mobile touch screens
  }

  // Calculate dynamic simulated 3D coordinates based on position
  const simX = (mousePos.x * 0.05).toFixed(1);
  const simY = (mousePos.y * 0.05).toFixed(1);
  const simZ = (1.2 + ((mousePos.x + mousePos.y) % 150) * 0.02).toFixed(2);

  return (
    <div
      // Top of the layer scale (see index.css): above the header and modals, never interactive.
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease-out' }}
      aria-hidden="true"
    >
      {/* 3D LiDAR Point Cloud Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Capture Icon Mark (Viewfinder Reticle & HUD) */}
      <div
        className="pointer-events-none absolute left-0 top-0 will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
                  }}
      >
        {/* Reticle Container (Centers on cursor point) */}
        <div
          className={`relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
            isHovered ? 'scale-125' : isClicking ? 'scale-90' : 'scale-100'
          }`}
          style={{ width: '32px', height: '32px' }}
        >
          {/* Target Circle (Visible on hover like a shooting crosshair) */}
          <div className={`absolute inset-0 rounded-full border-[1.5px] transition-all duration-300 ease-out ${
            isHovered ? 'border-accent scale-100 opacity-100' : 'border-zinc-900 scale-125 opacity-0'
          }`} />

          {/* 4-Corner Viewfinder Capture Brackets */}
          <div className="absolute inset-0">
            {/* Top-Left Bracket */}
            <span
              className={`absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 transition-all duration-300 ${
                isHovered ? 'border-accent -translate-x-0.5 -translate-y-0.5' : 'border-zinc-900'
              }`}
            />
            {/* Top-Right Bracket */}
            <span
              className={`absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 transition-all duration-300 ${
                isHovered ? 'border-accent translate-x-0.5 -translate-y-0.5' : 'border-zinc-900'
              }`}
            />
            {/* Bottom-Left Bracket */}
            <span
              className={`absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 transition-all duration-300 ${
                isHovered ? 'border-accent -translate-x-0.5 translate-y-0.5' : 'border-zinc-900'
              }`}
            />
            {/* Bottom-Right Bracket */}
            <span
              className={`absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 transition-all duration-300 ${
                isHovered ? 'border-accent translate-x-0.5 translate-y-0.5' : 'border-zinc-900'
              }`}
            />
          </div>

          {/* Center Precision Crosshair & Laser Point */}
          <div className="relative flex items-center justify-center">
            {/* Horizontal Hair */}
            <div
              className={`h-px transition-all duration-300 ${
                isHovered ? 'w-5 bg-accent' : 'w-2 bg-zinc-800'
              }`}
            />
            {/* Vertical Hair */}
            <div
              className={`absolute w-px transition-all duration-300 ${
                isHovered ? 'h-5 bg-accent' : 'h-2 bg-zinc-800'
              }`}
            />
            {/* Center LiDAR Laser Dot */}
            <div
              className={`absolute h-1 w-1 rounded-full transition-transform duration-300 ${
                isHovered
                  ? 'bg-accent scale-[1.5] shadow-[0_0_6px_#E11D48]'
                  : isClicking
                  ? 'bg-zinc-950 scale-150'
                  : 'bg-accent'
              }`}
            />
          </div>

          {/* Micro HUD Coordinate Readout Tag (Top Right) */}
          <div
            className="absolute -top-4 -right-12 select-none rounded bg-white/90 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-zinc-700 shadow-sm border border-zinc-200 backdrop-blur-sm whitespace-nowrap"
            style={{ letterSpacing: '0.02em' }}
          >
            <span className="text-accent mr-1">XYZ</span>
            {simX},{simY},{simZ}m
          </div>

          {/* Target Capture Status Badge (Bottom Right when hovering) */}
          {isHovered && (
            <div className="absolute -bottom-4 -right-10 select-none rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-[8px] font-bold text-white shadow-md flex items-center gap-1 border border-zinc-800 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
              <span>CAPTURE</span>
            </div>
          )}

          {/* Click Pulse Shutter Effect */}
          {isClicking && (
            <div className="absolute inset-0 animate-ping rounded-full border border-accent opacity-75" />
          )}
        </div>
      </div>
    </div>
  );
};
