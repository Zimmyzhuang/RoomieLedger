import { Icons } from "./icons";

export function AppHeader() {
  return (
    <header className="relative z-10 pt-12 pb-4 px-6 text-center">
      <div className="inline-flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-full bg-terracotta flex items-center justify-center text-white">
          {Icons.chef}
        </div>
        <h1 className="font-display text-[28px] font-bold text-ink tracking-tight">
          ReelRecipe
        </h1>
      </div>
      <p className="font-display text-[15px] italic text-ink-muted font-normal">
        Turn Instagram cooking reels into step-by-step recipes
      </p>
    </header>
  );
}
