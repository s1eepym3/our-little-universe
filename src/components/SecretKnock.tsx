"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface SecretKnockProps {
  children: React.ReactNode;
  className?: string;
  hintPosition?: "bottom" | "top";
}

export default function SecretKnock({
  children,
  className = "",
  hintPosition = "bottom",
}: SecretKnockProps) {
  const [taps, setTaps] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [hintText, setHintText] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const navigateToSecretRoom = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.push("/ruang-kita/kelola");
      } else {
        router.push("/masuk?callbackUrl=/ruang-kita/kelola");
      }
    } catch {
      router.push("/masuk?callbackUrl=/ruang-kita/kelola");
    }
  };

  // Keyboard shortcut listener: Ctrl + Shift + K or Cmd + Shift + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "K" || e.key === "k")
      ) {
        e.preventDefault();
        setIsBursting(true);
        setTimeout(() => {
          navigateToSecretRoom();
        }, 400);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Keep it secret - don't trigger parent link clicks if any
    e.preventDefault();
    e.stopPropagation();

    // Haptic vibration feedback for mobile if supported
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(30);
      } catch {
        // ignore if not allowed by browser permissions
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const nextTaps = taps + 1;
    setTaps(nextTaps);

    // Taps 1-2: tiny wiggle
    if (nextTaps === 1 || nextTaps === 2) {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 140);
    }

    // Tap 3: hint 1
    if (nextTaps === 3) {
      setHintText("2 ketukan lagi... 💫");
    }

    // Tap 4: hint 2
    if (nextTaps === 4) {
      setHintText("1 ketukan lagi... ✨");
    }

    // Tap 5: burst & navigate!
    if (nextTaps >= 5) {
      setIsBursting(true);
      setHintText("pintu rahasia terbuka... 🗝️");
      setTimeout(() => {
        navigateToSecretRoom();
      }, 420);
      return;
    }

    // Reset after 1.5 seconds if no more taps occur
    timeoutRef.current = setTimeout(() => {
      setTaps(0);
      setHintText("");
      setIsWiggling(false);
    }, 1500);
  };

  return (
    <div className="relative inline-block">
      <motion.div
        onClick={handleTap}
        animate={
          isWiggling
            ? { rotate: [-1.2, 1.2, -0.8, 0.8, 0] }
            : isBursting
            ? { scale: [1, 1.08, 0.96, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: isWiggling ? 0.14 : 0.4 }}
        style={{
          cursor: "default",
          userSelect: "none",
          WebkitTouchCallout: "none",
          touchAction: "manipulation",
        }}
        className={`select-none ${className}`}
      >
        {children}
      </motion.div>

      {/* Secret Hint bubble */}
      <AnimatePresence>
        {hintText && (
          <motion.div
            initial={{ opacity: 0, y: hintPosition === "bottom" ? 6 : -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`absolute ${
              hintPosition === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5"
            } left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none`}
          >
            <div className="px-2.5 py-1 rounded-full bg-rose-900/90 text-white font-accent text-sm shadow-lg backdrop-blur-xs flex items-center gap-1">
              <span>{hintText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini heart & sparkle burst on 5th tap */}
      <AnimatePresence>
        {isBursting && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
            {["💖", "✨", "💫", "🌸", "🗝️"].map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.4,
                  x: (i - 2) * 28,
                  y: -30 - Math.random() * 25,
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute text-lg select-none"
              >
                {item}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
