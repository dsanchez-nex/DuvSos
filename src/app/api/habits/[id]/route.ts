import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidHexColor, validateCycle } from '@/lib/habit-utils'
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

async function checkOwnership(habitId: number, userId: number) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } })
  if (!habit) return { exists: false, owned: false, habit: null }
  if (habit.userId && habit.userId !== userId) return { exists: true, owned: false, habit }
  return { exists: true, owned: true, habit }
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

    const { owned, habit } = await checkOwnership(id, userId)
    if (!owned) {
      return NextResponse.json({ error: habit ? 'Forbidden' : 'Not found' }, { status: habit ? 403 : 404 })
    }

    const fullHabit = await prisma.habit.findUnique({
      where: { id },
      include: {
        completions: { orderBy: { date: 'desc' } },
        category: true,
        objective: true,
        blockers: { include: { blockerHabit: true } },
        blocking: { include: { habit: true } },
      },
    })

    return NextResponse.json(fullHabit)
  } catch (error) {
    console.error('Error fetching habit:', error)
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { owned, habit } = await checkOwnership(id, userId)
    if (!owned) {
      return NextResponse.json({ error: habit ? 'Forbidden' : 'Not found' }, { status: habit ? 403 : 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      color,
      state,
      isPermanent,
      startDate,
      endDate,
      goalType,
      goalValue,
      categoryId,
      objectiveId,
    } = body

    if (title !== undefined && (!title || typeof title !== 'string')) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (color && !isValidHexColor(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Must be a valid hex color (#RRGGBB).' },
        { status: 400 }
      )
    }

    const cycleValidation = validateCycle(
      isPermanent !== undefined ? isPermanent : habit!.isPermanent,
      startDate !== undefined ? startDate : habit!.startDate,
      endDate !== undefined ? endDate : habit!.endDate
    )
    if (!cycleValidation.valid) {
      return NextResponse.json({ error: cycleValidation.error }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (color !== undefined) updateData.color = color
    if (state !== undefined) updateData.state = state
    if (isPermanent !== undefined) updateData.isPermanent = isPermanent
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (goalType !== undefined) updateData.goalType = goalType
    if (goalValue !== undefined) updateData.goalValue = parseInt(goalValue, 10)
    if (categoryId !== undefined) updateData.categoryId = categoryId || null
    if (objectiveId !== undefined) updateData.objectiveId = objectiveId || null

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: updateData,
      include: {
        completions: true,
        category: true,
        objective: true,
        blockers: { include: { blockerHabit: true } },
      },
    })

    return NextResponse.json(updatedHabit)
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
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

    const { owned, habit } = await checkOwnership(id, userId)
    if (!owned) {
      return NextResponse.json({ error: habit ? 'Forbidden' : 'Not found' }, { status: habit ? 403 : 404 })
    }

    await prisma.habit.delete({ where: { id } })
    return NextResponse.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
}
