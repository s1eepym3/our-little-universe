"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PenLine } from "lucide-react";

export default function AnimatedNotebookEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* 3D Journal Book that gently breathes/opens and closes */}
      <div className="relative mb-8 perspective-[1000px] select-none">
        {/* Book Shadow */}
        <div className="w-36 h-6 bg-stone-300/40 rounded-full blur-md mx-auto -mb-3" />

        <div className="relative w-40 h-48 bg-[#fffdf7] border border-stone-300 rounded-r-xl rounded-l-xs shadow-xl flex overflow-hidden">
          {/* Book Spine */}
          <div className="w-5 h-full bg-[#f43f5e] border-r border-rose-600 flex flex-col justify-around py-3 items-center">
            <div className="w-1 h-3 bg-rose-300/70 rounded-full" />
            <div className="w-1 h-3 bg-rose-300/70 rounded-full" />
            <div className="w-1 h-3 bg-rose-300/70 rounded-full" />
          </div>

          {/* Book Pages */}
          <div className="flex-1 p-3 flex flex-col justify-between relative bg-[repeating-linear-gradient(#fdfbf7,#fdfbf7_18px,#f1e8e6_19px)]">
            <div className="space-y-2 pt-2">
              <div className="w-3/4 h-2 bg-rose-200/50 rounded-full" />
              <div className="w-1/2 h-2 bg-rose-200/40 rounded-full" />
            </div>
            <div className="text-right">
              <span className="text-xl">🌸</span>
            </div>

            {/* Gently Opening / Closing Cover with Framer Motion */}
            <motion.div
              style={{ transformOrigin: "left center" }}
              animate={{
                rotateY: [-35, -5, -35],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-[#fda4af] border-r-2 border-rose-300 rounded-r-xl shadow-lg flex items-center justify-center pointer-events-none"
            >
              <div className="border border-white/60 p-2 rounded-lg text-center">
                <span className="text-2xl">📖</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <h3 className="font-handwriting text-3xl text-rose-950 mb-2">
        Belum ada catatan
      </h3>
      <p className="font-handwriting text-xl text-rose-800/80 mb-6 max-w-sm">
        Halaman pertama menunggu tinta kamu ✍️
      </p>

      <Link
        href="/ruang-kita/catatan?write=true"
        className="washi-tape washi-pink px-6 py-2.5 font-handwriting text-xl text-rose-950 hover:scale-105 active:scale-95 transition-all shadow-md rotate-[-1deg] flex items-center gap-2"
      >
        <PenLine className="w-5 h-5" />
        <span>Tulis Note Pertama</span>
      </Link>
    </div>
  );
}
