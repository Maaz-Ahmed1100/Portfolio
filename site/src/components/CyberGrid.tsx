"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ServerNodeId = "academy" | "neuralnet" | "backend" | "comms";

interface ServerNode {
  id: ServerNodeId;
  label: string;
  x: number;
  y: number;
  color: string;
  glowColor: string;
  icon: string;
}

interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GridParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TILE = 40;
const MAP_COLS = 22;
const MAP_ROWS = 14;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;
const PLAYER_R = 12;
const INTERACT_DIST = 55;
const PLAYER_SPEED = 3;

const NEON = {
  blue: "#00f0ff",
  green: "#39ff14",
  crimson: "#ff003c",
  purple: "#bc13fe",
  orange: "#ff8800",
  bg: "#0a0a0f",
  wall: "#1a1f2e",
  wallStroke: "#2a3040",
  floor: "#0d1117",
  grid: "rgba(0, 240, 255, 0.025)",
  text: "#8b949e",
  white: "#e6edf3",
};

// 0 = floor, 1 = wall
// Map layout: a cyberpunk server room with corridors
const MAP_DATA: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const SERVER_NODES: ServerNode[] = [
  { id: "academy",   label: "ACADEMY",      x: 3  * TILE, y: 2  * TILE, color: NEON.blue,    glowColor: "rgba(0,240,255,0.3)",   icon: "🎓" },
  { id: "neuralnet", label: "NEURAL NET",   x: 18 * TILE, y: 2  * TILE, color: NEON.green,   glowColor: "rgba(57,255,20,0.3)",   icon: "🧠" },
  { id: "backend",   label: "BACKEND ENG",  x: 3  * TILE, y: 11 * TILE, color: NEON.crimson, glowColor: "rgba(255,0,60,0.3)",    icon: "⚙️" },
  { id: "comms",     label: "COMMS",        x: 18 * TILE, y: 11 * TILE, color: NEON.purple,  glowColor: "rgba(188,19,254,0.3)",  icon: "📡" },
];

function buildWalls(): Wall[] {
  const walls: Wall[] = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (MAP_DATA[r][c] === 1) {
        walls.push({ x: c * TILE, y: r * TILE, w: TILE, h: TILE });
      }
    }
  }
  return walls;
}

function circleRectCollision(
  cx: number, cy: number, cr: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < cr * cr;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface CyberGridProps {
  onInteract: (nodeId: ServerNodeId) => void;
}

export default function CyberGrid({ onInteract }: CyberGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [nearNode, setNearNode] = useState<ServerNodeId | null>(null);
  const [hint, setHint] = useState("WASD / Arrows to move. Approach a server and press E.");
  const [mounted, setMounted] = useState(false);

  const stateRef = useRef({
    px: MAP_W / 2,
    py: MAP_H / 2,
    vx: 0,
    vy: 0,
    keys: new Set<string>(),
    frame: 0,
    walls: buildWalls(),
    particles: [] as GridParticle[],
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    canvasW: MAP_W,
    canvasH: MAP_H,
    nearNode: null as ServerNodeId | null,
    tapTarget: null as { x: number; y: number } | null,
  });

  useEffect(() => { setMounted(true); }, []);

  const spawnBurst = useCallback((x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      s.particles.push({
        x, y,
        vx: Math.cos(a) * (1 + Math.random() * 2),
        vy: Math.sin(a) * (1 + Math.random() * 2),
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }, []);

  const handleInteract = useCallback(() => {
    const s = stateRef.current;
    if (!s.nearNode) return;
    const node = SERVER_NODES.find(n => n.id === s.nearNode);
    if (node) spawnBurst(node.x, node.y, node.color);
    onInteract(s.nearNode);
  }, [onInteract, spawnBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    function resize() {
      const container = containerRef.current;
      if (!container) return;
      const maxW = Math.min(container.clientWidth, 900);
      const scale = maxW / MAP_W;
      const dispH = MAP_H * scale;
      canvas!.width = maxW;
      canvas!.height = dispH;
      s.scale = scale;
      s.canvasW = maxW;
      s.canvasH = dispH;
    }
    resize();
    window.addEventListener("resize", resize);

    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","e"," "].includes(key)) {
        e.preventDefault();
        s.keys.add(key);
      }
      if (key === "e" || key === " ") {
        if (s.nearNode) handleInteract();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      s.keys.delete(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ── Drawing helpers ────────────────────────────────────────────────────

    function drawFloor() {
      ctx.fillStyle = NEON.floor;
      ctx.fillRect(0, 0, MAP_W, MAP_H);

      ctx.strokeStyle = NEON.grid;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= MAP_W; x += TILE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_H); ctx.stroke();
      }
      for (let y = 0; y <= MAP_H; y += TILE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_W, y); ctx.stroke();
      }

      // Pulsing circuit traces on floor
      const pulse = (Math.sin(s.frame * 0.03) + 1) * 0.5;
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.03 + pulse * 0.04})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 16]);
      for (let y = TILE * 3; y < MAP_H; y += TILE * 4) {
        ctx.beginPath(); ctx.moveTo(TILE * 2, y); ctx.lineTo(MAP_W - TILE * 2, y); ctx.stroke();
      }
      for (let x = TILE * 4; x < MAP_W; x += TILE * 5) {
        ctx.beginPath(); ctx.moveTo(x, TILE * 2); ctx.lineTo(x, MAP_H - TILE * 2); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawWalls() {
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (MAP_DATA[r][c] !== 1) continue;
          const wx = c * TILE, wy = r * TILE;

          ctx.fillStyle = NEON.wall;
          ctx.fillRect(wx, wy, TILE, TILE);

          ctx.strokeStyle = NEON.wallStroke;
          ctx.lineWidth = 1;
          ctx.strokeRect(wx + 0.5, wy + 0.5, TILE - 1, TILE - 1);

          // Glow on top edge of certain walls for depth
          if (r > 0 && MAP_DATA[r - 1][c] === 0) {
            const grd = ctx.createLinearGradient(wx, wy, wx, wy + 6);
            grd.addColorStop(0, "rgba(0, 240, 255, 0.08)");
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.fillRect(wx, wy, TILE, 6);
          }
        }
      }
    }

    function drawServerNodes() {
      for (const node of SERVER_NODES) {
        const pulse = Math.sin(s.frame * 0.04 + SERVER_NODES.indexOf(node) * 1.5) * 6;
        const r = 16 + pulse * 0.3;
        const isNear = s.nearNode === node.id;

        ctx.save();

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? node.glowColor : node.glowColor.replace("0.3", "0.12");
        ctx.fill();

        // Rotating hex outline
        ctx.beginPath();
        const sides = 6;
        const rotSpeed = isNear ? 0.04 : 0.015;
        for (let i = 0; i <= sides; i++) {
          const a = (i * Math.PI * 2) / sides + s.frame * rotSpeed;
          const hx = node.x + Math.cos(a) * (22 + pulse * 0.5);
          const hy = node.y + Math.sin(a) * (22 + pulse * 0.5);
          if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isNear ? 2.5 : 1.5;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isNear ? 20 : 8;
        ctx.stroke();

        // Inner filled circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? node.color : `${node.color}88`;
        ctx.fill();

        // Center icon
        ctx.shadowBlur = 0;
        ctx.font = `${isNear ? 16 : 14}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.icon, node.x, node.y);

        // Label below
        ctx.font = `bold ${isNear ? 10 : 9}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = isNear ? node.color : NEON.text;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isNear ? 10 : 0;
        ctx.fillText(node.label, node.x, node.y + 36);

        // Interact prompt when near
        if (isNear) {
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = NEON.white;
          ctx.shadowBlur = 6;
          ctx.shadowColor = node.color;
          const promptY = node.y - 38 + Math.sin(s.frame * 0.08) * 3;
          ctx.fillText("[ PRESS E ]", node.x, promptY);
        }

        ctx.restore();
      }
    }

    function drawPlayer() {
      const { px, py } = s;
      const pulse = Math.sin(s.frame * 0.1) * 2;

      ctx.save();
      ctx.shadowColor = NEON.blue;
      ctx.shadowBlur = 18 + pulse;

      // Trail particles
      if (Math.abs(s.vx) > 0.3 || Math.abs(s.vy) > 0.3) {
        if (s.frame % 3 === 0) {
          s.particles.push({
            x: px - s.vx * 2,
            y: py - s.vy * 2,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 0.6,
            maxLife: 0.6,
            color: NEON.blue,
            size: 2,
          });
        }
      }

      // Outer glow
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_R + 4 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.fill();

      // Body diamond
      ctx.beginPath();
      ctx.moveTo(px, py - PLAYER_R);
      ctx.lineTo(px + PLAYER_R * 0.7, py);
      ctx.lineTo(px, py + PLAYER_R);
      ctx.lineTo(px - PLAYER_R * 0.7, py);
      ctx.closePath();
      ctx.fillStyle = NEON.blue;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner core
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Direction indicator (shows velocity direction)
      if (Math.abs(s.vx) > 0.2 || Math.abs(s.vy) > 0.2) {
        const angle = Math.atan2(s.vy, s.vx);
        ctx.beginPath();
        ctx.moveTo(
          px + Math.cos(angle) * (PLAYER_R + 6),
          py + Math.sin(angle) * (PLAYER_R + 6)
        );
        ctx.lineTo(
          px + Math.cos(angle) * (PLAYER_R + 12),
          py + Math.sin(angle) * (PLAYER_R + 12)
        );
        ctx.strokeStyle = NEON.blue;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawParticles() {
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) { s.particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawMinimap() {
      const mmScale = 0.12;
      const mmW = MAP_W * mmScale;
      const mmH = MAP_H * mmScale;
      const mmX = MAP_W - mmW - 8;
      const mmY = 8;

      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.fillRect(mmX, mmY, mmW, mmH);
      ctx.strokeRect(mmX, mmY, mmW, mmH);

      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (MAP_DATA[r][c] === 1) {
            ctx.fillStyle = NEON.wallStroke;
            ctx.fillRect(mmX + c * TILE * mmScale, mmY + r * TILE * mmScale, TILE * mmScale, TILE * mmScale);
          }
        }
      }

      for (const node of SERVER_NODES) {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(mmX + node.x * mmScale, mmY + node.y * mmScale, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(mmX + s.px * mmScale, mmY + s.py * mmScale, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawHUD() {
      ctx.save();
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = NEON.text;
      ctx.fillText("CYBER-GRID SANDBOX", 10, 18);

      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(139,148,158,0.5)";
      ctx.fillText("Walk to a server node • Press E to interact", 10, 30);
      ctx.restore();
    }

    // ── Update ─────────────────────────────────────────────────────────────

    function update() {
      const accel = 0.65;
      const friction = 0.82;
      let ax = 0, ay = 0;

      if (s.keys.has("w") || s.keys.has("arrowup"))    ay -= accel;
      if (s.keys.has("s") || s.keys.has("arrowdown"))  ay += accel;
      if (s.keys.has("a") || s.keys.has("arrowleft"))  ax -= accel;
      if (s.keys.has("d") || s.keys.has("arrowright")) ax += accel;

      // Tap-to-move for mobile
      if (s.tapTarget) {
        const tdx = s.tapTarget.x - s.px;
        const tdy = s.tapTarget.y - s.py;
        const tDist = Math.hypot(tdx, tdy);
        if (tDist > 8) {
          ax = (tdx / tDist) * accel;
          ay = (tdy / tDist) * accel;
        } else {
          s.tapTarget = null;
        }
      }

      // Diagonal normalization
      if (ax !== 0 && ay !== 0) {
        const norm = 1 / Math.sqrt(2);
        ax *= norm;
        ay *= norm;
      }

      s.vx = (s.vx + ax) * friction;
      s.vy = (s.vy + ay) * friction;
      if (Math.abs(s.vx) < 0.05) s.vx = 0;
      if (Math.abs(s.vy) < 0.05) s.vy = 0;
      const speed = Math.hypot(s.vx, s.vy);
      if (speed > PLAYER_SPEED) {
        s.vx = (s.vx / speed) * PLAYER_SPEED;
        s.vy = (s.vy / speed) * PLAYER_SPEED;
      }

      // Collision: try X then Y independently for smooth wall sliding
      const nextX = s.px + s.vx;
      let blockedX = false;
      for (const w of s.walls) {
        if (circleRectCollision(nextX, s.py, PLAYER_R - 1, w.x, w.y, w.w, w.h)) {
          blockedX = true; break;
        }
      }
      if (!blockedX) s.px = nextX; else s.vx = 0;

      const nextY = s.py + s.vy;
      let blockedY = false;
      for (const w of s.walls) {
        if (circleRectCollision(s.px, nextY, PLAYER_R - 1, w.x, w.y, w.w, w.h)) {
          blockedY = true; break;
        }
      }
      if (!blockedY) s.py = nextY; else s.vy = 0;

      // Clamp to map bounds
      s.px = Math.max(PLAYER_R, Math.min(MAP_W - PLAYER_R, s.px));
      s.py = Math.max(PLAYER_R, Math.min(MAP_H - PLAYER_R, s.py));

      // Proximity detection for server nodes
      let closestNode: ServerNodeId | null = null;
      let closestDist = Infinity;
      for (const node of SERVER_NODES) {
        const dist = Math.hypot(s.px - node.x, s.py - node.y);
        if (dist < INTERACT_DIST && dist < closestDist) {
          closestDist = dist;
          closestNode = node.id;
        }
      }
      if (closestNode !== s.nearNode) {
        s.nearNode = closestNode;
        setNearNode(closestNode);
        if (closestNode) {
          const node = SERVER_NODES.find(n => n.id === closestNode)!;
          setHint(`${node.icon} ${node.label} — Press E or Space to access`);
        } else {
          setHint("WASD / Arrows to move. Approach a server and press E.");
        }
      }

      s.frame++;
    }

    // ── Game Loop ──────────────────────────────────────────────────────────

    function loop() {
      update();

      ctx.save();
      ctx.fillStyle = NEON.bg;
      ctx.fillRect(0, 0, s.canvasW, s.canvasH);

      ctx.scale(s.scale, s.scale);

      drawFloor();
      drawWalls();
      drawParticles();
      drawServerNodes();
      drawPlayer();
      drawMinimap();
      drawHUD();

      ctx.restore();

      animRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mounted, handleInteract, spawnBurst]);

  // Mobile tap-to-move
  const handleCanvasTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mapX = (clientX - rect.left) / s.scale;
    const mapY = (clientY - rect.top) / s.scale;
    s.tapTarget = { x: mapX, y: mapY };

    // If tapped near a node, also try interact
    for (const node of SERVER_NODES) {
      const dist = Math.hypot(mapX - node.x, mapY - node.y);
      if (dist < INTERACT_DIST * 1.5 && s.nearNode === node.id) {
        handleInteract();
        s.tapTarget = null;
        break;
      }
    }
  }, [handleInteract]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="w-full max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-xs text-neon-green">SANDBOX ACTIVE</span>
          </div>
          <span className="font-mono text-[10px] text-cyber-muted">
            {hint}
          </span>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="cyber-grid-canvas w-full cursor-crosshair"
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTap}
        />

        {/* Controls Bar */}
        <div className="flex flex-wrap justify-between items-center mt-3 px-1 gap-2">
          <div className="flex gap-2 font-mono text-[10px] text-cyber-muted">
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">W</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">A</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">S</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">D</kbd>
            <span className="text-cyber-muted/50 mx-1">Move</span>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-neon-blue/30 rounded text-neon-blue">E</kbd>
            <span className="text-cyber-muted/50">Interact</span>
          </div>

          {/* Mobile interact button */}
          {nearNode && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleInteract}
              className="bypass-btn px-4 py-1.5 border border-neon-blue/50 text-neon-blue font-mono text-xs rounded-lg hover:bg-neon-blue/10 transition-all md:hidden"
            >
              [ ACCESS SERVER ]
            </motion.button>
          )}

          <div className="flex gap-3 font-mono text-[10px]">
            {SERVER_NODES.map(n => (
              <span key={n.id} className="flex items-center gap-1" style={{ color: n.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
                {n.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
