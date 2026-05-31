"use client";

import { useState, type KeyboardEvent } from "react";
import { Icons } from "./icons";

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function URLInput({ onSubmit, loading }: URLInputProps) {
  const [url, setUrl] = useState("");
  const isValid = url.trim().length > 0;

  const handleSubmit = () => {
    if (isValid && !loading) onSubmit(url.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="animate-fade-up max-w-[560px] mx-auto py-6 px-5 relative z-10">
      <div className="flex gap-0 bg-white rounded-xl shadow-card border border-border overflow-hidden">
        <label htmlFor="reel-url-input" className="sr-only">
          Instagram Reel URL
        </label>
        <input
          id="reel-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste Instagram Reel URL..."
          disabled={loading}
          className="flex-1 py-4 px-5 border-none outline-none font-body text-[15px] text-ink bg-transparent min-w-0 placeholder:text-ink-muted disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          aria-label="Extract recipe from URL"
          className="py-4 px-6 border-none font-body text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer disabled:cursor-default bg-terracotta text-white disabled:bg-cream-dark disabled:text-ink-muted hover:enabled:bg-terracotta-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Extract Recipe {Icons.arrow}
        </button>
      </div>
      <p className="text-center mt-3 text-xs text-ink-muted">
        Works with public Instagram Reels and Posts
      </p>
    </div>
  );
}
