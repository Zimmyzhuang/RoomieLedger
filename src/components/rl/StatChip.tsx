import { formatCurrency } from '@/lib/rl/formatCurrency'

interface Props {
  label: string
  value: string | number
  color: 'red' | 'green' | 'amber' | 'ink'
}

const COLOR_CLASS = {
  red: 'rl-amount-negative',
  green: 'rl-amount-positive',
  amber: 'text-[var(--rl-warning)]',
  ink: 'text-[var(--rl-ink)]',
} as const

export function StatChip({ label, value, color }: Props) {
  const display =
    typeof value === 'number' ? formatCurrency(Math.abs(value)) : value
  const spoken = `${label}: ${display}`

  return (
    <div className="rl-card rl-stat-chip" role="group" aria-label={spoken}>
      <p className="rl-overline">{label}</p>
      <p className={`rl-amount ${COLOR_CLASS[color]}`}>{display}</p>
    </div>
  )
}
