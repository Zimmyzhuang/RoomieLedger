# RoomieLedger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA for roommates to track shared expenses, view balances, and settle debts — 5-screen app with teal design system, 5-tab bottom nav, and a SQLite-backed REST API.

**Architecture:** Next.js App Router for both UI (React Server + Client components) and API routes (replacing the need for a separate Express process). Prisma manages SQLite in dev. All balance calculations happen server-side in a shared utility so API routes stay thin.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 5, SQLite (better-sqlite3), Vitest + React Testing Library

---

## File Map

```
prisma/
  schema.prisma              ← data models: Roommate, Expense, ExpenseParticipant, Settlement
  seed.ts                    ← dev seed: 4 roommates + 6 expenses

src/
  app/
    (rl)/                    ← route group — RoomieLedger, own layout
      layout.tsx             ← mobile shell: viewport, bottom nav, max-width container
      page.tsx               ← Dashboard screen
      ledger/page.tsx        ← Ledger screen
      balances/page.tsx      ← Balances screen
      roommates/page.tsx     ← Roommates screen
      add/page.tsx           ← Add Expense screen
    api/rl/
      expenses/route.ts      ← GET (recent) + POST (create expense + participants)
      ledger/route.ts        ← GET (all, with ?search=&category= filters)
      balances/route.ts      ← GET (per-roommate net balance)
      settlements/route.ts   ← POST (mark a pair as settled)
      roommates/route.ts     ← GET (all roommates)

  components/rl/
    BottomNav.tsx            ← 5-tab nav with teal Add button
    BottomSheet.tsx          ← slide-up modal wrapper
    TransactionDetail.tsx    ← sheet content for a single expense
    TransactionCard.tsx      ← ledger row card
    BalanceCard.tsx          ← per-roommate balance card
    RoommateCard.tsx         ← roommates list card
    StatChip.tsx             ← dashboard summary chip
    CategoryIcon.tsx         ← SVG icon by category string
    EmptyState.tsx           ← reusable empty state

  lib/rl/
    db.ts                    ← Prisma client singleton
    balances.ts              ← calculateBalances(expenses, settlements) → BalanceMap
    formatCurrency.ts        ← formatCurrency(cents: number) → "$X.XX"

  types/rl.ts                ← shared TS interfaces (Expense, Balance, Roommate, etc.)

  app/globals.css            ← add RL CSS custom properties (design tokens)

__tests__/rl/
  balances.test.ts           ← unit tests for balance calculation logic
  api.expenses.test.ts       ← API route integration tests
  api.balances.test.ts       ← API route integration tests
  api.settlements.test.ts    ← API route integration tests
```

---

## Task 1: Install dependencies + Prisma schema

**Files:**
- Modify: `package.json` (via npm install)
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/rl/db.ts`

- [ ] **Step 1: Install packages**

```bash
cd /Users/timothy/Desktop/Projects/ReelRecipe
npm install prisma @prisma/client better-sqlite3
npm install -D @types/better-sqlite3 vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/user-event jsdom
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` and `prisma/.env` created. `.env` will contain `DATABASE_URL="file:./dev.db"`.

- [ ] **Step 2: Write Prisma schema**

Replace the contents of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Roommate {
  id        String   @id @default(cuid())
  name      String
  handle    String   @unique
  color     String   @default("#64748b")
  createdAt DateTime @default(now())

  paidExpenses      Expense[]            @relation("PaidBy")
  participations    ExpenseParticipant[]
  settlementsGiven  Settlement[]         @relation("Payer")
  settlementsRecv   Settlement[]         @relation("Receiver")
}

model Expense {
  id           String   @id @default(cuid())
  title        String
  amount       Int      // stored as cents (e.g. $40.00 = 4000)
  category     String   @default("other")
  paidById     String
  createdAt    DateTime @default(now())

  paidBy       Roommate             @relation("PaidBy", fields: [paidById], references: [id])
  participants ExpenseParticipant[]
}

model ExpenseParticipant {
  id          String  @id @default(cuid())
  expenseId   String
  roommateId  String
  shareAmount Int     // cents

  expense  Expense  @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  roommate Roommate @relation(fields: [roommateId], references: [id])

  @@unique([expenseId, roommateId])
}

model Settlement {
  id         String   @id @default(cuid())
  payerId    String
  receiverId String
  amount     Int      // cents
  settledAt  DateTime @default(now())

  payer    Roommate @relation("Payer",    fields: [payerId],    references: [id])
  receiver Roommate @relation("Receiver", fields: [receiverId], references: [id])
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected output: `✔ Generated Prisma Client` and `dev.db` created in `prisma/`.

- [ ] **Step 4: Create Prisma singleton**

Create `src/lib/rl/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Write seed file**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Roommates
  const timothy = await prisma.roommate.upsert({
    where: { handle: 'timz' },
    update: {},
    create: { name: 'Timothy', handle: 'timz', color: '#0d9488' },
  })
  const ruby = await prisma.roommate.upsert({
    where: { handle: 'rubyc' },
    update: {},
    create: { name: 'Ruby Chen', handle: 'rubyc', color: '#8b5cf6' },
  })
  const jake = await prisma.roommate.upsert({
    where: { handle: 'jakep' },
    update: {},
    create: { name: 'Jake Park', handle: 'jakep', color: '#f59e0b' },
  })
  const mia = await prisma.roommate.upsert({
    where: { handle: 'miat' },
    update: {},
    create: { name: 'Mia Torres', handle: 'miat', color: '#ec4899' },
  })

  const all = [timothy, ruby, jake, mia]

  // Helper: create expense split equally among participants
  async function addExpense(
    title: string,
    amountCents: number,
    category: string,
    paidById: string,
    participants: typeof all,
    daysAgo: number,
  ) {
    const share = Math.round(amountCents / participants.length)
    const date = new Date(Date.now() - daysAgo * 86400000)
    await prisma.expense.create({
      data: {
        title,
        amount: amountCents,
        category,
        paidById,
        createdAt: date,
        participants: {
          create: participants.map((r) => ({
            roommateId: r.id,
            shareAmount: share,
          })),
        },
      },
    })
  }

  await addExpense("Trader Joe's", 6100, 'groceries', ruby.id, all, 0)
  await addExpense('Electric Bill', 11200, 'utilities', timothy.id, all, 1)
  await addExpense("Domino's Pizza", 2850, 'food', jake.id, [timothy, ruby, jake], 2)
  await addExpense('Internet', 8000, 'internet', timothy.id, all, 3)
  await addExpense('Rent', 280000, 'rent', timothy.id, all, 30)
  await addExpense('Whole Foods', 4250, 'groceries', mia.id, [ruby, mia], 5)

  console.log('✓ Seeded 4 roommates + 6 expenses')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 6: Add seed script to package.json**

Add to `package.json` under `"scripts"`:
```json
"db:seed": "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts",
"db:reset": "npx prisma migrate reset --force && npm run db:seed"
```

Also add to `package.json` root level:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 7: Run seed**

```bash
npx prisma db seed
```

Expected: `✓ Seeded 4 roommates + 6 expenses`

- [ ] **Step 8: Commit**

```bash
git add prisma/ src/lib/rl/db.ts package.json
git commit -m "feat(rl): add Prisma schema, SQLite migration, and seed data"
```

---

## Task 2: Shared types + utilities

**Files:**
- Create: `src/types/rl.ts`
- Create: `src/lib/rl/formatCurrency.ts`
- Create: `src/lib/rl/balances.ts`
- Create: `__tests__/rl/balances.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Set up Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Create shared types**

Create `src/types/rl.ts`:

```typescript
export type Category =
  | 'groceries'
  | 'utilities'
  | 'food'
  | 'rent'
  | 'internet'
  | 'other'

export interface RoommateDTO {
  id: string
  name: string
  handle: string
  color: string
}

export interface ParticipantDTO {
  roommateId: string
  name: string
  shareAmount: number // cents
  settled: boolean
}

export interface ExpenseDTO {
  id: string
  title: string
  amount: number // cents
  category: Category
  paidById: string
  paidByName: string
  createdAt: string // ISO string
  participants: ParticipantDTO[]
}

export interface BalanceDTO {
  roommateId: string
  name: string
  handle: string
  color: string
  netCents: number // positive = they owe you, negative = you owe them
  lastExpenseTitle: string | null
  lastExpenseDate: string | null
  lastExpenseCategory: Category | null
}

export interface CreateExpenseBody {
  title: string
  amountCents: number
  category: Category
  paidById: string
  participantIds: string[]
}
```

- [ ] **Step 3: Create formatCurrency utility**

Create `src/lib/rl/formatCurrency.ts`:

```typescript
export function formatCurrency(cents: number): string {
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const remaining = abs % 100
  return `$${dollars}.${remaining.toString().padStart(2, '0')}`
}

export function formatSign(cents: number): string {
  if (cents === 0) return formatCurrency(0)
  return cents > 0 ? `+${formatCurrency(cents)}` : `-${formatCurrency(cents)}`
}
```

- [ ] **Step 4: Write failing balance tests**

Create `__tests__/rl/balances.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateBalances } from '@/lib/rl/balances'

const ME = 'user-timothy'
const RUBY = 'user-ruby'
const JAKE = 'user-jake'

describe('calculateBalances', () => {
  it('returns zero balance when no expenses', () => {
    const result = calculateBalances(ME, [], [])
    expect(result).toEqual([])
  })

  it('records positive balance when others owe me', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 5000 },
          { roommateId: RUBY, shareAmount: 5000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance?.netCents).toBe(5000) // Ruby owes me
  })

  it('records negative balance when I owe others', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: RUBY,
        participants: [
          { roommateId: ME, shareAmount: 3000 },
          { roommateId: RUBY, shareAmount: 3000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance?.netCents).toBe(-3000) // I owe Ruby
  })

  it('applies settlements to reduce balance', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 5000 },
          { roommateId: RUBY, shareAmount: 5000 },
        ],
      },
    ]
    const settlements = [
      { payerId: RUBY, receiverId: ME, amount: 5000 },
    ]
    const result = calculateBalances(ME, expenses, settlements)
    const rubyBalance = result.find((b) => b.roommateId === RUBY)
    expect(rubyBalance?.netCents).toBe(0)
  })

  it('handles multiple people correctly', () => {
    const expenses = [
      {
        id: 'e1',
        paidById: ME,
        participants: [
          { roommateId: ME, shareAmount: 4000 },
          { roommateId: RUBY, shareAmount: 4000 },
          { roommateId: JAKE, shareAmount: 4000 },
        ],
      },
    ]
    const result = calculateBalances(ME, expenses, [])
    expect(result.find((b) => b.roommateId === RUBY)?.netCents).toBe(4000)
    expect(result.find((b) => b.roommateId === JAKE)?.netCents).toBe(4000)
  })
})
```

- [ ] **Step 5: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/lib/rl/balances'`

- [ ] **Step 6: Implement calculateBalances**

Create `src/lib/rl/balances.ts`:

```typescript
interface RawParticipant {
  roommateId: string
  shareAmount: number
}

interface RawExpense {
  id: string
  paidById: string
  participants: RawParticipant[]
}

interface RawSettlement {
  payerId: string
  receiverId: string
  amount: number
}

export interface NetBalance {
  roommateId: string
  netCents: number // positive = they owe me, negative = I owe them
}

export function calculateBalances(
  myId: string,
  expenses: RawExpense[],
  settlements: RawSettlement[],
): NetBalance[] {
  const net = new Map<string, number>()

  for (const expense of expenses) {
    for (const p of expense.participants) {
      if (p.roommateId === myId) continue // skip my own share

      if (expense.paidById === myId) {
        // I paid — others owe me their share
        net.set(p.roommateId, (net.get(p.roommateId) ?? 0) + p.shareAmount)
      } else if (p.roommateId !== myId) {
        // Someone else paid — find my share and I owe the payer
        const myParticipation = expense.participants.find(
          (pp) => pp.roommateId === myId,
        )
        if (myParticipation && expense.paidById === p.roommateId) {
          net.set(
            expense.paidById,
            (net.get(expense.paidById) ?? 0) - myParticipation.shareAmount,
          )
        }
      }
    }
    // Handle: someone else paid, my share goes to the payer
    if (expense.paidById !== myId) {
      const myShare = expense.participants.find((p) => p.roommateId === myId)
      if (myShare) {
        net.set(
          expense.paidById,
          (net.get(expense.paidById) ?? 0) - myShare.shareAmount,
        )
      }
    }
  }

  // Apply settlements
  for (const s of settlements) {
    if (s.payerId === myId) {
      // I paid someone — reduces what I owe them
      net.set(s.receiverId, (net.get(s.receiverId) ?? 0) + s.amount)
    } else if (s.receiverId === myId) {
      // Someone paid me — reduces what they owe me
      net.set(s.payerId, (net.get(s.payerId) ?? 0) - s.amount)
    }
  }

  return Array.from(net.entries()).map(([roommateId, netCents]) => ({
    roommateId,
    netCents,
  }))
}
```

- [ ] **Step 7: Run tests — verify they pass**

```bash
npm test
```

Expected: All 5 tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/types/rl.ts src/lib/rl/ __tests__/rl/balances.test.ts vitest.config.ts package.json
git commit -m "feat(rl): shared types, formatCurrency, balance calculation with tests"
```

---

## Task 3: API routes

**Files:**
- Create: `src/app/api/rl/roommates/route.ts`
- Create: `src/app/api/rl/expenses/route.ts`
- Create: `src/app/api/rl/ledger/route.ts`
- Create: `src/app/api/rl/balances/route.ts`
- Create: `src/app/api/rl/settlements/route.ts`

> The "current user" is hardcoded to the first roommate in the DB for MVP (no auth). The client passes `?me=<id>` on balance requests, defaulting to the seeded Timothy id.

- [ ] **Step 1: Roommates route**

Create `src/app/api/rl/roommates/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function GET() {
  const roommates = await prisma.roommate.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(roommates)
}
```

- [ ] **Step 2: Expenses route (POST + GET recent)**

Create `src/app/api/rl/expenses/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'
import type { CreateExpenseBody } from '@/types/rl'

export async function GET() {
  const expenses = await prisma.expense.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const body: CreateExpenseBody = await req.json()
  const { title, amountCents, category, paidById, participantIds } = body

  if (!title || !amountCents || !paidById || participantIds.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const shareAmount = Math.round(amountCents / participantIds.length)

  const expense = await prisma.expense.create({
    data: {
      title,
      amount: amountCents,
      category,
      paidById,
      participants: {
        create: participantIds.map((id) => ({
          roommateId: id,
          shareAmount,
        })),
      },
    },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
```

- [ ] **Step 3: Ledger route (GET with search + category filter)**

Create `src/app/api/rl/ledger/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  const expenses = await prisma.expense.findMany({
    where: {
      ...(search ? { title: { contains: search } } : {}),
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })

  return NextResponse.json(expenses)
}
```

- [ ] **Step 4: Balances route**

Create `src/app/api/rl/balances/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'
import { calculateBalances } from '@/lib/rl/balances'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const meId = searchParams.get('me') ?? ''

  if (!meId) {
    return NextResponse.json({ error: 'Missing ?me= param' }, { status: 400 })
  }

  const [expenses, settlements, roommates] = await Promise.all([
    prisma.expense.findMany({
      include: { participants: true },
    }),
    prisma.settlement.findMany(),
    prisma.roommate.findMany(),
  ])

  const netBalances = calculateBalances(meId, expenses, settlements)

  // Enrich with roommate metadata + last transaction
  const result = await Promise.all(
    roommates
      .filter((r) => r.id !== meId)
      .map(async (r) => {
        const net = netBalances.find((b) => b.roommateId === r.id)
        const lastExpense = await prisma.expense.findFirst({
          where: {
            participants: { some: { roommateId: r.id } },
          },
          orderBy: { createdAt: 'desc' },
        })
        return {
          roommateId: r.id,
          name: r.name,
          handle: r.handle,
          color: r.color,
          netCents: net?.netCents ?? 0,
          lastExpenseTitle: lastExpense?.title ?? null,
          lastExpenseDate: lastExpense?.createdAt ?? null,
          lastExpenseCategory: lastExpense?.category ?? null,
        }
      }),
  )

  return NextResponse.json(result)
}
```

- [ ] **Step 5: Settlements route**

Create `src/app/api/rl/settlements/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function POST(req: NextRequest) {
  const { payerId, receiverId, amount } = await req.json()

  if (!payerId || !receiverId || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const settlement = await prisma.settlement.create({
    data: { payerId, receiverId, amount },
  })

  return NextResponse.json(settlement, { status: 201 })
}
```

- [ ] **Step 6: Smoke-test routes manually**

```bash
npm run dev
```

In a new terminal:
```bash
# Check roommates
curl http://localhost:3000/api/rl/roommates | head -c 200

# Check ledger
curl http://localhost:3000/api/rl/ledger | head -c 200
```

Expected: JSON arrays with roommate/expense data from seed.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/rl/
git commit -m "feat(rl): REST API routes for expenses, ledger, balances, settlements, roommates"
```

---

## Task 4: Design tokens + global styles + app shell

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/(rl)/layout.tsx`
- Create: `src/components/rl/BottomNav.tsx`

- [ ] **Step 1: Add design tokens to globals.css**

Append to `src/app/globals.css`:

```css
/* ── RoomieLedger design tokens ── */
:root {
  --rl-teal: #0d9488;
  --rl-teal-dark: #0f766e;
  --rl-teal-light: #f0fdfa;
  --rl-teal-border: #99f6e4;

  --rl-red: #ef4444;
  --rl-red-light: #fef2f2;
  --rl-red-border: #fecaca;

  --rl-green: #10b981;
  --rl-green-light: #f0fdf4;

  --rl-amber: #f59e0b;

  --rl-ink: #1a1a2e;
  --rl-ink-secondary: #64748b;
  --rl-ink-muted: #94a3b8;
  --rl-border: #e8edf2;
  --rl-bg: #f8fafc;
  --rl-card: #ffffff;

  --rl-radius-card: 14px;
  --rl-radius-pill: 20px;
  --rl-radius-sheet: 22px;
  --rl-shadow-card: 0 1px 6px rgba(0, 0, 0, 0.06);
  --rl-shadow-strong: 0 4px 16px rgba(13, 148, 136, 0.35);
}

/* Bottom sheet slide-up animation */
@keyframes rl-slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.rl-sheet-enter {
  animation: rl-slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

/* Overlay fade */
@keyframes rl-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.rl-overlay-enter {
  animation: rl-fade-in 0.2s ease forwards;
}
```

- [ ] **Step 2: Create BottomNav component**

Create `src/components/rl/BottomNav.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/ledger',
    label: 'Ledger',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  { href: '/add', label: 'Add', icon: null }, // center Add button
  {
    href: '/balances',
    label: 'Balances',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    href: '/roommates',
    label: 'Roommates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-t border-[var(--rl-border)] flex items-center justify-around px-1 pt-2 pb-4 flex-shrink-0">
      {NAV_ITEMS.map((item) => {
        if (item.label === 'Add') {
          return (
            <Link
              key="add"
              href="/add"
              className="flex flex-col items-center gap-1 flex-1 text-[9.5px] font-bold text-[var(--rl-teal)]"
            >
              <span
                className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center -mt-2"
                style={{ background: 'var(--rl-teal)', boxShadow: 'var(--rl-shadow-strong)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-[22px] h-[22px]">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              Add
            </Link>
          )
        }

        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 flex-1 text-[9.5px] font-semibold min-w-0 ${
              isActive ? 'text-[var(--rl-teal)]' : 'text-[var(--rl-ink-muted)]'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Create route group layout**

Create `src/app/(rl)/layout.tsx`:

```typescript
import type { ReactNode } from 'react'
import { BottomNav } from '@/components/rl/BottomNav'

export const metadata = {
  title: 'RoomieLedger',
  description: 'Split expenses with your roommates',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
}

export default function RLLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-col bg-[var(--rl-bg)]"
      style={{ height: '100dvh', maxWidth: 430, margin: '0 auto' }}
    >
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the existing ReelRecipe page (the `(rl)` route group applies to routes inside it, not the root). We'll set up the dashboard route in the next task.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/'(rl)'/layout.tsx src/components/rl/BottomNav.tsx
git commit -m "feat(rl): design tokens, app shell layout, 5-tab bottom nav"
```

---

## Task 5: Shared UI components

**Files:**
- Create: `src/components/rl/CategoryIcon.tsx`
- Create: `src/components/rl/StatChip.tsx`
- Create: `src/components/rl/EmptyState.tsx`
- Create: `src/components/rl/TransactionCard.tsx`
- Create: `src/components/rl/BottomSheet.tsx`
- Create: `src/components/rl/TransactionDetail.tsx`

- [ ] **Step 1: CategoryIcon**

Create `src/components/rl/CategoryIcon.tsx`:

```typescript
import type { Category } from '@/types/rl'

const CONFIGS: Record<Category, { bg: string; stroke: string; path: string }> = {
  groceries: {
    bg: '#f0fdfa',
    stroke: '#0d9488',
    path: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
  },
  utilities: {
    bg: '#fef3c7',
    stroke: '#d97706',
    path: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  },
  food: {
    bg: '#fdf2f8',
    stroke: '#ec4899',
    path: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>',
  },
  rent: {
    bg: '#eff6ff',
    stroke: '#3b82f6',
    path: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  internet: {
    bg: '#f0f9ff',
    stroke: '#0ea5e9',
    path: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  },
  other: {
    bg: '#f8fafc',
    stroke: '#94a3b8',
    path: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  },
}

interface Props {
  category: Category
  size?: number
}

export function CategoryIcon({ category, size = 38 }: Props) {
  const cfg = CONFIGS[category] ?? CONFIGS.other
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-[11px]"
      style={{ width: size, height: size, background: cfg.bg }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size * 0.47}
        height={size * 0.47}
        dangerouslySetInnerHTML={{ __html: cfg.path }}
      />
    </div>
  )
}
```

- [ ] **Step 2: StatChip**

Create `src/components/rl/StatChip.tsx`:

```typescript
import { formatCurrency } from '@/lib/rl/formatCurrency'

interface Props {
  label: string
  value: string | number
  color: 'red' | 'green' | 'amber' | 'ink'
}

const COLOR_MAP = {
  red: '#ef4444',
  green: '#10b981',
  amber: '#f59e0b',
  ink: '#1a1a2e',
}

export function StatChip({ label, value, color }: Props) {
  return (
    <div className="flex-1 bg-white rounded-[14px] p-[10px_8px] text-center" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
      <p className="text-[9px] text-[var(--rl-ink-muted)] font-bold uppercase tracking-[0.4px] mb-1">{label}</p>
      <p className="text-[16px] font-extrabold leading-none" style={{ color: COLOR_MAP[color] }}>
        {typeof value === 'number' ? formatCurrency(Math.abs(value)) : value}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: EmptyState**

Create `src/components/rl/EmptyState.tsx`:

```typescript
interface Props {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ title, subtitle, ctaLabel, ctaHref }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div
        className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
        style={{ background: 'var(--rl-teal-light)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--rl-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={36} height={36}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 className="text-[17px] font-extrabold text-[var(--rl-ink)]">{title}</h2>
      <p className="text-[12px] text-[var(--rl-ink-muted)] leading-[1.55] max-w-[200px]">{subtitle}</p>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="flex items-center gap-2 text-white text-[13px] font-extrabold rounded-[14px] px-6 py-3 mt-1"
          style={{ background: 'var(--rl-teal)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" width={16} height={16}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 4: TransactionCard**

Create `src/components/rl/TransactionCard.tsx`:

```typescript
'use client'

import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { ExpenseDTO } from '@/types/rl'
import type { Category } from '@/types/rl'

interface Props {
  expense: ExpenseDTO
  myId: string
  onClick?: () => void
}

export function TransactionCard({ expense, myId, onClick }: Props) {
  const iPaid = expense.paidById === myId
  const myParticipation = expense.participants.find((p) => p.roommateId === myId)
  const myShare = myParticipation?.shareAmount ?? 0

  const displayAmount = iPaid ? myShare * (expense.participants.length - 1) : myShare
  const isPositive = iPaid

  const date = new Date(expense.createdAt)
  const dateLabel = formatDate(date)

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-[14px] p-[10px_12px] flex items-center gap-[10px] text-left"
      style={{ boxShadow: 'var(--rl-shadow-card)', minHeight: 52 }}
    >
      <CategoryIcon category={expense.category as Category} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--rl-ink)] leading-[1.2] truncate">{expense.title}</p>
        <p className="text-[10px] text-[var(--rl-ink-muted)] mt-[2px]">
          {dateLabel} · {expense.category}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-extrabold leading-[1.2]" style={{ color: isPositive ? 'var(--rl-green)' : 'var(--rl-red)' }}>
          {isPositive ? '+' : '-'}{formatCurrency(displayAmount)}
        </p>
        <p className="text-[10px] text-[var(--rl-ink-muted)] mt-[2px]">
          {iPaid ? 'you paid' : `${expense.paidByName} paid`}
        </p>
      </div>
    </button>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.setHours(0,0,0,0) - date.setHours(0,0,0,0)
  const days = Math.round(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
```

- [ ] **Step 5: BottomSheet**

Create `src/components/rl/BottomSheet.tsx`:

```typescript
'use client'

import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 rl-overlay-enter"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-[22px] rl-sheet-enter"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}
      >
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mt-[10px] mb-[14px]" />
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: TransactionDetail**

Create `src/components/rl/TransactionDetail.tsx`:

```typescript
import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { ExpenseDTO, Category } from '@/types/rl'

interface Props {
  expense: ExpenseDTO
  myId: string
}

const STATUS_STYLES = {
  paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'PAID' },
  owes:    { bg: '#fffbeb', color: '#d97706', label: 'OWES' },
  settled: { bg: '#f0fdfa', color: '#0d9488', label: 'SETTLED' },
}

export function TransactionDetail({ expense, myId }: Props) {
  const date = new Date(expense.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="pb-5">
      {/* Title row */}
      <div className="flex items-center gap-2 px-4 pb-3 border-b border-[var(--rl-border)]">
        <CategoryIcon category={expense.category as Category} size={32} />
        <h2 className="text-[16px] font-extrabold text-[var(--rl-ink)]">{expense.title}</h2>
      </div>

      {/* Amount */}
      <p className="text-[30px] font-extrabold text-[var(--rl-ink)] px-4 pt-3 pb-[2px]">
        {formatCurrency(expense.amount)}
      </p>
      <p className="text-[11px] text-[var(--rl-ink-muted)] px-4 pb-3 border-b border-[var(--rl-border)]">
        {expense.paidByName} paid · {date} · {expense.category}
      </p>

      {/* Detail rows */}
      <div className="flex justify-between items-center px-4 py-[9px] border-b border-[#f8fafc]">
        <span className="text-[11px] text-[var(--rl-ink-muted)] font-semibold">Paid by</span>
        <span className="text-[12px] text-[var(--rl-ink)] font-bold">{expense.paidByName}</span>
      </div>
      <div className="flex justify-between items-center px-4 py-[9px] border-b border-[#f8fafc]">
        <span className="text-[11px] text-[var(--rl-ink-muted)] font-semibold">Split</span>
        <span className="text-[12px] text-[var(--rl-ink)] font-bold">
          Equal · {formatCurrency(expense.participants[0]?.shareAmount ?? 0)} each
        </span>
      </div>

      {/* Participants */}
      <div className="px-4 pt-[4px] pb-[2px]">
        <span className="text-[11px] text-[var(--rl-ink-muted)] font-semibold">Participants</span>
      </div>
      {expense.participants.map((p) => {
        const isPayer = expense.paidById === p.roommateId
        const isMe = p.roommateId === myId
        const status = isPayer ? 'paid' : p.settled ? 'settled' : 'owes'
        const style = STATUS_STYLES[status]
        return (
          <div key={p.roommateId} className="flex items-center gap-2 px-4 py-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
              style={{ background: '#94a3b8' }}
            >
              {p.name[0].toUpperCase()}
            </div>
            <span className="text-[12px] font-semibold text-[var(--rl-ink)] flex-1">
              {p.name}{isMe ? ' (You)' : ''}
            </span>
            <span className="text-[12px] font-extrabold text-[var(--rl-ink)]">
              {formatCurrency(p.shareAmount)}
            </span>
            <span
              className="text-[9px] font-bold px-[7px] py-[2px] rounded-full ml-[6px]"
              style={{ background: style.bg, color: style.color }}
            >
              {style.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/rl/
git commit -m "feat(rl): shared UI components — CategoryIcon, StatChip, EmptyState, TransactionCard, BottomSheet, TransactionDetail"
```

---

## Task 6: Dashboard screen

**Files:**
- Create: `src/app/(rl)/page.tsx`

> Dashboard fetches recent expenses + current user id. For MVP, "current user" = first roommate in DB (no auth). We pass `myId` via a server-side fetch; the client uses it for balance calculations.

- [ ] **Step 1: Create Dashboard page**

Create `src/app/(rl)/page.tsx`:

```typescript
import { prisma } from '@/lib/rl/db'
import { formatCurrency, formatSign } from '@/lib/rl/formatCurrency'
import { calculateBalances } from '@/lib/rl/balances'
import { StatChip } from '@/components/rl/StatChip'
import { TransactionCard } from '@/components/rl/TransactionCard'
import { EmptyState } from '@/components/rl/EmptyState'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const [roommates, expenses, settlements] = await Promise.all([
    prisma.roommate.findMany({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { paidBy: true, participants: { include: { roommate: true } } },
    }),
    prisma.settlement.findMany(),
  ])

  const me = roommates[0] // MVP: first roommate = current user
  const myId = me.id

  const rawBalances = calculateBalances(myId, expenses, settlements)
  const totalOwed = rawBalances.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)
  const totalOwing = rawBalances.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const unsettled = rawBalances.filter((b) => b.netCents !== 0).length
  const net = totalOwed - totalOwing

  const serializedExpenses = expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category as any,
    paidById: e.paidById,
    paidByName: e.paidBy.name,
    createdAt: e.createdAt.toISOString(),
    participants: e.participants.map((p) => ({
      roommateId: p.roommateId,
      name: p.roommate.name,
      shareAmount: p.shareAmount,
      settled: false,
    })),
  }))

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <div
        className="flex-shrink-0 px-4 pt-[14px] pb-7"
        style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[11px] font-medium text-white/80">Good morning 👋</p>
            <p className="text-[16px] font-extrabold text-white">{me.name}</p>
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-white/25 flex items-center justify-center text-[13px] font-extrabold text-white">
            {me.name[0]}
          </div>
        </div>
        <p className="text-[11px] font-semibold text-white/70 mb-[3px]">Net balance</p>
        <p className="text-[34px] font-extrabold text-white leading-none tracking-tight">
          {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
        </p>
        <p className="text-[11px] text-white/75 mt-1">across {roommates.length - 1} roommates</p>
      </div>

      {/* Stat chips — overlap hero */}
      <div className="px-3 -mt-4 flex gap-2">
        <StatChip label="You Owe" value={totalOwing} color="red" />
        <StatChip label="Owed to You" value={totalOwed} color="green" />
        <StatChip label="Unsettled" value={String(unsettled)} color="amber" />
      </div>

      {/* Recent */}
      <div className="flex-1 px-3 pt-3 pb-2">
        <p className="text-[13px] font-bold text-[var(--rl-ink)] mb-2">Recent Activity</p>
        {serializedExpenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            subtitle="Tap + to add your first shared expense."
            ctaLabel="Add First Expense"
            ctaHref="/add"
          />
        ) : (
          <DashboardClient expenses={serializedExpenses} myId={myId} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create DashboardClient for interactive transaction cards**

Create `src/app/(rl)/DashboardClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { TransactionCard } from '@/components/rl/TransactionCard'
import { BottomSheet } from '@/components/rl/BottomSheet'
import { TransactionDetail } from '@/components/rl/TransactionDetail'
import type { ExpenseDTO } from '@/types/rl'

interface Props {
  expenses: ExpenseDTO[]
  myId: string
}

export function DashboardClient({ expenses, myId }: Props) {
  const [selected, setSelected] = useState<ExpenseDTO | null>(null)

  return (
    <>
      <div className="flex flex-col gap-2">
        {expenses.map((e) => (
          <TransactionCard key={e.id} expense={e} myId={myId} onClick={() => setSelected(e)} />
        ))}
      </div>
      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <TransactionDetail expense={selected} myId={myId} />}
      </BottomSheet>
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the teal hero with Timothy's name, 3 stat chips, and the recent transaction list. Tap a card to open the detail sheet.

- [ ] **Step 4: Commit**

```bash
git add src/app/'(rl)'/page.tsx src/app/'(rl)'/DashboardClient.tsx
git commit -m "feat(rl): Dashboard screen with hero, stat chips, recent transactions, detail sheet"
```

---

## Task 7: Ledger screen

**Files:**
- Create: `src/app/(rl)/ledger/page.tsx`
- Create: `src/app/(rl)/ledger/LedgerClient.tsx`

- [ ] **Step 1: Create LedgerClient (search + filter + sheet)**

Create `src/app/(rl)/ledger/LedgerClient.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import { CategoryIcon } from '@/components/rl/CategoryIcon'
import { BottomSheet } from '@/components/rl/BottomSheet'
import { TransactionDetail } from '@/components/rl/TransactionDetail'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { ExpenseDTO, Category } from '@/types/rl'

const CATEGORIES = ['all', 'groceries', 'utilities', 'food', 'rent', 'internet']

interface Props {
  expenses: ExpenseDTO[]
  myId: string
}

export function LedgerClient({ expenses, myId }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<ExpenseDTO | null>(null)

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || e.category === category
      return matchSearch && matchCat
    })
  }, [expenses, search, category])

  // Group by date label
  const grouped = useMemo(() => {
    const groups = new Map<string, ExpenseDTO[]>()
    for (const e of filtered) {
      const label = dateLabel(new Date(e.createdAt))
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label)!.push(e)
    }
    return groups
  }, [filtered])

  return (
    <>
      {/* Search */}
      <div className="mx-3 mt-[10px] bg-white rounded-[12px] px-[13px] py-[9px] flex items-center gap-2 flex-shrink-0" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15} className="flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-[12px] text-[var(--rl-ink)] bg-transparent outline-none placeholder:text-[var(--rl-ink-muted)]"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-[6px] px-3 py-2 overflow-x-auto flex-shrink-0 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3 py-[5px] rounded-[20px] text-[10px] font-bold whitespace-nowrap capitalize"
            style={
              cat === category
                ? { background: 'var(--rl-teal)', color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-2">
        {grouped.size === 0 && (
          <div className="flex flex-col items-center gap-2 pt-16 text-center px-6">
            <p className="text-[14px] font-bold text-[var(--rl-ink)]">No results</p>
            <p className="text-[12px] text-[var(--rl-ink-muted)]">Try a different search or category.</p>
          </div>
        )}
        {Array.from(grouped.entries()).map(([label, group]) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.5px] px-3 pt-[6px] pb-[3px]">
              {label}
            </p>
            <div className="flex flex-col gap-[6px] px-3">
              {group.map((e) => {
                const myShare = e.participants.find((p) => p.roommateId === myId)?.shareAmount ?? 0
                const iPaid = e.paidById === myId
                const amount = iPaid ? myShare * (e.participants.length - 1) : myShare
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="bg-white rounded-[14px] p-[10px_12px] flex items-center gap-[10px] w-full text-left"
                    style={{ boxShadow: 'var(--rl-shadow-card)' }}
                  >
                    <CategoryIcon category={e.category as Category} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[var(--rl-ink)] truncate">{e.title}</p>
                      <p className="text-[10px] text-[var(--rl-ink-muted)] mt-[1px]">
                        {e.paidByName} paid · {e.participants.length} people
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-extrabold" style={{ color: iPaid ? 'var(--rl-green)' : 'var(--rl-red)' }}>
                        {iPaid ? '+' : '-'}{formatCurrency(amount)}
                      </p>
                      <p className="text-[10px] text-[var(--rl-ink-muted)]">
                        {iPaid ? 'you get back' : 'your share'}
                      </p>
                      <span
                        className="inline-block text-[9px] font-bold px-[7px] py-[2px] rounded-full mt-[2px]"
                        style={iPaid
                          ? { background: '#f0fdf4', color: '#16a34a' }
                          : { background: '#fffbeb', color: '#d97706' }}
                      >
                        {iPaid ? 'Pending' : 'Pending'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <TransactionDetail expense={selected} myId={myId} />}
      </BottomSheet>
    </>
  )
}

function dateLabel(date: Date): string {
  const now = new Date()
  const diff = Math.round((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}
```

- [ ] **Step 2: Create Ledger page (server)**

Create `src/app/(rl)/ledger/page.tsx`:

```typescript
import { prisma } from '@/lib/rl/db'
import { EmptyState } from '@/components/rl/EmptyState'
import { LedgerClient } from './LedgerClient'
import type { ExpenseDTO } from '@/types/rl'

export default async function LedgerPage() {
  const [me, expenses] = await Promise.all([
    prisma.roommate.findFirst({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: { paidBy: true, participants: { include: { roommate: true } } },
    }),
  ])

  if (!me) return null

  const serialized: ExpenseDTO[] = expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category as any,
    paidById: e.paidById,
    paidByName: e.paidBy.name,
    createdAt: e.createdAt.toISOString(),
    participants: e.participants.map((p) => ({
      roommateId: p.roommateId,
      name: p.roommate.name,
      shareAmount: p.shareAmount,
      settled: false,
    })),
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white px-4 py-[14px] border-b border-[var(--rl-border)] flex-shrink-0">
        <h1 className="text-[18px] font-extrabold text-[var(--rl-ink)]">Ledger</h1>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">{expenses.length} transactions</p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          subtitle="Add an expense to get started."
          ctaLabel="Add Expense"
          ctaHref="/add"
        />
      ) : (
        <LedgerClient expenses={serialized} myId={me.id} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/ledger`. You should see the expense list grouped by date with search and filter working client-side.

- [ ] **Step 4: Commit**

```bash
git add src/app/'(rl)'/ledger/
git commit -m "feat(rl): Ledger screen with search, category filter, date groups, detail sheet"
```

---

## Task 8: Balances screen

**Files:**
- Create: `src/app/(rl)/balances/page.tsx`
- Create: `src/app/(rl)/balances/BalancesClient.tsx`

- [ ] **Step 1: Create BalancesClient**

Create `src/app/(rl)/balances/BalancesClient.tsx`:

```typescript
'use client'

import { useState, useTransition } from 'react'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { BalanceDTO } from '@/types/rl'

interface Props {
  balances: BalanceDTO[]
  myId: string
}

export function BalancesClient({ balances: initial, myId }: Props) {
  const [balances, setBalances] = useState(initial)
  const [, startTransition] = useTransition()

  const totalOwing = balances.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const totalOwed  = balances.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)

  async function handleSettle(b: BalanceDTO) {
    if (b.netCents === 0) return

    const body = b.netCents > 0
      ? { payerId: b.roommateId, receiverId: myId, amount: b.netCents }
      : { payerId: myId, receiverId: b.roommateId, amount: Math.abs(b.netCents) }

    await fetch('/api/rl/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    startTransition(() => {
      setBalances((prev) =>
        prev.map((item) =>
          item.roommateId === b.roommateId ? { ...item, netCents: 0 } : item,
        ),
      )
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Summary */}
      <div className="flex gap-[10px] px-3 pt-3 pb-1 flex-shrink-0">
        <div className="flex-1 rounded-[14px] p-3 text-center" style={{ background: 'var(--rl-red-light)' }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.4px] mb-1" style={{ color: 'var(--rl-red)' }}>You Owe</p>
          <p className="text-[22px] font-extrabold" style={{ color: 'var(--rl-red)' }}>{formatCurrency(totalOwing)}</p>
        </div>
        <div className="flex-1 rounded-[14px] p-3 text-center" style={{ background: 'var(--rl-teal-light)' }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.4px] mb-1" style={{ color: 'var(--rl-teal)' }}>Owed to You</p>
          <p className="text-[22px] font-extrabold" style={{ color: 'var(--rl-teal)' }}>{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      {/* Per-roommate cards */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
        {balances.map((b) => {
          const isOwed    = b.netCents > 0
          const isOwing   = b.netCents < 0
          const isSettled = b.netCents === 0

          const amountColor = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'
          const dirLabel    = isOwed ? 'Owes you' : isOwing ? 'You owe' : 'Settled'
          const dirColor    = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'

          const barWidth = isSettled ? 0 : Math.min(100, Math.round((Math.abs(b.netCents) / Math.max(totalOwed, totalOwing, 1)) * 100))
          const barColor = isOwed ? 'var(--rl-green)' : 'var(--rl-red)'

          const btnStyle = isOwed
            ? { color: 'var(--rl-teal)', borderColor: 'var(--rl-teal-border)', background: 'var(--rl-teal-light)' }
            : isOwing
            ? { color: 'var(--rl-red)', borderColor: 'var(--rl-red-border)', background: 'var(--rl-red-light)' }
            : { color: 'var(--rl-ink-muted)', borderColor: 'var(--rl-border)', background: '#f8fafc' }

          return (
            <div key={b.roommateId} className="bg-white rounded-[16px] p-[12px_14px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
              <div className="flex items-center gap-[10px] mb-[9px]">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] font-extrabold text-white flex-shrink-0"
                  style={{ background: b.color }}
                >
                  {b.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[var(--rl-ink)]">{b.name}</p>
                  <p className="text-[10px] font-semibold mt-[1px]" style={{ color: dirColor }}>{dirLabel}</p>
                </div>
                <p className="text-[18px] font-extrabold" style={{ color: amountColor }}>
                  {isSettled ? '$0.00' : formatCurrency(Math.abs(b.netCents))}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-[5px] bg-[#f1f5f9] rounded-full overflow-hidden mb-[10px]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: isSettled ? '#e2e8f0' : barColor }} />
              </div>

              <button
                onClick={() => handleSettle(b)}
                disabled={isSettled}
                className="w-full rounded-[10px] py-2 text-[11px] font-bold border-[1.5px] disabled:opacity-50"
                style={btnStyle}
              >
                {isSettled ? '✓ Settled' : 'Mark as Settled'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Balances page (server)**

Create `src/app/(rl)/balances/page.tsx`:

```typescript
import { prisma } from '@/lib/rl/db'
import { calculateBalances } from '@/lib/rl/balances'
import { EmptyState } from '@/components/rl/EmptyState'
import { BalancesClient } from './BalancesClient'
import type { BalanceDTO } from '@/types/rl'

export default async function BalancesPage() {
  const [roommates, expenses, settlements] = await Promise.all([
    prisma.roommate.findMany({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({ include: { participants: true } }),
    prisma.settlement.findMany(),
  ])

  const me = roommates[0]
  const others = roommates.filter((r) => r.id !== me.id)
  const rawBalances = calculateBalances(me.id, expenses, settlements)

  const balances: BalanceDTO[] = await Promise.all(
    others.map(async (r) => {
      const net = rawBalances.find((b) => b.roommateId === r.id)
      const last = await prisma.expense.findFirst({
        where: { participants: { some: { roommateId: r.id } } },
        orderBy: { createdAt: 'desc' },
      })
      return {
        roommateId: r.id,
        name: r.name,
        handle: r.handle,
        color: r.color,
        netCents: net?.netCents ?? 0,
        lastExpenseTitle: last?.title ?? null,
        lastExpenseDate: last?.createdAt.toISOString() ?? null,
        lastExpenseCategory: (last?.category as any) ?? null,
      }
    }),
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white px-4 py-[14px] border-b border-[var(--rl-border)] flex-shrink-0">
        <h1 className="text-[18px] font-extrabold text-[var(--rl-ink)]">Balances</h1>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">
          {others.length} roommates · {balances.filter((b) => b.netCents !== 0).length} unsettled
        </p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No balances yet"
          subtitle="Add an expense and balances will appear here."
          ctaLabel="Add Expense"
          ctaHref="/add"
        />
      ) : (
        <BalancesClient balances={balances} myId={me.id} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/balances`. You should see summary cards and per-roommate balance cards. Click "Mark as Settled" on one — it should update to gray/settled state immediately.

- [ ] **Step 4: Commit**

```bash
git add src/app/'(rl)'/balances/
git commit -m "feat(rl): Balances screen with summary, per-person cards, progress bars, settle action"
```

---

## Task 9: Roommates screen

**Files:**
- Create: `src/app/(rl)/roommates/page.tsx`

- [ ] **Step 1: Create Roommates page**

Create `src/app/(rl)/roommates/page.tsx`:

```typescript
import { prisma } from '@/lib/rl/db'
import { calculateBalances } from '@/lib/rl/balances'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { CategoryIcon } from '@/components/rl/CategoryIcon'
import type { Category } from '@/types/rl'

export default async function RoommatesPage() {
  const [roommates, expenses, settlements] = await Promise.all([
    prisma.roommate.findMany({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({ include: { participants: true } }),
    prisma.settlement.findMany(),
  ])

  const me = roommates[0]
  const others = roommates.filter((r) => r.id !== me.id)
  const rawBalances = calculateBalances(me.id, expenses, settlements)

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const now = new Date()
  const thisMonth = expenses.filter(
    (e) => e.createdAt.getMonth() === now.getMonth() && e.createdAt.getFullYear() === now.getFullYear(),
  )
  const thisMonthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)

  const members = await Promise.all(
    others.map(async (r) => {
      const net = rawBalances.find((b) => b.roommateId === r.id)
      const last = await prisma.expense.findFirst({
        where: { participants: { some: { roommateId: r.id } } },
        orderBy: { createdAt: 'desc' },
      })
      return { roommate: r, netCents: net?.netCents ?? 0, lastExpense: last }
    }),
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Hero */}
      <div
        className="flex-shrink-0 px-4 pt-[14px] pb-4"
        style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-[18px] font-extrabold text-white">Roommates</h1>
            <p className="text-[11px] text-white/75">{roommates.length} people · Apt 4B</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-bold text-white border border-white/40 bg-white/20 rounded-full px-[14px] py-[6px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" width={12} height={12}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Invite
          </button>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Total Spent', value: formatCurrency(totalSpent) },
            { label: 'This Month', value: formatCurrency(thisMonthTotal) },
            { label: 'Expenses', value: String(expenses.length) },
          ].map((chip) => (
            <div key={chip.label} className="flex-1 bg-white/15 rounded-[12px] p-[8px_10px] text-center">
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-[0.3px] mb-[3px]">{chip.label}</p>
              <p className="text-[15px] font-extrabold text-white">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roommate cards */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {members.map(({ roommate: r, netCents, lastExpense }) => {
          const isOwed    = netCents > 0
          const isOwing   = netCents < 0
          const isSettled = netCents === 0

          const amountColor = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'
          const dirLabel    = isOwed ? 'owes you' : isOwing ? 'you owe' : ''
          const dirColor    = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'

          const lastDate = lastExpense
            ? new Date(lastExpense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : null

          return (
            <div key={r.id} className="bg-white rounded-[16px] p-[12px_14px] flex items-center gap-3" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[17px] font-extrabold text-white"
                  style={{ background: r.color }}
                >
                  {r.name[0]}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[var(--rl-ink)]">{r.name}</p>
                <p className="text-[10px] text-[var(--rl-ink-muted)] font-medium">@{r.handle}</p>
                {lastExpense && (
                  <div className="flex items-center gap-[3px] mt-[3px]">
                    <CategoryIcon category={lastExpense.category as Category} size={14} />
                    <p className="text-[10px] text-[var(--rl-ink-muted)] truncate">
                      {lastExpense.title} · {lastDate}
                    </p>
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="text-right flex-shrink-0">
                <p className="text-[16px] font-extrabold leading-none" style={{ color: amountColor }}>
                  {isSettled ? '$0.00' : formatCurrency(Math.abs(netCents))}
                </p>
                {isSettled ? (
                  <span className="inline-flex items-center gap-[3px] text-[9px] font-bold text-[var(--rl-ink-muted)] bg-[#f1f5f9] rounded-full px-[9px] py-[3px] mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width={9} height={9}><polyline points="20 6 9 17 4 12"/></svg>
                    Settled
                  </span>
                ) : (
                  <p className="text-[10px] font-semibold mt-1" style={{ color: dirColor }}>{dirLabel}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/roommates`. Each roommate card should show name, handle, last transaction, and color-coded balance.

- [ ] **Step 3: Commit**

```bash
git add src/app/'(rl)'/roommates/
git commit -m "feat(rl): Roommates screen with hero, summary chips, Splitwise-style member cards"
```

---

## Task 10: Add Expense screen

**Files:**
- Create: `src/app/(rl)/add/page.tsx`
- Create: `src/app/(rl)/add/AddExpenseForm.tsx`

- [ ] **Step 1: Create AddExpenseForm client component**

Create `src/app/(rl)/add/AddExpenseForm.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryIcon } from '@/components/rl/CategoryIcon'
import type { RoommateDTO, Category, CreateExpenseBody } from '@/types/rl'

const CATEGORIES: Category[] = ['groceries', 'utilities', 'food', 'rent', 'internet', 'other']

interface Props {
  roommates: RoommateDTO[]
  myId: string
}

export function AddExpenseForm({ roommates, myId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<Category>('groceries')
  const [paidById, setPaidById] = useState(myId)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(roommates.map((r) => r.id)))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100)
  const participantCount = checkedIds.size
  const sharePerPerson = participantCount > 0 ? Math.round(amountCents / participantCount) : 0

  function toggleRoommate(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (amountCents <= 0) { setError('Please enter an amount.'); return }
    if (checkedIds.size === 0) { setError('Select at least one person to split with.'); return }

    setSubmitting(true)
    setError('')

    const body: CreateExpenseBody = {
      title: title.trim(),
      amountCents,
      category,
      paidById,
      participantIds: Array.from(checkedIds),
    }

    const res = await fetch('/api/rl/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      setError('Failed to add expense. Please try again.')
      setSubmitting(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
      {/* Amount */}
      <div className="bg-white rounded-[18px] p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <p className="text-[10px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.4px] mb-[5px]">How much?</p>
        <div className="flex items-center justify-center gap-[2px]">
          <span className="text-[28px] font-extrabold text-[var(--rl-teal)]">$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="text-[36px] font-extrabold text-[var(--rl-teal)] bg-transparent outline-none w-[160px] text-center tracking-tight"
          />
        </div>
      </div>

      {/* Title */}
      <div className="bg-white rounded-[14px] px-[13px] py-[10px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
        <p className="text-[9px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.5px] mb-1">Title</p>
        <input
          type="text"
          placeholder="e.g. Trader Joe's run"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[13px] font-semibold text-[var(--rl-ink)] bg-transparent outline-none placeholder:text-[var(--rl-ink-muted)]"
        />
      </div>

      {/* Paid By */}
      <div className="bg-white rounded-[14px] px-[13px] py-[10px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
        <p className="text-[9px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.5px] mb-1">Paid By</p>
        <select
          value={paidById}
          onChange={(e) => setPaidById(e.target.value)}
          className="w-full text-[13px] font-semibold text-[var(--rl-ink)] bg-transparent outline-none"
        >
          {roommates.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}{r.id === myId ? ' (You)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="bg-white rounded-[14px] px-[13px] py-[10px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
        <p className="text-[9px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.5px] mb-2">Category</p>
        <div className="flex flex-wrap gap-[6px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex items-center gap-1 px-[10px] py-[5px] rounded-[20px] text-[11px] font-semibold capitalize border-[1.5px]"
              style={
                cat === category
                  ? { background: 'var(--rl-teal-light)', color: 'var(--rl-teal)', borderColor: 'var(--rl-teal-border)' }
                  : { background: '#f1f5f9', color: '#64748b', borderColor: 'transparent' }
              }
            >
              <CategoryIcon category={cat} size={16} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Split With */}
      <div className="bg-white rounded-[14px] px-[13px] py-[10px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
        <p className="text-[9px] font-bold text-[var(--rl-ink-muted)] uppercase tracking-[0.5px] mb-[2px]">Split With</p>
        <p className="text-[10px] text-[var(--rl-teal)] font-semibold mb-2">
          Equal · {sharePerPerson > 0 ? `$${(sharePerPerson / 100).toFixed(2)} each` : '—'}
        </p>
        <div className="flex flex-col gap-0">
          {roommates.map((r) => {
            const checked = checkedIds.has(r.id)
            return (
              <button
                key={r.id}
                onClick={() => toggleRoommate(r.id)}
                className="flex items-center gap-2 py-[7px] border-b border-[#f8fafc] last:border-none w-full text-left"
              >
                {/* Checkbox */}
                <div
                  className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0"
                  style={
                    checked
                      ? { background: 'var(--rl-teal)' }
                      : { background: '#fff', border: '2px solid #cbd5e1' }
                  }
                >
                  {checked && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                {/* Avatar */}
                <div
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
                  style={{ background: r.color }}
                >
                  {r.name[0]}
                </div>
                <span className="flex-1 text-[12px] font-semibold text-[var(--rl-ink)]">
                  {r.name}{r.id === myId ? ' (You)' : ''}
                </span>
                <span className="text-[12px] font-bold" style={{ color: checked ? 'var(--rl-teal)' : '#cbd5e1' }}>
                  {checked && sharePerPerson > 0 ? `$${(sharePerPerson / 100).toFixed(2)}` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-[12px] font-semibold text-[var(--rl-red)] text-center px-2">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full text-white text-[14px] font-extrabold rounded-[14px] py-[13px] disabled:opacity-60"
        style={{ background: 'var(--rl-teal)', boxShadow: 'var(--rl-shadow-strong)' }}
      >
        {submitting ? 'Adding…' : 'Add Expense'}
      </button>

      <div className="h-4" /> {/* bottom padding */}
    </div>
  )
}
```

- [ ] **Step 2: Create Add page (server)**

Create `src/app/(rl)/add/page.tsx`:

```typescript
import { prisma } from '@/lib/rl/db'
import { AddExpenseForm } from './AddExpenseForm'
import Link from 'next/link'

export default async function AddExpensePage() {
  const roommates = await prisma.roommate.findMany({ orderBy: { name: 'asc' } })
  const me = roommates[0]

  const dtos = roommates.map((r) => ({
    id: r.id,
    name: r.name,
    handle: r.handle,
    color: r.color,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white px-4 py-[13px] border-b border-[var(--rl-border)] flex items-center gap-[10px] flex-shrink-0">
        <Link href="/" className="w-[32px] h-[32px] rounded-[10px] bg-[#f1f5f9] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="text-[16px] font-extrabold text-[var(--rl-ink)]">Add Expense</h1>
      </div>
      <AddExpenseForm roommates={dtos} myId={me.id} />
    </div>
  )
}
```

- [ ] **Step 3: Verify end-to-end**

```bash
npm run dev
```

1. Navigate to `http://localhost:3000/add` (or tap the + nav button)
2. Enter a title ("Movie night"), amount (30), pick Food, check 3 people
3. Tap "Add Expense"
4. You should be redirected to Dashboard and see the new expense in Recent Activity
5. Navigate to Balances — balances should update

- [ ] **Step 4: Commit**

```bash
git add src/app/'(rl)'/add/
git commit -m "feat(rl): Add Expense screen with live equal-split calculator and POST to API"
```

---

## Task 11: PWA manifest + polish

**Files:**
- Create: `public/manifest.json`
- Modify: `src/app/(rl)/layout.tsx` (add `<meta>` viewport)

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.json`:

```json
{
  "name": "RoomieLedger",
  "short_name": "RoomieLedger",
  "description": "Split expenses with your roommates",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#0d9488",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "48x48",
      "type": "image/x-icon"
    }
  ]
}
```

- [ ] **Step 2: Add scrollbar hiding utility**

Append to `src/app/globals.css`:

```css
/* Hide scrollbar on filter rows */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 3: Final smoke test — all 5 screens**

```bash
npm run dev
```

Check each route:
- `/` — Dashboard with hero, chips, recent activity
- `/ledger` — Ledger with search and filter working
- `/balances` — Balances with settle button
- `/roommates` — Roommates list
- `/add` — Add form, submit, redirects to dashboard

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: No TypeScript errors. Build completes successfully.

- [ ] **Step 5: Final commit**

```bash
git add public/manifest.json src/app/globals.css
git commit -m "feat(rl): PWA manifest, scrollbar polish, build verified"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 5-tab bottom nav (Home, Ledger, Add, Balances, Roommates)
- ✅ Center Add button — teal rounded square, equal flex-1 with other items
- ✅ Dashboard: hero gradient, stat chips, recent activity, empty state
- ✅ Add Expense: title, amount, paid by, category, split with, equal split rule, 1 screen
- ✅ Ledger: vertical timeline, cards, date groups, search, category filter, tap → detail sheet
- ✅ Balances: red/green/gray color coding, settle action, progress bar
- ✅ Roommates: Splitwise-inspired, hero, summary chips, member cards with balance + last txn
- ✅ Transaction Detail: bottom sheet, participant breakdown, status badges
- ✅ Empty states: Dashboard, Ledger (no results), Balances
- ✅ Real-time balance update after expense added
- ✅ No auth, no payments, no backend complexity
- ✅ Mobile-first (430px max-width container, `100dvh`)
- ✅ Large touch targets (44px+ buttons)
- ✅ PWA manifest
- ✅ SVG icons for categories

**Type consistency check:**
- `ExpenseDTO` used consistently across all components and pages ✅
- `BalanceDTO` used in balances page and client ✅
- `RoommateDTO` used in add form ✅
- `Category` type matches the string literals in schema ✅
- `formatCurrency(cents)` used everywhere amounts are displayed ✅
- `calculateBalances(myId, expenses, settlements)` signature consistent ✅
