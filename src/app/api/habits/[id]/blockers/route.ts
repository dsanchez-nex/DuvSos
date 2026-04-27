import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function getUserId(): Promise<number | null> {
  const headersList = await headers()
  const userIdHeader = headersList.get('x-user-id')
  if (!userIdHeader) return null
  return parseInt(userIdHeader, 10)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid habit ID' }, { status: 400 })
    }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const blockers = await prisma.habitBlocker.findMany({
      where: { habitId: id },
      include: { blockerHabit: true },
    })

    return NextResponse.json(blockers)
  } catch (error) {
    console.error('Error fetching blockers:', error)
    return NextResponse.json({ error: 'Failed to fetch blockers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid habit ID' }, { status: 400 })
    }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { blockerHabitId } = body

    if (!blockerHabitId || isNaN(parseInt(blockerHabitId, 10))) {
      return NextResponse.json({ error: 'blockerHabitId is required' }, { status: 400 })
    }

    const blockerId = parseInt(blockerHabitId, 10)

    // Prevent self-blocking
    if (blockerId === id) {
      return NextResponse.json({ error: 'A habit cannot block itself' }, { status: 400 })
    }

    // Verify blocker habit exists and belongs to user
    const blockerHabit = await prisma.habit.findUnique({ where: { id: blockerId } })
    if (!blockerHabit) {
      return NextResponse.json({ error: 'Blocker habit not found' }, { status: 404 })
    }
    if (blockerHabit.userId && blockerHabit.userId !== userId) {
      return NextResponse.json({ error: 'Blocker habit does not belong to you' }, { status: 403 })
    }

    // Check for circular blockers
    const circularBlocker = await prisma.habitBlocker.findFirst({
      where: { habitId: blockerId, blockerHabitId: id },
    })
    if (circularBlocker) {
      return NextResponse.json(
        { error: 'Circular blocker detected: the blocker habit is already blocked by this habit' },
        { status: 400 }
      )
    }

    const blocker = await prisma.habitBlocker.create({
      data: {
        habitId: id,
        blockerHabitId: blockerId,
      },
      include: { blockerHabit: true },
    })

    return NextResponse.json(blocker, { status: 201 })
  } catch (error) {
    console.error('Error creating blocker:', error)
    return NextResponse.json({ error: 'Failed to create blocker' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid habit ID' }, { status: 400 })
    }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    if (habit.userId && habit.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const blockerId = searchParams.get('blockerId')

    if (!blockerId) {
      return NextResponse.json({ error: 'blockerId is required' }, { status: 400 })
    }

    await prisma.habitBlocker.deleteMany({
      where: {
        habitId: id,
        blockerHabitId: parseInt(blockerId, 10),
      },
    })

    return NextResponse.json({ message: 'Blocker removed successfully' })
  } catch (error) {
    console.error('Error deleting blocker:', error)
    return NextResponse.json({ error: 'Failed to delete blocker' }, { status: 500 })
  }
}
