import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateStreak, calculateCompletionRate } from '@/lib/habit-utils'
import { headers } from 'next/headers'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function getUserId(): Promise<number | null> {
  const headersList = await headers()
  const userIdHeader = headersList.get('x-user-id')
  if (!userIdHeader) return null
  return parseInt(userIdHeader, 10)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid habit ID' }, { status: 400 })
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { completions: true },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentStreak = calculateStreak(habit.completions, habit.goalType, habit.goalValue)
    const completionRate = calculateCompletionRate(habit.completions, habit.goalType, habit.goalValue)

    // Count completions for current period
    const now = new Date()
    let completionsThisPeriod = 0

    switch (habit.goalType) {
      case 'Daily': {
        const today = new Date(now)
        today.setHours(0, 0, 0, 0)
        completionsThisPeriod = habit.completions.filter(
          (c) => new Date(c.date).toISOString().split('T')[0] === today.toISOString().split('T')[0]
        ).length
        break
      }
      case 'Weekly': {
        const weekStart = new Date(now)
        weekStart.setHours(0, 0, 0, 0)
        const day = weekStart.getDay()
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
        weekStart.setDate(diff)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        completionsThisPeriod = habit.completions.filter(
          (c) => {
            const d = new Date(c.date)
            return d >= weekStart && d < weekEnd
          }
        ).length
        break
      }
      case 'Monthly': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        completionsThisPeriod = habit.completions.filter(
          (c) => {
            const d = new Date(c.date)
            return d >= monthStart && d < monthEnd
          }
        ).length
        break
      }
      case 'Ratio': {
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        completionsThisPeriod = habit.completions.filter(
          (c) => new Date(c.date) >= thirtyDaysAgo
        ).length
        break
      }
    }

    return NextResponse.json({
      currentStreak,
      completionRate,
      completionsThisPeriod,
      goalValue: habit.goalValue,
      goalType: habit.goalType,
    })
  } catch (error) {
    console.error('Error fetching habit metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
