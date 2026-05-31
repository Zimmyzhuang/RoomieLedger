import { Icons } from "./icons";

const LOADING_MESSAGES = [
  "Finding the reel...",
  "Reading the caption & comments...",
  "Identifying ingredients...",
  "Measuring quantities...",
  "Writing out the steps...",
  "Plating your recipe...",
];

interface LoadingStateProps {
  step: number;
}

export function LoadingState({ step }: LoadingStateProps) {
  return (
    <div
      className="animate-scale-in max-w-[480px] mx-auto mt-8 px-5 text-center relative z-10"
      role="status"
      aria-label="Extracting recipe"
      aria-live="polite"
    >
      <div className="bg-white rounded-xl shadow-card border border-border p-12">
        <div
          className="w-12 h-12 mx-auto mb-6 border-3 border-cream-dark border-t-terracotta rounded-full animate-spin"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2 text-left">
          {LOADING_MESSAGES.slice(0, step + 1).map((msg, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white transition-colors ${
                  i < step
                    ? "bg-sage"
                    : i === step
                      ? "bg-terracotta"
                      : "bg-cream-dark"
                }`}
                aria-hidden="true"
              >
                {i < step ? (
                  Icons.check
                ) : (
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-white ${
                      i === step ? "animate-pulse" : ""
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-sm ${
                  i <= step ? "text-ink" : "text-ink-muted"
                } ${i === step ? "font-medium" : "font-normal"}`}
              >
                {msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
