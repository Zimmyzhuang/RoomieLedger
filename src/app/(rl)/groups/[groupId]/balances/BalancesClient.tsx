'use client'

import { useState, useTransition } from 'react'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import type { BalanceDTO } from '@/types/rl'

interface Props {
  balances: BalanceDTO[]
  myId: string
  groupId: string
}

export function BalancesClient({ balances: initial, myId, groupId }: Props) {
  const [balances, setBalances] = useState(initial)
  const [, startTransition] = useTransition()

  const totalOwing = balances.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const totalOwed  = balances.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)

  async function handleSettle(b: BalanceDTO) {
    if (b.netCents === 0) return

    const body = b.netCents > 0
      ? { payerId: b.roommateId, receiverId: myId, amount: b.netCents }
      : { payerId: myId, receiverId: b.roommateId, amount: Math.abs(b.netCents) }

    await fetch('/api/rl/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, groupId }),
    })

    startTransition(() => {
      setBalances((prev) =>
        prev.map((item) =>
          item.roommateId === b.roommateId ? { ...item, netCents: 0 } : item,
        ),
      )
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-[10px] pt-3 pb-1 flex-shrink-0">
        <div className="flex-1 rounded-[14px] p-3 text-center" style={{ background: 'var(--rl-red-light)' }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.4px] mb-1" style={{ color: 'var(--rl-red)' }}>You Owe</p>
          <p className="text-[22px] font-extrabold" style={{ color: 'var(--rl-red)' }}>{formatCurrency(totalOwing)}</p>
        </div>
        <div className="flex-1 rounded-[14px] p-3 text-center" style={{ background: 'var(--rl-teal-light)' }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.4px] mb-1" style={{ color: 'var(--rl-teal)' }}>Owed to You</p>
          <p className="text-[22px] font-extrabold" style={{ color: 'var(--rl-teal)' }}>{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2">
        {balances.map((b) => {
          const isOwed    = b.netCents > 0
          const isOwing   = b.netCents < 0
          const isSettled = b.netCents === 0

          const amountColor = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'
          const dirLabel    = isOwed ? 'Owes you' : isOwing ? 'You owe' : 'Settled'
          const dirColor    = isOwed ? 'var(--rl-green)' : isOwing ? 'var(--rl-red)' : 'var(--rl-ink-muted)'

          const barWidth = isSettled ? 0 : Math.min(100, Math.round((Math.abs(b.netCents) / Math.max(totalOwed, totalOwing, 1)) * 100))
          const barColor = isOwed ? 'var(--rl-green)' : 'var(--rl-red)'

          const btnStyle = isOwed
            ? { color: 'var(--rl-teal)', borderColor: 'var(--rl-teal-border)', background: 'var(--rl-teal-light)' }
            : isOwing
            ? { color: 'var(--rl-red)', borderColor: 'var(--rl-red-border)', background: 'var(--rl-red-light)' }
            : { color: 'var(--rl-ink-muted)', borderColor: 'var(--rl-border)', background: '#f8fafc' }

          return (
            <div key={b.roommateId} className="bg-white rounded-[16px] p-[12px_14px]" style={{ boxShadow: 'var(--rl-shadow-card)' }}>
              <div className="flex items-center gap-[10px] mb-[9px]">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] font-extrabold text-white flex-shrink-0"
                  style={{ background: b.color }}
                >
                  {b.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[var(--rl-ink)]">{b.name}</p>
                  <p className="text-[10px] font-semibold mt-[1px]" style={{ color: dirColor }}>{dirLabel}</p>
                </div>
                <p className="text-[18px] font-extrabold" style={{ color: amountColor }}>
                  {isSettled ? '$0.00' : formatCurrency(Math.abs(b.netCents))}
                </p>
              </div>

              <div className="h-[5px] bg-[#f1f5f9] rounded-full overflow-hidden mb-[10px]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: isSettled ? '#e2e8f0' : barColor }} />
              </div>

              <button
                onClick={() => handleSettle(b)}
                disabled={isSettled}
                className="w-full rounded-[10px] py-2 text-[11px] font-bold border-[1.5px] disabled:opacity-50"
                style={btnStyle}
              >
                {isSettled ? '✓ Settled' : 'Mark as Settled'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
