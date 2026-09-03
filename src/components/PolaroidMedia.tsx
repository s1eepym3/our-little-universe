"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";

export interface PolaroidMediaProps {
  url: string;
  type?: "image" | "video";
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|mov|webm|m4v|ogg)(\?.*)?$/i.test(url);
}

export default function PolaroidMedia({
  url,
  type,
  alt = "Kenangan Kita",
  sizes = "(max-width: 768px) 100vw, 500px",
  priority = false,
  className = "",
}: PolaroidMediaProps) {
  const isVideo = type === "video" || isVideoUrl(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isInView = useInView(videoRef, { amount: 0.4 });

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (isMobile) {
      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isMobile, isVideo]);

  if (isVideo) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-stone-900">
        <video
          ref={videoRef}
          src={url}
          muted
          loop
          playsInline
          autoPlay={!isMobile}
          preload={isMobile ? "metadata" : "auto"}
          className={`w-full h-full object-cover select-none pointer-events-none ${className}`}
        />
        {/* Tiny washi tape badge in bottom-right corner */}
        <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-xs washi-tape washi-pink font-body font-medium text-[10px] text-rose-950 shadow-2xs flex items-center gap-1 select-none pointer-events-none">
          ▶ video
        </span>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
