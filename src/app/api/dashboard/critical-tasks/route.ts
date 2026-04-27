import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface CriticalTask {
  id: string
  module: 'todo' | 'reminder'
  title: string
  dueDate: string
  priority: string
  completed: boolean
  sourceId?: number
  sourceModule?: string
}

/**
 * GET /api/dashboard/critical-tasks?date=YYYY-MM-DD
 * Returns up to 5 critical tasks (ToDo + Reminder) for the given date.
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

    const tasks: CriticalTask[] = []

    // Todos: high priority or due today
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        completed: false,
        OR: [
          { dueDate: { gte: dayStart, lte: dayEnd } },
          { priority: 'high' },
        ],
      },
      orderBy: { priority: 'desc' },
      take: 5,
    })
    for (const t of todos) {
      tasks.push({
        id: `todo-${t.id}`,
        module: 'todo',
        title: t.title,
        dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : dateParam,
        priority: t.priority,
        completed: t.completed,
      })
    }

    // Reminders: high priority or due today
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        completed: false,
        isPaused: false,
        OR: [
          { dueDate: { gte: dayStart, lte: dayEnd } },
          { priority: 'high' },
        ],
      },
      include: { recurrenceRule: true, exceptions: true },
      orderBy: { priority: 'desc' },
      take: 5,
    })
    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, dayStart, dayEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        if (instances.length > 0) {
          tasks.push({
            id: `reminder-${r.id}`,
            module: 'reminder',
            title: r.title,
            dueDate: dateParam,
            priority: r.priority,
            completed: r.completed,
            sourceId: r.sourceId || undefined,
            sourceModule: r.sourceModule || undefined,
          })
        }
      } else if (r.dueDate >= dayStart && r.dueDate <= dayEnd && isWithinLifecycle(r, r.dueDate)) {
        tasks.push({
          id: `reminder-${r.id}`,
          module: 'reminder',
          title: r.title,
          dueDate: r.dueDate.toISOString().split('T')[0],
          priority: r.priority,
          completed: r.completed,
          sourceId: r.sourceId || undefined,
          sourceModule: r.sourceModule || undefined,
        })
      }
    }

    // Sort: high priority first, then by due date
    const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 }
    tasks.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1
      const pb = priorityOrder[b.priority] ?? 1
      if (pa !== pb) return pa - pb
      return a.dueDate.localeCompare(b.dueDate)
    })

    return NextResponse.json(tasks.slice(0, 5))
  } catch (error) {
    console.error('Error fetching critical tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch critical tasks' }, { status: 500 })
  }
}
