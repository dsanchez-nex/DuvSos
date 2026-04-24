import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

function calculateNextDate(pattern: string): Date | null {
  const now = new Date()
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  if (pattern === 'EVERY_MONDAY') {
    const next = new Date(now)
    next.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7))
    return next
  }

  if (pattern === 'EVERY_FRIDAY') {
    const next = new Date(now)
    next.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7))
    return next
  }

  if (pattern === 'FIRST_FRIDAY_OF_MONTH') {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    while (next.getDay() !== 5) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  if (pattern === 'FIRST_MONDAY_OF_MONTH') {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    while (next.getDay() !== 1) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  // Generic pattern: EVERY_<DAY_NAME>
  const match = pattern.match(/^EVERY_([A-Z]+)$/)
  if (match) {
    const targetDay = dayNames.indexOf(match[1])
    if (targetDay !== -1) {
      const next = new Date(now)
      next.setDate(now.getDate() + ((targetDay - now.getDay() + 7) % 7 || 7))
      return next
    }
  }

  return null
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const templateId = parseInt(id)

    const template = await prisma.checklist.findFirst({
      where: { id: templateId, userId, isTemplate: true },
      include: { items: { orderBy: { position: 'asc' } } },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    let body: any = {}
    try {
      const text = await request.text()
      if (text) body = JSON.parse(text)
    } catch {
      body = {}
    }
    const { title, description, color, startDate, endDate, categoryId } = body || {}

    let computedStartDate: Date | null = null
    if (startDate) {
      computedStartDate = new Date(startDate)
    } else if (template.recurrencePattern) {
      computedStartDate = calculateNextDate(template.recurrencePattern)
    }

    const instance = await prisma.checklist.create({
      data: {
        title: title || template.title,
        description: description !== undefined ? description : template.description,
        color: color || template.color,
        isTemplate: false,
        lifecycleState: 'Active',
        startDate: computedStartDate,
        endDate: endDate ? new Date(endDate) : null,
        categoryId: categoryId !== undefined ? (categoryId || null) : template.categoryId,
        userId,
        templateId: template.id,
        items: template.items?.length > 0
          ? {
              create: template.items.map((item: any, idx: number) => ({
                title: item.title,
                notes: item.notes,
                priority: item.priority,
                position: idx,
                effortEstimate: item.effortEstimate,
                completed: false,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
    })

    return NextResponse.json(instance, { status: 201 })
  } catch (error) {
    console.error('Error instantiating template:', error)
    return NextResponse.json({ error: 'Failed to instantiate template' }, { status: 500 })
  }
}