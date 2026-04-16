import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const checklistId = parseInt(id)

    const checklist = await prisma.checklist.findFirst({ where: { id: checklistId, userId } })
    if (!checklist) return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })

    const { title, notes, priority } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const maxPos = await prisma.checklistItem.aggregate({
      where: { checklistId },
      _max: { position: true },
    })

    const item = await prisma.checklistItem.create({
      data: {
        title: title.trim(),
        notes: notes || null,
        priority: priority || 'normal',
        position: (maxPos._max.position ?? -1) + 1,
        checklistId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
