'use client'

import { useState, useTransition } from 'react'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { LiveRegion } from '@/components/rl/LiveRegion'
import type { BalanceDTO } from '@/types/rl'

interface Props {
  balances: BalanceDTO[]
  myId: string
  groupId: string
}

export function BalancesClient({ balances: initial, myId, groupId }: Props) {
  const [balances, setBalances] = useState(initial)
  const [, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const totalOwing = balances.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const totalOwed = balances.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)

  async function handleSettle(b: BalanceDTO) {
    if (b.netCents === 0) return

    setPendingId(b.roommateId)
    setStatusMessage(`Marking balance with ${b.name} as settled…`)

    const body =
      b.netCents > 0
        ? { payerId: b.roommateId, receiverId: myId, amount: b.netCents }
        : { payerId: myId, receiverId: b.roommateId, amount: Math.abs(b.netCents) }

    try {
      const res = await fetch('/api/rl/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, groupId }),
      })

      if (!res.ok) {
        setStatusMessage(
          `Could not record settlement with ${b.name}. Check your connection and try again.`,
        )
        setPendingId(null)
        return
      }

      startTransition(() => {
        setBalances((prev) =>
          prev.map((item) =>
            item.roommateId === b.roommateId ? { ...item, netCents: 0 } : item,
          ),
        )
      })
      setStatusMessage(`Balance with ${b.name} marked as settled.`)
      setPendingId(null)
    } catch {
      setStatusMessage(
        `Could not reach the server. Settlement with ${b.name} was not saved.`,
      )
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden gap-5">
      <LiveRegion message={statusMessage} />

      <div className="rl-stat-row flex-shrink-0" role="group" aria-label="Balance summary">
        <div className="rl-card rl-stat-chip" style={{ background: 'var(--rl-negative-soft)' }}>
          <p className="rl-overline rl-amount-negative">You owe</p>
          <p className="rl-amount rl-amount-negative">{formatCurrency(totalOwing)}</p>
        </div>
        <div className="rl-card rl-stat-chip" style={{ background: 'var(--rl-accent-soft)' }}>
          <p className="rl-overline" style={{ color: 'var(--rl-accent-hover)' }}>
            Owed to you
          </p>
          <p className="rl-amount" style={{ color: 'var(--rl-accent-hover)' }}>
            {formatCurrency(totalOwed)}
          </p>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto rl-list pb-2" aria-label="Balances by roommate">
        {balances.map((b) => {
          const isOwed = b.netCents > 0
          const isOwing = b.netCents < 0
          const isSettled = b.netCents === 0
          const isPending = pendingId === b.roommateId

          const amountClass = isOwed ? 'rl-amount-positive' : isOwing ? 'rl-amount-negative' : 'rl-amount-muted'
          const dirLabel = isOwed ? 'Owes you' : isOwing ? 'You owe' : 'Settled'
          const dirClass = isOwed ? 'rl-amount-positive' : isOwing ? 'rl-amount-negative' : 'rl-amount-muted'

          const barWidth = isSettled
            ? 0
            : Math.min(100, Math.round((Math.abs(b.netCents) / Math.max(totalOwed, totalOwing, 1)) * 100))
          const barColor = isOwed ? 'var(--rl-positive)' : 'var(--rl-negative)'

          const settleLabel = isSettled
            ? `Balance with ${b.name} is settled`
            : isOwing
              ? `Mark ${formatCurrency(Math.abs(b.netCents))} owed to ${b.name} as settled`
              : `Mark ${formatCurrency(b.netCents)} owed by ${b.name} as settled`

          return (
            <li key={b.roommateId} className="rl-card" style={{ padding: 'var(--rl-space-5)' }}>
              <div
                className="rl-list-row"
                style={{ padding: 0, minHeight: 'auto', marginBottom: 'var(--rl-space-4)' }}
              >
                <div className="rl-avatar rl-avatar-sm" aria-hidden="true" style={{ background: b.color }}>
                  {b.name[0]}
                </div>
                <div className="rl-text-stack">
                  <p className="rl-body font-semibold">{b.name}</p>
                  <p className={`rl-caption font-medium ${dirClass}`}>{dirLabel}</p>
                </div>
                <div className="rl-amount-col">
                  <p className={`rl-amount ${amountClass}`}>
                    <span className="rl-sr-only">{dirLabel}: </span>
                    {isSettled ? '$0.00' : formatCurrency(Math.abs(b.netCents))}
                  </p>
                </div>
              </div>

              <div
                className="rounded-full overflow-hidden"
                style={{ height: 4, background: 'var(--rl-bg)', marginBottom: 'var(--rl-space-4)' }}
                role="presentation"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    background: isSettled ? 'var(--rl-border-strong)' : barColor,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => handleSettle(b)}
                disabled={isSettled || isPending}
                className="rl-btn rl-btn-secondary w-full disabled:opacity-50"
                aria-busy={isPending}
                aria-label={settleLabel}
                style={
                  isOwed
                    ? { color: 'var(--rl-accent-hover)', background: 'var(--rl-accent-soft)' }
                    : isOwing
                      ? { color: 'var(--rl-negative)', background: 'var(--rl-negative-soft)' }
                      : undefined
                }
              >
                {isPending ? 'Saving…' : isSettled ? 'Settled' : 'Mark as settled'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
