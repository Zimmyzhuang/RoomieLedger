import { CategoryIcon } from '@/components/rl/CategoryIcon'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { Category } from '@/types/rl'

interface Props {
  name: string
  handle: string
  color: string
  netCents: number
  lastExpenseTitle: string | null
  lastExpenseDate: string | null
  lastExpenseCategory: Category | null
}

export function GroupMemberCard({
  name,
  handle,
  color,
  netCents,
  lastExpenseTitle,
  lastExpenseDate,
  lastExpenseCategory,
}: Props) {
  const isOwed = netCents > 0
  const isOwing = netCents < 0
  const isSettled = netCents === 0

  const amountClass = isOwed ? 'rl-amount-positive' : isOwing ? 'rl-amount-negative' : 'rl-amount-muted'
  const dirLabel = isOwed ? 'Owes you' : isOwing ? 'You owe' : 'Settled'
  const dirClass = isOwed ? 'rl-amount-positive' : isOwing ? 'rl-amount-negative' : 'rl-amount-muted'

  return (
    <article
      className="rl-card rl-list-row"
      aria-label={`${name}, ${dirLabel}${
        isSettled ? '' : ` ${formatCurrency(Math.abs(netCents))}`
      }`}
    >
      <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: color }}>
        {name[0]}
      </div>

      <div className="rl-text-stack">
        <p className="rl-body font-semibold">{name}</p>
        <p className="rl-caption">@{handle}</p>
        {lastExpenseTitle && lastExpenseCategory && (
          <div className="rl-row mt-2" style={{ gap: 'var(--rl-space-2)' }}>
            <CategoryIcon category={lastExpenseCategory} compact />
            <p className="rl-caption truncate">
              Last: {lastExpenseTitle}
              {lastExpenseDate ? ` · ${lastExpenseDate}` : ''}
            </p>
          </div>
        )}
      </div>

      <div className="rl-amount-col">
        <p className={`rl-amount ${amountClass}`}>
          <span className="rl-sr-only">{dirLabel}: </span>
          {isSettled ? '$0.00' : formatCurrency(Math.abs(netCents))}
        </p>
        {!isSettled && <p className={`rl-caption font-medium ${dirClass}`}>{dirLabel}</p>}
        {isSettled && <span className="rl-pill">Settled</span>}
      </div>
    </article>
  )
}
