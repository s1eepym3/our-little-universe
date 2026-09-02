import { createClient } from "@/lib/supabase/server";
import { Moment } from "@/types/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientRandomGrid from "./ClientRandomGrid";
import FloatingParticles from "@/components/FloatingParticles";

export const revalidate = 60;

export default async function MomentsPage() {
  const supabase = await createClient();

  const { data: moments } = await supabase
    .from("moments")
    .select("*")
    .eq("is_public", true);

  const typedMoments = (moments as Moment[]) || [];

  const firstAdventures = typedMoments.filter((m) => m.category === "first_trip");
  const randomThings = typedMoments.filter((m) => m.category === "random");

  return (
    <div className="min-h-screen pb-32 bg-[#fffdfa] paper-noise relative overflow-x-hidden">
      {/* Gentle floating romantic particles in background */}
      <FloatingParticles count={14} />

      {/* Header */}
      <header className="p-6 md:p-10 max-w-6xl mx-auto flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-rose-200 shadow-xs transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-handwriting text-lg text-rose-950">
            kembali ke semesta
          </span>
        </Link>

        <span className="washi-tape washi-pink px-4 py-1 text-sm font-handwriting text-rose-900 shadow-2xs rotate-[-1deg]">
          buku perjalanan kita 📖
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-24 relative z-10">
        {/* SECTION A: First Adventures */}
        <section>
          <div className="mb-10 text-center md:text-left border-b border-dashed border-rose-200/80 pb-4">
            <h2 className="font-handwriting text-4xl md:text-5xl text-rose-950 flex items-center justify-center md:justify-start gap-2">
              perjalanan pertama kita
              <span className="text-2xl">✈️</span>
            </h2>
            <p className="font-handwriting text-xl text-rose-800/70 -mt-1">
              jejak langkah terawal, kota baru, dan debar yang sama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {firstAdventures.length > 0 ? (
              firstAdventures.map((moment, idx) => (
                <div
                  key={moment.id}
                  style={{
                    transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                  }}
                  className="relative bg-[#fdfbf7] p-5 pb-8 shadow-xl border border-stone-200/80 paper-torn transition-transform hover:scale-[1.02] hover:rotate-0 duration-300 group"
                >
                  {/* Washi tape on top */}
                  <div className="washi-tape washi-lavender absolute -top-3 left-10 w-24 h-5 opacity-90 shadow-2xs rotate-[-2deg]" />

                  {moment.cover_url && (
                    <div className="aspect-[4/3] rounded-xs overflow-hidden mb-4 relative border border-stone-200/60 bg-rose-50/50">
                      <img
                        src={moment.cover_url}
                        alt={moment.title || "First Adventure"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  )}

                  <div className="px-1 space-y-1 text-center md:text-left">
                    <h3 className="font-handwriting text-3xl text-stone-800">
                      {moment.title || "Perjalanan Indah"}
                    </h3>
                    {moment.caption && (
                      <p className="font-handwriting text-xl text-stone-600 leading-relaxed">
                        "{moment.caption}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-rose-800/60 bg-white/60 rounded-3xl border border-rose-200/80 border-dashed paper-torn">
                <span className="text-4xl block mb-2">🗺️</span>
                <p className="font-handwriting text-2xl">
                  Belum ada catatan perjalanan pertama yang ditempel.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION B: Random Little Things */}
        <section>
          <div className="mb-10 text-center md:text-left border-b border-dashed border-rose-200/80 pb-4">
            <h2 className="font-handwriting text-4xl md:text-5xl text-rose-950 flex items-center justify-center md:justify-start gap-2">
              hal-hal kecil tak terduga
              <span className="text-2xl">🌸</span>
            </h2>
            <p className="font-handwriting text-xl text-rose-800/70 -mt-1">
              tawa mendadak, foto buram, dan jutaan detik sederhana bersamamu
            </p>
          </div>

          <ClientRandomGrid moments={randomThings} />
        </section>
      </div>
    </div>
  );
}
