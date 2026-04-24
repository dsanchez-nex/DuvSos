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
    const checklistId = parseInt(id)
    const checklist = await prisma.checklist.findFirst({ where: { id: checklistId, userId } })
    if (!checklist) return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    if (checklist.lifecycleState === 'Archived') {
      return NextResponse.json({ error: 'Cannot modify archived checklist' }, { status: 400 })
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.position !== undefined) updateData.position = body.position
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null
    if (body.blockedByItemId !== undefined) updateData.blockedByItemId = body.blockedByItemId || null
    if (body.effortEstimate !== undefined) updateData.effortEstimate = body.effortEstimate || null

    if (body.completed !== undefined) {
      // Dependency blocking logic
      if (body.completed) {
        const currentItem = await prisma.checklistItem.findUnique({
          where: { id: parseInt(itemId) },
        })
        if (currentItem?.blockedByItemId) {
          const blocker = await prisma.checklistItem.findUnique({
            where: { id: currentItem.blockedByItemId },
          })
          if (!blocker?.completed) {
            return NextResponse.json(
              { error: 'This item is blocked by another incomplete item' },
              { status: 400 }
            )
          }
        }
      }
      updateData.completed = body.completed
    }

    const item = await prisma.checklistItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
    })

    // Auto-complete logic: check if all items are done
    if (body.completed !== undefined) {
      const allItems = await prisma.checklistItem.findMany({
        where: { checklistId },
      })
      const allCompleted = allItems.length > 0 && allItems.every((i: any) => i.completed)
      if (allCompleted && checklist.lifecycleState === 'Active') {
        await prisma.checklist.update({
          where: { id: checklistId },
          data: { lifecycleState: 'Completed', completedAt: new Date() },
        })
      }
      // If un-completing an item in a completed checklist, revert to Active
      if (!body.completed && checklist.lifecycleState === 'Completed') {
        await prisma.checklist.update({
          where: { id: checklistId },
          data: { lifecycleState: 'Active', completedAt: null },
        })
      }
    }

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
