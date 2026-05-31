import { prisma } from '@/lib/rl/db'
import { getGroupDebts } from '@/lib/rl/groupBalances'
import type { GroupDebtDTO } from '@/types/rl'

export async function getGroupDebtsForGroup(groupId: string): Promise<{
  group: { id: string; name: string; emoji: string }
  debts: GroupDebtDTO[]
} | null> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      roommates: true,
      expenses: { include: { participants: true } },
      settlements: true,
    },
  })

  if (!group) return null

  const memberById = new Map(group.roommates.map((r) => [r.id, r]))
  const memberIds = group.roommates.map((r) => r.id)

  const simplified = getGroupDebts(
    memberIds,
    group.expenses.map((e) => ({
      paidById: e.paidById,
      amount: e.amount,
      participants: e.participants.map((p) => ({
        roommateId: p.roommateId,
        shareAmount: p.shareAmount,
      })),
    })),
    group.settlements.map((s) => ({
      payerId: s.payerId,
      receiverId: s.receiverId,
      amount: s.amount,
    })),
  )

  const debts: GroupDebtDTO[] = simplified
    .map((d) => {
      const from = memberById.get(d.fromId)
      const to = memberById.get(d.toId)
      if (!from || !to) return null
      return {
        fromId: from.id,
        fromName: from.name,
        fromColor: from.color,
        toId: to.id,
        toName: to.name,
        toColor: to.color,
        amountCents: d.amountCents,
      }
    })
    .filter((d): d is GroupDebtDTO => d !== null)
    .sort((a, b) => b.amountCents - a.amountCents)

  return {
    group: { id: group.id, name: group.name, emoji: group.emoji },
    debts,
  }
}
