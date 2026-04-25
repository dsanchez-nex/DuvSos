import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

// Enable WebSocket for local dev; in Vercel/Neon production this is handled automatically
if (process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV) {
  neonConfig.webSocketConstructor = require('ws')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PrismaNeon creates an internal Neon Pool with the given config.
// We limit max connections to 5 to stay well under Neon's serverless limit.
const adapter = new PrismaNeon(
  { connectionString: process.env.DATABASE_URL, max: 5 },
  { schema: 'public' }
)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
