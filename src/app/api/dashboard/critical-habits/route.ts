import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface CriticalHabit {
  id: number
  title: string
  color: string
  streak: number
  completedToday: boolean
  goalType: string
  goalValue: number
}

function computeStreak(completions: { date: Date }[], goalType: string, goalValue: number): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort((a, b) => b.date.getTime() - a.date.getTime())
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(today)

  // If goal is daily, check consecutive days
  if (goalType === 'Daily') {
    // Check if completed today or yesterday to start streak
    const latest = sorted[0].date
    latest.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 1) return 0 // streak broken

    streak = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date)
      prev.setHours(0, 0, 0, 0)
      const curr = new Date(sorted[i].date)
      curr.setHours(0, 0, 0, 0)
      const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
  } else {
    // For weekly/monthly/ratio, just count total completions as a simple streak proxy
    streak = completions.length >= goalValue ? Math.floor(completions.length / goalValue) : 0
  }
  return streak
}

/**
 * GET /api/dashboard/critical-habits?date=YYYY-MM-DD
 * Returns active habits with streak counters for the given date.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    if (!dateParam) return NextResponse.json({ error: 'date is required' }, { status: 400 })

    const dayStart = new Date(dateParam)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dateParam)
    dayEnd.setHours(23, 59, 59, 999)

    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
      include: {
        completions: { orderBy: { date: 'desc' } },
      },
    })

    const result: CriticalHabit[] = []
    for (const h of habits) {
      const completedToday = h.completions.some((c) => {
        const d = new Date(c.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === dayStart.getTime()
      })
      const streak = computeStreak(h.completions, h.goalType, h.goalValue)
      result.push({
        id: h.id,
        title: h.title,
        color: h.color,
        streak,
        completedToday,
        goalType: h.goalType,
        goalValue: h.goalValue,
      })
    }

    // Sort: incomplete first, then by streak (higher = more critical)
    result.sort((a, b) => {
      if (a.completedToday !== b.completedToday) return a.completedToday ? 1 : -1
      return b.streak - a.streak
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching critical habits:', error)
    return NextResponse.json({ error: 'Failed to fetch critical habits' }, { status: 500 })
  }
}
