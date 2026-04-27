import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

interface UpcomingReminder {
  id: number | string
  title: string
  dueDate: string
  priority: string
  sourceModule?: string
  sourceId?: number
  daysUntil: number
}

/**
 * GET /api/dashboard/upcoming-reminders
 * Returns upcoming non-completed reminders for the next 14 days.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fourteenDaysLater = new Date(today)
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14)
    fourteenDaysLater.setHours(23, 59, 59, 999)

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        completed: false,
        isPaused: false,
      },
      include: { recurrenceRule: true, exceptions: true },
      orderBy: { dueDate: 'asc' },
    })

    const result: UpcomingReminder[] = []

    for (const r of reminders) {
      if (r.recurrenceRule) {
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, today, fourteenDaysLater)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        for (const inst of instances) {
          const ms = inst.date.getTime() - today.getTime()
          const daysUntil = Math.ceil(ms / (1000 * 60 * 60 * 24))
          result.push({
            id: `${r.id}-${inst.date.toISOString().split('T')[0]}`,
            title: r.title,
            dueDate: inst.date.toISOString().split('T')[0],
            priority: r.priority,
            sourceModule: r.sourceModule || undefined,
            sourceId: r.sourceId || undefined,
            daysUntil,
          })
        }
      } else if (r.dueDate >= today && r.dueDate <= fourteenDaysLater && isWithinLifecycle(r, r.dueDate)) {
        const ms = r.dueDate.getTime() - today.getTime()
        const daysUntil = Math.ceil(ms / (1000 * 60 * 60 * 24))
        result.push({
          id: r.id,
          title: r.title,
          dueDate: r.dueDate.toISOString().split('T')[0],
          priority: r.priority,
          sourceModule: r.sourceModule || undefined,
          sourceId: r.sourceId || undefined,
          daysUntil,
        })
      }
    }

    // Sort by daysUntil ascending, then priority
    const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 }
    result.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)
    })

    return NextResponse.json(result.slice(0, 10))
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch upcoming reminders' }, { status: 500 })
  }
}
