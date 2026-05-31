import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { GroupDebtDTO } from '@/types/rl'

interface Props {
  debt: GroupDebtDTO
}

export function DebtRow({ debt }: Props) {
  const label = `${debt.fromName} owes ${debt.toName} ${formatCurrency(debt.amountCents)}`

  return (
    <article className="rl-card rl-list-row" aria-label={label}>
      <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: debt.fromColor }}>
        {debt.fromName[0]}
      </div>
      <div className="flex-1 min-w-0 text-center">
        <p className="rl-body font-semibold leading-snug">
          <span>{debt.fromName}</span>
          <span className="rl-caption font-medium"> owes </span>
          <span>{debt.toName}</span>
        </p>
        <p className="rl-amount rl-amount-negative mt-1">
          <span className="rl-sr-only">Amount: </span>
          {formatCurrency(debt.amountCents)}
        </p>
      </div>
      <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: debt.toColor }}>
        {debt.toName[0]}
      </div>
    </article>
  )
}
