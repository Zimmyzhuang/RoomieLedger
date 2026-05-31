"use client";

import type { KeyboardEvent } from "react";
import { Icons } from "./icons";

interface ServingsControlProps {
  servings: number;
  baseServings: number;
  onChange: (value: number) => void;
}

export function ServingsControl({
  servings,
  baseServings,
  onChange,
}: ServingsControlProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(servings + 1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(1, servings - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(baseServings * 4);
    }
  };

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Servings adjustment"
    >
      <button
        onClick={() => onChange(Math.max(1, servings - 1))}
        aria-label="Decrease servings"
        className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center cursor-pointer text-ink transition-all hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      >
        {Icons.minus}
      </button>
      <span
        role="spinbutton"
        aria-valuenow={servings}
        aria-valuemin={1}
        aria-label={`${servings} servings`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`min-w-[32px] text-center text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded ${
          servings !== baseServings ? "text-terracotta" : "text-ink"
        }`}
      >
        {servings}
      </span>
      <button
        onClick={() => onChange(servings + 1)}
        aria-label="Increase servings"
        className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center cursor-pointer text-ink transition-all hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      >
        {Icons.plus}
      </button>
      {servings !== baseServings && (
        <button
          onClick={() => onChange(baseServings)}
          aria-label={`Reset to ${baseServings} servings`}
          className="animate-fade-in w-7 h-7 rounded-md border-none bg-cream flex items-center justify-center cursor-pointer text-ink-muted ml-1 hover:text-terracotta transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          {Icons.reset}
        </button>
      )}
    </div>
  );
}
