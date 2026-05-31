'use client'

import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { ExpenseDTO, Category } from '@/types/rl'

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
