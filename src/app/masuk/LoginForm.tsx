"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const callbackUrl = searchParams.get("callbackUrl");
  const destination = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/ruang-kita";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(destination);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 font-body text-sm rounded-xl border border-red-200 text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          Email:
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 font-body text-sm text-stone-800"
          placeholder="kita@love.com"
        />
      </div>

      <div>
        <label className="block font-accent text-2xl text-rose-950 mb-1">
          Kunci Rahasia (Password):
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 font-body text-sm text-stone-800"
          placeholder="••••••••"
        />
      </div>

      <div className="pt-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full washi-tape washi-pink py-3 font-body font-medium text-base sm:text-lg text-rose-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-heart-spin inline-block text-2xl">💖</span>
              Membuka pintu...
            </span>
          ) : (
            "🗝️ Buka Pintu Kita"
          )}
        </button>
      </div>
    </form>
  );
}
