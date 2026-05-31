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

  const lastExpenseByRoommate = new Map<string, (typeof expenses)[0]>()
  for (const exp of [...expenses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    for (const p of exp.participants) {
      if (!lastExpenseByRoommate.has(p.roommateId)) {
        lastExpenseByRoommate.set(p.roommateId, exp)
      }
    }
  }

  const result = roommates
    .filter((r) => r.id !== meId)
    .map((r) => {
      const net = netBalances.find((b) => b.roommateId === r.id)
      const lastExpense = lastExpenseByRoommate.get(r.id) ?? null
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
    })

  return NextResponse.json(result)
}
