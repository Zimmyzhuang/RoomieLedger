import { prisma } from '@/lib/rl/db'
import { EmptyState } from '@/components/rl/EmptyState'
import { LedgerClient } from './LedgerClient'
import type { ExpenseDTO } from '@/types/rl'

export default async function LedgerPage() {
  const [me, expenses] = await Promise.all([
    prisma.roommate.findFirst({ orderBy: { name: 'asc' } }),
    prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: { paidBy: true, participants: { include: { roommate: true } } },
    }),
  ])

  if (!me) return null

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
      <div className="bg-white px-4 py-[14px] border-b border-[var(--rl-border)] flex-shrink-0">
        <h1 className="text-[18px] font-extrabold text-[var(--rl-ink)]">Ledger</h1>
        <p className="text-[11px] text-[var(--rl-ink-muted)] mt-[2px]">{expenses.length} transactions</p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          subtitle="Add an expense to get started."
          ctaLabel="Add Expense"
          ctaHref="/add"
        />
      ) : (
        <LedgerClient expenses={serialized} myId={me.id} />
      )}
    </div>
  )
}
