"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  symbol: string;
  x: number; // percentage across screen 0-100
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

const symbols = ["❤️", "💕", "✨", "🌸", "🤍", "💖", "⭐"];

export default function FloatingParticles({ count = 18 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate deterministic/stable pseudo-random particles on client mount
    const items: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      x: Math.random() * 92 + 4, // 4% to 96%
      size: Math.random() * 10 + 12, // 12px to 22px
      duration: Math.random() * 8 + 12, // 12s to 20s
      delay: Math.random() * 8, // 0s to 8s
      drift: (Math.random() - 0.5) * 60, // drift left/right -30px to +30px
      opacity: Math.random() * 0.4 + 0.3, // 0.3 to 0.7
    }));
    setParticles(items);
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none will-change-transform"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            bottom: "-40px",
          }}
          animate={{
            y: ["0vh", "-115vh"],
            x: [0, p.drift, -p.drift / 2, 0],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [0, p.drift * 2, -p.drift * 2, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.symbol}
        </motion.div>
      ))}
    </div>
  );
}
