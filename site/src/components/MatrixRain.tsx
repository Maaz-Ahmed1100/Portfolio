"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]=/\\|";
    const charArr = chars.split("");
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      columns = Math.floor(canvas!.width / fontSize);
      drops = Array.from({ length: columns }, () =>
        Math.random() * -100
      );
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.fillStyle = "rgba(10, 10, 15, 0.06)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < drops.length; i++) {
        const char = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const brightness = Math.random();
        if (brightness > 0.95) {
          ctx!.fillStyle = "#ffffff";
          ctx!.shadowColor = "#00f0ff";
          ctx!.shadowBlur = 10;
        } else if (brightness > 0.8) {
          ctx!.fillStyle = "#00f0ff";
          ctx!.shadowColor = "#00f0ff";
          ctx!.shadowBlur = 4;
        } else {
          ctx!.fillStyle = `rgba(0, 240, 255, ${0.15 + brightness * 0.3})`;
          ctx!.shadowBlur = 0;
        }

        ctx!.font = `${fontSize}px "JetBrains Mono", monospace`;
        ctx!.fillText(char, x, y);
        ctx!.shadowBlur = 0;

        if (y > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-container"
      aria-hidden="true"
    />
  );
}
