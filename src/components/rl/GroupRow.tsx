'use client'

import { formatCurrency } from '@/lib/rl/formatCurrency'
import { describeNetBalance } from '@/lib/rl/a11y'
import type { GroupDTO } from '@/types/rl'

interface Props {
  group: GroupDTO
  selected: boolean
  onSelect: () => void
}

export function GroupRow({ group, selected, onSelect }: Props) {
  const net = group.yourNetCents
  const balanceLabel = describeNetBalance(net)
  const balanceClass =
    net === 0 ? 'rl-amount-muted' : net > 0 ? 'rl-amount-positive' : 'rl-amount-negative'

  const ariaLabel = `${group.name}, ${balanceLabel}${
    group.unsettledDebtCount > 0
      ? `, ${group.unsettledDebtCount} unsettled ${group.unsettledDebtCount === 1 ? 'debt' : 'debts'}`
      : ''
  }. ${selected ? 'Currently selected.' : 'Select this group.'}`

  return (
    <button
      type="button"
      onClick={onSelect}
      className="rl-tappable-row"
      aria-pressed={selected}
      aria-label={ariaLabel}
      style={{
        background: selected ? 'var(--rl-accent-soft)' : 'var(--rl-surface)',
        boxShadow: selected ? 'var(--rl-shadow-md)' : 'var(--rl-shadow-sm)',
      }}
    >
      <div
        className="rl-emoji-tile"
        aria-hidden="true"
        style={{ background: selected ? 'var(--rl-surface)' : 'var(--rl-accent-soft)' }}
      >
        {group.emoji}
      </div>
      <div className="rl-text-stack">
        <p className="rl-h2 truncate">{group.name}</p>
        <p className={`rl-small ${balanceClass}`}>{balanceLabel}</p>
      </div>
      <div
        className="flex-shrink-0 flex items-center justify-end"
        style={{ width: 'var(--rl-amount-col-w)' }}
        aria-hidden={group.unsettledDebtCount === 0}
      >
        {group.unsettledDebtCount > 0 && (
          <span className="rl-pill rl-pill-active">
            <span className="rl-sr-only">Unsettled: </span>
            {group.unsettledDebtCount}
          </span>
        )}
      </div>
    </button>
  )
}
