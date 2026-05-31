import { formatCurrency } from '@/lib/rl/formatCurrency'

interface Props {
  label: string
  value: string | number
  color: 'red' | 'green' | 'amber' | 'ink'
}

const COLOR_MAP = {
  red: '#ef4444',
  green: '#10b981',
  amber: '#f59e0b',
  ink: '#1a1a2e',
}

export function StatChip({ label, value, color }: Props) {
  return (
    <div className="flex-1 bg-white rounded-[14px] p-[10px_8px] text-center" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
      <p className="text-[9px] text-[var(--rl-ink-muted)] font-bold uppercase tracking-[0.4px] mb-1">{label}</p>
      <p className="text-[16px] font-extrabold leading-none" style={{ color: COLOR_MAP[color] }}>
        {typeof value === 'number' ? formatCurrency(Math.abs(value)) : value}
      </p>
    </div>
  )
}
