import { Suspense } from "react";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FloatingParticles from "@/components/LazyFloatingParticles";

export default function MasukPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#fffaf5] paper-noise">
      {/* Floating particles */}
      <FloatingParticles count={14} />

      <header className="p-6 relative z-10 max-w-md mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-rose-700 border border-rose-200 text-sm font-body font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>kembali</span>
        </Link>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#fffefc] p-8 md:p-10 shadow-2xl border border-stone-200/80 paper-torn relative">
          {/* Top Washi Tape */}
          <div className="washi-tape washi-pink absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-5 opacity-90 shadow-2xs rotate-[-1deg]" />

          <div className="text-center mb-6">
            <span className="text-3xl inline-block mb-1">🗝️</span>
            <h1 className="font-accent text-4xl text-rose-950">
              pintu rahasia
            </h1>
            <p className="font-body text-sm text-rose-800/70 -mt-0.5">
              hanya untuk kita berdua
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-6 font-body text-sm text-rose-700/60">menyiapkan kunci rahasia...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <footer className="p-4 text-center relative z-10">
        <p className="font-body text-xs text-rose-900/50">
          tempat pulang paling tenang ‧₊˚❀
        </p>
      </footer>
    </div>
  );
}
