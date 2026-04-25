import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
      select: { sourceModule: true, sourceId: true },
    })

    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!reminder.sourceModule || !reminder.sourceId) {
      return NextResponse.json({ source: null })
    }

    let source = null
    switch (reminder.sourceModule) {
      case 'habit':
        source = await prisma.habit.findFirst({
          where: { id: reminder.sourceId, userId },
          select: { id: true, title: true, color: true, state: true },
        })
        break
      case 'checklist':
        source = await prisma.checklist.findFirst({
          where: { id: reminder.sourceId, userId },
          select: { id: true, title: true, color: true, lifecycleState: true },
        })
        break
      case 'todo':
        source = await prisma.todo.findFirst({
          where: { id: reminder.sourceId, userId },
          select: { id: true, title: true, completed: true, priority: true },
        })
        break
      case 'milestone':
        source = await prisma.milestone.findFirst({
          where: { id: reminder.sourceId, userId },
          select: { id: true, title: true, date: true, color: true },
        })
        break
    }

    return NextResponse.json({
      sourceModule: reminder.sourceModule,
      sourceId: reminder.sourceId,
      source,
    })
  } catch (error) {
    console.error('Error fetching traceability:', error)
    return NextResponse.json({ error: 'Failed to fetch traceability' }, { status: 500 })
  }
}
