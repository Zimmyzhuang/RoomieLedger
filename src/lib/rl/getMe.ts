import { prisma } from '@/lib/rl/db'

export async function getMe(groupId?: string) {
  if (groupId) {
    return prisma.roommate.findFirst({
      where: { groupId },
      orderBy: { name: 'asc' },
    })
  }
  return prisma.roommate.findFirst({ orderBy: { name: 'asc' } })
}
