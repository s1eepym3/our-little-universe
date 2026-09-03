"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title = "Konfirmasi Hati",
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  isDestructive = true,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#fffdfa] p-6 pb-8 sm:p-8 sm:pb-8 shadow-2xl border border-rose-200/80 paper-torn"
          >
            {/* Top Washi Tape */}
            <div className="washi-tape washi-lavender absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 opacity-90 shadow-2xs rotate-[-1deg]" />

            <div className="text-center space-y-3 pt-2">
              <span className="text-3xl inline-block">🕊️</span>
              <h3 className="font-accent text-2xl sm:text-3xl text-rose-950">
                {title}
              </h3>
              <p className="font-body text-sm sm:text-base text-stone-700 leading-relaxed px-2">
                {message}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="px-5 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 font-body font-medium text-xs sm:text-sm text-stone-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`px-5 py-2 rounded-full font-body font-medium text-xs sm:text-sm text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                  isDestructive
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                }`}
              >
                {loading ? "Menghapus..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
