# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**RoomieLedger** — a mobile-first PWA for roommate expense splitting. 5-screen app: Dashboard, Ledger, Balances, Roommates, Add Expense. No auth for MVP; the "current user" is always the first roommate in the DB (ordered by name).

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm test             # Run Vitest unit tests (one-shot)
npm run test:watch   # Watch mode
npm run db:seed      # Seed 4 roommates + 6 sample expenses
npm run db:reset     # Wipe DB, re-migrate, re-seed
```

> **Node.js v22 gotcha:** `npx next` and `node_modules/.bin/next` are broken due to a symlink resolution change. All scripts already use `node node_modules/next/dist/bin/next` directly — don't change them back.

TypeScript check (tsc is also broken via npx on this machine):
```bash
node node_modules/typescript/lib/tsc.js --noEmit
```

Run a single test file:
```bash
npx vitest run __tests__/rl/balances.test.ts
```

After any schema change:
```bash
npx prisma migrate dev --name <migration-name>
npx prisma generate
```

## Architecture

### Data layer

**Prisma 7** with the driver adapter pattern (not the classic `DATABASE_URL` env var approach). The adapter is instantiated lazily inside the singleton closure in `src/lib/rl/db.ts` — this matters for hot-reload safety. Config lives in `prisma.config.ts` (not `prisma/schema.prisma`'s datasource block directly).

All monetary amounts are stored and passed as **integer cents** throughout — DB, DTOs, API responses, and UI calculations. `formatCurrency(cents)` in `src/lib/rl/formatCurrency.ts` is the single place that converts to display strings.

### Balance calculation

`calculateBalances(myId, expenses, settlements)` in `src/lib/rl/balances.ts` is pure and tested. It works in terms of `RawExpense`/`RawSettlement` (minimal shapes), not full Prisma types. All server pages and API routes call this function — never reimplement the logic inline.

Sign convention: **positive `netCents` = they owe me; negative = I owe them.**

### Page architecture

All screens live under `src/app/(rl)/` (Next.js route group — doesn't affect URLs). The pattern is consistent:

1. **Server page** (`page.tsx`) — fetches from Prisma directly, serializes Dates to ISO strings, passes plain DTOs as props.
2. **Client component** (`*Client.tsx` or `*Form.tsx`) — handles interactivity, `useState`, and `fetch` calls to `/api/rl/*` routes.

Server pages never import client hooks. Client components never import Prisma.

### API routes

Five thin routes under `src/app/api/rl/`. They import `prisma` and `calculateBalances` — no business logic beyond what's needed to shape the response. The balances route resolves `lastExpense` per roommate from an in-memory sort of already-fetched expenses (not N+1 queries).

### Component library

All shared UI is in `src/components/rl/`. Components use inline styles referencing `--rl-*` CSS variables — no Tailwind utility classes in JSX. `CategoryIcon` uses `dangerouslySetInnerHTML` to inject pre-built SVG path strings (avoids a per-category component).

## Design tokens

All tokens are `--rl-*` CSS custom properties defined in `src/app/globals.css`:

| Purpose | Variable |
|---------|----------|
| Primary accent | `--rl-teal` (#0d9488) |
| Positive/owed to me | `--rl-green` |
| Negative/I owe | `--rl-red` |
| Body text | `--rl-ink` |
| Muted text | `--rl-ink-muted` |
| Card background | `--rl-card` |
| Page background | `--rl-bg` |

Animation classes: `.rl-sheet-enter` (bottom sheet slide-up), `.rl-overlay-enter` (backdrop fade). Scrollbar hiding: `.no-scrollbar`.

## Key conventions

- **DTOs over Prisma types in client code.** Server pages map Prisma results to `ExpenseDTO` / `BalanceDTO` / `RoommateDTO` (defined in `src/types/rl.ts`) before passing to client components. Never let Prisma model types leak to the client.
- **Dates are always serialized.** Prisma returns `Date` objects; server pages call `.toISOString()` before sending to client components.
- **Equal split only.** `shareAmount = Math.round(amountCents / participantCount)` — integer rounding is intentional for MVP.
- **`settled` field on `ParticipantDTO` is always `false` for now.** The field exists in the type for future use; settlement state is derived from the `Settlement` table via `calculateBalances`, not from individual participant rows.
- **No `useEffect` for data fetching.** All data loads server-side in `page.tsx`. Client components only `fetch` for mutations (POST to `/api/rl/expenses` or `/api/rl/settlements`), then update local state optimistically.
