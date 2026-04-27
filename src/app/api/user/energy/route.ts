import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId(): Promise<number | null> {
  const headersList = await headers()
  const userIdHeader = headersList.get('x-user-id')
  if (!userIdHeader) return null
  return parseInt(userIdHeader, 10)
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const where: any = { userId }
    if (fromDate || toDate) {
      where.date = {}
      if (fromDate) where.date.gte = new Date(fromDate)
      if (toDate) where.date.lt = new Date(toDate)
    }

    const logs = await prisma.energyLog.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching energy logs:', error)
    return NextResponse.json({ error: 'Failed to fetch energy logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, level } = body

    if (level === undefined || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Level must be between 1 and 5' }, { status: 400 })
    }

    const logDate = date ? new Date(`${date}T00:00:00`) : new Date()
    logDate.setHours(0, 0, 0, 0)

    const log = await prisma.energyLog.upsert({
      where: {
        userId_date: {
          userId,
          date: logDate,
        },
      },
      update: { level: parseInt(level, 10) },
      create: {
        userId,
        date: logDate,
        level: parseInt(level, 10),
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating energy log:', error)
    return NextResponse.json({ error: 'Failed to create energy log' }, { status: 500 })
  }
}
