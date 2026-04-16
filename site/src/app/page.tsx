"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MatrixRain from "@/components/MatrixRain";
import TerminalUI from "@/components/TerminalUI";
import Game from "@/components/Game";
import CyberGrid3D from "@/components/CyberGrid3D";
import ServerModal from "@/components/ServerModal";
import BentoGrid from "@/components/BentoGrid";
import DecryptText from "@/components/DecryptText";
import type { ServerNodeId } from "@/components/CyberGrid3D";

const TOTAL_NODES = 4;

const SECTION_LABELS = [
  "EDUCATION & SKILLS",
  "PROFESSIONAL PROJECTS",
  "ML EXPERIMENTS & CERTS",
  "TECH STACK & CONTACT",
];

export default function Home() {
  const [unlockedSections, setUnlockedSections] = useState<boolean[]>(
    Array(TOTAL_NODES).fill(false)
  );
  const [allUnlocked, setAllUnlocked] = useState(false);
  const [bypassing, setBypassing] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showGame, setShowGame] = useState(true);
  const [activeModal, setActiveModal] = useState<ServerNodeId | null>(null);
  const bypassTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNodeCollected = useCallback((nodeIndex: number) => {
    setUnlockedSections((prev) => {
      const next = [...prev];
      next[nodeIndex] = true;
      return next;
    });
  }, []);

  const handleGameComplete = useCallback(() => {
    setGameComplete(true);
    setTimeout(() => {
      setAllUnlocked(true);
      setShowGame(false);
    }, 1000);
  }, []);

  const handleGameReset = useCallback(() => {
    setUnlockedSections(Array(TOTAL_NODES).fill(false));
    setAllUnlocked(false);
    setGameComplete(false);
  }, []);

  const handleBypass = useCallback(() => {
    setBypassing(true);
    let i = 0;
    function unlockNext() {
      if (i >= TOTAL_NODES) {
        setTimeout(() => {
          setAllUnlocked(true);
          setShowGame(false);
          setBypassing(false);
        }, 400);
        return;
      }
      setUnlockedSections((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      i++;
      bypassTimerRef.current = setTimeout(unlockNext, 300);
    }
    unlockNext();
  }, []);

  const handleServerInteract = useCallback((nodeId: ServerNodeId) => {
    setActiveModal(nodeId);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  // ESC to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveModal(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const decrypted = allUnlocked || unlockedSections.some(Boolean);

  return (
    <main className="relative min-h-screen">
      <MatrixRain />

      <div className="relative z-10 pt-8 pb-16 px-4">
        {/* ─── Phase 1: Terminal / Extraction Game ─── */}
        <AnimatePresence mode="wait">
          {showGame && (
            <motion.div
              key="game-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <TerminalUI>
                <div className="font-mono text-xs space-y-1.5 mb-6">
                  <p className="text-neon-green">
                    <DecryptText text="[SYS] Neural interface initialized..." trigger={true} speed={15} />
                  </p>
                  <p className="text-neon-blue">
                    <DecryptText text="[SEC] Encrypted portfolio detected. Begin data extraction protocol." trigger={true} speed={15} />
                  </p>
                  <p className="text-cyber-muted">
                    <DecryptText text="[INF] Navigate through firewalls. Collect 4 data nodes to decrypt the CV." trigger={true} speed={15} />
                  </p>
                </div>

                <Game
                  onNodeCollected={handleNodeCollected}
                  onGameComplete={handleGameComplete}
                  onReset={handleGameReset}
                  totalNodes={TOTAL_NODES}
                />

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
                  {SECTION_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className={`p-2 rounded border text-center transition-all duration-500 ${
                        unlockedSections[i] || allUnlocked
                          ? "border-neon-green/50 bg-neon-green/5 text-neon-green"
                          : "border-cyber-border bg-cyber-surface/30 text-cyber-muted"
                      }`}
                    >
                      <span className="block mb-0.5">
                        {unlockedSections[i] || allUnlocked ? "■" : "□"} NODE {i + 1}
                      </span>
                      <span className="text-[9px] opacity-70">{label}</span>
                    </div>
                  ))}
                </div>

                {!allUnlocked && !gameComplete && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleBypass}
                      disabled={bypassing}
                      className="bypass-btn px-6 py-2.5 border border-neon-blue/30 text-neon-blue/70 font-mono text-xs rounded-lg hover:border-neon-blue/60 hover:text-neon-blue hover:bg-neon-blue/5 transition-all disabled:opacity-50"
                    >
                      {bypassing ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 border-2 border-neon-blue/50 border-t-neon-blue rounded-full animate-spin" />
                          DECRYPTING...
                        </span>
                      ) : (
                        "[ BYPASS SECURITY — SKIP TO CV ]"
                      )}
                    </button>
                    <p className="mt-2 text-[10px] text-cyber-muted/50 font-mono">
                      For recruiters who prefer to skip the game
                    </p>
                  </div>
                )}
              </TerminalUI>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Phase 2: Cyber-Grid Sandbox (walkable RPG) ─── */}
        <AnimatePresence>
          {decrypted && (
            <motion.section
              key="cybergrid"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-16"
            >
              {/* Section header */}
              <div className="max-w-[900px] mx-auto mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                  <h2 className="font-mono text-sm text-neon-blue tracking-widest">
                    CYBER-GRID SANDBOX
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                </div>
                <p className="text-center font-mono text-xs text-cyber-muted">
                  Explore the maze. Find all 4 server nodes to explore my CV interactively.
                  <span className="text-cyber-muted/40 ml-1">Or scroll down for the standard view.</span>
                </p>
              </div>

              <CyberGrid3D onInteract={handleServerInteract} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* ─── Server Node Modal Overlay ─── */}
        <ServerModal activeNode={activeModal} onClose={handleModalClose} />

        {/* ─── Phase 3: Bento Grid CV (always-readable fallback) ─── */}
        <AnimatePresence>
          {decrypted && (
            <motion.div
              key="bento-divider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-6xl mx-auto mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
                <span className="font-mono text-[10px] text-cyber-muted/50 tracking-widest">
                  STANDARD CV VIEW
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BentoGrid
          unlockedSections={unlockedSections}
          allUnlocked={allUnlocked}
        />
      </div>
    </main>
  );
}
