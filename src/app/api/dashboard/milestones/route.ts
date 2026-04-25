import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface UpcomingMilestone {
  id: number
  title: string
  date: string
  color: string
  daysRemaining: number
}

/**
 * GET /api/dashboard/milestones
 * Returns upcoming milestones within 7 days.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
    sevenDaysLater.setHours(23, 59, 59, 999)

    const milestones = await prisma.milestone.findMany({
      where: {
        userId,
        date: { gte: today, lte: sevenDaysLater },
      },
      orderBy: { date: 'asc' },
    })

    const result: UpcomingMilestone[] = milestones.map((m) => {
      const ms = m.date.getTime() - today.getTime()
      const daysRemaining = Math.ceil(ms / (1000 * 60 * 60 * 24))
      return {
        id: m.id,
        title: m.title,
        date: m.date.toISOString().split('T')[0],
        color: m.color,
        daysRemaining,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching upcoming milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}
