"use client";

import { motion, AnimatePresence } from "framer-motion";
import GlitchText from "./GlitchText";
import Typewriter from "./Typewriter";
import TechMarquee from "./TechMarquee";

interface BentoGridProps {
  unlockedSections: boolean[];
  allUnlocked: boolean;
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(8px) brightness(2)",
    y: 20,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px) brightness(1)",
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

function SectionWrapper({
  children,
  unlocked,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  unlocked: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatePresence>
      {unlocked && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay }}
          className={`glass-card p-5 md:p-6 ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTag({ label, color = "neon-blue" }: { label: string; color?: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded border mb-3
        ${color === "neon-green" ? "text-neon-green border-neon-green/30 bg-neon-green/5" : ""}
        ${color === "neon-blue" ? "text-neon-blue border-neon-blue/30 bg-neon-blue/5" : ""}
        ${color === "neon-crimson" ? "text-neon-crimson border-neon-crimson/30 bg-neon-crimson/5" : ""}
        ${color === "neon-purple" ? "text-neon-purple border-neon-purple/30 bg-neon-purple/5" : ""}
      `}
    >
      {label}
    </span>
  );
}

export default function BentoGrid({
  unlockedSections,
  allUnlocked,
}: BentoGridProps) {
  const heroVisible = allUnlocked || unlockedSections.some(Boolean);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* ─── Hero Card ─── */}
      <AnimatePresence>
        {heroVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold font-mono mb-4">
                <GlitchText text="SYED MAAZ AHMED" />
              </h1>
              <div className="text-lg md:text-xl text-cyber-muted font-mono mb-6">
                <Typewriter />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-cyber-muted">
                <a
                  href="mailto:maazahmed1100@gmail.com"
                  className="hover:text-neon-blue transition-colors flex items-center gap-1.5"
                >
                  <span className="text-neon-blue">◆</span> maazahmed1100@gmail.com
                </a>
                <span className="text-cyber-border">│</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-neon-green">◆</span> Islamabad, Pakistan
                </span>
                <span className="text-cyber-border">│</span>
                <a
                  href="https://linkedin.com/in/syed-maaz-ahmed-9b937a33b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-blue transition-colors flex items-center gap-1.5"
                >
                  <span className="text-neon-purple">◆</span> LinkedIn
                </a>
                <span className="text-cyber-border">│</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-neon-crimson">◆</span> +92 325 3595507
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Section 1: Education & Skills ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionWrapper unlocked={unlockedSections[0] || allUnlocked} delay={0.1}>
          <SectionTag label="Education" color="neon-blue" />
          <h3 className="text-xl font-bold font-mono text-white mb-1">
            BSc Computer Science
          </h3>
          <p className="text-neon-blue font-mono text-sm mb-2">
            FAST National University (NUCES)
          </p>
          <p className="text-cyber-muted text-sm mb-1">Islamabad, Pakistan</p>
          <p className="text-cyber-muted text-xs font-mono">
            08/2024 — 06/2028 (Expected)
          </p>

          <div className="mt-4 pt-4 border-t border-cyber-border">
            <SectionTag label="Experience" color="neon-green" />
            <h4 className="text-md font-bold font-mono text-white">AI Intern</h4>
            <p className="text-neon-green font-mono text-sm">NovaSphere</p>
            <p className="text-cyber-muted text-xs font-mono mb-2">06/2025 — 08/2025 · Islamabad</p>
            <ul className="text-sm text-cyber-muted space-y-1">
              <li className="flex gap-2">
                <span className="text-neon-green mt-1">▸</span>
                Collaborated on advanced ML research and data processing workflows
              </li>
              <li className="flex gap-2">
                <span className="text-neon-green mt-1">▸</span>
                Implemented AI models under strict team deadlines and faculty supervision
              </li>
            </ul>
          </div>
        </SectionWrapper>

        <SectionWrapper unlocked={unlockedSections[0] || allUnlocked} delay={0.2}>
          <SectionTag label="Skills" color="neon-purple" />
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-mono text-neon-blue mb-2">
                Languages & Frameworks
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Python", "C++", "JavaScript", "SQL", "Flask", "Java", "JavaFX"].map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 text-xs font-mono rounded border border-neon-blue/20 bg-neon-blue/5 text-neon-blue"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-mono text-neon-green mb-2">AI & ML</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "YOLOv8", "PyTorch", "LangChain", "Hugging Face",
                  "Computer Vision", "NLP", "NumPy", "OpenCV",
                ].map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 text-xs font-mono rounded border border-neon-green/20 bg-neon-green/5 text-neon-green"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-mono text-neon-purple mb-2">
                Tools & Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Redis", "Tableau", "React Native", "Node.js", "LM Studio"].map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 text-xs font-mono rounded border border-neon-purple/20 bg-neon-purple/5 text-neon-purple"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* ─── Section 2: Professional Projects ─── */}
      <SectionWrapper unlocked={unlockedSections[1] || allUnlocked} delay={0.1}>
        <SectionTag label="Professional Projects" color="neon-green" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {/* AgriVision */}
          <div className="glass-card p-5 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h4 className="font-bold font-mono text-white text-sm">AgriVision</h4>
                <p className="text-[10px] font-mono text-neon-green">Full-Stack AI & Computer Vision</p>
              </div>
            </div>
            <ul className="text-xs text-cyber-muted space-y-2">
              <li className="flex gap-2">
                <span className="text-neon-green mt-0.5">▸</span>
                End-to-end agricultural platform with custom YOLOv8 model for real-time plant disease detection
              </li>
              <li className="flex gap-2">
                <span className="text-neon-green mt-0.5">▸</span>
                Java & JavaFX desktop client with SQL backend for enterprise supply chain management
              </li>
              <li className="flex gap-2">
                <span className="text-neon-green mt-0.5">▸</span>
                Integrated ML inference pipeline with responsive web interface for actionable crop health insights
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["YOLOv8", "Java", "JavaFX", "SQL", "Python"].map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-green/5 text-neon-green/70 border border-neon-green/10">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Namari */}
          <div className="glass-card p-5 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📄</span>
              <div>
                <h4 className="font-bold font-mono text-white text-sm">Namari</h4>
                <p className="text-[10px] font-mono text-neon-blue">LangChain & RAG Research Assistant</p>
              </div>
            </div>
            <ul className="text-xs text-cyber-muted space-y-2">
              <li className="flex gap-2">
                <span className="text-neon-blue mt-0.5">▸</span>
                RAG pipeline connecting vector databases to PDF knowledge bases via LangChain & Hugging Face
              </li>
              <li className="flex gap-2">
                <span className="text-neon-blue mt-0.5">▸</span>
                Flask backend with document chunking, semantic parsing, and retrieval logic
              </li>
              <li className="flex gap-2">
                <span className="text-neon-blue mt-0.5">▸</span>
                Strict prompt architecture forcing exact citation — zero hallucination on financial data
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["LangChain", "Flask", "HuggingFace", "RAG", "Python"].map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-blue/5 text-neon-blue/70 border border-neon-blue/10">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp Bot */}
          <div className="glass-card p-5 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-bold font-mono text-white text-sm">WhatsApp Moderation Bot</h4>
                <p className="text-[10px] font-mono text-neon-crimson">Multi-Modal AI Moderation</p>
              </div>
            </div>
            <ul className="text-xs text-cyber-muted space-y-2">
              <li className="flex gap-2">
                <span className="text-neon-crimson mt-0.5">▸</span>
                Multi-modal moderation: l33t speak regex engine, Image OCR via OpenCV + Tesseract, Voice transcription via Vosk
              </li>
              <li className="flex gap-2">
                <span className="text-neon-crimson mt-0.5">▸</span>
                Node.js core with Python child processes for CV and ML inference
              </li>
              <li className="flex gap-2">
                <span className="text-neon-crimson mt-0.5">▸</span>
                Admin tools: automated kick/readd timeouts, universal @everyone tagging
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Node.js", "Python", "OpenCV", "Tesseract", "Vosk"].map((t) => (
                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-crimson/5 text-neon-crimson/70 border border-neon-crimson/10">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Section 3: ML Experiments ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionWrapper unlocked={unlockedSections[2] || allUnlocked} delay={0.1}>
          <SectionTag label="ML Experiment" color="neon-purple" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h4 className="font-bold font-mono text-white">Semantic Redis Cache</h4>
              <p className="text-[10px] font-mono text-neon-purple">Intelligent LLM Query Caching</p>
            </div>
          </div>
          <ul className="text-xs text-cyber-muted space-y-2">
            <li className="flex gap-2">
              <span className="text-neon-purple mt-0.5">▸</span>
              Smart caching layer using Hugging Face embeddings + Redis for semantic similarity matching
            </li>
            <li className="flex gap-2">
              <span className="text-neon-purple mt-0.5">▸</span>
              Cascading lookup: exact match → fuzzy match → semantic vector match → LLM fallback
            </li>
            <li className="flex gap-2">
              <span className="text-neon-purple mt-0.5">▸</span>
              Auto-caches new LLM responses for future semantic retrieval
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Python", "Redis", "HuggingFace", "LM Studio"].map((t) => (
              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-purple/5 text-neon-purple/70 border border-neon-purple/10">
                {t}
              </span>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper unlocked={unlockedSections[2] || allUnlocked} delay={0.2}>
          <SectionTag label="ML Experiment" color="neon-blue" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🐦</span>
            <div>
              <h4 className="font-bold font-mono text-white">Flappy Bird AI Arena</h4>
              <p className="text-[10px] font-mono text-neon-blue">DQN vs Neuroevolution</p>
            </div>
          </div>
          <ul className="text-xs text-cyber-muted space-y-2">
            <li className="flex gap-2">
              <span className="text-neon-blue mt-0.5">▸</span>
              Comparative study: Deep Q-Network (PyTorch) vs Neuroevolution (raw NumPy) on custom Flappy Bird
            </li>
            <li className="flex gap-2">
              <span className="text-neon-blue mt-0.5">▸</span>
              DQN required careful reward shaping; Neuroevolution used simple &quot;survive longest&quot; fitness
            </li>
            <li className="flex gap-2">
              <span className="text-neon-blue mt-0.5">▸</span>
              Population of 50 neural nets per generation with weight inheritance for top performers
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["PyTorch", "NumPy", "Python", "RL"].map((t) => (
              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-blue/5 text-neon-blue/70 border border-neon-blue/10">
                {t}
              </span>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* ─── Tableau Dashboard ─── */}
      <SectionWrapper unlocked={unlockedSections[2] || allUnlocked} delay={0.3}>
        <SectionTag label="BI Project" color="neon-green" />
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <div>
            <h4 className="font-bold font-mono text-white">Global Retail Sales Dashboard</h4>
            <p className="text-[10px] font-mono text-neon-green">Business Intelligence & Geospatial Analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-xs text-cyber-muted flex gap-2">
            <span className="text-neon-green mt-0.5">▸</span>
            Comprehensive Tableau dashboard analyzing $1.43M in global retail sales data
          </div>
          <div className="text-xs text-cyber-muted flex gap-2">
            <span className="text-neon-green mt-0.5">▸</span>
            Interactive geospatial maps and trend visualizations tracking executive-level KPIs
          </div>
          <div className="text-xs text-cyber-muted flex gap-2">
            <span className="text-neon-green mt-0.5">▸</span>
            Dynamic filtering for regions and product categories for deep-dive analysis
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["Tableau", "Data Viz", "Geospatial", "BI"].map((t) => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-green/5 text-neon-green/70 border border-neon-green/10">
              {t}
            </span>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Certifications ─── */}
      <SectionWrapper unlocked={unlockedSections[2] || allUnlocked} delay={0.35}>
        <SectionTag label="Certifications" color="neon-blue" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-bold font-mono text-white text-sm">React Native App Dev</h4>
            <p className="text-[10px] font-mono text-neon-blue mb-1">NED University</p>
            <p className="text-xs text-cyber-muted">Cross-platform mobile apps, UI/UX, state management</p>
          </div>
          <div>
            <h4 className="font-bold font-mono text-white text-sm">Google AI Professional</h4>
            <p className="text-[10px] font-mono text-neon-green mb-1">Coursera</p>
            <p className="text-xs text-cyber-muted">ML models, neural networks, NLP, fine-tuning</p>
          </div>
          <div>
            <h4 className="font-bold font-mono text-white text-sm">Tableau BI Analyst</h4>
            <p className="text-[10px] font-mono text-neon-purple mb-1">Coursera</p>
            <p className="text-xs text-cyber-muted">Data visualization, dashboards, predictive analysis</p>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Section 4: Tech Stack Marquee + Contact ─── */}
      <SectionWrapper unlocked={unlockedSections[3] || allUnlocked} delay={0.1}>
        <SectionTag label="Tech Stack" color="neon-blue" />
        <TechMarquee />
      </SectionWrapper>

      <SectionWrapper unlocked={unlockedSections[3] || allUnlocked} delay={0.2}>
        <SectionTag label="Contact" color="neon-green" />
        <div className="text-center py-4">
          <p className="font-mono text-lg text-white mb-4">
            <span className="text-neon-green">$</span> Ready to collaborate?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:maazahmed1100@gmail.com"
              className="bypass-btn px-6 py-2.5 border border-neon-blue/50 text-neon-blue font-mono text-sm rounded-lg hover:bg-neon-blue/10 transition-all"
            >
              [ SEND_EMAIL ]
            </a>
            <a
              href="https://linkedin.com/in/syed-maaz-ahmed-9b937a33b"
              target="_blank"
              rel="noopener noreferrer"
              className="bypass-btn px-6 py-2.5 border border-neon-purple/50 text-neon-purple font-mono text-sm rounded-lg hover:bg-neon-purple/10 transition-all"
            >
              [ LINKEDIN ]
            </a>
            <a
              href="tel:+923253595507"
              className="bypass-btn px-6 py-2.5 border border-neon-green/50 text-neon-green font-mono text-sm rounded-lg hover:bg-neon-green/10 transition-all"
            >
              [ CALL ]
            </a>
          </div>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <AnimatePresence>
        {(allUnlocked || unlockedSections[3]) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8 font-mono text-xs text-cyber-muted"
          >
            <p>
              <span className="text-neon-blue">{">"}</span> Designed & built by{" "}
              <span className="text-white">Syed Maaz Ahmed</span> · 2026
            </p>
            <p className="mt-1 text-cyber-muted/50">
              Next.js · Tailwind CSS · Framer Motion · TypeScript
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
