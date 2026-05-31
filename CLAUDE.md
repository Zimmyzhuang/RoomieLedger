# CLAUDE.md — ReelRecipe

## Project Overview

ReelRecipe is an AI-powered single-page application that converts Instagram cooking Reels into structured, interactive step-by-step recipe cards. Users paste a public Reel URL, the app calls Claude's API with web search to extract recipe data from the page content, and renders it as an interactive card with adjustable servings.

**Core loop:** URL input → Claude API (web search + extraction) → JSON recipe → interactive recipe card.

**Current stage:** MVP (single-file React artifact deployed on Claude.ai).

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React (functional components, hooks only) | Runs inside Claude.ai artifact renderer |
| Styling | Inline styles + CSS variables via `<style>` tag | No Tailwind compiler available; use Tailwind utility classes only for layout shortcuts |
| Fonts | Google Fonts (`Playfair Display` + `Source Sans 3`) | Loaded via `@import` in CSS string |
| Icons | Inline SVG elements | No icon library; hand-coded SVGs stored in `Icon` object |
| AI Backend | Anthropic Claude API (`claude-sonnet-4-20250514`) | Called directly from frontend — no separate backend |
| Content Fetching | Claude's `web_search_20250305` tool | Passed as a tool in the API call; Claude searches for Reel content |
| State Management | React `useState` / `useRef` | No external state library |
| Storage | None (MVP) | Future: `window.storage` persistent key-value API |
| Build/Deploy | Claude.ai artifact renderer | Single `.jsx` file, no build step |

---

## Project Structure

This is a **single-file application** (`reel-to-recipe.jsx`). The file is organized in this order:

```
reel-to-recipe.jsx
├── Imports (react hooks)
├── Constants
│   ├── FONTS — Google Fonts import string
│   ├── CSS — Full CSS with variables, resets, animations
│   ├── LOADING_MSGS — Loading state step labels
│   └── Icon — SVG icon object map
├── Utilities
│   ├── formatAmount() — Number → display string with Unicode fractions
│   └── extractRecipe() — API call to Claude, JSON parsing, error handling
├── Components (top to bottom rendering order)
│   ├── AppHeader — Logo + tagline
│   ├── URLInput — URL text field + submit button
│   ├── LoadingState — Animated progress steps
│   ├── ErrorState — Error message + retry button
│   ├── ServingsControl — +/− buttons with reset
│   └── RecipeCard — Full recipe display (header, ingredients, steps, source)
└── App (default export) — State machine, event handlers, layout composition
```

If the project grows beyond MVP, split into this structure:

```
src/
├── components/
│   ├── AppHeader.jsx
│   ├── URLInput.jsx
│   ├── LoadingState.jsx
│   ├── ErrorState.jsx
│   ├── ServingsControl.jsx
│   └── RecipeCard.jsx
├── utils/
│   ├── formatAmount.js
│   └── extractRecipe.js
├── constants/
│   ├── icons.jsx
│   ├── theme.js
│   └── loading.js
├── styles/
│   └── global.css
└── App.jsx
```

---

## App State Machine

The app uses a simple string state (`"idle" | "loading" | "done" | "error"`) instead of booleans. All transitions flow through `handleSubmit` and `handleReset`:

```
idle ──(submit)──▶ loading ──(success)──▶ done
                       │                    │
                       └──(failure)──▶ error │
                                         │   │
                                         └───┘──(retry/reset)──▶ idle
```

Always use this state machine pattern. Never add independent boolean flags like `isLoading`, `hasError`, `isComplete` — they desync.

---

## Code Conventions

### General

- **Single file for now.** Don't split into multiple files until there's a real reason (shared components, tests, routing).
- **Functional components only.** No class components, ever.
- **Hooks:** `useState` for UI state, `useRef` for mutable values that shouldn't trigger re-renders (intervals, DOM refs), `useEffect` only for cleanup. Avoid `useEffect` for derived state — compute it inline.
- **Default export** on the root `App` component. Named exports for everything else if the project splits into modules.

### Naming

- **Components:** PascalCase (`RecipeCard`, `URLInput`, `ServingsControl`).
- **Functions/variables:** camelCase (`formatAmount`, `handleSubmit`, `loadingStep`).
- **Constants:** UPPER_SNAKE_CASE for true constants (`LOADING_MSGS`, `CSS`, `FONTS`). camelCase for object maps that happen to be const (`Icon`).
- **State setters:** Always pair as `[thing, setThing]`.
- **Event handlers:** Prefix with `handle` in the parent (`handleSubmit`, `handleReset`), prefix with `on` in the prop name (`onSubmit`, `onRetry`, `onNewRecipe`).
- **Boolean variables:** Use `is`/`has` prefix (`isValid`, `hasError`). Exception: `checked` for checkbox state is fine.

### Styling

- **Inline styles** as the primary approach. This keeps the single-file structure simple and avoids class name collisions.
- **CSS variables** for all colors, shadows, radii, and font families. Defined in the `CSS` string injected via `<style>` tag. Never hardcode hex colors in inline styles — always use `var(--name)`.
- **CSS classes** only for animations (`.fade-up`, `.scale-in`, etc.) since `animation` shorthand in inline styles doesn't work reliably across renderers.
- **No Tailwind classes in JSX.** Tailwind is available but we use it sparingly. Our design language is custom, not utility-first.
- **Transitions** on interactive elements: `transition: "all 0.15s"` or `"all 0.2s"` for hover/active states.

### Color Palette (use these variable names)

| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg` | `#FAF7F2` | Page background |
| `--bg-card` | `#FFFFFF` | Card surfaces |
| `--terracotta` | `#C0613A` | Primary accent, buttons, CTA |
| `--terracotta-light` | `#E8845A` | Gradient accent |
| `--terracotta-dark` | `#9A4E2F` | Hover states, ingredient amounts |
| `--sage` | `#7A8B6F` | Success/checked state |
| `--sage-light` | `#A3B396` | Secondary success |
| `--cream` | `#F5EDE3` | Subtle backgrounds, checked step bg |
| `--cream-dark` | `#E8DDD0` | Borders on cream backgrounds |
| `--ink` | `#2C2420` | Primary text |
| `--ink-light` | `#5C534D` | Secondary text |
| `--ink-muted` | `#8A817A` | Tertiary/disabled text |
| `--border` | `#E2D9CF` | Default borders |
| `--error` | `#B91C1C` | Error text |
| `--error-bg` | `#FEF2F2` | Error card background |

### Typography

- **Display font:** `var(--font-display)` — Playfair Display. Use for headings, recipe titles, step numbers.
- **Body font:** `var(--font-body)` — Source Sans 3. Use for everything else.
- Never use system fonts, Inter, Roboto, or Arial.

### Icons

- All icons are inline SVGs stored in the `Icon` object.
- Standard size: `width="16" height="16"` with `viewBox="0 0 24 24"`.
- Use `stroke="currentColor"` so icons inherit text color.
- Add new icons to the `Icon` object, don't import an icon library.

### API Calls

- All Claude API calls go through `extractRecipe()` or similar top-level async functions.
- Always use `claude-sonnet-4-20250514` as the model.
- Always set `max_tokens: 1000`.
- Never pass an API key — the artifact runtime handles auth.
- Parse responses by filtering `content` blocks for `type === "text"`, then strip markdown fences before JSON.parse.
- Always wrap JSON.parse in try/catch with a regex fallback (`/\{[\s\S]*\}/`).
- Propagate errors with `throw new Error(message)` — the caller handles display.

### Recipe JSON Schema

Every recipe object must conform to this shape:

```typescript
interface Recipe {
  title: string;
  description: string;
  prepTime?: string;        // e.g. "15 min"
  cookTime?: string;        // e.g. "30 min"
  baseServings: number;     // default serving count
  ingredients: {
    name: string;
    amount: number;         // always a decimal (0.5, not "1/2")
    unit: string;           // cups, tbsp, tsp, oz, lb, g, kg, ml, L, cloves, pieces, slices, or ""
  }[];
  steps: {
    number: number;
    instruction: string;
    duration?: string;      // e.g. "5 minutes"
  }[];
  source: {
    creatorName?: string;
    handle?: string;        // e.g. "@chefname"
    url: string;
  };
  tags?: string[];
}
```

### Component Patterns

- **Checkable lists:** Use `Set` for tracking checked items. Toggle with a new Set copy (immutable update).
- **Servings scaling:** Compute `ratio = servings / baseServings` and multiply `ingredient.amount * ratio` at render time. Never mutate the recipe object.
- **Conditional rendering:** Use `&&` for simple presence checks, ternary for either/or. Never nest ternaries.
- **Event delegation:** Put `onClick` on the entire row/card, not on a tiny checkbox target. Better touch targets.

---

## What to Avoid

### Architecture

- **No `localStorage` or `sessionStorage`.** These APIs are not supported in Claude.ai artifacts and will crash the app. Use React state for session data. Use `window.storage` (the persistent storage API) for cross-session data when that feature is needed.
- **No separate CSS files** in single-file mode. Keep styles inline or in the `CSS` template string.
- **No `useReducer`** unless the state machine grows beyond 4-5 states. `useState` with a string state is simpler for now.
- **No context providers** unless there are 3+ levels of prop drilling. The current component tree is flat enough.
- **No external state management** (Redux, Zustand, Jotai). Overkill for a single-page app.
- **No React Router.** Single view, no routing needed.

### Styling

- **Never use generic fonts** (Inter, Roboto, Arial, system-ui). The design identity depends on Playfair Display + Source Sans 3.
- **Never hardcode colors.** Always reference CSS variables.
- **Never use purple gradients.** The palette is warm (terracotta, sage, cream) — no cool-tone gradients.
- **No CSS-in-JS libraries** (styled-components, emotion). Inline styles + CSS variables work fine here.
- **No `!important`.**

### API & Data

- **Never store API keys in code.** The artifact runtime injects auth automatically.
- **Never mutate the recipe object.** Treat it as immutable. Compute derived values (scaled amounts) at render time.
- **Never trust AI output blindly.** Always wrap JSON.parse in try/catch. Always check for `recipe.error`. Always handle missing/null fields with optional chaining (`?.`) and fallbacks (`|| default`).
- **Never display raw API errors to users.** Map them to friendly messages.

### UX

- **No modals or popups.** Use inline state changes (swap components in/out).
- **No toast notifications.** Errors and success states are shown inline in the main content area.
- **No infinite scroll or pagination.** Recipes are single-page.
- **No form tags.** Use `onClick` handlers on buttons and `onKeyDown` for Enter-to-submit. `<form>` tags break in the artifact renderer.
- **Don't block interaction during loading.** The URL input should be disabled, but the rest of the page should remain scrollable.
- **Don't auto-play sounds or videos.**

### Performance

- **No unnecessary re-renders.** Don't create new object/array literals in render unless needed. The `Icon` object is defined outside components for this reason.
- **Don't over-animate.** One entrance animation per component mount is enough. Reserve motion for state transitions and hover feedback.
- **No polling or intervals left running.** Always clear intervals in cleanup (`useEffect` return or explicit `stopLoading()`).

---

## Future Considerations

When extending beyond MVP, keep these in mind:

- **Recipe history:** Use `window.storage.set('recipes:id', JSON.stringify(recipe))` with hierarchical keys. Batch reads with a single `list('recipes:')` call.
- **Manual caption fallback:** Add a textarea mode that bypasses web search and sends raw text to Claude for extraction.
- **Step timers:** Add a `TimerButton` component per step. Use `setInterval` with ref-based cleanup. Show remaining time inline, not in a modal.
- **Multi-recipe Reels:** If the AI returns an array instead of an object, render a recipe picker before the card.
- **TikTok support:** Same `extractRecipe` function, different URL validation. The prompt is platform-agnostic.
- **Editable recipes:** Make ingredient amounts and step text `contentEditable` or swap to controlled inputs on an "edit" toggle. Store edits in local state, not back to the API.
