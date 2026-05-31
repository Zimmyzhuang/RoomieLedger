'use client'

import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { describeExpenseAction } from '@/lib/rl/a11y'
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
  const amountWord = isPositive ? 'you receive' : 'you owe'
  const amountText = `${isPositive ? '+' : '-'}${formatCurrency(displayAmount)}`
  const payerText = iPaid ? 'you paid' : `${expense.paidByName} paid`

  const ariaLabel = describeExpenseAction(
    expense.title,
    `${amountWord} ${formatCurrency(displayAmount)}`,
    `${dateLabel}, ${expense.category}, ${payerText}. Tap for details.`,
  )

  return (
    <button type="button" onClick={onClick} className="rl-tappable-row" aria-label={ariaLabel}>
      <div className="rl-media" aria-hidden="true">
        <CategoryIcon category={expense.category as Category} />
      </div>
      <div className="rl-text-stack">
        <p className="rl-body font-semibold truncate">{expense.title}</p>
        <p className="rl-caption">
          {dateLabel} · {expense.category}
        </p>
      </div>
      <div className="rl-amount-col">
        <p className={`rl-amount ${isPositive ? 'rl-amount-positive' : 'rl-amount-negative'}`}>
          <span className="rl-sr-only">{amountWord} </span>
          {amountText}
        </p>
        <p className="rl-caption">{payerText}</p>
      </div>
    </button>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)
  const days = Math.round(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
