"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface GameProps {
  onNodeCollected: (nodeIndex: number) => void;
  onGameComplete: () => void;
  onReset?: () => void;
  totalNodes: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Firewall {
  x: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
  color: string;
}

interface DataNode {
  x: number;
  y: number;
  collected: boolean;
  pulsePhase: number;
}

const COLORS = {
  bg: "#0a0a0f",
  player: "#00f0ff",
  playerGlow: "rgba(0, 240, 255, 0.3)",
  firewall: "#ff003c",
  firewallGlow: "rgba(255, 0, 60, 0.2)",
  node: "#39ff14",
  nodeGlow: "rgba(57, 255, 20, 0.4)",
  grid: "rgba(0, 240, 255, 0.03)",
  text: "#8b949e",
  white: "#e6edf3",
};

const FW_COLORS = ["#ff003c", "#bc13fe", "#ff6600"];

export default function Game({
  onNodeCollected,
  onGameComplete,
  onReset,
  totalNodes,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    playerX: 60,
    playerY: 0,
    playerVY: 0,
    playerVX: 0,
    speed: 2.5,
    firewalls: [] as Firewall[],
    nodes: [] as DataNode[],
    particles: [] as Particle[],
    score: 0,
    nodesCollected: 0,
    gameOver: false,
    started: false,
    frame: 0,
    canvasW: 800,
    canvasH: 400,
    keysDown: new Set<string>(),
    lastNodeCallback: -1,
  });
  const animRef = useRef<number>(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [collected, setCollected] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const initGame = useCallback(() => {
    const gs = gameStateRef.current;
    const isRestart = gs.started || gs.gameOver;

    gs.playerY = gs.canvasH / 2;
    gs.playerVY = 0;
    gs.playerVX = 0;
    gs.speed = 2.5;
    gs.firewalls = [];
    gs.nodes = [];
    gs.particles = [];
    gs.score = 0;
    gs.nodesCollected = 0;
    gs.gameOver = false;
    gs.started = true;
    gs.frame = 0;
    gs.lastNodeCallback = -1;

    // Spawn initial firewalls + nodes
    const spacing = gs.canvasW * 0.6;
    for (let i = 0; i < totalNodes + 3; i++) {
      const gapHeight = Math.max(100, 140 - i * 5);
      const gapY = 60 + Math.random() * (gs.canvasH - gapHeight - 120);

      gs.firewalls.push({
        x: gs.canvasW + i * spacing,
        gapY,
        gapHeight,
        passed: false,
        color: FW_COLORS[i % 3],
      });

      if (i < totalNodes) {
        gs.nodes.push({
          x: gs.canvasW + i * spacing + spacing * 0.5,
          y: gapY + gapHeight / 2,
          collected: false,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    setDisplayScore(0);
    setCollected(0);
    setGameOver(false);
    setStarted(true);

    if (isRestart) onReset?.();
  }, [totalNodes, onReset]);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number) => {
      const gs = gameStateRef.current;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 1 + Math.random() * 3;
        gs.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        });
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const gs = gameStateRef.current;

    function resize() {
      const container = canvas!.parentElement!;
      const w = Math.min(container.clientWidth, 900);
      const h = Math.min(w * 0.5, 450);
      canvas!.width = w;
      canvas!.height = h;
      gs.canvasW = w;
      gs.canvasH = h;
    }
    resize();
    window.addEventListener("resize", resize);

    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
        gs.keysDown.add(e.key);

        if (gs.gameOver) {
          initGame();
          return;
        }
        if (!gs.started) initGame();
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      gs.keysDown.delete(e.key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function drawGrid() {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      const offset = (gs.frame * gs.speed) % gridSize;
      for (let x = -offset; x < gs.canvasW; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gs.canvasH); ctx.stroke();
      }
      for (let y = 0; y < gs.canvasH; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(gs.canvasW, y); ctx.stroke();
      }
    }

    function drawPlayer() {
      const { playerX: px, playerY: py } = gs;
      const r = 12;
      const pulse = Math.sin(gs.frame * 0.1) * 3;

      ctx.save();
      ctx.shadowColor = COLORS.player;
      ctx.shadowBlur = 20 + pulse;

      ctx.beginPath();
      ctx.arc(px, py, r + pulse * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.playerGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.player;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      const trailLen = 6;
      for (let i = 1; i <= trailLen; i++) {
        const alpha = (1 - i / trailLen) * 0.3;
        ctx.beginPath();
        ctx.arc(px - i * 5 - gs.playerVX * i, py - gs.playerVY * i * 0.3, r * 0.5 * (1 - i / trailLen), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawFirewalls() {
      for (const fw of gs.firewalls) {
        if (fw.x < -60 || fw.x > gs.canvasW + 100) continue;

        ctx.save();
        ctx.shadowColor = fw.color;
        ctx.shadowBlur = 15;

        const barW = 6;
        const scan = (Math.sin(gs.frame * 0.05 + fw.x * 0.01) + 1) * 0.5;

        ctx.fillStyle = fw.color;
        ctx.fillRect(fw.x - barW / 2, 0, barW, fw.gapY);
        ctx.fillRect(fw.x - barW / 2, fw.gapY + fw.gapHeight, barW, gs.canvasH - fw.gapY - fw.gapHeight);

        ctx.fillStyle = `${fw.color}22`;
        ctx.fillRect(fw.x - 20, 0, 40, fw.gapY);
        ctx.fillRect(fw.x - 20, fw.gapY + fw.gapHeight, 40, gs.canvasH - fw.gapY - fw.gapHeight);

        const scanY = fw.gapY * scan;
        ctx.fillStyle = `${fw.color}44`;
        ctx.fillRect(fw.x - 15, scanY - 2, 30, 4);

        ctx.strokeStyle = `${fw.color}66`;
        ctx.lineWidth = 1;
        ctx.strokeRect(fw.x - 3, fw.gapY + 2, 6, fw.gapHeight - 4);

        ctx.restore();
      }
    }

    function drawNodes() {
      for (const node of gs.nodes) {
        if (node.collected || node.x < -40 || node.x > gs.canvasW + 100) continue;

        node.pulsePhase += 0.05;
        const pulse = Math.sin(node.pulsePhase) * 4;
        const r = 10 + pulse;

        ctx.save();
        ctx.shadowColor = COLORS.node;
        ctx.shadowBlur = 25;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.nodeGlow;
        ctx.fill();

        ctx.beginPath();
        const sides = 6;
        for (let i = 0; i <= sides; i++) {
          const angle = (i * Math.PI * 2) / sides + gs.frame * 0.02;
          const hx = node.x + Math.cos(angle) * r;
          const hy = node.y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.fillStyle = "#39ff14";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("D", node.x, node.y);

        ctx.restore();
      }
    }

    function drawParticles() {
      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const p = gs.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) { gs.particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.restore();
      }
    }

    function drawHUD() {
      ctx.save();
      ctx.fillStyle = COLORS.text;
      ctx.font = "12px 'JetBrains Mono', monospace";

      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${gs.score}`, 12, 24);

      ctx.textAlign = "right";
      ctx.fillText(`DATA NODES: ${gs.nodesCollected}/${totalNodes}`, gs.canvasW - 12, 24);

      const barW = 120;
      const barH = 6;
      const barX = gs.canvasW - barW - 12;
      const barY = 32;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = COLORS.node;
      ctx.shadowColor = COLORS.node;
      ctx.shadowBlur = 8;
      ctx.fillRect(barX, barY, (barW * gs.nodesCollected) / totalNodes, barH);

      ctx.restore();
    }

    function update() {
      if (!gs.started || gs.gameOver) return;

      const accel = 0.6;
      const friction = 0.88;
      const maxSpeed = 6;

      if (gs.keysDown.has("ArrowUp") || gs.keysDown.has("w")) gs.playerVY -= accel;
      if (gs.keysDown.has("ArrowDown") || gs.keysDown.has("s")) gs.playerVY += accel;
      if (gs.keysDown.has("ArrowLeft") || gs.keysDown.has("a")) gs.playerVX -= accel * 0.5;
      if (gs.keysDown.has("ArrowRight") || gs.keysDown.has("d")) gs.playerVX += accel * 0.5;

      gs.playerVY *= friction;
      gs.playerVX *= friction;
      gs.playerVY = Math.max(-maxSpeed, Math.min(maxSpeed, gs.playerVY));
      gs.playerVX = Math.max(-maxSpeed * 0.5, Math.min(maxSpeed * 0.5, gs.playerVX));

      gs.playerY += gs.playerVY;
      gs.playerX += gs.playerVX;
      gs.playerX = Math.max(20, Math.min(gs.canvasW * 0.3, gs.playerX));

      if (gs.playerY < 14) { gs.playerY = 14; gs.playerVY = 0; }
      if (gs.playerY > gs.canvasH - 14) { gs.playerY = gs.canvasH - 14; gs.playerVY = 0; }

      // Move firewalls and nodes
      for (const fw of gs.firewalls) fw.x -= gs.speed;
      for (const node of gs.nodes) if (!node.collected) node.x -= gs.speed;

      // Collision with firewalls
      const pr = 10;
      for (const fw of gs.firewalls) {
        if (fw.passed) continue;
        const fwLeft = fw.x - 4;
        const fwRight = fw.x + 4;
        if (gs.playerX + pr > fwLeft && gs.playerX - pr < fwRight) {
          if (gs.playerY - pr < fw.gapY || gs.playerY + pr > fw.gapY + fw.gapHeight) {
            gs.gameOver = true;
            setGameOver(true);
            spawnParticles(gs.playerX, gs.playerY, COLORS.firewall, 30);
            return;
          }
        }
        if (gs.playerX > fw.x && !fw.passed) {
          fw.passed = true;
          gs.score += 100;
          setDisplayScore(gs.score);
          spawnParticles(gs.playerX, gs.playerY, COLORS.player, 8);
        }
      }

      // Collect nodes
      for (const node of gs.nodes) {
        if (node.collected) continue;
        const dist = Math.hypot(gs.playerX - node.x, gs.playerY - node.y);
        if (dist < 24) {
          node.collected = true;
          gs.nodesCollected += 1;
          gs.score += 500;
          setDisplayScore(gs.score);
          setCollected(gs.nodesCollected);
          spawnParticles(node.x, node.y, COLORS.node, 20);

          if (gs.nodesCollected - 1 > gs.lastNodeCallback) {
            gs.lastNodeCallback = gs.nodesCollected - 1;
            onNodeCollected(gs.nodesCollected - 1);
          }

          if (gs.nodesCollected >= totalNodes) {
            onGameComplete();
          }
        }
      }

      // ── Respawn missed nodes ──
      // If an uncollected node scrolled off-screen, spawn a new firewall+node ahead
      if (gs.nodesCollected < totalNodes) {
        for (let i = gs.nodes.length - 1; i >= 0; i--) {
          const node = gs.nodes[i];
          if (!node.collected && node.x < -40) {
            gs.nodes.splice(i, 1);

            let maxX = gs.canvasW;
            for (const fw of gs.firewalls) if (fw.x > maxX) maxX = fw.x;

            const spacing = gs.canvasW * 0.6;
            const gapHeight = Math.max(100, 140 - gs.score * 0.005);
            const gapY = 60 + Math.random() * (gs.canvasH - gapHeight - 120);

            gs.firewalls.push({
              x: maxX + spacing,
              gapY,
              gapHeight,
              passed: false,
              color: FW_COLORS[Math.floor(Math.random() * 3)],
            });

            gs.nodes.push({
              x: maxX + spacing + spacing * 0.5,
              y: gapY + gapHeight / 2,
              collected: false,
              pulsePhase: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      // Clean up off-screen firewalls
      gs.firewalls = gs.firewalls.filter((fw) => fw.x > -200);

      gs.speed = Math.min(4.5, 2.5 + gs.score * 0.0003);
      gs.frame += 1;
    }

    function gameLoop() {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, gs.canvasW, gs.canvasH);

      drawGrid();

      if (!gs.started) {
        ctx.save();
        ctx.fillStyle = COLORS.white;
        ctx.font = "bold 18px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = COLORS.player;
        ctx.shadowBlur = 15;
        ctx.fillText("[ PRESS ARROW KEYS TO START ]", gs.canvasW / 2, gs.canvasH / 2 - 15);
        ctx.shadowBlur = 0;
        ctx.fillStyle = COLORS.text;
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillText("Navigate the orb through firewalls • Collect data nodes", gs.canvasW / 2, gs.canvasH / 2 + 20);
        ctx.restore();
      } else {
        update();
        drawFirewalls();
        drawNodes();
        drawPlayer();
        drawParticles();
        drawHUD();

        if (gs.gameOver) {
          ctx.save();
          ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
          ctx.fillRect(0, 0, gs.canvasW, gs.canvasH);
          ctx.fillStyle = COLORS.firewall;
          ctx.font = "bold 22px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = COLORS.firewall;
          ctx.shadowBlur = 20;
          ctx.fillText("// FIREWALL BREACH DETECTED", gs.canvasW / 2, gs.canvasH / 2 - 20);
          ctx.shadowBlur = 0;
          ctx.fillStyle = COLORS.text;
          ctx.font = "14px 'JetBrains Mono', monospace";
          ctx.fillText(
            `Score: ${gs.score} | Nodes: ${gs.nodesCollected}/${totalNodes}`,
            gs.canvasW / 2,
            gs.canvasH / 2 + 15
          );
          ctx.fillStyle = COLORS.white;
          ctx.fillText("Press any arrow key to retry", gs.canvasW / 2, gs.canvasH / 2 + 40);
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [initGame, onNodeCollected, onGameComplete, totalNodes, spawnParticles]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const gs = gameStateRef.current;
      const touch = e.touches[0];
      const y = touch.clientY - rect.top;
      gs.playerVY = (y - gs.playerY) * 0.1;
      if (!gs.started) initGame();
    },
    [initGame]
  );

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full max-w-[900px] relative">
        <canvas
          ref={canvasRef}
          className="game-canvas w-full"
          onTouchMove={handleTouchMove}
          onTouchStart={() => {
            const gs = gameStateRef.current;
            if (!gs.started || gs.gameOver) initGame();
          }}
        />

        <div className="flex justify-between items-center mt-3 px-1 font-mono text-xs">
          <div className="flex gap-4">
            <span className="text-cyber-muted">
              SCORE: <span className="text-neon-blue font-semibold">{displayScore}</span>
            </span>
            <span className="text-cyber-muted">
              NODES: <span className="text-neon-green font-semibold">{collected}/{totalNodes}</span>
            </span>
          </div>
          <div className="flex gap-2 text-cyber-muted">
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded text-[10px]">↑↓←→</kbd>
            <span>Navigate</span>
          </div>
        </div>
      </div>

      {gameOver && (
        <button
          onClick={initGame}
          className="bypass-btn px-6 py-2 border border-neon-crimson/50 text-neon-crimson font-mono text-sm rounded-lg hover:bg-neon-crimson/10 transition-all"
        >
          [ REINITIALIZE ]
        </button>
      )}
    </div>
  );
}
