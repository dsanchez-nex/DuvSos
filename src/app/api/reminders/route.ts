import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'
import { expandRecurrence, isWithinLifecycle } from '@/lib/reminder-recurrence'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const expand = searchParams.get('expand') === 'true'
    const rangeStart = searchParams.get('rangeStart')
    const rangeEnd = searchParams.get('rangeEnd')
    const includePaused = searchParams.get('includePaused') === 'true'

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        ...(includePaused ? {} : { isPaused: false }),
      },
      include: {
        recurrenceRule: true,
        exceptions: true,
        blockers: true,
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    })

    // If expansion requested, generate instances for recurring reminders
    if (expand && rangeStart && rangeEnd) {
      const start = new Date(rangeStart)
      const end = new Date(rangeEnd)
      const expanded = reminders.flatMap((r) => {
        if (!r.recurrenceRule) {
          // Single reminder — check lifecycle
          if (!isWithinLifecycle(r, r.dueDate)) return []
          return [{ ...r, instances: [{ date: r.dueDate, isException: false }] }]
        }
        const instances = expandRecurrence(r.recurrenceRule, r.exceptions, start, end)
          .filter((inst) => isWithinLifecycle(r, inst.date))
        return instances.length > 0 ? [{ ...r, instances }] : []
      })
      return NextResponse.json(expanded)
    }

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      title,
      description,
      dueDate,
      priority,
      sourceModule,
      sourceId,
      lifecycleStartDate,
      lifecycleEndDate,
      recurrence,
      blockers,
    } = body

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (!dueDate) return NextResponse.json({ error: 'Due date is required' }, { status: 400 })

    const reminder = await prisma.reminder.create({
      data: {
        title: title.trim(),
        description: description || null,
        dueDate: new Date(dueDate),
        priority: priority || 'normal',
        userId,
        sourceModule: sourceModule || null,
        sourceId: sourceId || null,
        lifecycleStartDate: lifecycleStartDate ? new Date(lifecycleStartDate) : null,
        lifecycleEndDate: lifecycleEndDate ? new Date(lifecycleEndDate) : null,
        ...(recurrence && {
          recurrenceRule: {
            create: {
              frequency: recurrence.frequency || 'once',
              interval: recurrence.interval || 1,
              daysOfWeek: recurrence.daysOfWeek || [],
              dayOfMonth: recurrence.dayOfMonth || null,
              monthOfYear: recurrence.monthOfYear || null,
              startDate: recurrence.startDate ? new Date(recurrence.startDate) : new Date(dueDate),
              endDate: recurrence.endDate ? new Date(recurrence.endDate) : null,
            },
          },
        }),
        ...(blockers?.length > 0 && {
          blockers: {
            createMany: {
              data: blockers.map((b: { blockerModule: string; blockerId: number }) => ({
                blockerModule: b.blockerModule,
                blockerId: b.blockerId,
              })),
            },
          },
        }),
      },
      include: {
        recurrenceRule: true,
        exceptions: true,
        blockers: true,
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}
