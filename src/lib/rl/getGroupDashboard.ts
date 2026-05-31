import { prisma } from '@/lib/rl/db'
import { getMe } from '@/lib/rl/getMe'
import { calculateBalances } from '@/lib/rl/balances'
import type { ExpenseDTO } from '@/types/rl'

export interface GroupDashboardData {
  groupId: string
  groupName: string
  groupEmoji: string
  meName: string
  roommateCount: number
  totalOwing: number
  totalOwed: number
  unsettled: number
  expenses: ExpenseDTO[]
  myId: string
}

export async function getGroupDashboard(
  groupId: string,
): Promise<GroupDashboardData | null> {
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

  if (!group || !me) return null

  const rawBalances = calculateBalances(me.id, expenses, settlements)
  const totalOwed = rawBalances
    .filter((b) => b.netCents > 0)
    .reduce((s, b) => s + b.netCents, 0)
  const totalOwing = rawBalances
    .filter((b) => b.netCents < 0)
    .reduce((s, b) => s + Math.abs(b.netCents), 0)
  const unsettled = rawBalances.filter((b) => b.netCents !== 0).length

  return {
    groupId: group.id,
    groupName: group.name,
    groupEmoji: group.emoji,
    meName: me.name,
    roommateCount: roommates.length,
    totalOwing,
    totalOwed,
    unsettled,
    myId: me.id,
    expenses: expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category as ExpenseDTO['category'],
      paidById: e.paidById,
      paidByName: e.paidBy.name,
      createdAt: e.createdAt.toISOString(),
      participants: e.participants.map((p) => ({
        roommateId: p.roommateId,
        name: p.roommate.name,
        shareAmount: p.shareAmount,
        settled: false,
      })),
    })),
  }
}
