"use client";

import React, { useState, useMemo, KeyboardEvent } from "react";
import { normalizeTag, cleanTags, MAX_TAGS_PER_MOMENT } from "@/lib/tags";
import { X, Sparkles, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

const washiStickerColors = [
  "bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100/80",
  "bg-purple-50 text-purple-900 border-purple-200/90 hover:bg-purple-100/80",
  "bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100/80",
  "bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/80",
  "bg-sky-50 text-sky-900 border-sky-200/90 hover:bg-sky-100/80",
];

export default function TagInput({
  tags,
  onChange,
  availableTags = [],
  maxTags = MAX_TAGS_PER_MOMENT,
  placeholder = "tambah stiker rasa... (kafe, hujan, tugas)",
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const isFull = tags.length >= maxTags;

  // Compute top autocomplete suggestions filtered by input and not already selected
  const suggestions = useMemo(() => {
    if (!availableTags || availableTags.length === 0) return [];

    // Count frequency of available tags
    const freq = new Map<string, number>();
    for (const t of availableTags) {
      const norm = normalizeTag(t);
      if (norm) {
        freq.set(norm, (freq.get(norm) || 0) + 1);
      }
    }

    const currentNormalizedSet = new Set(tags.map((t) => normalizeTag(t)));
    const search = normalizeTag(inputValue);

    return Array.from(freq.entries())
      .filter(([tag]) => !currentNormalizedSet.has(tag))
      .filter(([tag]) => (search ? tag.includes(search) : true))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [availableTags, tags, inputValue]);

  const handleAddTag = (raw: string) => {
    if (isFull || disabled) return;
    const norm = normalizeTag(raw);
    if (!norm) return;

    // Check duplicate
    if (tags.some((t) => normalizeTag(t) === norm)) {
      setInputValue("");
      return;
    }

    const updated = cleanTags([...tags, norm]);
    onChange(updated);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Backspace removes last chip if input is empty
      handleRemoveTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Input container with chips inside */}
      <div className="w-full min-h-[46px] p-2 bg-[#fffdfa] rounded-xl border border-rose-200/90 focus-within:ring-2 focus-within:ring-rose-300 focus-within:border-transparent transition-all flex flex-wrap items-center gap-1.5 shadow-2xs">
        {tags.map((tag, idx) => {
          const colorClass = washiStickerColors[idx % washiStickerColors.length];
          const rotation = idx % 2 === 0 ? "-rotate-1" : "rotate-1";

          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border text-xs font-body font-medium shadow-2xs transition-transform ${colorClass} ${rotation}`}
            >
              <span>#{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer text-current opacity-70 hover:opacity-100"
                  aria-label={`Hapus stiker ${tag}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          );
        })}

        {/* Text Input */}
        {!isFull && !disabled ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) handleAddTag(inputValue);
            }}
            placeholder={tags.length === 0 ? placeholder : "tambah lagi..."}
            className="flex-1 min-w-[140px] bg-transparent border-none outline-none font-body text-xs sm:text-sm text-stone-800 placeholder:text-stone-400/80 px-1 py-0.5"
          />
        ) : isFull ? (
          <span className="font-body text-[11px] text-stone-400 italic px-1">
            (maksimal {maxTags} stiker rasa ✨)
          </span>
        ) : null}
      </div>

      {/* Autocomplete / Suggested Stiker Rasa */}
      {suggestions.length > 0 && !isFull && !disabled && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="font-body text-[11px] text-rose-800/70 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            stiker saran:
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-xs bg-white hover:bg-rose-50 border border-dashed border-rose-200 text-stone-600 hover:text-rose-900 font-body text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <Plus className="w-2.5 h-2.5 opacity-60" />
              <span>#{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
