import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const checklists = await prisma.checklist.findMany({
      where: { userId },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(checklists)
  } catch (error) {
    console.error('Error fetching checklists:', error)
    return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, color, startDate, endDate, categoryId } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const checklist = await prisma.checklist.create({
      data: {
        title: title.trim(),
        description: description || null,
        color: color || '#3b82f6',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        categoryId: categoryId || null,
        userId,
      },
      include: { items: true, category: true },
    })
    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error('Error creating checklist:', error)
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 })
  }
}
