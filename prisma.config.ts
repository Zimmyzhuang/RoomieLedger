import path from 'node:path'
import { defineConfig } from 'prisma/config'

const dbUrl = path.join(process.cwd(), 'prisma', 'dev.db')

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: `file:${dbUrl}`,
  },
})
