"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/app/actions";
import { convertHeicToJpeg, isHeicFile } from "@/lib/heicConverter";
import { cleanTags } from "@/lib/tags";
import TagInput from "@/components/TagInput";
import { CheckCircle2, Heart } from "lucide-react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [category, setCategory] = useState<"first_trip" | "random">("random");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
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

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);

    const isVideo =
      selectedFile.type.startsWith("video") ||
      /\.(mp4|mov|webm|m4v)$/i.test(selectedFile.name);

    if (isVideo) {
      const sizeInMB = selectedFile.size / (1024 * 1024);
      if (sizeInMB > 50) {
        setError("videonya kebesaran sayang... potong dulu ya 💕");
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setStatusMessage("Video terdeteksi! Siap menghidupkan polaroid ✨");
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      return;
    }

    // If it's a HEIC file, give instant feedback
    if (isHeicFile(selectedFile)) {
      setStatusMessage("Foto HEIC terdeteksi. Akan otomatis dikonversi saat upload.");
    } else {
      setStatusMessage("");
    }

    setFile(selectedFile);

    // Create object URL for preview if it's not raw HEIC
    if (!isHeicFile(selectedFile) && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(15);

    try {
      const isVideo =
        file.type.startsWith("video") ||
        /\.(mp4|mov|webm|m4v)$/i.test(file.name);

      // 1. Convert HEIC to JPEG if needed (skip for video)
      let uploadableFile = file;
      if (!isVideo && isHeicFile(file)) {
        setStatusMessage("Mengonversi foto iPhone (.HEIC) ke .JPG...");
        uploadableFile = await convertHeicToJpeg(file, (msg) => setStatusMessage(msg));
      }

      setProgress(40);
      setStatusMessage(isVideo ? "Menyelipkan video ke bucket memori..." : "Menyelipkan foto ke bucket memori...");

      // 2. Upload directly to Supabase Storage bucket 'memories'
      const fileExt = uploadableFile.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${category}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, uploadableFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: uploadableFile.type || (isVideo ? "video/mp4" : "image/jpeg"),
        });

      if (uploadError) throw uploadError;

      setProgress(75);
      setStatusMessage("Menyimpan detail kenangan di scrapbook...");

      // 3. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("memories").getPublicUrl(filePath);

      // 4. Insert metadata to 'moments' DB
      const cleanedTags = cleanTags(tags);
      const momentPayload: any = {
        title: title.trim() || null,
        caption: caption.trim() || null,
        category,
        is_public: isPublic,
        cover_url: publicUrl,
        tags: cleanedTags,
      };

      if (takenAt.trim()) {
        momentPayload.taken_at = takenAt.trim();
      }

      const { data: momentData, error: momentError } = await supabase
        .from("moments")
        .insert(momentPayload)
        .select()
        .single();

      if (momentError) throw momentError;

      // Also insert to media table
      await supabase.from("media").insert({
        moment_id: momentData.id,
        type: isVideo ? "video" : "image",
        url: publicUrl,
      });

      setProgress(100);
      setSuccess(true);
      setStatusMessage("");

      // Revalidate public landing and timeline
      await triggerRevalidate();

      // Reset form after short delay
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setPreviewUrl(null);
        setTitle("");
        setCaption("");
        setTakenAt("");
        setCategory("random");
        setTags([]);
        setIsPublic(true);
        setProgress(0);
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan kenangan. Coba lagi ya!");
      setProgress(0);
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="font-accent text-3xl sm:text-4xl text-rose-950">
          Tersimpan Indah di Semesta Kita!
        </h2>
        <p className="font-body text-sm text-rose-800/80 max-w-sm">
          Momen ini telah terselip rapi ke dalam scrapbook kenangan.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="washi-tape washi-pink px-6 py-2.5 font-body font-medium text-sm sm:text-base text-rose-950 shadow-md hover:scale-105 active:scale-95 transition-all mt-4"
        >
          Upload Kenangan Lain 💌
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo/Video Dropzone Card */}
      <div className="relative">
        <div className="washi-tape washi-pink absolute -top-3 left-8 w-24 h-5 opacity-90 rotate-[-1deg] z-10" />

        <label className="block relative cursor-pointer group">
          <input
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm,.heic,.heif"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div className="border-2 border-dashed border-rose-300 group-hover:border-rose-400 bg-white/70 p-6 sm:p-8 rounded-2xl text-center transition-all duration-300 paper-torn relative overflow-hidden group-hover:bg-white/90 shadow-sm">
            {previewUrl ? (
              <div className="relative w-44 h-44 mx-auto rounded-lg overflow-hidden border border-rose-200/80 shadow-md">
                {file && (file.type.startsWith("video") || /\.(mp4|mov|webm|m4v)$/i.test(file.name)) ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="block text-center font-body text-xs text-stone-500 mt-1">
                  {file?.name.slice(0, 16)}...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="w-16 h-16 rounded-full bg-rose-100/80 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  💌
                </div>
                <p className="font-accent text-2xl text-rose-950">
                  {file ? file.name : "Selipkan foto atau video ke dalam amplop..."}
                </p>
                <p className="font-body text-xs sm:text-sm text-rose-700/70 max-w-xs">
                  Sentuh atau tarik file ke sini (iPhone .HEIC, JPG, PNG, MP4 maks 50MB)
                </p>
              </div>
            )}

            {/* Washi tape accent on envelope */}
            <div className="washi-tape washi-lavender absolute -bottom-2 right-8 w-20 h-4 opacity-85 rotate-[-2deg]" />
          </div>
        </label>
      </div>

      {statusMessage && (
        <p className="font-body text-xs sm:text-sm text-purple-800 mt-2 animate-pulse flex items-center gap-1.5">
          <span>✨</span> {statusMessage}
        </p>
      )}

      {/* Title Field */}
      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          Judul Momen (opsional):
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. sore santai di pinggir danau..."
          className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-[#fffdfa] font-body text-sm sm:text-base text-stone-800 placeholder:text-stone-400"
        />
      </div>

      {/* Date Field (taken_at) */}
      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          tanggal kenangan ini... (opsional)
        </label>
        <input
          type="date"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-[#fffdfa] font-body text-sm sm:text-base text-stone-800"
        />
        <p className="font-body text-[11px] text-stone-500 mt-1">
          Kosongkan jika momen terjadi hari ini 🗓️
        </p>
      </div>

      {/* Caption Field */}
      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          Cerita / Catatan Manis:
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="Ceritakan sedikit rasa atau tawa saat momen ini terjadi..."
          className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-[#fffdfa] font-body text-sm sm:text-base text-stone-800 placeholder:text-stone-400 resize-none leading-relaxed"
        />
      </div>

      {/* Stiker Rasa (Tags) Field */}
      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          Stiker Rasa:
        </label>
        <TagInput
          tags={tags}
          onChange={setTags}
          availableTags={availableTags}
          placeholder="tambah stiker rasa... (kafe, hujan, tugas)"
        />
        <p className="font-body text-[11px] text-stone-500 mt-1">
          Opsional. Beri stiker suasana agar kenangan mudah dicari kembali ✨
        </p>
      </div>

      {/* Category and Public Toggle in cozy card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-[#fffbf5] p-3.5 rounded-xl border border-rose-200/80">
          <label className="block font-accent text-xl text-rose-950 mb-1">
            Kategori Album:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white font-body text-sm sm:text-base text-stone-800 focus:outline-none"
          >
            <option value="first_trip">☕ Tempat Kita</option>
            <option value="random">✨ Random Little Things</option>
          </select>
        </div>

        <div className="bg-[#fffbf5] p-3.5 rounded-xl border border-rose-200/80 flex items-center justify-between">
          <div>
            <span className="block font-body font-medium text-sm sm:text-base text-rose-950">
              Tampil di Publik?
            </span>
            <span className="font-body text-xs text-stone-500">
              {isPublic ? "Bisa dilihat di semesta luar ✦" : "Hanya untuk kita berdua 🔒"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-body text-sm">
          {error}
        </div>
      )}

      {/* Progress Bar when uploading */}
      {loading && (
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-rose-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-body text-xs text-rose-800/80 text-right">
            {progress}% terunggah
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full sm:w-auto washi-tape washi-pink px-8 py-3.5 font-body font-medium text-base text-rose-950 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Menyimpan ke memori...</span>
          ) : (
            <>
              <Heart className="w-5 h-5 text-rose-700 fill-rose-600 animate-pulse" />
              <span>Sematkan ke Semesta Kita</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
