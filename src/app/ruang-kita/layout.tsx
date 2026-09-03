import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Image as ImageIcon, PenLine, PlusCircle, LogOut, Home } from "lucide-react";
import SecretKnock from "@/components/SecretKnock";

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
          <span className="font-body font-medium text-sm text-rose-900">
            kembali ke semesta
          </span>
        </Link>

        {/* Center desk seal */}
        <div className="flex items-center gap-2">
          <span className="washi-tape washi-pink px-4 py-1 text-base font-accent text-rose-950 shadow-xs rotate-[-1deg]">
            meja jurnal kita 💌
          </span>
        </div>

        {/* User indicator & Secret Knock to Management Room */}
        <div className="text-right">
          <SecretKnock hintPosition="bottom">
            <span className="font-body text-xs text-rose-800/80 cursor-default select-none">
              dua hati, satu ruang
            </span>
          </SecretKnock>
        </div>
      </header>

      {/* Main Content Desk Area with padding for bottom nav */}
      <main className="relative z-10 flex-grow pb-32 max-w-5xl mx-auto w-full px-4 md:px-8">
        {children}
      </main>

      {/* Floating Glassmorphism Pill Bottom Navigation */}
      <nav
        aria-label="Private Dashboard Navigation"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/85 backdrop-blur-xl border border-rose-200/80 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 sm:gap-4 select-none hover:shadow-rose-100/50 transition-shadow duration-300 max-md:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] max-md:w-[calc(100vw-1rem)] max-md:px-3 max-md:gap-1.5 max-md:py-2 max-w-full justify-center whitespace-nowrap overflow-x-auto"
      >
        <Link
          href="/ruang-kita"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-rose-900 hover:bg-rose-100/70 transition-all duration-200 group active:scale-95 shrink-0"
        >
          <ImageIcon className="w-5 h-5 max-md:w-4 max-md:h-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-body font-medium text-sm sm:text-base max-md:text-[11px]">Kenangan</span>
        </Link>

        <span className="text-rose-200 select-none max-md:hidden">•</span>

        <Link
          href="/ruang-kita/catatan"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-rose-900 hover:bg-rose-100/70 transition-all duration-200 group active:scale-95 shrink-0"
        >
          <PenLine className="w-5 h-5 max-md:w-4 max-md:h-4 text-purple-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-body font-medium text-sm sm:text-base max-md:text-[11px]">Catatan</span>
        </Link>

        <span className="text-rose-200 select-none max-md:hidden">•</span>

        <Link
          href="/ruang-kita/upload"
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200/60 transition-all duration-200 active:scale-95 group shrink-0"
        >
          <PlusCircle className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
          <span className="font-body font-medium text-sm sm:text-base max-md:text-[11px]">Upload</span>
        </Link>

        <span className="text-rose-200 select-none max-md:hidden">•</span>

        <form action="/auth/signout" method="post" className="inline shrink-0">
          <button
            type="submit"
            title="Keluar dari ruang kita"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-stone-500 hover:text-red-500 hover:bg-red-50/70 transition-all duration-200 active:scale-95 group shrink-0"
          >
            <LogOut className="w-4 h-4 max-md:w-4 max-md:h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            <span className="font-body font-medium text-xs sm:text-sm max-md:text-[11px] hidden sm:inline">Keluar</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
