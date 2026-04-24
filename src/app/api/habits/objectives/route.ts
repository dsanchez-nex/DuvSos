import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId(): Promise<number | null> {
  const headersList = await headers()
  const userIdHeader = headersList.get('x-user-id')
  if (!userIdHeader) return null
  return parseInt(userIdHeader, 10)
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const objectives = await prisma.objective.findMany({
      where: { userId },
      include: { habits: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(objectives)
  } catch (error) {
    console.error('Error fetching objectives:', error)
    return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color = '#3b82f6' } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const objective = await prisma.objective.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        color,
        userId,
      },
    })

    return NextResponse.json(objective, { status: 201 })
  } catch (error) {
    console.error('Error creating objective:', error)
    return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 })
  }
}
