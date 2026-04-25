import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

/**
 * POST /api/reminders/conflict-check
 * Body: { date: string }
 * Returns conflicting events across all modules for a given date.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { date } = await request.json()
    if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 })

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const conflicts: { module: string; title: string; priority?: string; type: string }[] = []

    // High-priority reminders on same day
    const reminders = await prisma.reminder.findMany({
      where: { userId, isPaused: false, priority: 'high' },
      include: { recurrenceRule: true, exceptions: true },
    })
    for (const r of reminders) {
      let hasInstance = false
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, dayStart, dayEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        hasInstance = instances.length > 0
      } else {
        hasInstance = r.dueDate >= dayStart && r.dueDate <= dayEnd && isWithinLifecycle(r, r.dueDate)
      }
      if (hasInstance) {
        conflicts.push({ module: 'reminder', title: r.title, priority: r.priority, type: 'high-priority-reminder' })
      }
    }

    // High-priority todos on same day
    const todos = await prisma.todo.findMany({
      where: { userId, dueDate: { gte: dayStart, lte: dayEnd }, priority: 'high', completed: false },
    })
    for (const t of todos) {
      conflicts.push({ module: 'todo', title: t.title, priority: t.priority, type: 'high-priority-todo' })
    }

    // Active habits (always count as activity)
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
    })
    for (const h of habits) {
      conflicts.push({ module: 'habit', title: h.title, type: 'active-habit' })
    }

    // Checklists due on same day
    const checklists = await prisma.checklist.findMany({
      where: { userId, endDate: { gte: dayStart, lte: dayEnd }, lifecycleState: { not: 'Completed' } },
    })
    for (const c of checklists) {
      conflicts.push({ module: 'checklist', title: c.title, type: 'due-checklist' })
    }

    const hasConflict = conflicts.length > 2 // more than 2 activities = potential overload

    return NextResponse.json({
      date,
      hasConflict,
      conflictCount: conflicts.length,
      conflicts,
    })
  } catch (error) {
    console.error('Error checking conflicts:', error)
    return NextResponse.json({ error: 'Failed to check conflicts' }, { status: 500 })
  }
}
