"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidate } from "@/app/actions";
import { convertHeicToJpeg, isHeicFile } from "@/lib/heicConverter";
import { CheckCircle2, Heart } from "lucide-react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<"first_trip" | "random">("random");
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);

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
      // 1. Convert HEIC to JPEG if needed
      let uploadableFile = file;
      if (isHeicFile(file)) {
        setStatusMessage("Mengonversi foto iPhone (.HEIC) ke .JPG...");
        uploadableFile = await convertHeicToJpeg(file, (msg) => setStatusMessage(msg));
      }

      setProgress(40);
      setStatusMessage("Menyelipkan foto ke bucket memori...");

      // 2. Upload directly to Supabase Storage bucket 'memories'
      const fileExt = uploadableFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${category}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, uploadableFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(75);
      setStatusMessage("Menyimpan detail kenangan di scrapbook...");

      // 3. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("memories").getPublicUrl(filePath);

      // 4. Insert metadata to 'moments' DB
      const { data: momentData, error: momentError } = await supabase
        .from("moments")
        .insert({
          title: title.trim() || null,
          caption: caption.trim() || null,
          category,
          is_public: isPublic,
          cover_url: publicUrl,
        })
        .select()
        .single();

      if (momentError) throw momentError;

      // Also insert to media table
      await supabase.from("media").insert({
        moment_id: momentData.id,
        type: uploadableFile.type.startsWith("video") ? "video" : "image",
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
        setCategory("random");
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
          + Upload Foto Lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 font-body text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* DROP ZONE: Open Love-Letter Envelope Design */}
      <div className="relative">
        <label className="block font-accent text-2xl text-rose-950 mb-2">
          Pilih Foto atau Video:
        </label>

        <div className="relative group cursor-pointer">
          <input
            id="scrapbook-file"
            type="file"
            accept="image/*,video/*,.heic,.heif"
            required
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="sr-only"
          />

          <label
            htmlFor="scrapbook-file"
            className="block relative cursor-pointer select-none"
          >
            {/* Open Envelope Illustration Container */}
            <div className="relative w-full min-h-[220px] bg-[#fffaf0] border-2 border-dashed border-rose-300 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-[#fff7ed]">
              {/* Envelope Back Flap folded up */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-rose-200/40 rounded-b-3xl -mt-2 border-b border-rose-300/60 pointer-events-none" />

              {/* Center Content / Polaroid sticking out */}
              {previewUrl ? (
                <div className="relative w-36 aspect-[4/3] bg-white p-2 pb-5 rounded-xs shadow-md border border-stone-200 rotate-[-2deg] mb-2 group-hover:rotate-0 transition-transform">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
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
                    {file ? file.name : "Selipkan foto ke dalam amplop..."}
                  </p>
                  <p className="font-body text-xs sm:text-sm text-rose-700/70 max-w-xs">
                    Sentuh atau tarik file ke sini (Mendukung iPhone .HEIC, JPG, PNG, MP4)
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
      </div>

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
              Bisa dilihat di halaman depan
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

      {/* Progress Bar during upload */}
      {loading && (
        <div className="space-y-2 pt-2">
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button styled as Washi Tape / Wax Seal */}
      <div className="pt-3 text-center">
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full washi-tape washi-pink py-3.5 font-body font-medium text-base sm:text-lg text-rose-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rotate-[-0.5deg]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-heart-spin inline-block text-2xl">💖</span>
              {statusMessage || "Menyelipkan foto..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-rose-800" /> Tempel Kenangan Ini
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
