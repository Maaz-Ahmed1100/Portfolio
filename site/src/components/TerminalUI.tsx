"use client";

import { motion } from "framer-motion";

export default function TerminalUI({
  children,
  title = "terminal@maaz:~/portfolio",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-[960px] mx-auto"
    >
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyber-border bg-cyber-surface/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neon-crimson/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-neon-green/80" />
          </div>
          <span className="ml-2 font-mono text-xs text-cyber-muted tracking-wider">
            {title}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-[10px] text-neon-green/70">
              CONNECTED
            </span>
          </div>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}
