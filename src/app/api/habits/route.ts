import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isValidHexColor, validateCycle } from '@/lib/habit-utils'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const { searchParams } = new URL(request.url)
    const stateFilter = searchParams.get('state')
    const categoryId = searchParams.get('categoryId')
    const objectiveId = searchParams.get('objectiveId')
    const includeArchived = searchParams.get('includeArchived') === 'true'

    const where: any = { userId }

    if (stateFilter) {
      where.state = stateFilter
    } else if (!includeArchived) {
      where.state = { not: 'Archived' }
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10)
    }

    if (objectiveId) {
      where.objectiveId = parseInt(objectiveId, 10)
    }

    const habits = await prisma.habit.findMany({
      where,
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 90,
        },
        category: true,
        objective: true,
        blockers: {
          include: { blockerHabit: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const body = await request.json()

    const {
      title,
      description,
      color,
      state = 'Active',
      isPermanent = true,
      startDate,
      endDate,
      goalType = 'Daily',
      goalValue = 1,
      categoryId,
      objectiveId,
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (color && !isValidHexColor(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Must be a valid hex color (#RRGGBB).' },
        { status: 400 }
      )
    }

    const cycleValidation = validateCycle(isPermanent, startDate, endDate)
    if (!cycleValidation.valid) {
      return NextResponse.json({ error: cycleValidation.error }, { status: 400 })
    }

    // Ensure default category exists if categoryId not provided
    let finalCategoryId = categoryId
    if (!finalCategoryId) {
      const defaultCategory = await prisma.category.findFirst({
        where: { userId, name: 'General' },
      })
      if (defaultCategory) {
        finalCategoryId = defaultCategory.id
      }
    }

    const habit = await prisma.habit.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        color: color || '#3b82f6',
        state,
        isPermanent,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        goalType,
        goalValue: parseInt(goalValue, 10) || 1,
        userId,
        categoryId: finalCategoryId || null,
        objectiveId: objectiveId || null,
      },
      include: {
        completions: true,
        category: true,
        objective: true,
        blockers: { include: { blockerHabit: true } },
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
