import UploadForm from "./UploadForm";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div className="border-b border-dashed border-rose-200/80 pb-4">
        <h1 className="font-accent text-4xl text-rose-950 flex items-center gap-2">
          tempel kenangan baru
          <span className="text-xl">💌</span>
        </h1>
        <p className="font-body text-sm text-rose-800/70 -mt-0.5">
          selipkan foto atau video ke dalam buku harian kita
        </p>
      </div>

      <div className="relative bg-[#fffdfa] p-6 md:p-10 shadow-xl border border-stone-200 paper-torn">
        {/* Washi tape accent on top corner */}
        <div className="washi-tape washi-lavender absolute -top-3 left-10 w-28 h-5 opacity-90 shadow-2xs rotate-[-2deg]" />
        
        <UploadForm />
      </div>
    </div>
  );
}
