import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface DashboardMetrics {
  overallStreak: number
  activeProjects: number
  pendingTasks: number
  weeklyCompliance: number
  lastUpdated: string
}

function computeOverallStreak(habitCompletions: { date: Date }[], todoCompletions: { completed: boolean; updatedAt: Date }[]): number {
  // Build a set of dates where all daily items were completed
  const dateMap = new Map<string, { habits: number; todos: number; total: number }>()

  for (const hc of habitCompletions) {
    const key = hc.date.toISOString().split('T')[0]
    const entry = dateMap.get(key) || { habits: 0, todos: 0, total: 0 }
    entry.habits++
    entry.total++
    dateMap.set(key, entry)
  }

  for (const tc of todoCompletions) {
    if (!tc.completed) continue
    const key = tc.updatedAt.toISOString().split('T')[0]
    const entry = dateMap.get(key) || { habits: 0, todos: 0, total: 0 }
    entry.todos++
    entry.total++
    dateMap.set(key, entry)
  }

  if (dateMap.size === 0) return 0

  const sortedDates = Array.from(dateMap.keys()).sort().reverse()
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i])
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (i === 0 && diff > 1) break // streak broken
    if (i > 0) {
      const prev = new Date(sortedDates[i - 1])
      prev.setHours(0, 0, 0, 0)
      const curr = new Date(sortedDates[i])
      curr.setHours(0, 0, 0, 0)
      const dayDiff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
      if (dayDiff !== 1) break
    }
    streak++
  }
  return streak
}

/**
 * GET /api/dashboard/metrics
 * Returns overall dashboard metrics with daily caching.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if we have a daily cache via a simple in-memory approach
    // In production, use Redis or similar. Here we compute on demand but set cache headers.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Active projects: checklists + objectives count
    const activeChecklists = await prisma.checklist.count({
      where: { userId, lifecycleState: { not: 'Completed' } },
    })
    const activeObjectives = await prisma.objective.count({
      where: { userId },
    })
    const activeProjects = activeChecklists + activeObjectives

    // Pending tasks: todos + reminders
    const pendingTodos = await prisma.todo.count({
      where: { userId, completed: false },
    })
    const pendingReminders = await prisma.reminder.count({
      where: { userId, completed: false, isPaused: false },
    })
    const pendingTasks = pendingTodos + pendingReminders

    // Weekly compliance: % of habits completed this week
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
      include: {
        completions: {
          where: { date: { gte: weekStart, lte: weekEnd } },
        },
      },
    })
    let totalSlots = 0
    let completedSlots = 0
    for (const h of habits) {
      if (h.goalType === 'Daily') {
        totalSlots += 7
        completedSlots += h.completions.length
      } else if (h.goalType === 'Weekly') {
        totalSlots += 1
        if (h.completions.length >= h.goalValue) completedSlots += 1
      } else {
        totalSlots += 1
        if (h.completions.length > 0) completedSlots += 1
      }
    }
    const weeklyCompliance = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0

    // Overall streak
    const habitCompletions = await prisma.habitCompletion.findMany({
      where: { habit: { userId } },
      select: { date: true },
    })
    const todoCompletions = await prisma.todo.findMany({
      where: { userId, completed: true },
      select: { completed: true, updatedAt: true },
    })
    const overallStreak = computeOverallStreak(habitCompletions, todoCompletions)

    const metrics: DashboardMetrics = {
      overallStreak,
      activeProjects,
      pendingTasks,
      weeklyCompliance,
      lastUpdated: new Date().toISOString(),
    }

    const response = NextResponse.json(metrics)
    // Cache for 1 hour (metrics are recalculated daily but we allow some caching)
    response.headers.set('Cache-Control', 'private, max-age=3600')
    return response
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
