import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbUrl = path.resolve(process.cwd(), 'prisma', 'dev.db')

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const adapter = new PrismaBetterSqlite3({ url: dbUrl })
    return new PrismaClient({ adapter, log: ['error'] })
  })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
