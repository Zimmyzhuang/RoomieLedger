import { notFound } from 'next/navigation'
import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { formatCurrency } from '@/lib/rl/formatCurrency'
import { calculateBalances } from '@/lib/rl/balances'
import { StatChip } from '@/components/rl/StatChip'
import { EmptyState } from '@/components/rl/EmptyState'
import { SetupRequired } from '@/components/rl/SetupRequired'
import { DashboardClient } from './DashboardClient'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupHomePage({ params }: Props) {
  const { groupId } = await params

  const [group, me, roommates, expenses, settlements] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    getMe(groupId),
    prisma.roommate.findMany({ where: { groupId }, orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      where: { groupId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { paidBy: true, participants: { include: { roommate: true } } },
    }),
    prisma.settlement.findMany({ where: { groupId } }),
  ])

  if (!group) notFound()
  if (!me) return <SetupRequired />

  const myId = me.id

  const rawBalances = calculateBalances(myId, expenses, settlements)
  const totalOwed = rawBalances.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)
  const totalOwing = rawBalances.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
  const unsettled = rawBalances.filter((b) => b.netCents !== 0).length
  const net = totalOwed - totalOwing

  const serializedExpenses = expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category as any,
    paidById: e.paidById,
    paidByName: e.paidBy.name,
    createdAt: e.createdAt.toISOString(),
    participants: e.participants.map((p) => ({
      roommateId: p.roommateId,
      name: p.roommate.name,
      shareAmount: p.shareAmount,
      settled: false,
    })),
  }))

  return (
    <div className="flex flex-col flex-1">
      <div
        className="flex-shrink-0 rl-edge-bleed pt-[14px] pb-7"
        style={{ background: 'linear-gradient(150deg, #0d9488 0%, #0f766e 100%)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[11px] font-medium text-white/80">{group.emoji} {group.name}</p>
            <p className="text-[16px] font-extrabold text-white">{me.name}</p>
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-white/25 flex items-center justify-center text-[13px] font-extrabold text-white">
            {me.name[0]}
          </div>
        </div>
        <p className="text-[11px] font-semibold text-white/70 mb-[3px]">Net balance</p>
        <p className="text-[34px] font-extrabold text-white leading-none tracking-tight">
          {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
        </p>
        <p className="text-[11px] text-white/75 mt-1">across {roommates.length - 1} roommates</p>
      </div>

      <div className="-mt-4 flex gap-2">
        <StatChip label="You Owe" value={totalOwing} color="red" />
        <StatChip label="Owed to You" value={totalOwed} color="green" />
        <StatChip label="Unsettled" value={String(unsettled)} color="amber" />
      </div>

      <div className="flex-1 pt-3 pb-2">
        <p className="text-[13px] font-bold text-[var(--rl-ink)] mb-2">Recent Activity</p>
        {serializedExpenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            subtitle="Tap + to add your first shared expense."
            ctaLabel="Add First Expense"
            ctaHref={`/groups/${groupId}/add`}
          />
        ) : (
          <DashboardClient expenses={serializedExpenses} myId={myId} />
        )}
      </div>
    </div>
  )
}
