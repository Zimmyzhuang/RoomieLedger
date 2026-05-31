import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { calculateBalances } from '@/lib/rl/balances'
import { getGroupDebts } from '@/lib/rl/groupBalances'
import type { GroupDTO } from '@/types/rl'

export async function getGroupsList(): Promise<GroupDTO[]> {
  const groups = await prisma.group.findMany({
    orderBy: { name: 'asc' },
    include: {
      roommates: { select: { id: true } },
      expenses: { include: { participants: true } },
      settlements: true,
    },
  })

  const results: GroupDTO[] = []

  for (const g of groups) {
    const memberIds = g.roommates.map((r) => r.id)
    const debts = getGroupDebts(
      memberIds,
      g.expenses.map((e) => ({
        paidById: e.paidById,
        amount: e.amount,
        participants: e.participants.map((p) => ({
          roommateId: p.roommateId,
          shareAmount: p.shareAmount,
        })),
      })),
      g.settlements.map((s) => ({
        payerId: s.payerId,
        receiverId: s.receiverId,
        amount: s.amount,
      })),
    )

    const me = await getMe(g.id)
    let yourNetCents = 0
    if (me) {
      const nets = calculateBalances(me.id, g.expenses, g.settlements)
      const owed = nets.filter((b) => b.netCents > 0).reduce((s, b) => s + b.netCents, 0)
      const owing = nets.filter((b) => b.netCents < 0).reduce((s, b) => s + Math.abs(b.netCents), 0)
      yourNetCents = owed - owing
    }

    results.push({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      memberCount: g.roommates.length,
      unsettledDebtCount: debts.length,
      yourNetCents,
    })
  }

  return results
}
