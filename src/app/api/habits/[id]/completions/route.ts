import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateLevel, getXPForHabitCompletion, checkMilestones } from '@/lib/habit-utils'
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

/**
 * Check if all blocker habits are completed for the current period
 */
async function checkBlockers(habitId: number, date: Date): Promise<{ blocked: boolean; missingBlockers: string[] }> {
  const blockers = await prisma.habitBlocker.findMany({
    where: { habitId },
    include: { blockerHabit: true },
  })

  if (blockers.length === 0) {
    return { blocked: false, missingBlockers: [] }
  }

  const missingBlockers: string[] = []

  for (const blocker of blockers) {
    const completion = await prisma.habitCompletion.findFirst({
      where: {
        habitId: blocker.blockerHabitId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (!completion) {
      missingBlockers.push(blocker.blockerHabit.title)
    }
  }

  return { blocked: missingBlockers.length > 0, missingBlockers }
}

/**
 * Award XP to user for habit completion
 */
async function awardXP(userId: number, goalType: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean; milestone: string | null }> {
  const xpAmount = getXPForHabitCompletion(goalType as any)

  let progression = await prisma.userProgression.findUnique({
    where: { userId },
  })

  if (!progression) {
    progression = await prisma.userProgression.create({
      data: { userId, totalXP: 0, currentLevel: 1 },
    })
  }

  const oldLevel = progression.currentLevel
  const newXP = progression.totalXP + xpAmount
  const newLevel = calculateLevel(newXP)
  const leveledUp = newLevel > oldLevel

  await prisma.userProgression.update({
    where: { userId },
    data: { totalXP: newXP, currentLevel: newLevel },
  })

  // Count total completions for milestones
  const totalCompletions = await prisma.habitCompletion.count({
    where: { habit: { userId } },
  })
  const milestone = checkMilestones(totalCompletions)

  return { newXP, newLevel, leveledUp, milestone }
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

    const { owned, habit } = await checkOwnership(id, userId)
    if (!owned) {
      return NextResponse.json({ error: habit ? 'Forbidden' : 'Not found' }, { status: habit ? 403 : 404 })
    }

    const body = await request.json()
    const { date } = body

    // Handle date correctly (local time vs UTC)
    let completionDate: Date
    if (date) {
      completionDate = new Date(`${date}T00:00:00`)
    } else {
      completionDate = new Date()
    }
    completionDate.setHours(0, 0, 0, 0)

    // Check blockers
    const { blocked, missingBlockers } = await checkBlockers(id, completionDate)
    if (blocked) {
      return NextResponse.json(
        {
          error: 'Prerequisites not met',
          message: `Debes completar primero: ${missingBlockers.join(', ')}`,
          missingBlockers,
        },
        { status: 403 }
      )
    }

    // Check if habit is active and within cycle
    if (habit!.state !== 'Active') {
      return NextResponse.json(
        { error: `Cannot complete a ${habit!.state.toLowerCase()} habit` },
        { status: 403 }
      )
    }

    if (!habit!.isPermanent && habit!.endDate && new Date() > new Date(habit!.endDate)) {
      return NextResponse.json(
        { error: 'Habit cycle has ended' },
        { status: 403 }
      )
    }

    // Create completion
    const completion = await prisma.habitCompletion.create({
      data: {
        habitId: id,
        date: completionDate,
        completedAt: new Date(),
      },
    })

    // Award XP
    const xpResult = await awardXP(userId, habit!.goalType)

    return NextResponse.json({
      completion,
      xp: xpResult,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating completion:', error)
    return NextResponse.json({ error: 'Failed to create completion' }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const date = new Date(`${dateParam}T00:00:00`)
    date.setHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    await prisma.habitCompletion.deleteMany({
      where: {
        habitId: id,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    })

    return NextResponse.json({ message: 'Completion deleted successfully' })
  } catch (error) {
    console.error('Error deleting completion:', error)
    return NextResponse.json({ error: 'Failed to delete completion' }, { status: 500 })
  }
}
