import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const expand = searchParams.get('expand') === 'true'
    const rangeStart = searchParams.get('rangeStart')
    const rangeEnd = searchParams.get('rangeEnd')

    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        recurrenceRule: true,
        exceptions: true,
        blockers: true,
        metrics: { orderBy: { viewedAt: 'desc' }, take: 50 },
      },
    })

    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Log view metric
    await prisma.reminderMetrics.create({
      data: { reminderId: reminder.id, actionTaken: 'viewed' },
    })

    if (expand && rangeStart && rangeEnd && reminder.recurrenceRule) {
      const instances = expandRecurrence(
        reminder.recurrenceRule,
        reminder.exceptions,
        new Date(rangeStart),
        new Date(rangeEnd),
      ).filter((inst) => isWithinLifecycle(reminder, inst.date))
      return NextResponse.json({ ...reminder, instances })
    }

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error fetching reminder:', error)
    return NextResponse.json({ error: 'Failed to fetch reminder' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
      include: { recurrenceRule: true },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const {
      title,
      description,
      dueDate,
      completed,
      priority,
      sourceModule,
      sourceId,
      isPaused,
      lifecycleStartDate,
      lifecycleEndDate,
      recurrence,
    } = body

    // Update recurrence rule if provided
    if (recurrence && existing.recurrenceRule) {
      await prisma.reminderRecurrenceRule.update({
        where: { id: existing.recurrenceRule.id },
        data: {
          ...(recurrence.frequency !== undefined && { frequency: recurrence.frequency }),
          ...(recurrence.interval !== undefined && { interval: recurrence.interval }),
          ...(recurrence.daysOfWeek !== undefined && { daysOfWeek: recurrence.daysOfWeek }),
          ...(recurrence.dayOfMonth !== undefined && { dayOfMonth: recurrence.dayOfMonth }),
          ...(recurrence.monthOfYear !== undefined && { monthOfYear: recurrence.monthOfYear }),
          ...(recurrence.startDate !== undefined && { startDate: new Date(recurrence.startDate) }),
          ...(recurrence.endDate !== undefined && { endDate: recurrence.endDate ? new Date(recurrence.endDate) : null }),
        },
      })
    } else if (recurrence && !existing.recurrenceRule) {
      await prisma.reminderRecurrenceRule.create({
        data: {
          reminderId: existing.id,
          frequency: recurrence.frequency || 'once',
          interval: recurrence.interval || 1,
          daysOfWeek: recurrence.daysOfWeek || [],
          dayOfMonth: recurrence.dayOfMonth || null,
          monthOfYear: recurrence.monthOfYear || null,
          startDate: recurrence.startDate ? new Date(recurrence.startDate) : new Date(existing.dueDate),
          endDate: recurrence.endDate ? new Date(recurrence.endDate) : null,
        },
      })
    }

    const reminder = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(sourceModule !== undefined && { sourceModule }),
        ...(sourceId !== undefined && { sourceId }),
        ...(isPaused !== undefined && { isPaused }),
        ...(lifecycleStartDate !== undefined && { lifecycleStartDate: lifecycleStartDate ? new Date(lifecycleStartDate) : null }),
        ...(lifecycleEndDate !== undefined && { lifecycleEndDate: lifecycleEndDate ? new Date(lifecycleEndDate) : null }),
      },
      include: {
        recurrenceRule: true,
        exceptions: true,
        blockers: true,
      },
    })

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const result = await prisma.reminder.deleteMany({ where: { id: parseInt(id), userId } })
    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 })
  }
}
