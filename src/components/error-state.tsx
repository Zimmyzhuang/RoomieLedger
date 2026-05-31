import type { ExtractionError } from "@/types/recipe";

interface ErrorStateProps {
  error: ExtractionError;
  onRetry: () => void;
}

const ERROR_TITLES: Record<ExtractionError["code"], string> = {
  INVALID_URL: "Invalid URL",
  PRIVATE_ACCOUNT: "Private account",
  NOT_RECIPE: "No recipe found",
  RATE_LIMIT: "Too many requests",
  TIMEOUT: "Connection timeout",
  UNKNOWN: "Couldn't extract recipe",
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      className="animate-scale-in max-w-[480px] mx-auto mt-8 px-5 relative z-10"
      role="alert"
    >
      <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
        <div className="text-[32px] mb-3" aria-hidden="true">
          😔
        </div>
        <h3 className="font-display text-lg font-semibold text-red-700 mb-2">
          {ERROR_TITLES[error.code]}
        </h3>
        <p className="text-sm text-ink-light leading-relaxed mb-5">
          {error.message}
        </p>
        <button
          onClick={onRetry}
          className="py-2.5 px-6 bg-terracotta text-white border-none rounded-lg font-body text-sm font-semibold cursor-pointer hover:bg-terracotta-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
