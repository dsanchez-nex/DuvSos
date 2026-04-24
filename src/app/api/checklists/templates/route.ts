import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, color, categoryId, recurrencePattern, items } = await request.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const template = await prisma.checklist.create({
      data: {
        title: title.trim(),
        description: description || null,
        color: color || '#3b82f6',
        isTemplate: true,
        version: 1,
        lifecycleState: 'Active',
        recurrencePattern: recurrencePattern || null,
        categoryId: categoryId || null,
        userId,
        items: items?.length > 0
          ? {
              create: items.map((item: any, idx: number) => ({
                title: item.title.trim(),
                notes: item.notes || null,
                priority: item.priority || 'normal',
                position: idx,
                effortEstimate: item.effortEstimate || null,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const templates = await prisma.checklist.findMany({
      where: { userId, isTemplate: true },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}