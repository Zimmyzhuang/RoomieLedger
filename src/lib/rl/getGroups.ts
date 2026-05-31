import { prisma } from '@/lib/rl/db'
import { getGroupDebts } from '@/lib/rl/groupBalances'
import type { GroupDTO } from '@/types/rl'

export async function getGroupsList(): Promise<GroupDTO[]> {
  const groups = await prisma.group.findMany({
    orderBy: { name: 'asc' },
    include: {
      roommates: { select: { id: true } },
      expenses: {
        include: { participants: true },
      },
      settlements: true,
    },
  })

  return groups.map((g) => {
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

    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      memberCount: g.roommates.length,
      unsettledDebtCount: debts.length,
    }
  })
}
