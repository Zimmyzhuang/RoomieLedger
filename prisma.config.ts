import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbUrl = path.join(process.cwd(), 'prisma', 'dev.db')

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: `file:${dbUrl}`,
  },
  migrate: {
    adapter() {
      return new PrismaBetterSqlite3({ url: dbUrl })
    },
  },
})
