import { prisma } from '@/lib/rl/db'
import { calculateBalances } from '@/lib/rl/balances'
import { EmptyState } from '@/components/rl/EmptyState'
import { BalancesClient } from './BalancesClient'
import type { BalanceDTO } from '@/types/rl'

export default async function BalancesPage() {
  const [roommates, allExpenses, settlements] = await Promise.all([
    prisma.roommate.findMany({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({ include: { participants: true } }),
    prisma.settlement.findMany(),
  ])

  const me = roommates[0]
  const others = roommates.filter((r) => r.id !== me.id)
  const rawBalances = calculateBalances(me.id, allExpenses, settlements)

  const lastExpenseByRoommate = new Map<string, (typeof allExpenses)[0]>()
  for (const exp of [...allExpenses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    for (const p of exp.participants) {
      if (!lastExpenseByRoommate.has(p.roommateId)) {
        lastExpenseByRoommate.set(p.roommateId, exp)
      }
    }
  }

  const balances: BalanceDTO[] = others.map((r) => {
    const net = rawBalances.find((b) => b.roommateId === r.id)
    const last = lastExpenseByRoommate.get(r.id) ?? null
    return {
      roommateId: r.id,
      name: r.name,
      handle: r.handle,
      color: r.color,
      netCents: net?.netCents ?? 0,
      lastExpenseTitle: last?.title ?? null,
      lastExpenseDate: last?.createdAt.toISOString() ?? null,
      lastExpenseCategory: (last?.category as any) ?? null,
    }
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white px-4 py-[14px] border-b border-[var(--rl-border)] flex-shrink-0">
        <h1 className="text-[18px] font-extrabold text-[var(--rl-ink)]">Balances</h1>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">
          {others.length} roommates · {balances.filter((b) => b.netCents !== 0).length} unsettled
        </p>
      </div>

      {allExpenses.length === 0 ? (
        <EmptyState
          title="No balances yet"
          subtitle="Add an expense and balances will appear here."
          ctaLabel="Add Expense"
          ctaHref="/add"
        />
      ) : (
        <BalancesClient balances={balances} myId={me.id} />
      )}
    </div>
  )
}
