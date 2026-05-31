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
      <div className="flex items-center gap-2 px-4 pb-3 border-b border-[var(--rl-border)]">
        <CategoryIcon category={expense.category as Category} size={32} />
        <h2 className="text-[16px] font-extrabold text-[var(--rl-ink)]">{expense.title}</h2>
      </div>

      <p className="text-[30px] font-extrabold text-[var(--rl-ink)] px-4 pt-3 pb-[2px]">
        {formatCurrency(expense.amount)}
      </p>
      <p className="text-[11px] text-[var(--rl-ink-muted)] px-4 pb-3 border-b border-[var(--rl-border)]">
        {expense.paidByName} paid · {date} · {expense.category}
      </p>

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
