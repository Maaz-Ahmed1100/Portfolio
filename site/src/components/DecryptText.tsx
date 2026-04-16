"use client";

import { useEffect, useState, useRef } from "react";

const GLYPHS = "!@#$%^&*()_+-=[]{}|;:,./<>?0123456789ABCDEF";

export default function DecryptText({
  text,
  trigger,
  speed = 30,
  className = "",
}: {
  text: string;
  trigger: boolean;
  speed?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const [mounted, setMounted] = useState(false);
  const iterRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Phase 1: scramble
    setDisplay(
      text
        .split("")
        .map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
        .join("")
    );

    if (!trigger) return;

    // Phase 2: progressive decrypt
    iterRef.current = 0;
    const interval = setInterval(() => {
      iterRef.current += 1;
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (i < iterRef.current) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
      if (iterRef.current >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [mounted, trigger, text, speed]);

  // suppressHydrationWarning: randomised content is intentionally different
  return (
    <span className={className} suppressHydrationWarning>
      {display}
    </span>
  );
}
