# RoomieLedger — Design Spec
**Date:** 2026-05-30  
**Status:** Approved for implementation

---

## Overview

RoomieLedger is a mobile-first PWA for student roommates to track shared expenses, split costs equally, and settle debts — no auth, no payments, no backend complexity for MVP.

**Design language:** Style B · Clean & Friendly · Teal (`#0d9488`) accent · White cards · Subtle shadows · Inter font

---

## Navigation

5-item bottom nav bar, always visible, evenly spaced:

| Position | Label | Icon | Route |
|---|---|---|---|
| 1 | Home | House | `/` |
| 2 | Ledger | Document | `/ledger` |
| 3 | **Add** | Teal rounded-square `+` | Opens Add Expense screen |
| 4 | Balances | Dollar sign | `/balances` |
| 5 | Roommates | People | `/roommates` |

The center Add button uses a `42×42px` teal rounded-square icon (`border-radius: 14px`) raised `8px` above the nav baseline. It is a nav item, not a floating FAB — all 5 items share equal `flex: 1` width so the bar is perfectly even.

---

## Screens

### 1. Dashboard (`/`)

**Hero header** — teal gradient (`#0d9488 → #0f766e`), contains:
- Greeting ("Good morning 👋 Timothy")
- Net balance in large white type (`+$104.50`)
- Subtitle: "across N roommates"

**Stat chips** — 3 equal cards overlapping the bottom of the hero by 16px:
- You Owe (red)
- Owed to You (green)
- Unsettled count (amber)

**Recent Activity** — vertical list of `txn-card` components:
- Category icon (colored rounded square, SVG)
- Expense name + category · date
- Amount (red = you owe, green = owed to you) + who paid

**Empty state:** Teal icon, "No expenses yet", subtitle, teal CTA button.

---

### 2. Add Expense

Single-screen form (no multi-step wizard). Fields top to bottom:

1. **Amount** — large teal number display (`36px bold`), full-width hero card
2. **Title** — text field
3. **Paid By** — dropdown/selector (defaults to current user)
4. **Category** — horizontal pill selector with SVG icons: Groceries, Utilities, Food, Rent, Internet
5. **Split With** — checklist of roommates with checkboxes; label shows "Equal · $X.XX each" updating live as members are checked/unchecked

**CTA:** Full-width teal "Add Expense" button with shadow.

**Rule:** Equal split only. Share = amount ÷ checked roommates count, recalculated on every toggle.

---

### 3. Ledger (`/ledger`)

**Header:** "Ledger" title + transaction count subtitle

**Search bar:** White rounded card with search icon, placeholder "Search expenses..."

**Category filter chips:** Horizontal scroll row — All (active=teal), Groceries, Utilities, Food, Rent, Internet

**Transaction list:** Grouped by date label (Today / Yesterday / May 28 / etc.)

Each row is a `ledger-card`:
- Category SVG icon (colored background)
- Expense name + "X paid · N people"
- Right: amount (red/green) + "your share" / "you get back" + Pending/Settled badge

**Tap any row** → opens Transaction Detail bottom sheet.

---

### 4. Balances (`/balances`)

**Header:** "Balances" + "N roommates · N unsettled"

**Summary cards:** 2-column — "You Owe" (red bg) and "Owed to You" (teal bg)

**Per-roommate balance cards:**
- Avatar (colored circle with initial)
- Name + direction label (green "Owes you" / red "You owe")
- Amount (large, color-coded)
- Progress bar (green or red fill showing relative amount)
- "Mark as Settled" button (teal outline if owed, red outline if owing, gray if already settled)

**Color rules:**
- Green = they owe you
- Red = you owe them
- Gray + "Settled" badge = $0 balance

---

### 5. Roommates (`/roommates`) — Splitwise-inspired

**Hero header** — same teal gradient:
- Title "Roommates" + group name/unit
- "Invite +" button (outline style, top right)
- 3 summary chips: Total Spent · This Month · Expenses count

**Roommate cards** (one per person):
- Avatar with optional online dot (green)
- Name + @handle
- Last transaction (icon + name + date)
- Balance amount (right-aligned, color-coded: green/red/gray)
- "Owes you" / "You owe" / Settled badge label

**Settled state:** Gray `$0.00` + gray pill badge with checkmark "Settled"

**Empty state (no expenses):** Teal document icon, "No transactions yet", subtitle "Add an expense to get started."

**Empty state (filtered, no results):** Muted search icon, "No results for '[query]'", "Try a different search or category."

---

### 6. Transaction Detail (Bottom Sheet)

Slides up over any screen (triggered by tapping a ledger row or balance item).

**Sheet anatomy:**
- Drag handle pill
- Icon + expense title
- Large amount
- Meta line: "Who paid · Date · Category"
- Detail rows: Paid by / Split type / per-person amount
- Participant list: avatar + name + share amount + status badge (PAID / OWES / SETTLED)

---

## Component Design Tokens

```
--teal:        #0d9488
--teal-dark:   #0f766e
--teal-light:  #f0fdfa
--teal-border: #99f6e4

--red:         #ef4444
--red-light:   #fef2f2
--red-border:  #fecaca

--green:       #10b981
--green-light: #f0fdf4

--amber:       #f59e0b

--ink:         #1a1a2e
--ink-secondary: #64748b
--ink-muted:   #94a3b8
--border:      #e8edf2
--bg:          #f8fafc
--card:        #ffffff

--radius-card: 14px
--radius-pill: 20px
--radius-sheet: 22px
--shadow-card: 0 1px 6px rgba(0,0,0,0.06)
--shadow-strong: 0 4px 16px rgba(13,148,136,0.35)

--touch-target: 44px minimum height on all interactive elements
```

---

## Interaction Behavior

- **Tap ledger row** → slide-up bottom sheet (Transaction Detail)
- **Tap Add nav** → navigate to Add Expense screen
- **Toggle split checkbox** → live-recalculate equal share amount
- **Mark as Settled** → instantly updates balance to $0, changes card to gray settled state
- **Add Expense submit** → recalculates all balances in real time, navigates back to Dashboard

---

## Tech Stack (per CLAUDE.md)

- React + TypeScript + Tailwind CSS
- Node.js + Express backend
- SQLite (dev) / PostgreSQL (prod)
- Prisma ORM
- REST API: `GET /expenses`, `POST /expenses`, `GET /balances`, `POST /settlements`, `GET /ledger`
- No auth, no payments for MVP

---

## Out of Scope (MVP)

- Authentication / login
- Real-time sync (websockets)
- Push notifications
- Payment processing
- Multiple households
- Custom split ratios (equal split only)
