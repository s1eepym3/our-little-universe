"use client";

import React, { useState } from "react";
import { Moment, Note } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/app/actions";
import Link from "next/link";
import Image from "next/image";
import PolaroidMedia from "@/components/PolaroidMedia";
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  Lock,
  Globe,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditMomentModal from "./EditMomentModal";
import EditNoteModal from "./EditNoteModal";
import ConfirmDialog from "./ConfirmDialog";
import WashiTagChips from "@/components/WashiTagChips";

interface KelolaDeskProps {
  initialMoments: Moment[];
  initialNotes: Note[];
}

export default function KelolaDesk({
  initialMoments,
  initialNotes,
}: KelolaDeskProps) {
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  // Modals state
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Deletion state
  const [deletingMoment, setDeletingMoment] = useState<Moment | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Helper to extract bucket path from Supabase storage public URL
  const extractStoragePath = (url: string, bucket = "memories") => {
    try {
      const marker = `/${bucket}/`;
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(url.substring(idx + marker.length));
      }
    } catch (e) {
      console.error("Gagal membaca path storage:", e);
    }
    return null;
  };

  // Delete moment handler
  const handleConfirmDeleteMoment = async () => {
    if (!deletingMoment) return;
    setIsDeleting(true);

    try {
      const supabase = createClient();

      // 1. Delete image file from memories bucket if cover_url exists
      if (deletingMoment.cover_url) {
        const filePath = extractStoragePath(deletingMoment.cover_url);
        if (filePath) {
          await supabase.storage.from("memories").remove([filePath]);
        }
      }

      // 2. Delete database row (cascade deletes media rows)
      const { error } = await supabase
        .from("moments")
        .delete()
        .eq("id", deletingMoment.id);

      if (error) throw error;

      setMoments((prev) => prev.filter((m) => m.id !== deletingMoment.id));
      await triggerRevalidate();
      setDeletingMoment(null);
      showToast("Kenangan dilepas dengan sayang 🕊️");
    } catch (err: any) {
      alert("Gagal menghapus kenangan: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete note handler
  const handleConfirmDeleteNote = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", deletingNote.id);

      if (error) throw error;

      setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
      await triggerRevalidate();
      setDeletingNote(null);
      showToast("Catatan telah dihapus 🕊️");
    } catch (err: any) {
      alert("Gagal menghapus catatan: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMomentUpdate = (updatedMoment: Moment) => {
    setMoments((prev) =>
      prev.map((m) => (m.id === updatedMoment.id ? updatedMoment : m))
    );
    showToast("Kenangan diperbarui 💞");
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    showToast("Catatan diperbarui ✍️");
  };

  const isEverythingEmpty = moments.length === 0 && notes.length === 0;

  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Toast Notification Pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="washi-tape washi-pink px-6 py-2.5 rounded-full shadow-2xl border border-rose-200 text-rose-950 font-body font-medium text-sm sm:text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Back Link */}
      <div className="border-b border-dashed border-rose-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/ruang-kita"
            className="inline-flex items-center gap-1.5 font-body font-medium text-xs sm:text-sm text-rose-700 hover:text-rose-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>kembali ke meja jurnal</span>
          </Link>
          <h1 className="font-accent text-4xl sm:text-5xl text-rose-950 flex items-center gap-2">
            ruang kelola
            <span className="text-2xl">🗝️</span>
          </h1>
          <p className="font-body text-sm text-rose-800/70 -mt-0.5">
            tempat rapi-rapi kenangan kita
          </p>
        </div>

        {/* Action badge */}
        <div className="flex items-center gap-2">
          <span className="washi-tape washi-lavender px-3.5 py-1 text-xs sm:text-sm font-body font-medium text-purple-950 shadow-2xs rotate-[1deg]">
            ✨ Mode Kelola Rahasia
          </span>
        </div>
      </div>

      {isEverythingEmpty ? (
        <div className="text-center py-20 bg-[#fffdfa] rounded-3xl border border-rose-200/80 border-dashed paper-torn p-8 space-y-4">
          <span className="text-4xl block">✨</span>
          <h2 className="font-accent text-3xl text-rose-950">
            Belum ada yang perlu dirapikan ✨
          </h2>
          <p className="font-body text-sm text-stone-600 max-w-sm mx-auto">
            Scrapbook masih kosong dan tenang. Mulai tempel kenangan foto atau tulis catatan rahasia pertama kita.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/ruang-kita/upload"
              className="washi-tape washi-pink px-5 py-2 text-xs sm:text-sm font-body font-medium text-rose-950 shadow-xs"
            >
              + Tempel Foto
            </Link>
            <Link
              href="/ruang-kita/catatan?write=true"
              className="washi-tape washi-lavender px-5 py-2 text-xs sm:text-sm font-body font-medium text-purple-950 shadow-xs"
            >
              + Tulis Catatan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION A: KELOLA KENANGAN */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-accent text-2xl sm:text-3xl text-stone-900 flex items-center gap-2">
                kelola kenangan 🖼️
                <span className="text-sm font-body font-light text-rose-800/60">
                  ({moments.length} momen)
                </span>
              </h2>

              <Link
                href="/ruang-kita/upload"
                className="font-body font-medium text-xs sm:text-sm text-rose-600 hover:text-rose-800 hover:underline"
              >
                + tambah baru
              </Link>
            </div>

            {moments.length === 0 ? (
              <p className="font-body text-xs sm:text-sm text-stone-400 italic">
                Belum ada foto kenangan yang ditempel.
              </p>
            ) : (
              <div className="space-y-3">
                {moments.map((m) => (
                  <div
                    key={m.id}
                    className="relative bg-[#fffdfa] p-3.5 sm:p-4 rounded-xl shadow-xs hover:shadow-md transition-shadow border border-stone-200/80 paper-torn flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left details: Thumbnail + Title + Metadata */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xs overflow-hidden bg-rose-50 border border-stone-200/70 shrink-0">
                        {m.cover_url ? (
                          <PolaroidMedia
                            url={m.cover_url}
                            alt={m.title || "Kenangan"}
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📸
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-accent text-xl sm:text-2xl text-stone-900 leading-tight truncate">
                            {m.title || "Momen Tanpa Judul"}
                          </h3>

                          {/* Category Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-body text-rose-800 shrink-0">
                            {m.category === "first_trip" ? (
                              <>
                                <MapPin className="w-2.5 h-2.5 text-rose-600" />
                                <span>Tempat Kita</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                <span>Random Thing</span>
                              </>
                            )}
                          </span>

                          {/* Visibility badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body shrink-0 ${
                              m.is_public
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            {m.is_public ? (
                              <>
                                <Globe className="w-2.5 h-2.5" />
                                <span>Publik</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>Rahasia</span>
                              </>
                            )}
                          </span>
                        </div>

                        {m.caption && (
                          <p className="font-body text-xs text-stone-600 line-clamp-1">
                            "{m.caption}"
                          </p>
                        )}

                        {/* Stiker Rasa Tags */}
                        <WashiTagChips tags={m.tags} max={4} className="pt-0.5" />

                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-body text-stone-400 pt-0.5">
                          <span className="flex items-center gap-1 text-stone-600">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            <span>
                              {m.taken_at
                                ? new Date(m.taken_at).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : new Date(m.created_at).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                            </span>
                          </span>
                          {m.taken_at &&
                            new Date(m.taken_at).toDateString() !==
                              new Date(m.created_at).toDateString() && (
                              <span className="text-[10px] text-stone-400">
                                (diunggah{" "}
                                {new Date(m.created_at).toLocaleDateString("id-ID", {
                                  month: "short",
                                  day: "numeric",
                                })}
                                )
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* ALWAYS-VISIBLE ACTION BUTTONS */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-rose-100 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingMoment(m)}
                        className="washi-tape washi-lavender px-3.5 py-1.5 font-body font-medium text-xs sm:text-sm text-purple-950 shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>✏️ Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingMoment(m)}
                        className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-body font-medium text-xs sm:text-sm shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>🗑️ Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION B: KELOLA CATATAN */}
          <section className="space-y-4 pt-4 border-t border-dashed border-rose-200/80">
            <div className="flex items-center justify-between">
              <h2 className="font-accent text-2xl sm:text-3xl text-stone-900 flex items-center gap-2">
                kelola catatan 💌
                <span className="text-sm font-body font-light text-rose-800/60">
                  ({notes.length} catatan)
                </span>
              </h2>

              <Link
                href="/ruang-kita/catatan?write=true"
                className="font-body font-medium text-xs sm:text-sm text-rose-600 hover:text-rose-800 hover:underline"
              >
                + tulis baru
              </Link>
            </div>

            {notes.length === 0 ? (
              <p className="font-body text-xs sm:text-sm text-stone-400 italic">
                Belum ada catatan rahasia yang tersimpan.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="relative bg-[#fffef7] p-4 rounded-xl shadow-xs hover:shadow-md transition-shadow border border-amber-200/70 paper-torn flex flex-col justify-between space-y-3"
                  >
                    {/* Top note header with mood and date */}
                    <div className="flex items-center justify-between text-xs font-body text-stone-400 pb-2 border-b border-dashed border-amber-100">
                      <span className="text-xl select-none">{n.mood || "💌"}</span>
                      <span>
                        {new Date(n.created_at).toLocaleDateString("id-ID", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Note Content */}
                    <p className="font-body-readable text-stone-800 text-sm sm:text-base leading-relaxed line-clamp-3">
                      "{n.content}"
                    </p>

                    {/* ALWAYS-VISIBLE ACTION BUTTONS */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-amber-100">
                      <button
                        type="button"
                        onClick={() => setEditingNote(n)}
                        className="washi-tape washi-pink px-3 py-1 font-body font-medium text-xs sm:text-sm text-rose-950 shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>✏️ Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingNote(n)}
                        className="px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-body font-medium text-xs sm:text-sm shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>🗑️ Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Edit Moment Modal */}
      <EditMomentModal
        moment={editingMoment}
        isOpen={!!editingMoment}
        onClose={() => setEditingMoment(null)}
        onSuccess={handleMomentUpdate}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSuccess={handleNoteUpdate}
      />

      {/* Delete Moment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMoment}
        title="Hapus Kenangan?"
        message="Yakin hapus kenangan ini? Foto dan ceritanya akan hilang selamanya 💔"
        confirmLabel="Hapus Selamanya"
        cancelLabel="Batal Simpan"
        loading={isDeleting}
        onConfirm={handleConfirmDeleteMoment}
        onCancel={() => setDeletingMoment(null)}
      />

      {/* Delete Note Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingNote}
        title="Hapus Catatan?"
        message="Hapus catatan ini? Tinta yang sudah ditulis tidak bisa kembali 🥺"
        confirmLabel="Hapus Tinta"
        cancelLabel="Batal"
        loading={isDeleting}
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
}
