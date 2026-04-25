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
      include: {
        blockers: true,
        recurrenceRule: true,
        exceptions: true,
        metrics: { orderBy: { viewedAt: 'desc' }, take: 20 },
      },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Resolve blocker completion status cross-module
    const blockerStatus = await Promise.all(
      reminder.blockers.map(async (b) => {
        let completed = false
        try {
          switch (b.blockerModule) {
            case 'habit': {
              const habit = await prisma.habit.findFirst({
                where: { id: b.blockerId, userId },
                include: { completions: { take: 1, orderBy: { date: 'desc' } } },
              })
              completed = (habit?.completions?.length ?? 0) > 0
              break
            }
            case 'checklist': {
              const item = await prisma.checklistItem.findFirst({
                where: { id: b.blockerId },
              })
              completed = item?.completed ?? false
              break
            }
            case 'todo': {
              const todo = await prisma.todo.findFirst({
                where: { id: b.blockerId, userId },
              })
              completed = todo?.completed ?? false
              break
            }
            case 'reminder': {
              const rem = await prisma.reminder.findFirst({
                where: { id: b.blockerId, userId },
              })
              completed = rem?.completed ?? false
              break
            }
          }
        } catch {
          completed = false
        }
        return { ...b, completed }
      }),
    )

    return NextResponse.json({
      ...reminder,
      blockers: blockerStatus,
    })
  } catch (error) {
    console.error('Error fetching reminder detail:', error)
    return NextResponse.json({ error: 'Failed to fetch reminder detail' }, { status: 500 })
  }
}
