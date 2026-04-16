"use client";

import { useState, useEffect, useCallback } from "react";

const PHRASES = [
  "Software Engineer",
  "AI & System Architecture",
  "Machine Learning Researcher",
  "Computer Vision Specialist",
  "Backend Architect",
  "Python Developer",
];

export default function Typewriter({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = PHRASES[phraseIndex];
    if (!isDeleting) {
      setText(current.slice(0, text.length + 1));
      if (text.length + 1 === current.length) {
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }
    } else {
      setText(current.slice(0, text.length - 1));
      if (text.length - 1 === 0) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        return;
      }
    }
  }, [text, phraseIndex, isDeleting]);

  useEffect(() => {
    const speed = isDeleting ? 40 : 80;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className={`typing-cursor ${className}`}>
      <span className="text-neon-blue">&gt; </span>
      {text}
    </span>
  );
}
