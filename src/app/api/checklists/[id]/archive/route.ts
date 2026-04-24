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
    const existing = await prisma.checklist.findFirst({
      where: { id: parseInt(id), userId },
    })

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.lifecycleState === 'Archived') {
      return NextResponse.json({ error: 'Already archived' }, { status: 400 })
    }
    if (existing.isTemplate) {
      return NextResponse.json({ error: 'Cannot archive a template' }, { status: 400 })
    }

    const archived = await prisma.checklist.update({
      where: { id: parseInt(id) },
      data: { lifecycleState: 'Archived' },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
    })

    return NextResponse.json(archived)
  } catch (error) {
    console.error('Error archiving checklist:', error)
    return NextResponse.json({ error: 'Failed to archive checklist' }, { status: 500 })
  }
}