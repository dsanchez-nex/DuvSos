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
 * GET /api/dashboard/summary?date=YYYY-MM-DD
 * Returns activity counts per module for a specific day.
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

    const summary: Record<string, { count: number; pending: number; completed: number }> = {
      reminder: { count: 0, pending: 0, completed: 0 },
      habit: { count: 0, pending: 0, completed: 0 },
      checklist: { count: 0, pending: 0, completed: 0 },
      todo: { count: 0, pending: 0, completed: 0 },
      milestone: { count: 0, pending: 0, completed: 0 },
    }

    // Reminders
    const reminders = await prisma.reminder.findMany({
      where: { userId, isPaused: false },
      include: { recurrenceRule: true, exceptions: true },
    })
    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, dayStart, dayEnd)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        summary.reminder.count += instances.length
        summary.reminder.completed += r.completed ? instances.length : 0
      } else if (r.dueDate >= dayStart && r.dueDate <= dayEnd && isWithinLifecycle(r, r.dueDate)) {
        summary.reminder.count++
        if (r.completed) summary.reminder.completed++
      }
    }
    summary.reminder.pending = summary.reminder.count - summary.reminder.completed

    // Habits
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
      include: { completions: { where: { date: { gte: dayStart, lte: dayEnd } } } },
    })
    for (const h of habits) {
      summary.habit.count++
      if (h.completions.length > 0) summary.habit.completed++
    }
    summary.habit.pending = summary.habit.count - summary.habit.completed

    // Checklists
    const checklists = await prisma.checklist.findMany({
      where: { userId, endDate: { gte: dayStart, lte: dayEnd } },
    })
    for (const c of checklists) {
      summary.checklist.count++
      if (c.lifecycleState === 'Completed') summary.checklist.completed++
    }
    summary.checklist.pending = summary.checklist.count - summary.checklist.completed

    // Todos
    const todos = await prisma.todo.findMany({
      where: { userId, dueDate: { gte: dayStart, lte: dayEnd } },
    })
    for (const t of todos) {
      summary.todo.count++
      if (t.completed) summary.todo.completed++
    }
    summary.todo.pending = summary.todo.count - summary.todo.completed

    // Milestones
    const milestones = await prisma.milestone.findMany({
      where: { userId, date: { gte: dayStart, lte: dayEnd } },
    })
    summary.milestone.count = milestones.length

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching day summary:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
