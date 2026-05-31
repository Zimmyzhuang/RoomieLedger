'use client'

import { useState } from 'react'
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

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full text-white text-[14px] font-extrabold rounded-[14px] py-[13px] disabled:opacity-60"
        style={{ background: 'var(--rl-teal)', boxShadow: 'var(--rl-shadow-strong)' }}
      >
        {submitting ? 'Adding…' : 'Add Expense'}
      </button>

      <div className="h-4" />
    </div>
  )
}
