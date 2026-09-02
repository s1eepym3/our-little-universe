"use client";

import { motion } from "framer-motion";

export default function HeartLoader({ text = "Memuat kenangan..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-4xl select-none"
      >
        💖
      </motion.div>
      {text && (
        <p className="font-body text-sm sm:text-base text-rose-700/80 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
