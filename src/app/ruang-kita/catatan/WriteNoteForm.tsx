"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { triggerRevalidate } from "@/app/actions";

const moods = ["😊", "🥺", "😂", "💕", "🧸", "🦋", "🌸"];

export default function WriteNoteForm() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("💕");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("notes").insert({
        content: content.trim(),
        mood,
        author_id: user.id,
      });
      await triggerRevalidate();
    }

    setLoading(false);
    router.push("/ruang-kita/catatan");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-dashed border-rose-200">
        <Link
          href="/ruang-kita/catatan"
          className="font-handwriting text-lg text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> batal menulis
        </Link>
        <span className="font-handwriting text-base text-stone-500">
          surat untuk kita berdua
        </span>
      </div>

      <div>
        <label className="block font-handwriting text-xl text-rose-950 mb-2">
          Mood kamu saat menulis ini:
        </label>
        <div className="flex gap-2.5 flex-wrap">
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`text-2xl p-2.5 rounded-full transition-all duration-200 ${
                mood === m
                  ? "bg-rose-200/90 scale-125 shadow-sm border border-rose-300"
                  : "bg-white/80 hover:bg-rose-50 border border-stone-200 hover:scale-105 opacity-70 hover:opacity-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-handwriting text-xl text-rose-950 mb-1">
          Isi catatan:
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Tulis sesuatu yang ingin kamu bisikkan, atau cerita yang ingin kita kenang nanti..."
          required
          className="w-full px-4 py-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-[#fffefc] resize-none font-handwriting text-2xl text-stone-800 leading-relaxed placeholder:font-handwriting placeholder:text-stone-400 placeholder:text-xl"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full washi-tape washi-pink py-3 font-handwriting text-2xl text-rose-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-heart-spin inline-block">💖</span>{" "}
              Menyimpan catatan...
            </span>
          ) : (
            "💌 Tempel Catatan Ini"
          )}
        </button>
      </div>
    </form>
  );
}
