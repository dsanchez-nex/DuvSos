import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

const MODULE_COLORS: Record<string, string> = {
  reminder: '#3b82f6',
  habit: '#10b981',
  checklist: '#f59e0b',
  todo: '#ef4444',
  milestone: '#8b5cf6',
}

/**
 * GET /api/dashboard/calendar?year=2026&month=6
 * Returns per-day event counts and colors for calendar grid.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10)
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString(), 10)

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)

    const days: Record<string, { count: number; modules: Record<string, number> }> = {}

    // Helper to accumulate
    const add = (date: Date, module: string) => {
      const key = date.toISOString().split('T')[0]
      if (!days[key]) days[key] = { count: 0, modules: {} }
      days[key].count++
      days[key].modules[module] = (days[key].modules[module] || 0) + 1
    }

    // Reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId, isPaused: false },
      include: { recurrenceRule: true, exceptions: true },
    })
    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, start, end)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        for (const inst of instances) add(inst.date, 'reminder')
      } else if (r.dueDate >= start && r.dueDate <= end && isWithinLifecycle(r, r.dueDate)) {
        add(r.dueDate, 'reminder')
      }
    }

    // Habits
    const habitCompletions = await prisma.habitCompletion.findMany({
      where: { habit: { userId }, date: { gte: start, lte: end } },
    })
    for (const hc of habitCompletions) add(hc.date, 'habit')

    // Checklists
    const checklists = await prisma.checklist.findMany({
      where: { userId, endDate: { gte: start, lte: end } },
    })
    for (const c of checklists) add(c.endDate!, 'checklist')

    // Todos
    const todos = await prisma.todo.findMany({
      where: { userId, dueDate: { gte: start, lte: end } },
    })
    for (const t of todos) add(t.dueDate!, 'todo')

    // Milestones
    const milestones = await prisma.milestone.findMany({
      where: { userId, date: { gte: start, lte: end } },
    })
    for (const m of milestones) add(m.date, 'milestone')

    return NextResponse.json(days)
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
  }
}
