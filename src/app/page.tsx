"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Recipe, ExtractionError } from "@/types/recipe";
import { AppHeader } from "@/components/app-header";
import { URLInput } from "@/components/url-input";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { RecipeCard } from "@/components/recipe-card";

type AppState = "idle" | "loading" | "done" | "error";

const LOADING_STEP_INTERVAL = 2200;
const LOADING_STEP_COUNT = 6;

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<ExtractionError | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLoading = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    setLoadingStep(0);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step < LOADING_STEP_COUNT) {
        setLoadingStep(step);
      } else {
        stopLoading();
      }
    }, LOADING_STEP_INTERVAL);
  }, [stopLoading]);

  const handleSubmit = async (url: string) => {
    setState("loading");
    setError(null);
    startLoading();

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || "Something went wrong. Please try again.",
          code: data.code || "UNKNOWN",
        } as ExtractionError;
      }

      stopLoading();
      setRecipe(data as Recipe);
      setState("done");
    } catch (err: unknown) {
      stopLoading();
      if (err && typeof err === "object" && "code" in err) {
        setError(err as ExtractionError);
      } else {
        setError({
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          code: "UNKNOWN",
        });
      }
      setState("error");
    }
  };

  const handleReset = () => {
    stopLoading();
    setState("idle");
    setRecipe(null);
    setError(null);
  };

  useEffect(() => () => stopLoading(), [stopLoading]);

  return (
    <div className="grain min-h-screen pb-10">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-20 bg-gradient-to-r from-terracotta via-sage to-terracotta-light"
        aria-hidden="true"
      />

      <AppHeader />

      <main>
        {(state === "idle" || state === "loading") && (
          <URLInput onSubmit={handleSubmit} loading={state === "loading"} />
        )}

        {state === "loading" && <LoadingState step={loadingStep} />}

        {state === "error" && error && (
          <ErrorState error={error} onRetry={handleReset} />
        )}

        {state === "done" && recipe && (
          <RecipeCard recipe={recipe} onNewRecipe={handleReset} />
        )}

        {state === "done" && (
          <URLInput onSubmit={handleSubmit} loading={false} />
        )}
      </main>
    </div>
  );
}
