"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moment } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

interface PolaroidItem {
  id: string;
  title: string;
  caption?: string;
  cover_url?: string;
  emoji?: string;
  isReal: boolean;
  rotation: number;
  floatDuration: number;
  floatDelay: number;
  // Desktop constellation coordinates (percentage based within container)
  desktopX: number;
  desktopY: number;
  washiColor: string;
}

const placeholderPresets = [
  { title: "kopi pagi berdua", caption: "selalu manis kalau sama kamu ☕", emoji: "☕", washi: "washi-pink" },
  { title: "rencana jalan-jalan", caption: "menghitung hari menuju mimpi kita ✈️", emoji: "✈️", washi: "washi-lavender" },
  { title: "tawa kecil kita", caption: "hal random yang bikin bahagia 💕", emoji: "💕", washi: "washi-cream" },
  { title: "sudut favorit", caption: "tempat paling nyaman di dunia 🏡", emoji: "✨", washi: "washi-pink" },
  { title: "momen tak terduga", caption: "foto buram penuh tawa 📸", emoji: "📸", washi: "washi-lavender" },
  { title: "peluk hangat", caption: "saat hujan turun di luar 🌧️", emoji: "🧸", washi: "washi-cream" },
  { title: "bintang malam ini", caption: "alam semesta kita sendiri 🌙", emoji: "🌙", washi: "washi-pink" },
  { title: "cinta sederhana", caption: "kamu dan aku, cukup selamanya 🤍", emoji: "🤍", washi: "washi-lavender" },
];

// Predefined safe constellation anchor slots for desktop to look naturally scattered without crowding offscreen
const constellationAnchors = [
  { x: 12, y: 14 },
  { x: 38, y: 10 },
  { x: 68, y: 15 },
  { x: 86, y: 28 },
  { x: 18, y: 55 },
  { x: 42, y: 60 },
  { x: 68, y: 58 },
  { x: 84, y: 68 },
];

const washiColors = ["washi-pink", "washi-lavender", "washi-cream"];

export default function FloatingConstellation({ moments }: { moments: Moment[] }) {
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let list: Array<{
      id: string;
      title: string;
      caption?: string;
      cover_url?: string;
      emoji?: string;
      isReal: boolean;
    }> = moments.map((m) => ({
      id: m.id,
      title: m.title || "Kenangan Kita",
      caption: m.caption || "Momen manis yang tak terlupakan.",
      cover_url: m.cover_url || undefined,
      isReal: true,
    }));

    if (list.length < 8) {
      const needed = 8 - list.length;
      const shuffledPresets = [...placeholderPresets].sort(() => Math.random() - 0.5);
      const placeholders = shuffledPresets.slice(0, needed).map((p, idx) => ({
        id: `placeholder-${idx}-${Date.now()}`,
        title: p.title,
        caption: p.caption,
        emoji: p.emoji,
        isReal: false,
      }));
      list = [...list, ...placeholders];
    }

    // Shuffle the combined list
    list = list.sort(() => Math.random() - 0.5);

    const polaroids: PolaroidItem[] = list.map((item, idx) => {
      const anchor = constellationAnchors[idx % constellationAnchors.length];
      // subtle jitter on anchors (-3% to +3%)
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 6;
      const rotation = Math.floor((Math.random() - 0.5) * 16); // -8deg to +8deg

      return {
        ...item,
        rotation,
        floatDuration: 4.2 + Math.random() * 2.8, // 4.2s to 7.0s
        floatDelay: Math.random() * 2,
        desktopX: Math.max(5, Math.min(88, anchor.x + jitterX)),
        desktopY: Math.max(8, Math.min(78, anchor.y + jitterY)),
        washiColor: washiColors[idx % washiColors.length],
      };
    });

    setItems(polaroids);
  }, [moments]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center">
      {/* DESKTOP VIEW: Organic Scattered Constellation */}
      <div className="hidden lg:block relative w-full h-[88vh] max-w-7xl mx-auto">
        {items.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <motion.div
              key={item.id}
              className="absolute select-none will-change-transform"
              style={{
                left: `${item.desktopX}%`,
                top: `${item.desktopY}%`,
                zIndex: isHovered ? 50 : 10,
              }}
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: item.floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.floatDelay,
              }}
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                animate={{
                  rotate: isHovered ? 0 : item.rotation,
                }}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="relative cursor-pointer"
              >
                <Link
                  href={item.isReal ? `/moments/${item.id}` : "/moments"}
                  className="block"
                >
                  {/* Polaroid Frame */}
                  <div className="relative w-52 bg-[#fdfbf7] p-3 pb-5 rounded-md shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-stone-200/60">
                    {/* Washi Tape Accent on Top Edge */}
                    <div
                      className={`washi-tape ${item.washiColor} absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-xs opacity-90 shadow-xs rotate-[-2deg]`}
                    />

                    {/* Photo Area */}
                    <div className="w-full aspect-[4/3] bg-rose-50/60 rounded-xs overflow-hidden flex items-center justify-center relative border border-stone-200/40">
                      {item.cover_url ? (
                        <Image
                          src={item.cover_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 70vw, 220px"
                          loading="lazy"
                          className="object-cover filter contrast-[1.02] brightness-[1.02] hover:filter-none transition-all duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                          <span className="text-3xl filter drop-shadow-sm">
                            {item.emoji || "📸"}
                          </span>
                          <span className="font-accent text-sm text-rose-800/70">
                            cerita kita
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Polaroid Bottom Caption Chin */}
                    <div className="pt-3 text-center">
                      <p className="font-accent text-xl text-stone-700 tracking-wide line-clamp-1">
                        {item.title}
                      </p>
                    </div>

                    {/* Cute Hover Tooltip with Handwriting note */}
                    <AnimatePresence>
                      {isHovered && item.caption && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-56 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-rose-100/80 z-50 text-center pointer-events-none"
                        >
                          <p className="font-accent text-lg text-rose-900 leading-snug">
                            "{item.caption}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* MOBILE / TABLET VIEW: Stacked Flow with Gentle Overlap & Floating */}
      <div className="lg:hidden px-4 py-20 max-w-md mx-auto w-full flex flex-col gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={`mobile-${item.id}`}
            className="select-none will-change-transform"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: item.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (idx * 0.4) % 3,
            }}
          >
            <motion.div
              whileTap={{ scale: 0.96 }}
              style={{
                rotate: item.rotation / 1.5,
              }}
              className="mx-auto max-w-[260px]"
            >
              <Link
                href={item.isReal ? `/moments/${item.id}` : "/moments"}
                className="block"
              >
                <div className="relative bg-[#fdfbf7] p-3.5 pb-6 rounded-md shadow-md border border-stone-200/60">
                  {/* Washi Tape */}
                  <div
                    className={`washi-tape ${item.washiColor} absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-xs opacity-90 shadow-xs`}
                  />

                  {/* Photo Area */}
                  <div className="w-full aspect-[4/3] bg-rose-50/50 rounded-xs overflow-hidden flex items-center justify-center relative border border-stone-200/40">
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        sizes="260px"
                        loading="lazy"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-3xl">{item.emoji || "📸"}</span>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="pt-3 text-center">
                    <p className="font-accent text-2xl text-stone-800">
                      {item.title}
                    </p>
                    {item.caption && (
                      <p className="font-body text-sm text-rose-700/80 mt-1 line-clamp-2">
                        "{item.caption}"
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
