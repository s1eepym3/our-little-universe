import { createClient } from "@/lib/supabase/server";
import { Moment } from "@/types/database";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, X, Sparkles, MapPin } from "lucide-react";
import ClientRandomGrid from "./ClientRandomGrid";
import FloatingParticles from "@/components/LazyFloatingParticles";
import WashiTagChips from "@/components/WashiTagChips";
import { getTagFrequencies, normalizeTag } from "@/lib/tags";

export const revalidate = 60;

const tagCloudColors = [
  "bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100",
  "bg-purple-50 text-purple-900 border-purple-200/90 hover:bg-purple-100",
  "bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100",
  "bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100",
  "bg-sky-50 text-sky-900 border-sky-200/90 hover:bg-sky-100",
];

export default async function MomentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTag = resolvedSearchParams?.tag
    ? normalizeTag(resolvedSearchParams.tag)
    : null;

  const supabase = await createClient();

  const { data: moments } = await supabase
    .from("moments")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const typedMoments = (moments as Moment[]) || [];

  // Tag Cloud aggregation (calculated server-side in JS)
  const tagFrequencies = getTagFrequencies(typedMoments);

  // If a tag is active, filter matching moments
  const filteredMoments = activeTag
    ? typedMoments.filter(
        (m) =>
          Array.isArray(m.tags) &&
          m.tags.some((t) => normalizeTag(t) === activeTag)
      )
    : [];

  const tempatKitaMoments = typedMoments.filter(
    (m) => m.category === "first_trip"
  );
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
          <span className="font-body font-medium text-sm text-rose-950">
            kembali ke semesta
          </span>
        </Link>

        <span className="washi-tape washi-pink px-4 py-1 text-base font-accent text-rose-950 shadow-2xs rotate-[-1deg]">
          buku perjalanan kita 📖
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16 relative z-10">
        {/* ==================================================== */}
        {/* TAG CLOUD: "jelajahi rasa ☁️" */}
        {/* ==================================================== */}
        <section className="bg-[#fffefc]/80 p-6 md:p-8 rounded-2xl border border-rose-200/70 shadow-xs paper-torn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-dashed border-rose-200/80">
            <div>
              <h2 className="font-accent text-3xl sm:text-4xl text-rose-950 flex items-center gap-2">
                jelajahi rasa
                <span className="text-2xl">☁️</span>
              </h2>
              <p className="font-body text-xs sm:text-sm text-rose-800/70 -mt-0.5">
                stiker suasana dari setiap detik manis kita
              </p>
            </div>

            {activeTag && (
              <Link
                href="/moments"
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-body font-medium transition-all shadow-2xs hover:scale-105"
              >
                <X className="w-3 h-3 text-rose-600" />
                <span>hapus filter rasa</span>
              </Link>
            )}
          </div>

          {tagFrequencies.length === 0 ? (
            <p className="font-body text-xs sm:text-sm text-rose-800/60 italic text-center py-4">
              belum ada stiker rasa... mulai tempel dari kenangan pertama kalian ✨
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {tagFrequencies.map((item, idx) => {
                const isActive = activeTag === item.tag;
                const colorClass =
                  tagCloudColors[idx % tagCloudColors.length];
                const rotation =
                  idx % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1deg]";

                // Font size scaling subtly with usage: 0.8rem to 1.08rem
                const fontSizeRem = Math.min(
                  1.08,
                  0.8 + (item.count - 1) * 0.08
                );

                return (
                  <Link
                    key={item.tag}
                    href={isActive ? "/moments" : `/moments?tag=${encodeURIComponent(item.tag)}`}
                    style={{ fontSize: `${fontSizeRem}rem` }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xs border font-body font-medium transition-all shadow-2xs hover:scale-105 ${rotation} ${
                      isActive
                        ? "washi-tape washi-pink text-rose-950 scale-105 ring-2 ring-rose-400 font-semibold"
                        : `${colorClass} hover:rotate-0`
                    }`}
                  >
                    <span>#{item.tag}</span>
                    <span className="text-[10px] opacity-60 font-light ml-0.5">
                      ({item.count})
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* CONDITIONAL CONTENT: FILTERED VIEW vs DEFAULT SECTIONS */}
        {/* ==================================================== */}
        {activeTag ? (
          /* FILTERED MOMENTS SECTION */
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center md:text-left border-b border-dashed border-rose-200/80 pb-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-accent text-3xl md:text-4xl text-rose-950 flex items-center gap-2">
                  {filteredMoments.length} kenangan beraroma &apos;{activeTag}&apos;
                  <span className="text-2xl">☕</span>
                </h2>
                <p className="font-body text-sm text-rose-800/70 -mt-0.5">
                  koleksi memori dengan stiker suasana #{activeTag}
                </p>
              </div>

              <Link
                href="/moments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 text-xs font-body font-medium shadow-2xs transition-all hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
                <span>tampilkan semua kategori</span>
              </Link>
            </div>

            {filteredMoments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredMoments.map((moment, idx) => (
                  <Link
                    key={moment.id}
                    href={`/moments/${moment.id}`}
                    style={{
                      transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                    }}
                    className="block relative bg-[#fdfbf7] p-4 pb-6 shadow-lg hover:shadow-2xl border border-stone-200/80 paper-torn transition-all hover:scale-[1.03] hover:rotate-0 duration-300 group"
                  >
                    {/* Washi tape */}
                    <div className="washi-tape washi-lavender absolute -top-2.5 left-8 w-20 h-4 opacity-90 shadow-2xs rotate-[-2deg]" />

                    {moment.cover_url && (
                      <div className="aspect-[4/3] rounded-xs overflow-hidden mb-3 relative border border-stone-200/60 bg-rose-50/50">
                        <Image
                          src={moment.cover_url}
                          alt={moment.title || "Kenangan"}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1 text-[11px] font-body text-stone-400">
                        <span className="flex items-center gap-1">
                          {moment.category === "first_trip" ? (
                            <>
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>Tempat Kita</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Random</span>
                            </>
                          )}
                        </span>
                        <span>
                          {new Date(moment.created_at).toLocaleDateString(
                            "id-ID",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>

                      <h3 className="font-accent text-xl sm:text-2xl text-stone-900 group-hover:text-rose-900 transition-colors truncate">
                        {moment.title || "Momen Manis"}
                      </h3>

                      {moment.caption && (
                        <p className="font-body text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                          &ldquo;{moment.caption}&rdquo;
                        </p>
                      )}

                      {/* Washi Tags on Card */}
                      <WashiTagChips tags={moment.tags} max={3} className="pt-2" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-rose-800/60 bg-white/60 rounded-3xl border border-rose-200/80 border-dashed paper-torn space-y-2">
                <span className="text-4xl block">🔍</span>
                <p className="font-body text-base text-rose-800/80">
                  Belum ada kenangan dengan stiker &apos;{activeTag}&apos; ✨
                </p>
                <p className="font-body text-xs text-stone-500">
                  Coba pilih stiker rasa lain di atas atau kembali ke buku kenangan utama.
                </p>
              </div>
            )}
          </section>
        ) : (
          /* DEFAULT TWO SECTIONS */
          <>
            {/* SECTION A: Tempat Kita */}
            <section className="space-y-10">
              <div className="text-center md:text-left border-b border-dashed border-rose-200/80 pb-4">
                <h2 className="font-accent text-4xl md:text-5xl text-rose-950 flex items-center justify-center md:justify-start gap-2">
                  tempat kita
                  <span className="text-2xl">☕</span>
                </h2>
                <p className="font-body text-sm sm:text-base text-rose-800/70 -mt-0.5">
                  Setiap tempat yang pernah kita singgahi bersama — dari kafe sudut kota sampai pantai yang kita datangi sore-sore.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {tempatKitaMoments.length > 0 ? (
                  tempatKitaMoments.map((moment, idx) => (
                    <Link
                      key={moment.id}
                      href={`/moments/${moment.id}`}
                      style={{
                        transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                      }}
                      className="block relative bg-[#fdfbf7] p-5 pb-8 shadow-xl border border-stone-200/80 paper-torn transition-transform hover:scale-[1.02] hover:rotate-0 duration-300 group"
                    >
                      {/* Washi tape on top */}
                      <div className="washi-tape washi-lavender absolute -top-3 left-10 w-24 h-5 opacity-90 shadow-2xs rotate-[-2deg]" />

                      {moment.cover_url && (
                        <div className="aspect-[4/3] rounded-xs overflow-hidden mb-4 relative border border-stone-200/60 bg-rose-50/50">
                          <Image
                            src={moment.cover_url}
                            alt={moment.title || "Tempat Kita"}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        </div>
                      )}

                      <div className="px-1 space-y-1 text-center md:text-left">
                        <h3 className="font-accent text-2xl sm:text-3xl text-stone-800 group-hover:text-rose-950 transition-colors">
                          {moment.title || "Sudut Manis"}
                        </h3>
                        {moment.caption && (
                          <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed">
                            &ldquo;{moment.caption}&rdquo;
                          </p>
                        )}

                        {/* Washi Tags on Card */}
                        <WashiTagChips
                          tags={moment.tags}
                          max={3}
                          clickable
                          className="pt-2 justify-center md:justify-start"
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-rose-800/60 bg-white/60 rounded-3xl border border-rose-200/80 border-dashed paper-torn">
                    <span className="text-4xl block mb-2">☕</span>
                    <p className="font-body text-base text-rose-800/70">
                      Belum ada tempat yang kita tandai... mau mulai dari kafe favorit minggu ini? ☕
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION B: Random Little Things */}
            <section className="space-y-10">
              <div className="text-center md:text-left border-b border-dashed border-rose-200/80 pb-4">
                <h2 className="font-accent text-4xl md:text-5xl text-rose-950 flex items-center justify-center md:justify-start gap-2">
                  hal-hal kecil tak terduga
                  <span className="text-2xl">🌸</span>
                </h2>
                <p className="font-body text-sm sm:text-base text-rose-800/70 -mt-0.5">
                  tawa mendadak, foto buram, dan jutaan detik sederhana bersamamu
                </p>
              </div>

              <ClientRandomGrid moments={randomThings} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
