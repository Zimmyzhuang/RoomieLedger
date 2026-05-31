import { CategoryIcon } from './CategoryIcon'
import { StatusBadge } from './StatusBadge'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { ExpenseDTO, Category } from '@/types/rl'

export const EXPENSE_DETAIL_TITLE_ID = 'expense-detail-title'

interface Props {
  expense: ExpenseDTO
  myId: string
}

export function TransactionDetail({ expense, myId }: Props) {
  const date = new Date(expense.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const shareEach = expense.participants[0]?.shareAmount ?? 0

  return (
    <div style={{ padding: 'var(--rl-space-5) var(--rl-space-6) var(--rl-space-8)' }}>
      <div
        className="rl-list-row"
        style={{ padding: 0, minHeight: 'auto', marginBottom: 'var(--rl-space-6)' }}
      >
        <div className="rl-media" aria-hidden="true">
          <CategoryIcon category={expense.category as Category} />
        </div>
        <div className="rl-text-stack">
          <h2 id={EXPENSE_DETAIL_TITLE_ID} className="rl-h1">
            {expense.title}
          </h2>
          <p className="rl-caption">
            {date} · {expense.category}
          </p>
        </div>
      </div>

      <div
        className="rounded-[var(--rl-radius-md)] text-center"
        style={{ background: 'var(--rl-accent-soft)', padding: 'var(--rl-space-5)', marginBottom: 'var(--rl-space-6)' }}
        role="group"
        aria-label={`Total expense amount ${formatCurrency(expense.amount)}`}
      >
        <p className="rl-overline" style={{ color: 'var(--rl-accent-hover)' }}>
          Total
        </p>
        <p className="rl-display mt-2">{formatCurrency(expense.amount)}</p>
        <p className="rl-small mt-3">
          {expense.paidByName} paid · {formatCurrency(shareEach)} each
        </p>
      </div>

      <dl className="rl-list mb-6">
        <div className="flex justify-between items-center gap-4">
          <dt className="rl-caption font-medium">Paid by</dt>
          <dd className="rl-body font-semibold">{expense.paidByName}</dd>
        </div>
        <div className="flex justify-between items-center gap-4">
          <dt className="rl-caption font-medium">Split</dt>
          <dd className="rl-body font-semibold">
            Equal · {expense.participants.length} people
          </dd>
        </div>
      </dl>

      <h3 className="rl-overline mb-3">Split between</h3>
      <ul className="rl-list" aria-label="Participants and payment status">
        {expense.participants.map((p) => {
          const isPayer = expense.paidById === p.roommateId
          const isMe = p.roommateId === myId
          const status = isPayer ? 'paid' : p.settled ? 'settled' : 'owes'

          return (
            <li key={p.roommateId} className="rl-list-row rl-surface-muted">
              <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: 'var(--rl-ink-muted)' }}>
                {p.name[0].toUpperCase()}
              </div>
              <div className="rl-text-stack">
                <p className="rl-body font-semibold">
                  {p.name}
                  {isMe ? ' (you)' : ''}
                </p>
                <StatusBadge status={status} />
              </div>
              <div className="rl-amount-col">
                <p className="rl-amount text-[var(--rl-ink)]">{formatCurrency(p.shareAmount)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
