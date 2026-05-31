'use client'

import { useState, useMemo } from 'react'
import { TransactionCard } from '@/components/rl/TransactionCard'
import { BottomSheet } from '@/components/rl/BottomSheet'
import { TransactionDetail, EXPENSE_DETAIL_TITLE_ID } from '@/components/rl/TransactionDetail'
import type { ExpenseDTO } from '@/types/rl'

const CATEGORIES = ['all', 'groceries', 'utilities', 'food', 'rent', 'internet'] as const

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
    <div className="flex flex-col flex-1 overflow-hidden gap-4">
      <label className="rl-search flex-shrink-0" htmlFor="ledger-search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--rl-ink-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={18}
          height={18}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="rl-sr-only">Search expenses</span>
        <input
          id="ledger-search"
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rl-input"
          autoComplete="off"
        />
      </label>

      <div
        className="rl-chip-scroll no-scrollbar flex-shrink-0"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rl-pill capitalize flex-shrink-0 ${cat === category ? 'rl-pill-active' : ''}`}
            aria-pressed={cat === category}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-2" aria-live="polite" aria-relevant="additions">
        {grouped.size === 0 && (
          <div className="flex flex-col items-center gap-2 pt-16 text-center px-6" role="status">
            <p className="rl-h2">No results</p>
            <p className="rl-caption">
              Try a different search term or choose another category filter.
            </p>
          </div>
        )}
        {Array.from(grouped.entries()).map(([label, group]) => (
          <section key={label} className="mb-5" aria-labelledby={`ledger-${label.replace(/\s/g, '-')}`}>
            <h2 id={`ledger-${label.replace(/\s/g, '-')}`} className="rl-overline mb-3">
              {label}
            </h2>
            <ul className="rl-list">
              {group.map((e) => (
                <li key={e.id}>
                  <TransactionCard
                    expense={e}
                    myId={myId}
                    onClick={() => setSelected(e)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        titleId={EXPENSE_DETAIL_TITLE_ID}
        closeLabel={selected ? `Close details for ${selected.title}` : 'Close details'}
      >
        {selected && <TransactionDetail expense={selected} myId={myId} />}
      </BottomSheet>
    </div>
  )
}

function dateLabel(date: Date): string {
  const now = new Date()
  const diff = Math.round((now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}
