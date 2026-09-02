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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    const particleCount = mobile ? 8 : count;

    // Generate deterministic/stable pseudo-random particles on client mount
    const items: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      x: Math.random() * 90 + 5, // 5% to 95%
      size: mobile ? Math.random() * 6 + 12 : Math.random() * 10 + 12,
      duration: mobile ? Math.random() * 6 + 10 : Math.random() * 8 + 12,
      delay: Math.random() * 5,
      drift: mobile ? 0 : (Math.random() - 0.5) * 50,
      opacity: Math.random() * 0.35 + 0.3,
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
            willChange: "transform",
          }}
          animate={
            isMobile
              ? {
                  y: ["0vh", "-115vh"],
                  opacity: [0, p.opacity, p.opacity, 0],
                }
              : {
                  y: ["0vh", "-115vh"],
                  x: [0, p.drift, -p.drift / 2, 0],
                  opacity: [0, p.opacity, p.opacity, 0],
                  rotate: [0, p.drift * 2, -p.drift * 2, 0],
                }
          }
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
