import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { GroupDebtDTO } from '@/types/rl'

interface Props {
  debt: GroupDebtDTO
}

export function DebtRow({ debt }: Props) {
  return (
    <div
      className="bg-white rounded-[16px] p-[12px_14px] flex items-center gap-[10px]"
      style={{ boxShadow: 'var(--rl-shadow-card)' }}
    >
      <div
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[14px] font-extrabold text-white flex-shrink-0"
        style={{ background: debt.fromColor }}
      >
        {debt.fromName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--rl-ink)] leading-tight">
          <span>{debt.fromName}</span>
          <span className="text-[var(--rl-ink-muted)] font-semibold"> owes </span>
          <span>{debt.toName}</span>
        </p>
        <p className="text-[10px] font-semibold mt-[2px]" style={{ color: 'var(--rl-red)' }}>
          {formatCurrency(debt.amountCents)}
        </p>
      </div>
      <div
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[14px] font-extrabold text-white flex-shrink-0"
        style={{ background: debt.toColor }}
      >
        {debt.toName[0]}
      </div>
    </div>
  )
}
