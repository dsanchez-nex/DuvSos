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

const validTransitions: Record<string, string[]> = {
  Active: ['Paused', 'Archived'],
  Paused: ['Active', 'Archived'],
  Archived: ['Active'],
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { state } = body

    if (!state || !validTransitions[habit.state]?.includes(state)) {
      return NextResponse.json(
        { error: `Invalid state transition from ${habit.state} to ${state}` },
        { status: 400 }
      )
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: { state },
      include: {
        completions: true,
        category: true,
        objective: true,
      },
    })

    return NextResponse.json(updatedHabit)
  } catch (error) {
    console.error('Error updating habit state:', error)
    return NextResponse.json({ error: 'Failed to update habit state' }, { status: 500 })
  }
}
