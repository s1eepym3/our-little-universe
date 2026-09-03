import { createClient } from "@/lib/supabase/server";
import { Moment, Media } from "@/types/database";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Calendar, MapPin, Sparkles } from "lucide-react";
import FloatingParticles from "@/components/LazyFloatingParticles";
import WashiTagChips from "@/components/WashiTagChips";

export const dynamic = "force-dynamic";

export default async function MomentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: moment } = await supabase
    .from("moments")
    .select("*, media(*)")
    .eq("id", id)
    .single();

  const typedMoment = moment as (Moment & { media: Media[] }) | null;

  return (
    <div className="min-h-screen pb-24 bg-[#fffaf5] animated-mesh-bg paper-noise relative overflow-x-hidden flex flex-col justify-between">
      {/* Floating particles in background */}
      <FloatingParticles count={14} />

      {/* Top Header Navigation */}
      <header className="p-6 md:p-8 max-w-4xl mx-auto w-full flex items-center justify-between relative z-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-rose-200 shadow-xs transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-body font-medium text-sm text-rose-950">
            kembali ke semesta
          </span>
        </Link>

        <Link
          href="/moments"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-rose-200 shadow-xs transition-all duration-200 hover:scale-105"
        >
          <BookOpen className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="font-body font-medium text-sm text-purple-950">
            semua kenangan
          </span>
        </Link>
      </header>

      {/* Main Focused Moment Area */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10 max-w-3xl mx-auto w-full">
        {!typedMoment ? (
          <div className="bg-[#fffdfa] p-10 md:p-14 shadow-2xl border border-stone-200 paper-torn text-center max-w-md mx-auto space-y-4">
            <span className="text-5xl block animate-bounce">🔍</span>
            <h1 className="font-accent text-3xl text-rose-950">
              Kenangan Tidak Ditemukan
            </h1>
            <p className="font-body text-sm text-stone-600 leading-relaxed">
              Momen ini mungkin telah tersimpan di ruang rahasia lain atau belum pernah terabadikan.
            </p>
            <div className="pt-4">
              <Link
                href="/moments"
                className="washi-tape washi-pink px-6 py-2.5 font-body font-medium text-sm text-rose-950 inline-block shadow-sm hover:scale-105 transition-transform"
              >
                Buka Buku Kenangan 📖
              </Link>
            </div>
          </div>
        ) : (
          <article className="relative w-full bg-[#fdfbf7] p-5 sm:p-8 md:p-10 shadow-2xl border border-stone-200/90 paper-torn transition-all">
            {/* Top Washi Tape */}
            <div className="washi-tape washi-pink absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 md:w-40 h-6 opacity-95 shadow-sm rotate-[-1deg] z-20" />

            {/* Public or Category badge */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-dashed border-rose-200/70 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 font-body font-medium text-xs text-rose-800">
                {typedMoment.category === "first_trip" ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tempat Kita</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Random Little Thing</span>
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1.5 font-body font-light text-xs sm:text-sm text-stone-500">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {new Date(typedMoment.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Photo Canvas - Large and Clear */}
            {typedMoment.cover_url && (
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-rose-50/70 rounded-sm overflow-hidden border border-stone-200/80 shadow-inner mb-6">
                <Image
                  src={typedMoment.cover_url}
                  alt={typedMoment.title || "Kenangan Kita"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Handwritten Title and Story */}
            <div className="space-y-3 text-center sm:text-left pt-2">
              <h1 className="font-accent text-3xl sm:text-4xl md:text-5xl text-stone-900 leading-tight">
                {typedMoment.title || "Momen Tanpa Judul"}
              </h1>

              {typedMoment.caption && (
                <p className="font-body-readable text-lg sm:text-xl md:text-2xl text-stone-700 leading-relaxed pt-1">
                  "{typedMoment.caption}"
                </p>
              )}

              {/* Stiker Rasa Tags */}
              <WashiTagChips
                tags={typedMoment.tags}
                max={5}
                clickable
                size="sm"
                className="pt-2 justify-center sm:justify-start"
              />
            </div>

            {/* Sweet Footer Whisper */}
            <div className="mt-8 pt-4 border-t border-dashed border-rose-200/60 flex items-center justify-between text-xs font-body text-stone-400">
              <span>bagian dari semesta kita</span>
              <span>✨ selamanya tersimpan</span>
            </div>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center relative z-10">
        <p className="font-body text-xs text-rose-900/50">
          setiap detik bersamamu adalah rumah ‧₊˚❀
        </p>
      </footer>
    </div>
  );
}
