import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface WorkloadDay {
  date: string
  score: number
  tasks: number
  habits: number
  reminders: number
  overloaded: boolean
}

const OVERLOAD_THRESHOLD = 5

/**
 * GET /api/dashboard/workload?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns daily workload scores for the given date range.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    const rangeStart = startParam ? new Date(startParam) : new Date()
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = endParam ? new Date(endParam) : new Date()
    rangeEnd.setHours(23, 59, 59, 999)

    const days: Record<string, WorkloadDay> = {}

    // Helper
    const ensureDay = (date: Date) => {
      const key = date.toISOString().split('T')[0]
      if (!days[key]) {
        days[key] = { date: key, score: 0, tasks: 0, habits: 0, reminders: 0, overloaded: false }
      }
      return days[key]
    }

    // Todos
    const todos = await prisma.todo.findMany({
      where: { userId, completed: false, dueDate: { gte: rangeStart, lte: rangeEnd } },
    })
    for (const t of todos) {
      const d = ensureDay(t.dueDate!)
      d.tasks++
      d.score++
    }

    // Habits (active ones count as daily load)
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
    })
    // Habits are a daily commitment; assign to every day in range
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const day = ensureDay(d)
      day.habits = habits.length
      day.score += habits.length
    }

    // Reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId, completed: false, isPaused: false },
      include: { recurrenceRule: true, exceptions: true },
    })
    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, rangeStart, rangeEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        for (const inst of instances) {
          const d = ensureDay(inst.date)
          d.reminders++
          d.score++
        }
      } else if (r.dueDate >= rangeStart && r.dueDate <= rangeEnd && isWithinLifecycle(r, r.dueDate)) {
        const d = ensureDay(r.dueDate)
        d.reminders++
        d.score++
      }
    }

    // Mark overloaded days
    Object.values(days).forEach((d) => {
      d.overloaded = d.score > OVERLOAD_THRESHOLD
    })

    return NextResponse.json(days)
  } catch (error) {
    console.error('Error fetching workload:', error)
    return NextResponse.json({ error: 'Failed to fetch workload' }, { status: 500 })
  }
}
