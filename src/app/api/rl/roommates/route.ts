import { NextResponse } from 'next/server'
import { prisma } from '@/lib/rl/db'

export async function GET() {
  const roommates = await prisma.roommate.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(roommates)
}
