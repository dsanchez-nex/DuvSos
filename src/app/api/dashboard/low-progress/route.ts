import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface LowProgressItem {
  id: number
  module: string
  title: string
  color?: string
  last7DaysCount: number
  trend: 'improving' | 'stable' | 'declining'
}

/**
 * GET /api/dashboard/low-progress
 * Returns habits/projects with low execution in the last 7 days.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const result: LowProgressItem[] = []

    // Habits with low completion in last 7 days
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
      include: {
        completions: {
          where: { date: { gte: sevenDaysAgo, lte: today } },
          orderBy: { date: 'desc' },
        },
      },
    })
    for (const h of habits) {
      const last7DaysCount = h.completions.length
      let expected = 7
      if (h.goalType === 'Weekly') expected = 1
      if (h.goalType === 'Monthly') expected = 1
      if (h.goalType === 'Ratio') expected = Math.ceil(7 * (h.goalValue / 100))

      // Consider low progress if less than 50% of expected
      if (last7DaysCount < expected * 0.5) {
        const prev7DaysCount = await prisma.habitCompletion.count({
          where: {
            habitId: h.id,
            date: {
              gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
              lt: sevenDaysAgo,
            },
          },
        })
        let trend: LowProgressItem['trend'] = 'stable'
        if (last7DaysCount > prev7DaysCount) trend = 'improving'
        if (last7DaysCount < prev7DaysCount) trend = 'declining'

        result.push({
          id: h.id,
          module: 'habit',
          title: h.title,
          color: h.color,
          last7DaysCount,
          trend,
        })
      }
    }

    // Checklists with low progress in last 7 days
    const checklists = await prisma.checklist.findMany({
      where: {
        userId,
        lifecycleState: { not: 'Completed' },
        endDate: { gte: today },
      },
      include: { items: true },
    })
    for (const c of checklists) {
      const totalItems = c.items.length
      const completedItems = c.items.filter((i) => i.completed).length
      const progress = totalItems > 0 ? completedItems / totalItems : 0

      // Low progress if less than 30% completed and has been active for >7 days
      const ageDays = Math.floor((today.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      if (progress < 0.3 && ageDays > 7) {
        result.push({
          id: c.id,
          module: 'checklist',
          title: c.title,
          color: c.color,
          last7DaysCount: completedItems,
          trend: 'declining',
        })
      }
    }

    // Sort by lowest 7-day count first
    result.sort((a, b) => a.last7DaysCount - b.last7DaysCount)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching low-progress items:', error)
    return NextResponse.json({ error: 'Failed to fetch low-progress items' }, { status: 500 })
  }
}
