import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, itemId } = await params
    const checklist = await prisma.checklist.findFirst({ where: { id: parseInt(id), userId } })
    if (!checklist) return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })

    const body = await request.json()
    const item = await prisma.checklistItem.update({
      where: { id: parseInt(itemId) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.completed !== undefined && { completed: body.completed }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.priority !== undefined && { priority: body.priority }),
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, itemId } = await params
    const checklist = await prisma.checklist.findFirst({ where: { id: parseInt(id), userId } })
    if (!checklist) return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })

    await prisma.checklistItem.delete({ where: { id: parseInt(itemId) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
