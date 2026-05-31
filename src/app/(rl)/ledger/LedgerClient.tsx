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
