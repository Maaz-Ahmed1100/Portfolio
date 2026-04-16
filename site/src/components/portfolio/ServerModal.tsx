"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ServerNodeId } from "./CyberGrid";

// ── CV Data per Server Node ────────────────────────────────────────────────────

interface ProjectItem {
  name: string;
  subtitle: string;
  bullets: string[];
  tags: string[];
}

interface ServerData {
  icon: string;
  title: string;
  color: string;
  borderColor: string;
  content: React.ReactNode;
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
      style={{
        color,
        borderColor: `${color}22`,
        backgroundColor: `${color}08`,
      }}
    >
      {label}
    </span>
  );
}

function ProjectCard({ project, color }: { project: ProjectItem; color: string }) {
  return (
    <div className="glass-card p-4 space-y-2">
      <div>
        <h4 className="font-bold font-mono text-white text-sm">{project.name}</h4>
        <p className="text-[10px] font-mono" style={{ color }}>{project.subtitle}</p>
      </div>
      <ul className="text-xs text-cyber-muted space-y-1.5">
        {project.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5" style={{ color }}>▸</span>
            {b}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {project.tags.map(t => <Tag key={t} label={t} color={color} />)}
      </div>
    </div>
  );
}

const SERVER_CONTENT: Record<ServerNodeId, ServerData> = {
  academy: {
    icon: "🎓",
    title: "THE ACADEMY",
    color: "#00f0ff",
    borderColor: "rgba(0, 240, 255, 0.3)",
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold font-mono text-white">BSc Computer Science</h3>
          <p className="text-sm font-mono text-[#00f0ff]">FAST National University (NUCES)</p>
          <p className="text-xs text-[#8b949e]">Islamabad, Pakistan · Class of 2028</p>
        </div>

        <div className="border-t border-[#1a1f2e] pt-4">
          <p className="text-[10px] font-mono text-[#39ff14] mb-2 tracking-widest uppercase">Experience</p>
          <h4 className="font-bold font-mono text-white">AI Intern — NovaSphere</h4>
          <p className="text-xs text-[#8b949e] font-mono mb-2">Jun 2025 – Aug 2025 · Islamabad</p>
          <ul className="text-xs text-[#8b949e] space-y-1">
            <li className="flex gap-2"><span className="text-[#39ff14]">▸</span>Collaborated on advanced ML research and data processing workflows</li>
            <li className="flex gap-2"><span className="text-[#39ff14]">▸</span>Implemented AI models under strict team deadlines and faculty supervision</li>
          </ul>
        </div>

        <div className="border-t border-[#1a1f2e] pt-4">
          <p className="text-[10px] font-mono text-[#bc13fe] mb-2 tracking-widest uppercase">Certifications</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="font-mono text-white text-xs font-bold">React Native App Dev</p>
              <p className="text-[10px] text-[#00f0ff] font-mono">NED University</p>
            </div>
            <div>
              <p className="font-mono text-white text-xs font-bold">Google AI Professional</p>
              <p className="text-[10px] text-[#39ff14] font-mono">Coursera</p>
            </div>
            <div>
              <p className="font-mono text-white text-xs font-bold">Tableau BI Analyst</p>
              <p className="text-[10px] text-[#bc13fe] font-mono">Coursera</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1a1f2e] pt-4">
          <p className="text-[10px] font-mono text-[#00f0ff] mb-2 tracking-widest uppercase">Core Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {["Python","Java","C++","React","Next.js","Node.js","SQL","Redis","PyTorch","OpenCV"].map(s => (
              <Tag key={s} label={s} color="#00f0ff" />
            ))}
          </div>
        </div>
      </div>
    ),
  },

  neuralnet: {
    icon: "🧠",
    title: "THE NEURAL NET",
    color: "#39ff14",
    borderColor: "rgba(57, 255, 20, 0.3)",
    content: (
      <div className="space-y-4">
        <p className="text-xs text-[#8b949e] font-mono">AI / Machine Learning Projects</p>
        <div className="space-y-3">
          <ProjectCard
            color="#39ff14"
            project={{
              name: "AgriVision",
              subtitle: "AI-Powered Crop Health MIS",
              bullets: [
                "Custom YOLOv8 object detection model trained on curated plant disease dataset with strategic data augmentation",
                "Java & JavaFX enterprise desktop client with SQL backend for supply chain and farm logistics",
                "End-to-end data pipeline: image preprocessing → model inference → actionable crop health insights",
              ],
              tags: ["YOLOv8", "Java", "JavaFX", "SQL", "Python", "Computer Vision"],
            }}
          />
          <ProjectCard
            color="#39ff14"
            project={{
              name: "Flappy Bird RL Arena",
              subtitle: "DQN vs Neuroevolution Architecture Comparison",
              bullets: [
                "Deep Q-Network agent (PyTorch) with manual reward shaping for pixel-level game state",
                "Neuroevolution agent (raw NumPy) — population of 50 neural nets with 'survive longest' fitness",
                "Demonstrated that simple evolutionary pressure outperformed complex reward engineering for this domain",
              ],
              tags: ["PyTorch", "NumPy", "Reinforcement Learning", "Python"],
            }}
          />
          <ProjectCard
            color="#39ff14"
            project={{
              name: "Namari",
              subtitle: "LangChain & RAG Research Assistant",
              bullets: [
                "Retrieval-Augmented Generation pipeline connecting vector databases to PDF knowledge bases",
                "Flask backend with LangChain for document chunking, semantic parsing, and retrieval logic",
                "Strict prompt architecture forcing exact citation and source-grounded answers — zero hallucination on financial data",
              ],
              tags: ["LangChain", "Flask", "Hugging Face", "RAG", "Python"],
            }}
          />
        </div>
      </div>
    ),
  },

  backend: {
    icon: "⚙️",
    title: "THE BACKEND ENGINE",
    color: "#ff003c",
    borderColor: "rgba(255, 0, 60, 0.3)",
    content: (
      <div className="space-y-4">
        <p className="text-xs text-[#8b949e] font-mono">Systems / Backend Engineering Projects</p>
        <div className="space-y-3">
          <ProjectCard
            color="#ff003c"
            project={{
              name: "WhatsApp Moderation Bot",
              subtitle: "Multi-Modal Content Moderation System",
              bullets: [
                "Node.js routing core triggering Python subprocesses for ML inference across text, image, and audio",
                "l33t speak regex engine mapping hundreds of symbolic character variants to detect obfuscated banned words",
                "Image OCR pipeline: OpenCV grayscale + thresholding → Tesseract text extraction → moderation filter",
                "Voice note transcription via Vosk speech-to-text engine before content evaluation",
                "Admin tooling: automated 5-min kick/readd timeouts, universal @everyone tag",
              ],
              tags: ["Node.js", "Python", "OpenCV", "Tesseract", "Vosk", "whatsapp-web.js"],
            }}
          />
          <ProjectCard
            color="#ff003c"
            project={{
              name: "Semantic Cache Layer",
              subtitle: "Redis-Based LLM Query Caching Architecture",
              bullets: [
                "Smart caching layer converting prompts into vector embeddings via Hugging Face for meaning-based matching",
                "Cascading lookup: exact string → normalized/fuzzy → semantic vector similarity → LLM fallback",
                "Intercepts repetitive LLM queries for near-instant latency — automatically caches new responses for future retrieval",
              ],
              tags: ["Python", "Redis", "Hugging Face", "LM Studio", "Embeddings"],
            }}
          />
          <ProjectCard
            color="#ff003c"
            project={{
              name: "Global Retail Sales Dashboard",
              subtitle: "Business Intelligence & Geospatial Analytics",
              bullets: [
                "Tableau dashboard analyzing $1.43M in global retail sales with interactive geospatial maps",
                "Dynamic filtering for regions and product categories enabling deep-dive executive-level KPI analysis",
              ],
              tags: ["Tableau", "Data Viz", "Geospatial", "BI"],
            }}
          />
        </div>
      </div>
    ),
  },

  comms: {
    icon: "📡",
    title: "THE COMMS ARRAY",
    color: "#bc13fe",
    borderColor: "rgba(188, 19, 254, 0.3)",
    content: (
      <div className="space-y-6">
        <p className="text-xs text-[#8b949e] font-mono">Contact & Links</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:maazahmed1100@gmail.com"
            className="glass-card p-4 flex items-center gap-3 group hover:border-[#00f0ff]/40 transition-all"
          >
            <span className="text-xl">📧</span>
            <div>
              <p className="font-mono text-xs text-[#8b949e]">Email</p>
              <p className="font-mono text-sm text-white group-hover:text-[#00f0ff] transition-colors">maazahmed1100@gmail.com</p>
            </div>
          </a>

          <a
            href="https://linkedin.com/in/syed-maaz-ahmed-9b937a33b"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-4 flex items-center gap-3 group hover:border-[#bc13fe]/40 transition-all"
          >
            <span className="text-xl">💼</span>
            <div>
              <p className="font-mono text-xs text-[#8b949e]">LinkedIn</p>
              <p className="font-mono text-sm text-white group-hover:text-[#bc13fe] transition-colors">Syed Maaz Ahmed</p>
            </div>
          </a>

          <a
            href="tel:+923253595507"
            className="glass-card p-4 flex items-center gap-3 group hover:border-[#39ff14]/40 transition-all"
          >
            <span className="text-xl">📱</span>
            <div>
              <p className="font-mono text-xs text-[#8b949e]">Phone</p>
              <p className="font-mono text-sm text-white group-hover:text-[#39ff14] transition-colors">+92 325 3595507</p>
            </div>
          </a>

          <div className="glass-card p-4 flex items-center gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="font-mono text-xs text-[#8b949e]">Location</p>
              <p className="font-mono text-sm text-white">Islamabad, Pakistan</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1a1f2e] pt-4 text-center">
          <p className="font-mono text-sm text-[#8b949e]">
            <span className="text-[#39ff14]">$</span> Always open to collaboration on AI, systems architecture, and research engineering.
          </p>
        </div>
      </div>
    ),
  },
};

// ── Modal Component ────────────────────────────────────────────────────────────

interface ServerModalProps {
  activeNode: ServerNodeId | null;
  onClose: () => void;
}

export default function ServerModal({ activeNode, onClose }: ServerModalProps) {
  const data = activeNode ? SERVER_CONTENT[activeNode] : null;

  return (
    <AnimatePresence>
      {data && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border"
              style={{
                background: "rgba(13, 17, 23, 0.85)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderColor: data.borderColor,
                boxShadow: `0 0 60px ${data.borderColor}, 0 0 120px ${data.borderColor.replace("0.3", "0.1")}`,
              }}
            >
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: data.borderColor }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{data.icon}</span>
                  <div>
                    <h2
                      className="font-bold font-mono text-lg tracking-wider"
                      style={{ color: data.color }}
                    >
                      {data.title}
                    </h2>
                    <p className="text-[10px] font-mono text-[#8b949e]">SERVER NODE ACCESSED</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border font-mono text-sm transition-all hover:bg-white/5"
                  style={{ borderColor: data.borderColor, color: data.color }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {data.content}
              </div>

              {/* Modal Footer */}
              <div
                className="px-6 py-3 border-t flex items-center justify-between"
                style={{ borderColor: data.borderColor }}
              >
                <span className="font-mono text-[10px] text-[#8b949e]">
                  Press ESC or click outside to close
                </span>
                <button
                  onClick={onClose}
                  className="bypass-btn px-4 py-1.5 border font-mono text-xs rounded-lg transition-all hover:bg-white/5"
                  style={{ borderColor: `${data.color}44`, color: data.color }}
                >
                  [ DISCONNECT ]
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
