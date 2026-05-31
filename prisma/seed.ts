import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbUrl = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const APT_ID = 'seed-apt-4b'
const SKI_ID = 'seed-ski-trip'

async function main() {
  const apt = await prisma.group.upsert({
    where: { id: APT_ID },
    update: { name: 'Apt 4B', emoji: '🏠' },
    create: { id: APT_ID, name: 'Apt 4B', emoji: '🏠' },
  })
  const ski = await prisma.group.upsert({
    where: { id: SKI_ID },
    update: { name: 'Ski Trip', emoji: '⛷️' },
    create: { id: SKI_ID, name: 'Ski Trip', emoji: '⛷️' },
  })

  const timothy = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: apt.id, handle: 'timz' } },
    update: {},
    create: { groupId: apt.id, name: 'Timothy', handle: 'timz', color: '#0d9488' },
  })
  const ruby = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: apt.id, handle: 'rubyc' } },
    update: {},
    create: { groupId: apt.id, name: 'Ruby Chen', handle: 'rubyc', color: '#8b5cf6' },
  })
  const jake = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: apt.id, handle: 'jakep' } },
    update: {},
    create: { groupId: apt.id, name: 'Jake Park', handle: 'jakep', color: '#f59e0b' },
  })
  const mia = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: apt.id, handle: 'miat' } },
    update: {},
    create: { groupId: apt.id, name: 'Mia Torres', handle: 'miat', color: '#ec4899' },
  })

  const aptAll = [timothy, ruby, jake, mia]

  const skiTim = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: ski.id, handle: 'timz' } },
    update: {},
    create: { groupId: ski.id, name: 'Timothy', handle: 'timz', color: '#0d9488' },
  })
  const alex = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: ski.id, handle: 'alexr' } },
    update: {},
    create: { groupId: ski.id, name: 'Alex Rivera', handle: 'alexr', color: '#3b82f6' },
  })
  const sam = await prisma.roommate.upsert({
    where: { groupId_handle: { groupId: ski.id, handle: 'samk' } },
    update: {},
    create: { groupId: ski.id, name: 'Sam Kim', handle: 'samk', color: '#10b981' },
  })

  const skiAll = [skiTim, alex, sam]

  async function addExpense(
    groupId: string,
    title: string,
    amountCents: number,
    category: string,
    paidById: string,
    participants: { id: string }[],
    daysAgo: number,
  ) {
    const share = Math.round(amountCents / participants.length)
    const date = new Date(Date.now() - daysAgo * 86400000)
    await prisma.expense.create({
      data: {
        groupId,
        title,
        amount: amountCents,
        category,
        paidById,
        createdAt: date,
        participants: {
          create: participants.map((r) => ({
            roommateId: r.id,
            shareAmount: share,
          })),
        },
      },
    })
  }

  const aptExpenseCount = await prisma.expense.count({ where: { groupId: apt.id } })
  if (aptExpenseCount === 0) {
    await addExpense(apt.id, "Trader Joe's", 6100, 'groceries', ruby.id, aptAll, 0)
    await addExpense(apt.id, 'Electric Bill', 11200, 'utilities', timothy.id, aptAll, 1)
    await addExpense(apt.id, "Domino's Pizza", 2850, 'food', jake.id, [timothy, ruby, jake], 2)
    await addExpense(apt.id, 'Internet', 8000, 'internet', timothy.id, aptAll, 3)
    await addExpense(apt.id, 'Rent', 280000, 'rent', timothy.id, aptAll, 30)
    await addExpense(apt.id, 'Whole Foods', 4250, 'groceries', mia.id, [ruby, mia], 5)
  }

  const skiExpenseCount = await prisma.expense.count({ where: { groupId: ski.id } })
  if (skiExpenseCount === 0) {
    await addExpense(ski.id, 'Lift Tickets', 36000, 'other', skiTim.id, skiAll, 2)
    await addExpense(ski.id, 'Cabin Rental', 45000, 'rent', alex.id, skiAll, 5)
    await addExpense(ski.id, 'Groceries', 8400, 'groceries', sam.id, skiAll, 1)
  }

  console.log('✓ Seeded 2 groups with roommates and expenses')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
