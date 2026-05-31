import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbUrl = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  const timothy = await prisma.roommate.upsert({
    where: { handle: 'timz' },
    update: {},
    create: { name: 'Timothy', handle: 'timz', color: '#0d9488' },
  })
  const ruby = await prisma.roommate.upsert({
    where: { handle: 'rubyc' },
    update: {},
    create: { name: 'Ruby Chen', handle: 'rubyc', color: '#8b5cf6' },
  })
  const jake = await prisma.roommate.upsert({
    where: { handle: 'jakep' },
    update: {},
    create: { name: 'Jake Park', handle: 'jakep', color: '#f59e0b' },
  })
  const mia = await prisma.roommate.upsert({
    where: { handle: 'miat' },
    update: {},
    create: { name: 'Mia Torres', handle: 'miat', color: '#ec4899' },
  })

  const all = [timothy, ruby, jake, mia]

  async function addExpense(
    title: string,
    amountCents: number,
    category: string,
    paidById: string,
    participants: typeof all,
    daysAgo: number,
  ) {
    const share = Math.round(amountCents / participants.length)
    const date = new Date(Date.now() - daysAgo * 86400000)
    await prisma.expense.create({
      data: {
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

  await addExpense("Trader Joe's", 6100, 'groceries', ruby.id, all, 0)
  await addExpense('Electric Bill', 11200, 'utilities', timothy.id, all, 1)
  await addExpense("Domino's Pizza", 2850, 'food', jake.id, [timothy, ruby, jake], 2)
  await addExpense('Internet', 8000, 'internet', timothy.id, all, 3)
  await addExpense('Rent', 280000, 'rent', timothy.id, all, 30)
  await addExpense('Whole Foods', 4250, 'groceries', mia.id, [ruby, mia], 5)

  console.log('✓ Seeded 4 roommates + 6 expenses')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
