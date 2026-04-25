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

interface UnifiedEvent {
  id: number | string
  module: string
  title: string
  date: Date
  color: string
  completed?: boolean
  priority?: string
  context?: string
}

/**
 * GET /api/dashboard/events?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns unified events across all modules for calendar/list views.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const dateParam = searchParams.get('date') // single day filter

    const rangeStart = startParam ? new Date(startParam) : dateParam ? new Date(dateParam) : new Date()
    const rangeEnd = endParam ? new Date(endParam) : dateParam ? new Date(dateParam) : new Date()
    if (dateParam) {
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd.setHours(23, 59, 59, 999)
    }

    const events: UnifiedEvent[] = []

    // ─── Reminders (including expanded recurrence) ───
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        isPaused: false,
      },
      include: { recurrenceRule: true, exceptions: true },
    })

    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, rangeStart, rangeEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        for (const inst of instances) {
          events.push({
            id: `${r.id}-${inst.date.toISOString().split('T')[0]}`,
            module: 'reminder',
            title: r.title,
            date: inst.date,
            color: MODULE_COLORS.reminder,
            completed: r.completed,
            priority: r.priority,
            context: r.description || undefined,
          })
        }
      } else {
        if (r.dueDate >= rangeStart && r.dueDate <= rangeEnd && isWithinLifecycle(r, r.dueDate)) {
          events.push({
            id: r.id,
            module: 'reminder',
            title: r.title,
            date: r.dueDate,
            color: MODULE_COLORS.reminder,
            completed: r.completed,
            priority: r.priority,
            context: r.description || undefined,
          })
        }
      }
    }

    // ─── Habits (completions in range) ───
    const habitCompletions = await prisma.habitCompletion.findMany({
      where: {
        habit: { userId },
        date: { gte: rangeStart, lte: rangeEnd },
      },
      include: { habit: true },
    })
    for (const hc of habitCompletions) {
      events.push({
        id: `habit-${hc.habitId}-${hc.date.toISOString().split('T')[0]}`,
        module: 'habit',
        title: hc.habit.title,
        date: hc.date,
        color: hc.habit.color || MODULE_COLORS.habit,
        completed: true,
      })
    }

    // ─── Checklists (endDate in range) ───
    const checklists = await prisma.checklist.findMany({
      where: {
        userId,
        endDate: { gte: rangeStart, lte: rangeEnd },
      },
    })
    for (const c of checklists) {
      events.push({
        id: `checklist-${c.id}`,
        module: 'checklist',
        title: c.title,
        date: c.endDate!,
        color: c.color || MODULE_COLORS.checklist,
        completed: c.lifecycleState === 'Completed',
      })
    }

    // ─── Todos (dueDate in range) ───
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: { gte: rangeStart, lte: rangeEnd },
      },
    })
    for (const t of todos) {
      events.push({
        id: `todo-${t.id}`,
        module: 'todo',
        title: t.title,
        date: t.dueDate!,
        color: MODULE_COLORS.todo,
        completed: t.completed,
        priority: t.priority,
      })
    }

    // ─── Milestones (date in range) ───
    const milestones = await prisma.milestone.findMany({
      where: {
        userId,
        date: { gte: rangeStart, lte: rangeEnd },
      },
    })
    for (const m of milestones) {
      events.push({
        id: `milestone-${m.id}`,
        module: 'milestone',
        title: m.title,
        date: m.date,
        color: m.color || MODULE_COLORS.milestone,
      })
    }

    // Sort chronologically
    events.sort((a, b) => a.date.getTime() - b.date.getTime())

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching unified events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
