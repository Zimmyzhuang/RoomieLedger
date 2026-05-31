import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'
import type { CreateExpenseBody } from '@/types/rl'

export async function GET() {
  const expenses = await prisma.expense.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const body: CreateExpenseBody = await req.json()
  const { title, amountCents, category, paidById, participantIds } = body

  if (!title || !amountCents || !category || !paidById || participantIds.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const shareAmount = Math.round(amountCents / participantIds.length)

  const expense = await prisma.expense.create({
    data: {
      title,
      amount: amountCents,
      category,
      paidById,
      participants: {
        create: participantIds.map((id) => ({
          roommateId: id,
          shareAmount,
        })),
      },
    },
    include: {
      paidBy: true,
      participants: { include: { roommate: true } },
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
