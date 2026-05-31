"use client";

import { useState } from "react";
import type { Recipe } from "@/types/recipe";
import { Icons } from "./icons";
import { ServingsControl } from "./servings-control";
import { formatAmount } from "@/lib/format";

interface RecipeCardProps {
  recipe: Recipe;
  onNewRecipe: () => void;
}

export function RecipeCard({ recipe, onNewRecipe }: RecipeCardProps) {
  const [servings, setServings] = useState(recipe.baseServings || 4);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [checkedIngs, setCheckedIngs] = useState<Set<number>>(new Set());
  const ratio = servings / (recipe.baseServings || 4);

  const toggleStep = (n: number) =>
    setCheckedSteps((prev) => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });

  const toggleIng = (i: number) =>
    setCheckedIngs((prev) => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });

  return (
    <div className="animate-fade-up max-w-[600px] mx-auto mt-6 mb-10 px-4 relative z-10">
      <article className="bg-white rounded-2xl shadow-card-lg border border-border overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-terracotta to-terracotta-dark p-7 pb-7 text-white">
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {recipe.tags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium py-0.5 px-2.5 bg-white/[.18] rounded-full tracking-wide uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h2 className="font-display text-[26px] font-bold leading-tight mb-2">
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="text-sm opacity-90 leading-relaxed font-light">
              {recipe.description}
            </p>
          )}
          <div className="flex gap-5 mt-4 flex-wrap text-[13px] font-medium">
            {recipe.prepTime && (
              <span className="flex items-center gap-1.5 opacity-90">
                {Icons.clock} Prep: {recipe.prepTime}
              </span>
            )}
            {recipe.cookTime && (
              <span className="flex items-center gap-1.5 opacity-90">
                {Icons.clock} Cook: {recipe.cookTime}
              </span>
            )}
            <span className="flex items-center gap-1.5 opacity-90">
              {Icons.users} {servings} serving{servings !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-7">
          {/* Servings adjuster */}
          <div className="flex items-center justify-between py-3.5 px-4.5 bg-cream rounded-[10px] mb-7">
            <span className="text-sm font-medium text-ink-light">
              Adjust servings
            </span>
            <ServingsControl
              servings={servings}
              baseServings={recipe.baseServings || 4}
              onChange={setServings}
            />
          </div>

          {/* Ingredients */}
          <section aria-label="Ingredients">
            <h3 className="font-display text-lg font-semibold text-ink mb-3.5 flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-terracotta rounded-sm" />
              Ingredients
            </h3>
            <ul className="grid gap-0.5 mb-8 list-none p-0">
              {recipe.ingredients?.map((ing, i) => {
                const checked = checkedIngs.has(i);
                return (
                  <li
                    key={i}
                    onClick={() => toggleIng(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleIng(i);
                      }
                    }}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    className={`flex items-center gap-3 py-2.5 px-3.5 rounded-lg cursor-pointer transition-all select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      i % 2 === 0 ? "bg-bg" : "bg-transparent"
                    } ${checked ? "opacity-45" : "opacity-100"}`}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center transition-all ${
                        checked
                          ? "bg-sage border-none text-white"
                          : "bg-transparent border-[1.5px] border-border"
                      }`}
                      aria-hidden="true"
                    >
                      {checked && Icons.check}
                    </div>
                    <span
                      className={`text-[15px] ${checked ? "line-through" : ""}`}
                    >
                      <strong className="font-semibold text-terracotta-dark">
                        {formatAmount(ing.amount * ratio)}
                        {ing.unit ? ` ${ing.unit}` : ""}
                      </strong>{" "}
                      {ing.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Steps */}
          <section aria-label="Instructions">
            <h3 className="font-display text-lg font-semibold text-ink mb-3.5 flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-terracotta rounded-sm" />
              Instructions
            </h3>
            <ol className="grid gap-1.5 list-none p-0">
              {recipe.steps?.map((step, i) => {
                const checked = checkedSteps.has(step.number);
                return (
                  <li
                    key={i}
                    onClick={() => toggleStep(step.number)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleStep(step.number);
                      }
                    }}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    className={`flex gap-3.5 py-3.5 px-4 rounded-[10px] cursor-pointer transition-all select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      checked
                        ? "bg-cream border border-cream-dark opacity-55"
                        : "bg-transparent border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-display text-[13px] font-semibold transition-all mt-px ${
                        checked
                          ? "bg-sage text-white border-none"
                          : "bg-transparent border-2 border-border text-ink-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {checked ? Icons.check : step.number}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-[15px] leading-relaxed ${checked ? "line-through" : ""}`}
                      >
                        {step.instruction}
                      </p>
                      {step.duration && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-muted mt-1">
                          {Icons.clock} {step.duration}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Source attribution */}
          {recipe.source && (
            <div className="mt-8 py-4 px-4.5 bg-cream rounded-[10px] flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ink-muted font-medium mb-0.5">
                  Original source
                </p>
                <p className="text-sm font-medium text-ink">
                  {recipe.source.creatorName ||
                    recipe.source.handle ||
                    "Instagram Reel"}
                  {recipe.source.handle && recipe.source.creatorName && (
                    <span className="text-ink-muted font-normal">
                      {" "}
                      {recipe.source.handle}
                    </span>
                  )}
                </p>
              </div>
              <a
                href={recipe.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-terracotta no-underline hover:text-terracotta-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                View Reel {Icons.link}
              </a>
            </div>
          )}
        </div>
      </article>

      <div className="text-center mt-6">
        <button
          onClick={onNewRecipe}
          className="py-3 px-7 bg-transparent text-ink-muted border-[1.5px] border-border rounded-[10px] text-sm font-medium cursor-pointer transition-all hover:border-terracotta hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Extract Another Recipe
        </button>
      </div>
    </div>
  );
}
