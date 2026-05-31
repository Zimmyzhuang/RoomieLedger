import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function POST(req: NextRequest) {
  const { payerId, receiverId, amount } = await req.json()

  if (!payerId || !receiverId || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const settlement = await prisma.settlement.create({
    data: { payerId, receiverId, amount },
  })

  return NextResponse.json(settlement, { status: 201 })
}
