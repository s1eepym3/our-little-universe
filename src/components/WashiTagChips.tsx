import React from "react";
import Link from "next/link";

interface WashiTagChipsProps {
  tags?: string[] | null;
  max?: number;
  clickable?: boolean;
  className?: string;
  size?: "xs" | "sm";
}

const stickerTones = [
  "bg-rose-50/90 text-rose-800 border-rose-200/80",
  "bg-purple-50/90 text-purple-800 border-purple-200/80",
  "bg-amber-50/90 text-amber-800 border-amber-200/80",
  "bg-emerald-50/90 text-emerald-800 border-emerald-200/80",
  "bg-sky-50/90 text-sky-800 border-sky-200/80",
];

export default function WashiTagChips({
  tags,
  max = 3,
  clickable = false,
  className = "",
  size = "xs",
}: WashiTagChipsProps) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

  const visibleTags = tags.slice(0, max);
  const remainingCount = tags.length - max;

  const textSize = size === "sm" ? "text-xs px-2.5 py-1" : "text-[11px] px-2 py-0.5";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visibleTags.map((tag, idx) => {
        const tone = stickerTones[idx % stickerTones.length];
        const rot = idx % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1deg]";

        const chipContent = (
          <span
            className={`inline-flex items-center rounded-xs border font-body font-medium shadow-2xs transition-transform ${tone} ${textSize} ${rot} ${
              clickable ? "hover:scale-105 hover:rotate-0" : ""
            }`}
          >
            #{tag}
          </span>
        );

        if (clickable) {
          return (
            <Link
              key={tag}
              href={`/moments?tag=${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}
            >
              {chipContent}
            </Link>
          );
        }

        return <span key={tag}>{chipContent}</span>;
      })}

      {remainingCount > 0 && (
        <span className="font-body text-[10px] text-stone-400 font-light select-none">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
