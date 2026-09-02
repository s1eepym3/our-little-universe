import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Image as ImageIcon, PenLine, PlusCircle, LogOut, Home } from "lucide-react";

export default async function RuangKitaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a3e3d] paper-noise relative flex flex-col justify-between overflow-x-hidden selection:bg-rose-200">
      {/* Warm radial light source at top center */}
      <div className="fixed inset-0 desk-light pointer-events-none z-0" />

      {/* Top Header with cozy aesthetic */}
      <header className="relative z-20 px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white/95 border border-rose-200/60 shadow-xs transition-all duration-300 hover:scale-105"
        >
          <Home className="w-4 h-4 text-rose-500" />
          <span className="font-handwriting text-lg text-rose-900">
            kembali ke semesta
          </span>
        </Link>

        {/* Center desk seal */}
        <div className="flex items-center gap-2">
          <span className="washi-tape washi-pink px-4 py-1 text-sm font-handwriting text-rose-900 shadow-xs rotate-[-1deg]">
            meja jurnal kita 💌
          </span>
        </div>

        {/* User indicator */}
        <div className="text-right">
          <span className="font-handwriting text-base text-rose-800/80">
            dua hati, satu ruang
          </span>
        </div>
      </header>

      {/* Main Content Desk Area with padding for bottom nav */}
      <main className="relative z-10 flex-grow pb-32 max-w-5xl mx-auto w-full px-4 md:px-8">
        {children}
      </main>

      {/* Floating Glassmorphism Pill Bottom Navigation */}
      <nav
        aria-label="Private Dashboard Navigation"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/85 backdrop-blur-xl border border-rose-200/80 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 sm:gap-4 select-none hover:shadow-rose-100/50 transition-shadow duration-300"
      >
        <Link
          href="/ruang-kita"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-rose-900 hover:bg-rose-100/70 transition-all duration-200 group active:scale-95"
        >
          <ImageIcon className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="font-handwriting text-lg">Kenangan</span>
        </Link>

        <span className="text-rose-200 select-none">•</span>

        <Link
          href="/ruang-kita/catatan"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-rose-900 hover:bg-rose-100/70 transition-all duration-200 group active:scale-95"
        >
          <PenLine className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="font-handwriting text-lg">Catatan</span>
        </Link>

        <span className="text-rose-200 select-none">•</span>

        <Link
          href="/ruang-kita/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200/60 transition-all duration-200 active:scale-95 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-handwriting text-lg font-medium">Upload</span>
        </Link>

        <span className="text-rose-200 select-none">•</span>

        <form action="/auth/signout" method="post" className="inline">
          <button
            type="submit"
            title="Keluar dari ruang kita"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-stone-500 hover:text-red-500 hover:bg-red-50/70 transition-all duration-200 active:scale-95 group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-handwriting text-base hidden sm:inline">Keluar</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
