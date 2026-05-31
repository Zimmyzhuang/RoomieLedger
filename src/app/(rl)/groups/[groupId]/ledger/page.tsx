import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { EmptyState } from '@/components/rl/EmptyState'
import { SetupRequired } from '@/components/rl/SetupRequired'
import { LedgerClient } from './LedgerClient'
import type { ExpenseDTO } from '@/types/rl'

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function LedgerPage({ params }: Props) {
  const { groupId } = await params

  const [group, me, expenses] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    getMe(groupId),
    prisma.expense.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      include: { paidBy: true, participants: { include: { roommate: true } } },
    }),
  ])

  if (!group) return null
  if (!me) return <SetupRequired />

  const serialized: ExpenseDTO[] = expenses.map((e) => ({
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
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white py-[14px] border-b border-[var(--rl-border)] flex-shrink-0">
        <h1 className="text-[18px] font-extrabold text-[var(--rl-ink)]">Ledger</h1>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">
          {group.name} · {expenses.length} transactions
        </p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          subtitle="Add an expense to get started."
          ctaLabel="Add Expense"
          ctaHref={`/groups/${groupId}/add`}
        />
      ) : (
        <LedgerClient expenses={serialized} myId={me.id} />
      )}
    </div>
  )
}
