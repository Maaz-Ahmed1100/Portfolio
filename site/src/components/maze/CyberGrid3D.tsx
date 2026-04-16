"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

export type ServerNodeId = "academy" | "neuralnet" | "backend" | "comms";

// ── Maze Data ──────────────────────────────────────────────────────────────────
// 0 = floor, 1 = wall. 25×25 symmetric grid.

const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,1,0,0,1,1,1,0,1,1,1,0,0,1,1,1,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,0,1,0,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,0,1,0,1],
  [1,0,1,0,1,1,1,0,0,1,0,0,0,0,0,1,0,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,0,1,0,0,0,0,0,1,0,0,1,1,1,0,1,0,1],
  [1,0,1,0,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1,0,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,1,1,1,0,0,1,1,1,0,1,1,1,0,0,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const CELL = 2;
const GRID = 25;
const HALF = 12;
const WALL_H = 2.8;
const PLAYER_R = 0.38;
const MOVE_SPEED = 0.15;
const INTERACT_DIST = 3.5;
const CATCH_DIST = 1.1;
const INVULN_MS = 2000;

interface ServerNodeConfig {
  id: ServerNodeId;
  label: string;
  cell: [number, number];
  color: string;
}

const NODES: ServerNodeConfig[] = [
  { id: "academy",   label: "ACADEMY",     cell: [2, 2],   color: "#00f0ff" },
  { id: "neuralnet", label: "NEURAL NET",  cell: [2, 22],  color: "#39ff14" },
  { id: "backend",   label: "BACKEND ENG", cell: [22, 2],  color: "#ff003c" },
  { id: "comms",     label: "COMMS",       cell: [22, 22], color: "#bc13fe" },
];

function cellToWorld(r: number, c: number): [number, number, number] {
  return [(c - HALF) * CELL + 1, 0, (r - HALF) * CELL + 1];
}

const NODE_POSITIONS = NODES.map((n) => cellToWorld(n.cell[0], n.cell[1]));

function isWall(wx: number, wz: number): boolean {
  const c = Math.floor(wx / CELL + HALF);
  const r = Math.floor(wz / CELL + HALF);
  if (r < 0 || r >= GRID || c < 0 || c >= GRID) return true;
  return MAZE[r][c] === 1;
}

function canMove(wx: number, wz: number): boolean {
  const r = PLAYER_R;
  return (
    !isWall(wx - r, wz - r) &&
    !isWall(wx + r, wz - r) &&
    !isWall(wx - r, wz + r) &&
    !isWall(wx + r, wz + r)
  );
}

function isPathBlocked(fx: number, fz: number, tx: number, tz: number): boolean {
  const dx = tx - fx;
  const dz = tz - fz;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const steps = Math.max(4, Math.ceil(dist / (CELL * 0.5)));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    if (isWall(fx + dx * t, fz + dz * t)) return true;
  }
  return false;
}

const activeKeys = new Set<string>();

// ── Patrol definitions ─────────────────────────────────────────────────────────
// Each guard ping-pongs between two waypoints along a clear corridor.

interface PatrolDef {
  waypoints: [number, number][]; // [row, col]
  speed: number; // world units per second
}

const PATROLS: PatrolDef[] = [
  { waypoints: [[5, 5], [5, 19]], speed: 2.8 },
  { waypoints: [[11, 3], [11, 21]], speed: 3.2 },
  { waypoints: [[13, 3], [13, 21]], speed: 3.0 },
  { waypoints: [[19, 5], [19, 19]], speed: 2.8 },
  { waypoints: [[3, 1], [3, 8]], speed: 2.2 },
  { waypoints: [[21, 16], [21, 23]], speed: 2.2 },
];

// Shared refs so guards can read the player position without React state
const playerPosRef = { x: 0, z: 0 };
const guardPositions: [number, number][] = PATROLS.map(() => [0, 0]);

// ── Maze Walls (InstancedMesh) ─────────────────────────────────────────────────

function MazeWalls() {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);

  const wallCount = useMemo(() => {
    let n = 0;
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) if (MAZE[r][c] === 1) n++;
    return n;
  }, []);

  useEffect(() => {
    if (!bodyRef.current || !capRef.current) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (MAZE[r][c] !== 1) continue;
        const wx = (c - HALF) * CELL + CELL / 2;
        const wz = (r - HALF) * CELL + CELL / 2;

        dummy.position.set(wx, WALL_H / 2, wz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        bodyRef.current!.setMatrixAt(i, dummy.matrix);

        dummy.position.set(wx, WALL_H + 0.03, wz);
        dummy.updateMatrix();
        capRef.current!.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    bodyRef.current.instanceMatrix.needsUpdate = true;
    capRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, wallCount]} frustumCulled={false}>
        <boxGeometry args={[CELL, WALL_H, CELL]} />
        <meshStandardMaterial color="#10131f" emissive="#00f0ff" emissiveIntensity={0.03} metalness={0.95} roughness={0.25} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, wallCount]} frustumCulled={false}>
        <boxGeometry args={[CELL, 0.06, CELL]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} transparent opacity={0.2} />
      </instancedMesh>
    </>
  );
}

// ── Maze Floor ─────────────────────────────────────────────────────────────────

function MazeFloor() {
  const SIZE = GRID * CELL + 4;

  const fineLines = useMemo(() => {
    const v: number[] = [];
    const half = SIZE / 2;
    for (let i = -half; i <= half; i += CELL) {
      v.push(i, 0.005, -half, i, 0.005, half);
      v.push(-half, 0.005, i, half, 0.005, i);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#050508" metalness={0.9} roughness={0.3} />
      </mesh>
      <lineSegments geometry={fineLines}>
        <lineBasicMaterial color="#0e1525" transparent opacity={0.5} />
      </lineSegments>
    </>
  );
}

// ── Server Node 3D ─────────────────────────────────────────────────────────────

function ServerNode3D({
  config,
  worldPos,
  isNear,
}: {
  config: ServerNodeConfig;
  worldPos: [number, number, number];
  isNear: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const emissive = useMemo(() => new THREE.Color(config.color), [config.color]);

  useFrame((_, dt) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += dt * (isNear ? 2.5 : 0.6);
      coreRef.current.rotation.x += dt * 0.4;
      coreRef.current.position.y = 2.3 + Math.sin(Date.now() * 0.002) * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * (isNear ? 2 : 0.8);
      const t = isNear ? 1.35 : 1;
      const s = ringRef.current.scale;
      s.x += (t - s.x) * 0.06;
      s.y += (t - s.y) * 0.06;
      s.z += (t - s.z) * 0.06;
    }
  });

  return (
    <group position={worldPos}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1, 0.9, 1]} />
        <meshStandardMaterial color="#10131f" emissive={emissive} emissiveIntensity={isNear ? 0.35 : 0.08} metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
        <meshStandardMaterial color={config.color} emissive={emissive} emissiveIntensity={isNear ? 2.5 : 0.7} transparent opacity={0.6} />
      </mesh>
      <mesh ref={coreRef} position={[0, 2.3, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={config.color} emissive={emissive} emissiveIntensity={isNear ? 3.5 : 1.2} transparent opacity={0.88} wireframe={!isNear} />
      </mesh>
      <mesh ref={ringRef} position={[0, 2.3, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.65, 0.025, 8, 48]} />
        <meshStandardMaterial color={config.color} emissive={emissive} emissiveIntensity={isNear ? 4 : 1.2} transparent opacity={isNear ? 0.85 : 0.25} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} color={config.color} intensity={isNear ? 8 : 3} distance={isNear ? 9 : 5} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshStandardMaterial color={config.color} emissive={emissive} emissiveIntensity={isNear ? 0.6 : 0.12} transparent opacity={isNear ? 0.35 : 0.08} />
      </mesh>
      <Text position={[0, 3.6, 0]} fontSize={0.28} color={isNear ? config.color : "#6b7280"} anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000000">
        {config.label}
      </Text>
      {isNear && (
        <Float speed={4} floatIntensity={0.15}>
          <Text position={[0, 4.2, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.025} outlineColor={config.color}>
            {"[ PRESS E ]"}
          </Text>
        </Float>
      )}
    </group>
  );
}

// ── Patrol Guard ───────────────────────────────────────────────────────────────

function PatrolGuard({
  patrol,
  index,
  onCatch,
  invulnUntil,
}: {
  patrol: PatrolDef;
  index: number;
  onCatch: () => void;
  invulnUntil: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(Math.random());
  const dir = useRef(1);
  const shellRef = useRef<THREE.Mesh>(null);

  const [startW, endW] = useMemo(() => {
    const s = cellToWorld(patrol.waypoints[0][0], patrol.waypoints[0][1]);
    const e = cellToWorld(patrol.waypoints[1][0], patrol.waypoints[1][1]);
    return [new THREE.Vector3(s[0], 0.5, s[2]), new THREE.Vector3(e[0], 0.5, e[2])];
  }, [patrol]);

  const routeLen = useMemo(() => startW.distanceTo(endW), [startW, endW]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    // Ping-pong along route
    progress.current += (dir.current * patrol.speed * dt) / routeLen;
    if (progress.current >= 1) { progress.current = 1; dir.current = -1; }
    if (progress.current <= 0) { progress.current = 0; dir.current = 1; }

    const t = progress.current;
    const gx = startW.x + (endW.x - startW.x) * t;
    const gz = startW.z + (endW.z - startW.z) * t;
    groupRef.current.position.set(gx, 0.5, gz);

    guardPositions[index] = [gx, gz];

    if (shellRef.current) shellRef.current.rotation.y += dt * 3;

    // Catch detection
    const dx = gx - playerPosRef.x;
    const dz = gz - playerPosRef.z;
    if (dx * dx + dz * dz < CATCH_DIST * CATCH_DIST) {
      if (Date.now() > (invulnUntil.current ?? 0)) {
        onCatch();
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#ff003c" emissive="#ff003c" emissiveIntensity={4} />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshStandardMaterial color="#ff003c" emissive="#ff003c" emissiveIntensity={1.5} transparent opacity={0.15} wireframe />
      </mesh>
      <pointLight color="#ff003c" intensity={5} distance={7} decay={2} />
    </group>
  );
}

// ── Player Avatar ──────────────────────────────────────────────────────────────

function PlayerAvatar({
  onNear,
  onAct,
  startPos,
  resetSignal,
}: {
  onNear: (id: ServerNodeId | null) => void;
  onAct: (id: ServerNodeId) => void;
  startPos: [number, number, number];
  resetSignal: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const nearRef = useRef<ServerNodeId | null>(null);
  const vel = useRef(new THREE.Vector3());
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const moveDir = useMemo(() => new THREE.Vector3(), []);
  const ringRef = useRef<THREE.Mesh>(null);

  // Reset position when caught
  useEffect(() => {
    if (resetSignal > 0 && groupRef.current) {
      groupRef.current.position.set(startPos[0], startPos[1], startPos[2]);
      vel.current.set(0, 0, 0);
      playerPosRef.x = startPos[0];
      playerPosRef.z = startPos[2];
    }
  }, [resetSignal, startPos]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((k === "e" || k === " ") && nearRef.current) {
        e.preventDefault();
        onAct(nearRef.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAct]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const pos = groupRef.current.position;

    moveDir.set(0, 0, 0);
    if (activeKeys.has("w") || activeKeys.has("arrowup")) moveDir.z -= 1;
    if (activeKeys.has("s") || activeKeys.has("arrowdown")) moveDir.z += 1;
    if (activeKeys.has("a") || activeKeys.has("arrowleft")) moveDir.x -= 1;
    if (activeKeys.has("d") || activeKeys.has("arrowright")) moveDir.x += 1;
    if (moveDir.lengthSq() > 0) moveDir.normalize().multiplyScalar(MOVE_SPEED);

    vel.current.lerp(moveDir, 0.15);
    if (vel.current.lengthSq() < 0.0001) vel.current.set(0, 0, 0);

    const nx = pos.x + vel.current.x;
    const nz = pos.z + vel.current.z;
    if (canMove(nx, nz)) { pos.x = nx; pos.z = nz; }
    else if (canMove(nx, pos.z)) { pos.x = nx; }
    else if (canMove(pos.x, nz)) { pos.z = nz; }

    playerPosRef.x = pos.x;
    playerPosRef.z = pos.z;

    // Camera with wall-collision check:
    // Preferred angled view; if blocked, pull to overhead
    const idealX = pos.x;
    const idealZ = pos.z + 6;
    const blocked = isPathBlocked(pos.x, pos.z, idealX, idealZ);
    if (blocked) {
      camTarget.set(pos.x, 16, pos.z + 1.5);
    } else {
      camTarget.set(pos.x, 12, idealZ);
    }
    camera.position.lerp(camTarget, 0.06);
    camera.lookAt(pos.x, 0, pos.z);

    if (ringRef.current) ringRef.current.rotation.y += 0.04;

    let closest: ServerNodeId | null = null;
    let closestD = Infinity;
    for (let i = 0; i < NODES.length; i++) {
      const [wx, , wz] = NODE_POSITIONS[i];
      const d = Math.hypot(pos.x - wx, pos.z - wz);
      if (d < INTERACT_DIST && d < closestD) { closestD = d; closest = NODES[i].id; }
    }
    if (closest !== nearRef.current) { nearRef.current = closest; onNear(closest); }
  });

  return (
    <group ref={groupRef} position={startPos}>
      <mesh>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} transparent opacity={0.18} wireframe />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.018, 8, 32]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={3} transparent opacity={0.65} />
      </mesh>
      <pointLight color="#00f0ff" intensity={6} distance={12} decay={2} />
    </group>
  );
}

// ── Minimap ────────────────────────────────────────────────────────────────────

function Minimap({ playerPos }: { playerPos: [number, number] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const S = 4;
    cv.width = GRID * S;
    cv.height = GRID * S;

    let raf = 0;
    function draw() {
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, 0, cv!.width, cv!.height);

      for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
          if (MAZE[r][c] === 1) {
            ctx.fillStyle = "#1a2035";
            ctx.fillRect(c * S, r * S, S, S);
          }
        }
      }

      // Server nodes
      for (const n of NODES) {
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.cell[1] * S + S / 2, n.cell[0] * S + S / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Guards as red dots
      for (const [gx, gz] of guardPositions) {
        const gc = Math.floor(gx / CELL + HALF);
        const gr = Math.floor(gz / CELL + HALF);
        ctx.fillStyle = "#ff003c";
        ctx.beginPath();
        ctx.arc(
          Math.max(2, Math.min(GRID * S - 2, gc * S + S / 2)),
          Math.max(2, Math.min(GRID * S - 2, gr * S + S / 2)),
          2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Player
      const pc = Math.floor(playerPos[0] / CELL + HALF);
      const pr = Math.floor(playerPos[1] / CELL + HALF);
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(
        Math.max(2, Math.min(GRID * S - 2, pc * S + S / 2)),
        Math.max(2, Math.min(GRID * S - 2, pr * S + S / 2)),
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playerPos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-2 right-2 border border-neon-blue/20 rounded opacity-70 pointer-events-none"
      style={{ width: GRID * 4, height: GRID * 4 }}
    />
  );
}

// ── Mobile Button ──────────────────────────────────────────────────────────────

function MobileBtn({ k, label }: { k: string; label: string }) {
  return (
    <button
      className="w-14 h-14 rounded-xl bg-cyber-surface/80 border border-cyber-border flex items-center justify-center text-neon-blue font-mono text-lg select-none active:bg-neon-blue/20 touch-none"
      onTouchStart={(e) => { e.preventDefault(); activeKeys.add(k); }}
      onTouchEnd={() => activeKeys.delete(k)}
      onTouchCancel={() => activeKeys.delete(k)}
      onMouseDown={() => activeKeys.add(k)}
      onMouseUp={() => activeKeys.delete(k)}
      onMouseLeave={() => activeKeys.delete(k)}
    >
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface CyberGrid3DProps {
  onInteract: (nodeId: ServerNodeId) => void;
}

export default function CyberGrid3D({ onInteract }: CyberGrid3DProps) {
  const [nearNode, setNearNode] = useState<ServerNodeId | null>(null);
  const [mounted, setMounted] = useState(false);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [caught, setCaught] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const invulnUntil = useRef(0);
  const [hint, setHint] = useState(
    "WASD / Arrows to move — explore the maze, avoid red patrols!"
  );

  const playerStart = useMemo<[number, number, number]>(
    () => cellToWorld(12, 12),
    []
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "e", " "].includes(k)) {
        e.preventDefault();
      }
      activeKeys.add(k);
    };
    const up = (e: KeyboardEvent) => activeKeys.delete(e.key.toLowerCase());
    const blur = () => activeKeys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      activeKeys.clear();
    };
  }, []);

  // Poll player position for minimap
  useEffect(() => {
    const id = setInterval(() => {
      setPlayerPos([playerPosRef.x, playerPosRef.z]);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const handleNear = useCallback((id: ServerNodeId | null) => {
    setNearNode(id);
    if (id) {
      const n = NODES.find((x) => x.id === id)!;
      setHint(`${n.label} — Press E or Space to access`);
    } else {
      setHint("WASD / Arrows to move — explore the maze, avoid red patrols!");
    }
  }, []);

  const handleCaught = useCallback(() => {
    invulnUntil.current = Date.now() + INVULN_MS;
    setResetSignal((s) => s + 1);
    setCaught(true);
    setHint("CAUGHT! Returning to start...");
    setTimeout(() => {
      setCaught(false);
      setHint("WASD / Arrows to move — explore the maze, avoid red patrols!");
    }, 1500);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full max-w-[960px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-xs text-neon-green">3D MAZE ACTIVE</span>
          </div>
          <span className={`font-mono text-[10px] transition-colors duration-300 ${caught ? "text-red-400" : "text-cyber-muted"}`}>
            {hint}
          </span>
        </div>

        <div
          className="w-full rounded-xl overflow-hidden border border-neon-blue/15 relative"
          style={{
            aspectRatio: "16/9",
            boxShadow: "0 0 60px rgba(0,240,255,0.08), 0 0 120px rgba(0,240,255,0.03), inset 0 0 40px rgba(0,0,0,0.5)",
          }}
        >
          <Canvas
            camera={{ position: [0, 14, 8], fov: 55, near: 0.1, far: 120 }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={["#030308"]} />
            <fog attach="fog" args={["#030308", 14, 50]} />
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 20, 5]} intensity={0.3} color="#5555aa" />

            <MazeFloor />
            <MazeWalls />

            {NODES.map((n, i) => (
              <ServerNode3D key={n.id} config={n} worldPos={NODE_POSITIONS[i]} isNear={nearNode === n.id} />
            ))}

            {PATROLS.map((p, i) => (
              <PatrolGuard key={i} patrol={p} index={i} onCatch={handleCaught} invulnUntil={invulnUntil} />
            ))}

            <PlayerAvatar onNear={handleNear} onAct={onInteract} startPos={playerStart} resetSignal={resetSignal} />

            <Sparkles count={40} scale={50} size={1} speed={0.1} color="#00f0ff" opacity={0.1} />
          </Canvas>

          <Minimap playerPos={playerPos} />

          {/* Red flash overlay when caught */}
          <AnimatePresence>
            {caught && (
              <motion.div
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 bg-red-600/30 pointer-events-none z-10"
              />
            )}
          </AnimatePresence>

          {/* CAUGHT text overlay */}
          <AnimatePresence>
            {caught && (
              <motion.div
                initial={{ opacity: 1, scale: 1.3 }}
                animate={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <span className="font-mono text-2xl font-bold text-red-400 drop-shadow-[0_0_20px_rgba(255,0,60,0.8)]">
                  // PATROL DETECTED
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-between items-center mt-3 px-1 gap-2">
          <div className="flex gap-2 font-mono text-[10px] text-cyber-muted">
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">W</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">A</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">S</kbd>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-cyber-border rounded">D</kbd>
            <span className="text-cyber-muted/50 mx-1">Move</span>
            <kbd className="px-1.5 py-0.5 bg-cyber-surface border border-neon-blue/30 rounded text-neon-blue">E</kbd>
            <span className="text-cyber-muted/50">Interact</span>
            <span className="text-red-400/60 mx-1">|</span>
            <span className="text-red-400/60">Avoid red patrols</span>
          </div>

          <AnimatePresence>
            {nearNode && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => onInteract(nearNode)}
                className="bypass-btn px-4 py-1.5 border border-neon-blue/50 text-neon-blue font-mono text-xs rounded-lg hover:bg-neon-blue/10 transition-all"
              >
                [ ACCESS SERVER ]
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex gap-3 font-mono text-[10px]">
            {NODES.map((n) => (
              <span key={n.id} className="flex items-center gap-1" style={{ color: n.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
                {n.label}
              </span>
            ))}
          </div>
        </div>

        <div className="md:hidden mt-4 flex flex-col items-center gap-1">
          <MobileBtn k="w" label="▲" />
          <div className="flex gap-1">
            <MobileBtn k="a" label="◀" />
            <button
              className="w-14 h-14 rounded-xl bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center text-neon-blue font-mono text-sm font-bold select-none active:bg-neon-blue/40 touch-none"
              onClick={() => { if (nearNode) onInteract(nearNode); }}
            >
              E
            </button>
            <MobileBtn k="d" label="▶" />
          </div>
          <MobileBtn k="s" label="▼" />
        </div>
      </motion.div>
    </div>
  );
}
