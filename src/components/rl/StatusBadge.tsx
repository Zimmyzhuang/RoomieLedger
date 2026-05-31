type Status = 'paid' | 'owes' | 'settled'

const CONFIG: Record<Status, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'rl-status-badge--paid' },
  owes: { label: 'Owes', className: 'rl-status-badge--owes' },
  settled: { label: 'Settled', className: 'rl-status-badge--settled' },
}

interface Props {
  status: Status
}

export function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`rl-status-badge ${className}`}>
      <span className="rl-status-badge__prefix" aria-hidden="true">
        {status === 'paid' ? '✓' : status === 'settled' ? '○' : '!'}
      </span>
      {label}
    </span>
  )
}
