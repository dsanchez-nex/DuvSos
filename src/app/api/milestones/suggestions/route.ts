import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

/**
 * GET /api/milestones/suggestions?milestoneId=<id>
 * Returns related items that could be associated with a milestone.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const milestoneId = searchParams.get('milestoneId')
    if (!milestoneId) return NextResponse.json({ error: 'milestoneId is required' }, { status: 400 })

    const milestone = await prisma.milestone.findFirst({
      where: { id: parseInt(milestoneId), userId },
      include: { items: true },
    })
    if (!milestone) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existingIds = new Set(milestone.items.map((i) => `${i.itemModule}-${i.itemId}`))

    const suggestions: { module: string; id: number; title: string; reason: string }[] = []

    // Suggest reminders near milestone date
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        dueDate: { gte: new Date(milestone.date.getTime() - 3 * 86400000), lte: new Date(milestone.date.getTime() + 3 * 86400000) },
      },
    })
    for (const r of reminders) {
      if (!existingIds.has(`reminder-${r.id}`)) {
        suggestions.push({ module: 'reminder', id: r.id, title: r.title, reason: 'Near milestone date' })
      }
    }

    // Suggest todos near milestone date
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: { gte: new Date(milestone.date.getTime() - 3 * 86400000), lte: new Date(milestone.date.getTime() + 3 * 86400000) },
      },
    })
    for (const t of todos) {
      if (!existingIds.has(`todo-${t.id}`)) {
        suggestions.push({ module: 'todo', id: t.id, title: t.title, reason: 'Near milestone date' })
      }
    }

    // Suggest active habits
    const habits = await prisma.habit.findMany({
      where: { userId, state: 'Active' },
    })
    for (const h of habits) {
      if (!existingIds.has(`habit-${h.id}`)) {
        suggestions.push({ module: 'habit', id: h.id, title: h.title, reason: 'Active habit' })
      }
    }

    return NextResponse.json(suggestions.slice(0, 10))
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}
