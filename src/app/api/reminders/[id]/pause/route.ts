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
    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: { isPaused: !reminder.isPaused },
    })

    return NextResponse.json({ isPaused: updated.isPaused })
  } catch (error) {
    console.error('Error toggling pause:', error)
    return NextResponse.json({ error: 'Failed to toggle pause' }, { status: 500 })
  }
}
