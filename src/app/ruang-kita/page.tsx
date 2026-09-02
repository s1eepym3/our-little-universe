import { createClient } from "@/lib/supabase/server";
import { Moment } from "@/types/database";
import { triggerRevalidate } from "@/app/actions";
import ScrapbookGrid from "./ScrapbookGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RuangKitaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter as string | undefined;

  const supabase = await createClient();

  let query = supabase
    .from("moments")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "first_trip" || filter === "random") {
    query = query.eq("category", filter);
  }

  const { data: moments } = await query;

  const deleteMoment = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;

    const supabase = await createClient();
    await supabase.from("moments").delete().eq("id", id);
    await triggerRevalidate();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Title & Washi Tape Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-dashed border-rose-200/80 pb-5">
        <div>
          <h1 className="font-handwriting text-4xl text-rose-950 flex items-center gap-2">
            album kenangan
            <span className="text-xl">🌸</span>
          </h1>
          <p className="font-handwriting text-lg text-rose-800/70 -mt-1">
            setiap potongan memori yang kita simpan bersama
          </p>
        </div>

        {/* Washi Tape Strip Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/ruang-kita"
            className={`washi-tape px-4 py-1.5 font-handwriting text-base transition-all duration-200 rotate-[-1deg] ${
              !filter
                ? "washi-pink text-rose-950 font-bold scale-105 shadow-sm"
                : "bg-white/80 text-stone-600 hover:bg-rose-50"
            }`}
          >
            Semua Foto
          </Link>

          <Link
            href="/ruang-kita?filter=first_trip"
            className={`washi-tape px-4 py-1.5 font-handwriting text-base transition-all duration-200 rotate-[1deg] ${
              filter === "first_trip"
                ? "washi-lavender text-purple-950 font-bold scale-105 shadow-sm"
                : "bg-white/80 text-stone-600 hover:bg-rose-50"
            }`}
          >
            ✈️ First Adventures
          </Link>

          <Link
            href="/ruang-kita?filter=random"
            className={`washi-tape px-4 py-1.5 font-handwriting text-base transition-all duration-200 rotate-[-2deg] ${
              filter === "random"
                ? "washi-cream text-amber-950 font-bold scale-105 shadow-sm"
                : "bg-white/80 text-stone-600 hover:bg-rose-50"
            }`}
          >
            ✨ Random Things
          </Link>
        </div>
      </div>

      {/* Living Scrapbook Grid */}
      <ScrapbookGrid
        moments={(moments as Moment[]) || []}
        deleteAction={deleteMoment}
      />
    </div>
  );
}
