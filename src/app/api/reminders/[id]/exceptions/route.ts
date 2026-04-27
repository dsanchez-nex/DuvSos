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

    const { exceptionDate, reason } = await request.json()
    if (!exceptionDate) return NextResponse.json({ error: 'exceptionDate is required' }, { status: 400 })

    const exception = await prisma.reminderException.create({
      data: {
        reminderId: parseInt(id),
        exceptionDate: new Date(exceptionDate),
        reason: reason || null,
      },
    })

    return NextResponse.json(exception, { status: 201 })
  } catch (error) {
    console.error('Error creating exception:', error)
    return NextResponse.json({ error: 'Failed to create exception' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const reminder = await prisma.reminder.findFirst({
      where: { id: parseInt(id), userId },
      include: { exceptions: true },
    })
    if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(reminder.exceptions)
  } catch (error) {
    console.error('Error fetching exceptions:', error)
    return NextResponse.json({ error: 'Failed to fetch exceptions' }, { status: 500 })
  }
}
