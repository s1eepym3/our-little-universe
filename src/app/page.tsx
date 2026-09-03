import { createClient } from "@/lib/supabase/server";
import { Moment } from "@/types/database";
import FloatingConstellation from "@/components/FloatingConstellation";
import FloatingParticles from "@/components/LazyFloatingParticles";
import SecretKnock from "@/components/SecretKnock";
import Link from "next/link";

export const revalidate = 60; // ISR 60 seconds

export default async function Home() {
  const supabase = await createClient();

  const { data: moments } = await supabase
    .from("moments")
    .select("*, media(*)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden animated-mesh-bg paper-noise flex flex-col justify-between">
      {/* Ambient floating hearts and sparkles particle layer */}
      <FloatingParticles count={20} />

      {/* Small handwritten title in top corner with secret knock easter egg */}
      <header className="fixed top-6 left-6 z-40">
        <div
          className="opacity-0 animate-[fadeIn_1.4s_ease-out_2s_forwards]"
          style={{ animationFillMode: "forwards" }}
        >
          <SecretKnock>
            <div>
              <span className="font-accent text-3xl md:text-4xl text-rose-900/80 drop-shadow-xs flex items-center gap-2">
                our little universe
              </span>
              <p className="font-body text-sm text-rose-800/60 font-normal -mt-1">
                every little second with you
              </p>
            </div>
          </SecretKnock>
        </div>
      </header>

      {/* Secret entrance to private journal desk in top-right */}
      <div className="fixed top-6 right-6 z-40">
        <Link
          href="/ruang-kita"
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/40 hover:bg-white/80 backdrop-blur-md border border-rose-200/50 shadow-xs transition-all duration-300 hover:scale-105"
        >
          <span className="text-base select-none">🗝️</span>
          <span className="font-accent text-xl text-rose-900/80 group-hover:text-rose-900">
            ruang kita
          </span>
        </Link>
      </div>

      {/* Main Living Constellation of Scattered Polaroids */}
      <main className="relative z-10 flex-grow flex items-center justify-center">
        <FloatingConstellation moments={(moments as Moment[]) || []} />
      </main>

      {/* Tiny subtle whisper at the bottom */}
      <footer className="relative z-20 pb-5 text-center pointer-events-none">
        <p className="font-body text-sm text-rose-900/60 font-light tracking-wide">
          sentuh foto untuk melihat kenangan kita ‧₊˚❀༉‧₊˚.
        </p>
      </footer>
    </div>
  );
}
