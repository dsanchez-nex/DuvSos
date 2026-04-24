import { NextResponse } from 'next/server'
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

    const archivedChecklists = await prisma.checklist.findMany({
      where: { userId, lifecycleState: 'Archived' },
      include: { items: { orderBy: { position: 'asc' } }, category: true },
      orderBy: { completedAt: 'desc' },
    })

    const withMetrics = archivedChecklists.map((checklist: any) => {
      const totalItems = checklist.items?.length || 0
      const completedItems = checklist.items?.filter((item: any) => item.completed).length || 0
      const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      const totalEffort = checklist.items?.reduce((sum: number, item: any) => sum + (item.effortEstimate || 0), 0) || 0

      return {
        ...checklist,
        metrics: {
          totalItems,
          completedItems,
          completionPercentage,
          totalEffort,
        },
      }
    })

    return NextResponse.json(withMetrics)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}