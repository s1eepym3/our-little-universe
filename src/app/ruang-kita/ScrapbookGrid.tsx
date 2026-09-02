"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moment } from "@/types/database";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ScrapbookGridProps {
  moments: Moment[];
  deleteAction: (formData: FormData) => Promise<void>;
}

const washiStyles = ["washi-pink", "washi-lavender", "washi-cream"];

function ScrapbookItem({
  moment,
  index,
  deleteAction,
}: {
  moment: Moment;
  index: number;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Micro-float duration 5s - 8s (desktop only)
  const floatDuration = 5 + (index % 4) * 0.9;
  const floatDelay = (index * 0.3) % 2;
  const washi = washiStyles[index % washiStyles.length];
  const paperClass = index % 2 === 0 ? "paper-torn" : "paper-torn-alt";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Gentle 3D tilt calculation
    setTilt({
      rotateX: -(y / (rect.height / 2)) * 8,
      rotateY: (x / (rect.width / 2)) * 8,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      className="will-change-transform"
      animate={isMobile ? {} : isHovered ? { y: 0 } : { y: [0, -4, 0] }}
      transition={{
        duration: floatDuration,
        repeat: isMobile || isHovered ? 0 : Infinity,
        ease: "easeInOut",
        delay: floatDelay,
      }}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: !isMobile && isHovered
            ? `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : isHovered
            ? "scale3d(1.02, 1.02, 1.02)"
            : "none",
          transition: isHovered ? "transform 0.15s ease-out" : "transform 0.3s ease-out",
        }}
        className={`relative bg-[#fdfbf7] p-4 pb-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-stone-200/80 ${paperClass} group`}
      >
        {/* Top Washi Tape Sticker */}
        <div
          className={`washi-tape ${washi} absolute -top-3 left-8 w-20 h-5 opacity-90 shadow-2xs rotate-[-3deg] z-20`}
        />

        {/* Public Status Badge - Styled as a cute round stamp */}
        {moment.is_public && (
          <div className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-rose-50 border border-rose-300 flex items-center justify-center text-[11px] font-accent text-rose-800 shadow-xs rotate-12">
            public
          </div>
        )}

        {/* Photo Canvas */}
        <div className="w-full aspect-[4/3] bg-rose-50/70 rounded-xs overflow-hidden relative border border-stone-200/60 mb-3.5">
          {moment.cover_url ? (
            <Image
              src={moment.cover_url}
              alt={moment.title || "Kenangan"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl mb-1">📸</span>
              <span className="font-body text-xs text-stone-500">
                tanpa foto
              </span>
            </div>
          )}

          {/* Delete Button - Styled like a cute round wax seal stamp */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <form
              action={async (formData) => {
                if (confirm("Hapus kenangan ini dari scrapbook kita?")) {
                  setIsDeleting(true);
                  await deleteAction(formData);
                  setIsDeleting(false);
                }
              }}
            >
              <input type="hidden" name="id" value={moment.id} />
              <button
                type="submit"
                disabled={isDeleting}
                title="Hapus kenangan"
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-200 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Scrapbook handwritten notes section */}
        <div className="space-y-1">
          <h3 className="font-accent text-2xl text-stone-800 leading-tight line-clamp-1">
            {moment.title || "Tanpa Judul"}
          </h3>
          {moment.caption && (
            <p className="font-body text-sm text-stone-600 line-clamp-2 leading-snug">
              "{moment.caption}"
            </p>
          )}
          <div className="pt-2 flex items-center justify-between text-xs font-body font-light text-rose-800/70 border-t border-dashed border-rose-100 mt-2">
            <span>
              {moment.category === "first_trip"
                ? "☕ Tempat Kita"
                : "🌸 Random Thing"}
            </span>
            <span>
              {new Date(moment.created_at).toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScrapbookGrid({
  moments,
  deleteAction,
}: ScrapbookGridProps) {
  if (moments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        {/* Animated Swinging Empty Photo Frame */}
        <motion.div
          animate={{ rotate: [-6, 6, -6] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "top center" }}
          className="relative mb-6 select-none"
        >
          {/* Hanging String & Nail */}
          <div className="w-1.5 h-1.5 rounded-full bg-stone-500 mx-auto -mb-0.5 shadow-xs" />
          <div className="w-0.5 h-8 bg-stone-400 mx-auto" />

          {/* Empty Picture Frame */}
          <div className="w-48 h-56 bg-[#fdfbf7] border-4 border-dashed border-stone-300/80 rounded-md shadow-md p-4 flex flex-col items-center justify-center paper-torn">
            <span className="text-4xl mb-2 opacity-60">🖼️</span>
            <span className="font-body text-xs text-stone-500">
              kosong & tenang
            </span>
          </div>
        </motion.div>

        <h3 className="font-accent text-3xl text-rose-950 mb-1">
          Frame ini masih kosong...
        </h3>
        <p className="font-body text-sm text-rose-800/80 mb-6 max-w-sm">
          isi dengan kenangan kita berdua? 📸
        </p>

        <Link
          href="/ruang-kita/upload"
          className="washi-tape washi-pink px-6 py-2.5 text-sm sm:text-base font-body font-medium text-rose-950 hover:scale-105 active:scale-95 transition-all shadow-md rotate-[-1deg]"
        >
          + Tempel Foto Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
      {moments.map((moment, index) => (
        <ScrapbookItem
          key={moment.id}
          moment={moment}
          index={index}
          deleteAction={deleteAction}
        />
      ))}
    </div>
  );
}
