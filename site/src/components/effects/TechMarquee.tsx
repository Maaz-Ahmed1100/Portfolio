"use client";

const TECH = [
  { name: "Python", color: "#3776AB" },
  { name: "PyTorch", color: "#EE4C2C" },
  { name: "YOLOv8", color: "#00FFFF" },
  { name: "LangChain", color: "#39ff14" },
  { name: "Hugging Face", color: "#FFD21E" },
  { name: "Flask", color: "#ffffff" },
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "Node.js", color: "#339933" },
  { name: "React Native", color: "#61DAFB" },
  { name: "C++", color: "#00599C" },
  { name: "SQL", color: "#CC6699" },
  { name: "Redis", color: "#DC382D" },
  { name: "Tableau", color: "#E97627" },
  { name: "OpenCV", color: "#5C3EE8" },
  { name: "NumPy", color: "#013243" },
  { name: "Java", color: "#ED8B00" },
  { name: "JavaFX", color: "#4A90D9" },
  { name: "Next.js", color: "#ffffff" },
  { name: "Computer Vision", color: "#00f0ff" },
  { name: "NLP", color: "#bc13fe" },
];

export default function TechMarquee() {
  const items = [...TECH, ...TECH];
  return (
    <div className="overflow-hidden py-4">
      <div className="marquee-track flex gap-6 whitespace-nowrap w-max">
        {items.map((t, i) => (
          <span
            key={`${t.name}-${i}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-border bg-cyber-surface/50 font-mono text-sm transition-all hover:border-neon-blue/40"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            {t.name}
          </span>
        ))}
      </div>
    </div>
  );
}
