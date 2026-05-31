import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'
import { calculateBalances } from '@/lib/rl/balances'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const meId = searchParams.get('me') ?? ''

  if (!meId) {
    return NextResponse.json({ error: 'Missing ?me= param' }, { status: 400 })
  }

  const [expenses, settlements, roommates] = await Promise.all([
    prisma.expense.findMany({
      include: { participants: true },
    }),
    prisma.settlement.findMany(),
    prisma.roommate.findMany(),
  ])

  const netBalances = calculateBalances(meId, expenses, settlements)

  const result = await Promise.all(
    roommates
      .filter((r) => r.id !== meId)
      .map(async (r) => {
        const net = netBalances.find((b) => b.roommateId === r.id)
        const lastExpense = await prisma.expense.findFirst({
          where: {
            participants: { some: { roommateId: r.id } },
          },
          orderBy: { createdAt: 'desc' },
        })
        return {
          roommateId: r.id,
          name: r.name,
          handle: r.handle,
          color: r.color,
          netCents: net?.netCents ?? 0,
          lastExpenseTitle: lastExpense?.title ?? null,
          lastExpenseDate: lastExpense?.createdAt ?? null,
          lastExpenseCategory: lastExpense?.category ?? null,
        }
      }),
  )

  return NextResponse.json(result)
}
