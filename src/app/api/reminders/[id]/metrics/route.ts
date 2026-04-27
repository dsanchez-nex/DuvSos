import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { actionTaken } = await request.json()

    const metric = await prisma.reminderMetrics.create({
      data: {
        reminderId: parseInt(id),
        actionTaken: actionTaken || 'viewed',
      },
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error logging metric:', error)
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
      include: { metrics: { orderBy: { viewedAt: 'desc' } } },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(reminder.metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
