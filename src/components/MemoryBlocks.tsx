"use client";

import { motion } from "framer-motion";
import { Moment } from "@/types/database";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// 📸✈️☕💕
const placeholders = [
  { type: "emoji", content: "📸", color: "bg-rose-100" },
  { type: "emoji", content: "✈️", color: "bg-blue-100" },
  { type: "emoji", content: "☕", color: "bg-amber-100" },
  { type: "emoji", content: "💕", color: "bg-pink-100" },
  { type: "color", content: "", color: "bg-[#ffe4e6]" }, // blush
  { type: "color", content: "", color: "bg-[#e9d5ff]" }, // lavender
  { type: "emoji", content: "✨", color: "bg-purple-100" },
  { type: "text", content: "us", color: "bg-indigo-100" },
];

export default function MemoryBlocks({ moments }: { moments: Moment[] }) {
  const [blocks, setBlocks] = useState<(Moment | (typeof placeholders)[0])[]>([]);

  useEffect(() => {
    let combined: (Moment | (typeof placeholders)[0])[] = [...moments];
    if (combined.length < 8) {
      const needed = 8 - combined.length;
      // Shuffle placeholders and take needed
      const shuffledPlaceholders = [...placeholders].sort(() => Math.random() - 0.5);
      combined = [...combined, ...shuffledPlaceholders.slice(0, needed)];
    }
    
    // Always shuffle the combined array on client
    combined = combined.sort(() => Math.random() - 0.5);
    setBlocks(combined);
  }, [moments]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mx-auto p-4"
    >
      {blocks.map((block, index) => {
        const isMoment = "id" in block;
        
        return (
          <motion.div
            key={isMoment ? block.id : `placeholder-${index}`}
            variants={item}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="aspect-square relative will-change-transform"
          >
            {isMoment ? (
              <Link href={`/moments`} className="block w-full h-full relative overflow-hidden rounded-3xl shadow-sm border border-white/50 bg-white/50 group">
                {block.cover_url ? (
                  <img
                    src={block.cover_url}
                    alt={block.title || "Memory"}
                    className="w-full h-full object-cover blur-sm group-hover:blur-none transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-rose-50 flex items-center justify-center p-4 text-center">
                    <span className="font-display text-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                      {block.caption || block.title || "A sweet memory"}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/ruang-kita" className={cn(
                "block w-full h-full rounded-3xl shadow-sm border border-white/40 flex items-center justify-center text-4xl group",
                block.color
              )}>
                <span className="group-hover:scale-125 transition-transform duration-300">
                  {block.content}
                </span>
              </Link>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
