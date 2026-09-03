"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Moment, Media } from "@/types/database";
import { useRouter } from "next/navigation";
import PolaroidMedia from "@/components/PolaroidMedia";
import { formatMemoryDate } from "@/lib/date";
import { shuffleArray } from "@/lib/shuffle";

interface PolaroidItem {
  id: string;
  title: string;
  caption?: string;
  cover_url?: string;
  mediaType?: "image" | "video";
  emoji?: string;
  tags?: string[];
  dateFormatted?: string;
  isReal: boolean;
  rotation: number;
  floatDuration: number;
  floatDelay: number;
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

const washiColors = ["washi-pink", "washi-lavender", "washi-cream"];

function DesktopPolaroidCard({
  item,
  containerRef,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: {
  item: PolaroidItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);

  const handlePointerDown = () => {
    draggedRef.current = false;
  };

  const handleDragStart = () => {
    draggedRef.current = true;
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      draggedRef.current = false;
    }, 150);
  };

  const handleTap = () => {
    if (draggedRef.current) return;
    if (item.isReal) {
      router.push(`/moments/${item.id}`);
    } else {
      router.push("/moments");
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.08}
      dragMomentum={false}
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="absolute select-none will-change-transform touch-none"
      style={{
        left: `${item.desktopX}%`,
        top: `${item.desktopY}%`,
        zIndex: isDragging ? 100 : isHovered ? 50 : 10,
      }}
      animate={{
        scale: isDragging ? 1.06 : 1,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* INNER motion.div: handles bobbing float animation & rotation separately from drag */}
      <motion.div
        animate={{
          y: isDragging ? 0 : [0, -12, 0],
          rotate: isDragging ? 0 : isHovered ? 0 : item.rotation,
        }}
        transition={{
          y: {
            duration: item.floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.floatDelay,
          },
          rotate: { type: "spring", stiffness: 300, damping: 20 },
        }}
        whileHover={{
          scale: isDragging ? 1.06 : 1.08,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onClick={handleTap}
        role="button"
        tabIndex={0}
        aria-label={item.title}
        className="relative cursor-pointer focus:outline-none"
      >
        {/* Polaroid Frame */}
        <div
          className={`relative w-52 bg-[#fdfbf7] p-3 pb-4 rounded-md border border-stone-200/60 transition-shadow duration-300 ${
            isDragging
              ? "shadow-2xl ring-2 ring-rose-300/40"
              : "shadow-lg hover:shadow-2xl"
          }`}
        >
          {/* Washi Tape Accent on Top Edge */}
          <div
            className={`washi-tape ${item.washiColor} absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-xs opacity-90 shadow-xs rotate-[-2deg] pointer-events-none`}
          />

          {/* Photo / Video Area */}
          <div className="w-full aspect-[4/3] bg-rose-50/60 rounded-xs overflow-hidden flex items-center justify-center relative border border-stone-200/40">
            {item.cover_url ? (
              <PolaroidMedia
                url={item.cover_url}
                type={item.mediaType}
                alt={item.title}
                sizes="(max-width: 768px) 70vw, 220px"
                className="filter contrast-[1.02] brightness-[1.02] hover:filter-none transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-2 text-center select-none">
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
          <div className="pt-2 text-center">
            <p className="font-accent text-xl text-stone-700 tracking-wide line-clamp-1">
              {item.title}
            </p>
            {item.dateFormatted && (
              <p className="font-body text-[10px] text-stone-400 font-light -mt-0.5">
                {item.dateFormatted}
              </p>
            )}
          </div>

          {/* Cute Hover Tooltip with Handwriting note, date & tags */}
          <AnimatePresence>
            {isHovered && !isDragging && (item.caption || (item.tags && item.tags.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl border border-rose-100/80 z-50 text-center pointer-events-none"
              >
                {item.caption && (
                  <p className="font-accent text-lg text-rose-900 leading-snug">
                    &ldquo;{item.caption}&rdquo;
                  </p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <p className="font-body text-[11px] text-rose-700/80 font-medium mt-1">
                    {item.tags.map((t) => `#${t}`).join(" ")}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobilePolaroidCard({
  item,
  containerRef,
  idx,
}: {
  item: PolaroidItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  idx: number;
}) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);
  const dragControls = useDragControls();
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    draggedRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      dragControls.start(e.nativeEvent as any);
    }, 400);
  };

  const handleTouchMove = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleDragStart = () => {
    draggedRef.current = true;
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      draggedRef.current = false;
    }, 150);
  };

  const handleTap = () => {
    if (draggedRef.current) return;
    if (item.isReal) {
      router.push(`/moments/${item.id}`);
    } else {
      router.push("/moments");
    }
  };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={containerRef}
      dragElastic={0.08}
      dragMomentum={false}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="select-none will-change-transform"
      style={{
        zIndex: isDragging ? 100 : 1,
      }}
      animate={{
        scale: isDragging ? 1.06 : 1,
      }}
    >
      <motion.div
        animate={{
          y: isDragging ? 0 : [0, -8, 0],
          rotate: isDragging ? 0 : item.rotation / 1.5,
        }}
        transition={{
          y: {
            duration: item.floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (idx * 0.4) % 3,
          },
        }}
        whileTap={{ scale: 0.96 }}
        onClick={handleTap}
        className="mx-auto max-w-[260px] cursor-pointer focus:outline-none"
        role="button"
        tabIndex={0}
        aria-label={item.title}
      >
        <div
          className={`relative bg-[#fdfbf7] p-3.5 pb-5 rounded-md border border-stone-200/60 transition-shadow ${
            isDragging ? "shadow-2xl ring-2 ring-rose-300" : "shadow-md"
          }`}
        >
          {/* Washi Tape */}
          <div
            className={`washi-tape ${item.washiColor} absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-xs opacity-90 shadow-xs pointer-events-none`}
          />

          {/* Photo / Video Area */}
          <div className="w-full aspect-[4/3] bg-rose-50/50 rounded-xs overflow-hidden flex items-center justify-center relative border border-stone-200/40">
            {item.cover_url ? (
              <PolaroidMedia
                url={item.cover_url}
                type={item.mediaType}
                alt={item.title}
                sizes="260px"
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                <span className="text-3xl">{item.emoji || "📸"}</span>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="pt-3 text-center">
            <p className="font-accent text-2xl text-stone-800">{item.title}</p>
            {item.dateFormatted && (
              <p className="font-body text-[10px] text-stone-400 font-light -mt-0.5">
                {item.dateFormatted}
              </p>
            )}
            {item.caption && (
              <p className="font-body text-sm text-rose-700/80 mt-1 line-clamp-2">
                &ldquo;{item.caption}&rdquo;
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FloatingConstellation({
  moments,
}: {
  moments: (Moment & { media?: Media[] })[];
}) {
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let list: Array<{
      id: string;
      title: string;
      caption?: string;
      cover_url?: string;
      mediaType?: "image" | "video";
      emoji?: string;
      tags?: string[];
      dateFormatted?: string;
      isReal: boolean;
    }> = moments.map((m) => {
      const mediaItem = m.media?.[0];
      const mediaType = mediaItem?.type || (m.cover_url && /\.(mp4|mov|webm)(\?.*)?$/i.test(m.cover_url) ? "video" : "image");
      return {
        id: m.id,
        title: m.title || "Kenangan Kita",
        caption: m.caption || "Momen manis yang tak terlupakan.",
        cover_url: m.cover_url || undefined,
        mediaType,
        tags: m.tags || [],
        dateFormatted: formatMemoryDate(m, "short"),
        isReal: true,
      };
    });

    // Pad with presets only if public moments < 8
    if (list.length < 8) {
      const needed = 8 - list.length;
      const shuffledPresets = shuffleArray(placeholderPresets);
      const placeholders = shuffledPresets.slice(0, needed).map((p, idx) => ({
        id: `placeholder-${idx}-${Date.now()}`,
        title: p.title,
        caption: p.caption,
        emoji: p.emoji,
        dateFormatted: "hari ini",
        isReal: false,
      }));
      list = [...list, ...placeholders];
    }

    // Shuffle list for random delight
    list = shuffleArray(list);

    // Dynamic grid scatter algorithm:
    // Scale columns and rows to item count
    const totalItems = list.length;
    const cols = totalItems <= 4 ? totalItems : totalItems <= 8 ? 4 : totalItems <= 12 ? 4 : 5;
    const rows = Math.max(2, Math.ceil(totalItems / cols));

    // Create and shuffle grid cells
    const cellCoords: Array<{ col: number; row: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cellCoords.push({ col: c, row: r });
      }
    }
    const shuffledCells = shuffleArray(cellCoords);

    const cellW = 100 / cols;
    const cellH = 100 / rows;

    const polaroids: PolaroidItem[] = list.map((item, idx) => {
      const cell = shuffledCells[idx % shuffledCells.length];
      const centerX = (cell.col + 0.5) * cellW;
      const centerY = (cell.row + 0.5) * cellH;

      // Jitter ±5-7% within cell
      const jitterX = (Math.random() - 0.5) * (cellW * 0.45);
      const jitterY = (Math.random() - 0.5) * (cellH * 0.45);

      // Keep safely inside boundaries
      const desktopX = Math.max(3, Math.min(88, centerX + jitterX - 5));
      const desktopY = Math.max(4, Math.min(88, centerY + jitterY - 6));
      const rotation = Math.floor((Math.random() - 0.5) * 16); // -8deg to +8deg

      return {
        ...item,
        rotation,
        floatDuration: 4.2 + Math.random() * 2.8,
        floatDelay: Math.random() * 2,
        desktopX,
        desktopY,
        washiColor: washiColors[idx % washiColors.length],
      };
    });

    setItems(polaroids);
  }, [moments]);

  if (items.length === 0) return null;

  // Calculate dynamic container height for desktop based on row count (e.g. rows * 320px)
  const rows = Math.max(2, Math.ceil(items.length / (items.length <= 8 ? 4 : 5)));
  const desktopContainerHeight = Math.max(680, rows * 310);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center">
      {/* DESKTOP VIEW: Organic Dynamic Scattered Constellation */}
      <div
        ref={desktopContainerRef}
        style={{ minHeight: `${desktopContainerHeight}px` }}
        className="hidden lg:block relative w-full max-w-7xl mx-auto py-16"
      >
        {items.map((item) => (
          <DesktopPolaroidCard
            key={item.id}
            item={item}
            containerRef={desktopContainerRef}
            isHovered={hoveredId === item.id}
            onHoverStart={() => setHoveredId(item.id)}
            onHoverEnd={() => setHoveredId(null)}
          />
        ))}
      </div>

      {/* MOBILE / TABLET VIEW: Stacked Flow with Long-Press Drag */}
      <div
        ref={mobileContainerRef}
        className="lg:hidden px-4 py-20 max-w-md mx-auto w-full flex flex-col gap-6"
      >
        {items.map((item, idx) => (
          <MobilePolaroidCard
            key={`mobile-${item.id}`}
            item={item}
            containerRef={mobileContainerRef}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
}
