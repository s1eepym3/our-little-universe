import { createClient } from "@/lib/supabase/server";
import { Note } from "@/types/database";
import Link from "next/link";
import { PenLine, Dice5, Heart } from "lucide-react";
import WriteNoteForm from "./WriteNoteForm";
import AnimatedNotebookEmptyState from "./AnimatedNotebookEmptyState";

export const dynamic = "force-dynamic";

export default async function CatatanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const isWriting = resolvedSearchParams.write === "true";

  const supabase = await createClient();

  // Get total count
  const { count } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true });

  let randomNote: Note | null = null;

  if (count && count > 0 && !isWriting) {
    const { data: allNotes } = await supabase.from("notes").select("*");
    if (allNotes && allNotes.length > 0) {
      randomNote = allNotes[Math.floor(Math.random() * allNotes.length)] as Note;
    }
  }

  // Random rotation for the pinned note card (-2.5deg to +2.5deg)
  const randomRotation = (Math.random() - 0.5) * 5;

  return (
    <div className="max-w-xl mx-auto py-4 space-y-8">
      {/* Header with Title & Celebration Badge */}
      <div className="flex items-center justify-between border-b border-dashed border-rose-200/80 pb-4">
        <div>
          <h1 className="font-accent text-4xl text-rose-950 flex items-center gap-2">
            catatan kecil kita
            <span className="text-xl">💌</span>
          </h1>
          <p className="font-body text-sm text-rose-800/70 -mt-0.5">
            pesan rahasia yang tersimpan di balik meja
          </p>
        </div>

        {count !== null && count > 0 && (
          <div className="washi-tape washi-cream px-3 py-1 font-body font-medium text-xs sm:text-sm text-amber-900 shadow-2xs rotate-[2deg] flex items-center gap-1.5">
            <span>✨ {count} catatan tertulis</span>
          </div>
        )}
      </div>

      {/* Main Area: Writing Form OR Pinned Note OR Empty State */}
      <div className="pt-2">
        {isWriting ? (
          <div className="relative bg-[#fffdfa] p-6 md:p-8 shadow-xl border border-stone-200 paper-torn">
            {/* Top Washi Tape */}
            <div className="washi-tape washi-lavender absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 opacity-90 shadow-xs rotate-[-1deg]" />
            <WriteNoteForm />
          </div>
        ) : randomNote ? (
          <div className="relative flex flex-col items-center">
            {/* Actual Paper Note Pinned with Thumbtack SVG */}
            <div
              style={{
                transform: `rotate(${randomRotation}deg)`,
                transition: "transform 0.4s ease",
              }}
              className="relative w-full bg-[#fffef5] p-8 md:p-12 shadow-2xl border border-amber-200/60 paper-torn group select-none"
            >
              {/* Brass / Rose Gold Thumbtack SVG */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-md">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="18" cy="18" r="14" fill="#d97706" />
                  <circle cx="18" cy="18" r="11" fill="#f59e0b" />
                  <circle cx="15" cy="15" r="4" fill="#fef3c7" opacity="0.8" />
                  <path
                    d="M18 29L18 35"
                    stroke="#78350f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Note Mood Top-Right */}
              {randomNote.mood && (
                <div className="absolute top-4 right-5 text-3xl filter drop-shadow-xs select-none">
                  {randomNote.mood}
                </div>
              )}

              {/* Note Content */}
              <div className="pt-3 pb-4 text-center">
                <p className="font-body-readable text-xl md:text-2xl text-stone-800 leading-relaxed tracking-normal">
                  "{randomNote.content}"
                </p>
              </div>

              {/* Date Written */}
              <div className="pt-6 border-t border-dashed border-amber-200/80 text-center">
                <p className="font-body font-light text-xs sm:text-sm text-stone-500">
                  ditulis dengan cinta •{" "}
                  {new Date(randomNote.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Sticker / Washi Tape Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <Link
                href="/ruang-kita/catatan"
                className="washi-tape washi-pink px-5 py-2.5 font-body font-medium text-sm sm:text-base text-rose-950 hover:scale-105 active:scale-95 transition-all shadow-md rotate-[-2deg] flex items-center gap-2"
              >
                <Dice5 className="w-4 h-4" />
                <span>🎲 Note Lain</span>
              </Link>

              <Link
                href="/ruang-kita/catatan?write=true"
                className="washi-tape washi-lavender px-5 py-2.5 font-body font-medium text-sm sm:text-base text-purple-950 hover:scale-105 active:scale-95 transition-all shadow-md rotate-[1.5deg] flex items-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                <span>✏️ Tulis Baru</span>
              </Link>

              <button
                type="button"
                className="w-11 h-11 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-200 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Favorit"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </button>
            </div>
          </div>
        ) : (
          <AnimatedNotebookEmptyState />
        )}
      </div>
    </div>
  );
}
