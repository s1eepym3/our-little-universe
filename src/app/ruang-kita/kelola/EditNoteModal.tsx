"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/app/actions";
import { X } from "lucide-react";

interface EditNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedNote: Note) => void;
}

const availableMoods = ["💕", "✨", "🌸", "☕", "🥰", "🧸", "🌙", "🤍", "🥺", "💭"];

export default function EditNoteModal({
  note,
  isOpen,
  onClose,
  onSuccess,
}: EditNoteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("💕");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setMood(note.mood || "💕");
      setError(null);
    }
  }, [note]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("notes")
        .update({
          content: content.trim(),
          mood,
        })
        .eq("id", note.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      await triggerRevalidate();
      onSuccess(data as Note);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen || !note) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full h-full sm:h-auto sm:max-w-md bg-[#fffdfa] p-6 pb-8 sm:p-8 sm:pb-8 sm:rounded-2xl shadow-2xl border border-amber-200/80 paper-torn flex flex-col justify-between overflow-y-auto max-h-[100vh] sm:max-h-[90vh]"
        >
          {/* Top Washi Tape */}
          <div className="washi-tape washi-pink absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 opacity-90 shadow-2xs rotate-[-1deg] hidden sm:block" />

          {/* Header with close button */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-rose-200">
            <div>
              <h2 className="font-accent text-3xl text-rose-950">
                edit catatan ✍️
              </h2>
              <p className="font-body text-xs text-rose-800/70">
                perbaiki kata atau suasana hati catatan
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-rose-100/70 hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-4 flex-grow">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 font-body text-xs sm:text-sm rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Mood selector */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1.5">
                Suasana Hati (Mood):
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableMoods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`text-xl p-2 rounded-full transition-all duration-150 ${
                      mood === m
                        ? "bg-rose-200 scale-110 shadow-xs border border-rose-300"
                        : "bg-white hover:bg-rose-50 border border-stone-200 opacity-70"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Field */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1">
                Isi Catatan Rahasia:
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                required
                placeholder="Tulis pesan rahasia kita..."
                className="w-full px-3 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white font-body-readable text-sm sm:text-base text-stone-800 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashed border-rose-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 font-body font-medium text-xs sm:text-sm text-stone-700 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="washi-tape washi-lavender px-6 py-2 rounded-full font-body font-medium text-xs sm:text-sm text-purple-950 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Menyimpan..." : "Simpan Catatan ✍️"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
