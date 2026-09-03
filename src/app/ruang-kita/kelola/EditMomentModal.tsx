"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moment } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { convertHeicToJpeg, isHeicFile } from "@/lib/heicConverter";
import { triggerRevalidate } from "@/app/actions";
import { cleanTags } from "@/lib/tags";
import TagInput from "@/components/TagInput";
import { X, Camera, Sparkles } from "lucide-react";
import Image from "next/image";

interface EditMomentModalProps {
  moment: Moment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedMoment: Moment) => void;
}

export default function EditMomentModal({
  moment,
  isOpen,
  onClose,
  onSuccess,
}: EditMomentModalProps) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<"first_trip" | "random">("random");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("moments")
      .select("tags")
      .then(({ data }) => {
        if (data) {
          const all: string[] = [];
          data.forEach((m) => {
            if (Array.isArray(m.tags)) all.push(...m.tags);
          });
          setAvailableTags(all);
        }
      });
  }, []);

  useEffect(() => {
    if (moment) {
      setTitle(moment.title || "");
      setCaption(moment.caption || "");
      setCategory(moment.category);
      setTags(moment.tags || []);
      setIsPublic(moment.is_public ?? true);
      setPreviewUrl(moment.cover_url || null);
      setNewFile(null);
      setError(null);
      setStatusMsg("");
    }
  }, [moment]);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setError(null);

    let processedFile = file;
    if (isHeicFile(file)) {
      setStatusMsg("Mengonversi foto iPhone (.HEIC)...");
      processedFile = await convertHeicToJpeg(file, (msg) => setStatusMsg(msg));
    }

    setNewFile(processedFile);
    setPreviewUrl(URL.createObjectURL(processedFile));
    setStatusMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moment) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let coverUrl = moment.cover_url;

      // 1. If user selected a new photo, upload to memories bucket
      if (newFile) {
        setStatusMsg("Mengunggah foto baru...");
        const cleanName = newFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `moments/${Date.now()}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from("memories")
          .upload(filePath, newFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error("Gagal mengunggah foto baru: " + uploadError.message);
        }

        const { data: publicData } = supabase.storage
          .from("memories")
          .getPublicUrl(filePath);

        coverUrl = publicData.publicUrl;

        // Upsert media entry
        await supabase.from("media").insert({
          moment_id: moment.id,
          type: "image",
          url: coverUrl,
        });
      }

      // 2. Update moment in database
      setStatusMsg("Menyimpan perubahan kenangan...");
      const cleanedTags = cleanTags(tags);
      const { data: updatedData, error: updateError } = await supabase
        .from("moments")
        .update({
          title: title.trim() || null,
          caption: caption.trim() || null,
          category,
          is_public: isPublic,
          cover_url: coverUrl,
          tags: cleanedTags,
        })
        .eq("id", moment.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      await triggerRevalidate();
      onSuccess(updatedData as Moment);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  if (!isOpen || !moment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full h-full sm:h-auto sm:max-w-lg bg-[#fffdfa] p-6 pb-8 sm:p-8 sm:pb-8 sm:rounded-2xl shadow-2xl border border-rose-200/80 paper-torn flex flex-col justify-between overflow-y-auto max-h-[100vh] sm:max-h-[92vh]"
        >
          {/* Top Washi Tape */}
          <div className="washi-tape washi-lavender absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-5 opacity-90 shadow-2xs rotate-[-1deg] hidden sm:block" />

          {/* Header with close button */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-rose-200">
            <div>
              <h2 className="font-accent text-3xl text-rose-950">
                edit kenangan ✏️
              </h2>
              <p className="font-body text-xs text-rose-800/70">
                perbarui foto, judul, atau catatan cerita
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

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-4 pt-4 flex-grow">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 font-body text-xs sm:text-sm rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Photo Preview & Replacement */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1.5">
                Foto Kenangan:
              </label>

              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <div className="relative w-28 aspect-[4/3] rounded-xs overflow-hidden border border-stone-300 shadow-sm bg-stone-100 shrink-0">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 aspect-[4/3] rounded-xs border border-dashed border-stone-300 flex items-center justify-center text-2xl bg-rose-50/50 shrink-0">
                    📸
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <label
                    htmlFor="edit-moment-photo"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 font-body font-medium text-xs cursor-pointer transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ganti Foto</span>
                  </label>
                  <input
                    id="edit-moment-photo"
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <p className="font-body text-[11px] text-stone-500">
                    Mendukung JPG, PNG, atau iPhone .HEIC
                  </p>
                </div>
              </div>

              {statusMsg && (
                <p className="font-body text-xs text-purple-700 animate-pulse mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {statusMsg}
                </p>
              )}
            </div>

            {/* Title Field */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1">
                Judul Momen:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul kenangan kita..."
                className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white font-body text-sm text-stone-800 placeholder:text-stone-400"
              />
            </div>

            {/* Caption Field */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1">
                Cerita / Catatan Manis:
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Cerita atau debar saat foto ini diambil..."
                className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white font-body-readable text-sm text-stone-800 placeholder:text-stone-400 resize-none leading-relaxed"
              />
            </div>

            {/* Stiker Rasa (Tags) Field */}
            <div>
              <label className="block font-accent text-xl text-rose-950 mb-1">
                Stiker Rasa:
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                availableTags={availableTags}
                placeholder="tambah stiker rasa... (kafe, hujan, tugas)"
              />
            </div>

            {/* Category Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-accent text-lg text-rose-950 mb-1">
                  Kategori:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white font-body text-xs sm:text-sm text-stone-800 focus:outline-none"
                >
                  <option value="first_trip">☕ Tempat Kita</option>
                  <option value="random">✨ Random Things</option>
                </select>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/60">
                <div>
                  <span className="block font-body font-medium text-xs text-rose-950">
                    Tampil Publik?
                  </span>
                  <span className="font-body text-[10px] text-stone-500">
                    Bisa dilihat di depan
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
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
                disabled={loading}
                className="washi-tape washi-pink px-6 py-2 rounded-full font-body font-medium text-xs sm:text-sm text-rose-950 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan 💞"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
