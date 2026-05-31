import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { calculateBalances } from '@/lib/rl/balances'
import { EmptyState } from '@/components/rl/EmptyState'
import { PageHeader } from '@/components/rl/PageHeader'
import { SetupRequired } from '@/components/rl/SetupRequired'
import { BalancesClient } from './BalancesClient'
import type { BalanceDTO } from '@/types/rl'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function BalancesPage({ params }: Props) {
  const { groupId } = await params

  const [group, me, roommates, allExpenses, settlements] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    getMe(groupId),
    prisma.roommate.findMany({ where: { groupId }, orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      where: { groupId },
      include: { participants: true },
    }),
    prisma.settlement.findMany({ where: { groupId } }),
  ])

  if (!group) return null
  if (!me) return <SetupRequired />

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
    <div className="rl-page flex-1 overflow-hidden">
      <PageHeader
        title="Balances"
        subtitle={`${group.name} · ${others.length} roommates · ${balances.filter((b) => b.netCents !== 0).length} unsettled`}
      />

      {allExpenses.length === 0 ? (
        <EmptyState
          title="No balances yet"
          subtitle="Add an expense and balances will appear here."
          ctaLabel="Add Expense"
          ctaHref={`/groups/${groupId}/add`}
        />
      ) : (
        <BalancesClient balances={balances} myId={me.id} groupId={groupId} />
      )}
    </div>
  )
}
