import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const itemId = parseInt(id)

    const item = await prisma.checklistItem.findFirst({
      where: { id: itemId },
      include: { checklist: true },
    })

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (item.checklist.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!item.completed) {
      return NextResponse.json({ error: 'Item must be completed before conversion' }, { status: 400 })
    }

    const maxPositionResult = await prisma.todo.aggregate({
      where: { userId, completed: false, parentId: null },
      _max: { position: true },
    })
    const newPosition = (maxPositionResult._max.position ?? -1) + 1

    const todo = await prisma.todo.create({
      data: {
        title: item.title,
        description: item.notes || null,
        priority: item.priority || 'normal',
        effortMinutes: item.effortEstimate || 0,
        completed: false,
        userId,
        position: newPosition,
      },
      include: { subTasks: true, category: true },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error converting item to todo:', error)
    return NextResponse.json({ error: 'Failed to convert item to todo' }, { status: 500 })
  }
}