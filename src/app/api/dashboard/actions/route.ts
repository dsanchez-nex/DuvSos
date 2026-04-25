import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface ActionItem {
  id: string
  module: string
  title: string
  time?: string
  priority?: string
  completed?: boolean
  context?: string
  sourceId?: number
  sourceModule?: string
  directAction?: { label: string; route: string }
}

/**
 * GET /api/dashboard/actions?date=YYYY-MM-DD
 * Returns chronological action list for a selected date.
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

    const actions: ActionItem[] = []

    // Reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId, isPaused: false },
      include: { recurrenceRule: true, exceptions: true },
    })
    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, dayStart, dayEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        for (const inst of instances) {
          actions.push({
            id: `reminder-${r.id}-${inst.date.toISOString().split('T')[0]}`,
            module: 'reminder',
            title: r.title,
            priority: r.priority,
            completed: r.completed,
            context: r.description || undefined,
            sourceId: r.sourceId || undefined,
            sourceModule: r.sourceModule || undefined,
            directAction: { label: 'Mark Done', route: `/api/reminders/${r.id}` },
          })
        }
      } else if (r.dueDate >= dayStart && r.dueDate <= dayEnd && isWithinLifecycle(r, r.dueDate)) {
        actions.push({
          id: `reminder-${r.id}`,
          module: 'reminder',
          title: r.title,
          priority: r.priority,
          completed: r.completed,
          context: r.description || undefined,
          sourceId: r.sourceId || undefined,
          sourceModule: r.sourceModule || undefined,
          directAction: { label: 'Mark Done', route: `/api/reminders/${r.id}` },
        })
      }
    }

    // Habits
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
      include: { completions: { where: { date: { gte: dayStart, lte: dayEnd } } } },
    })
    for (const h of habits) {
      actions.push({
        id: `habit-${h.id}`,
        module: 'habit',
        title: h.title,
        completed: h.completions.length > 0,
        directAction: { label: 'Mark Habit', route: `/api/habits/${h.id}/completions` },
      })
    }

    // Checklists
    const checklists = await prisma.checklist.findMany({
      where: { userId, endDate: { gte: dayStart, lte: dayEnd } },
    })
    for (const c of checklists) {
      actions.push({
        id: `checklist-${c.id}`,
        module: 'checklist',
        title: c.title,
        completed: c.lifecycleState === 'Completed',
        directAction: { label: 'Open', route: `/checklists` },
      })
    }

    // Todos
    const todos = await prisma.todo.findMany({
      where: { userId, dueDate: { gte: dayStart, lte: dayEnd } },
    })
    for (const t of todos) {
      actions.push({
        id: `todo-${t.id}`,
        module: 'todo',
        title: t.title,
        priority: t.priority,
        completed: t.completed,
        directAction: { label: 'Go to ToDo', route: `/todos` },
      })
    }

    // Sort: pending first, then by module priority
    const moduleOrder = ['reminder', 'todo', 'checklist', 'habit']
    actions.sort((a, b) => {
      if (a.completed !== b.completed) return (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
      return moduleOrder.indexOf(a.module) - moduleOrder.indexOf(b.module)
    })

    return NextResponse.json(actions)
  } catch (error) {
    console.error('Error fetching action list:', error)
    return NextResponse.json({ error: 'Failed to fetch action list' }, { status: 500 })
  }
}
