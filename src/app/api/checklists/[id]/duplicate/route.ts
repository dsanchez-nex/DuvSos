import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const original = await prisma.checklist.findFirst({
      where: { id: parseInt(id), userId },
      include: { items: { orderBy: { position: 'asc' } } },
    })
    if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const copy = await prisma.checklist.create({
      data: {
        title: `${original.title} (copy)`,
        description: original.description,
        color: original.color,
        categoryId: original.categoryId,
        userId,
        items: {
          create: original.items.map(item => ({
            title: item.title,
            notes: item.notes,
            priority: item.priority,
            position: item.position,
            completed: false,
          })),
        },
      },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
    })
    return NextResponse.json(copy, { status: 201 })
  } catch (error) {
    console.error('Error duplicating checklist:', error)
    return NextResponse.json({ error: 'Failed to duplicate checklist' }, { status: 500 })
  }
}
