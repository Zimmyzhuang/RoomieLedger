import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  const expenses = await prisma.expense.findMany({
    where: {
      ...(search ? { title: { contains: search } } : {}),
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })

  return NextResponse.json(expenses)
}
