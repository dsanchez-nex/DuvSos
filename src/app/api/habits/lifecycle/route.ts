import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Lifecycle job endpoint:
 * - Archives habits whose endDate has passed
 * - Should be called by a cron job (e.g., daily at midnight)
 */
export async function POST(request: NextRequest) {
  try {
    // Simple cron secret validation
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Archive habits whose endDate has passed
    const archived = await prisma.habit.updateMany({
      where: {
        isPermanent: false,
        state: { not: 'Archived' },
        endDate: { lt: now },
      },
      data: { state: 'Archived' },
    })

    return NextResponse.json({
      message: 'Lifecycle job completed',
      archivedCount: archived.count,
    })
  } catch (error) {
    console.error('Error running lifecycle job:', error)
    return NextResponse.json({ error: 'Failed to run lifecycle job' }, { status: 500 })
  }
}
