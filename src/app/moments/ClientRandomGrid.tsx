"use client";

import { Moment } from "@/types/database";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const washiColors = ["washi-pink", "washi-lavender", "washi-cream"];

export default function ClientRandomGrid({ moments }: { moments: Moment[] }) {
  const [shuffled, setShuffled] = useState<
    (Moment & { rotation: number; floatDuration: number; washi: string })[]
  >([]);

  useEffect(() => {
    // Client-side shuffle with organic rotation and float durations
    const list = [...moments].sort(() => Math.random() - 0.5).map((m, idx) => ({
      ...m,
      rotation: Math.floor((Math.random() - 0.5) * 10), // -5deg to +5deg
      floatDuration: 4.5 + Math.random() * 2.5,
      washi: washiColors[idx % washiColors.length],
    }));
    setShuffled(list);
  }, [moments]);

  if (moments.length === 0) {
    return (
      <div className="py-16 text-center text-rose-800/60 bg-white/60 rounded-3xl border border-rose-200/80 border-dashed paper-torn">
        <span className="text-4xl block mb-2">📸</span>
        <p className="font-body text-base text-rose-800/70">
          Belum ada hal-hal kecil yang tersimpan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {shuffled.map((moment, idx) => (
        <motion.div
          key={moment.id}
          className="will-change-transform"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: moment.floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (idx * 0.25) % 2,
          }}
        >
          <div
            style={{
              transform: `rotate(${moment.rotation}deg)`,
            }}
            className="relative bg-[#fdfbf7] p-3 pb-5 shadow-lg hover:shadow-2xl hover:scale-105 hover:rotate-0 transition-all duration-300 border border-stone-200/70 rounded-xs group cursor-pointer"
          >
            {/* Washi Tape */}
            <div
              className={`washi-tape ${moment.washi} absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-3.5 opacity-90 shadow-2xs rotate-[-1deg]`}
            />

            {/* Photo */}
            <div className="aspect-[3/4] bg-rose-50/50 rounded-xs overflow-hidden relative border border-stone-200/40">
              {moment.cover_url ? (
                <img
                  src={moment.cover_url}
                  alt={moment.title || "Candid moment"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  📸
                </div>
              )}
            </div>

            {/* Handwritten Caption */}
            <div className="pt-3 text-center">
              <p className="font-accent text-xl text-stone-800 line-clamp-1">
                {moment.title || moment.caption || "Momen kita"}
              </p>
              {moment.caption && moment.title && (
                <p className="font-body text-xs text-rose-700/80 line-clamp-1">
                  "{moment.caption}"
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
