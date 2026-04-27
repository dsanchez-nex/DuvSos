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
    const { itemModule, itemId } = await request.json()
    if (!itemModule || !itemId) {
      return NextResponse.json({ error: 'itemModule and itemId are required' }, { status: 400 })
    }

    const milestone = await prisma.milestone.findFirst({
      where: { id: parseInt(id), userId },
    })
    if (!milestone) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const item = await prisma.milestoneItem.create({
      data: {
        milestoneId: parseInt(id),
        itemModule,
        itemId: parseInt(itemId),
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error adding milestone item:', error)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const items = await prisma.milestoneItem.findMany({
      where: { milestoneId: parseInt(id) },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching milestone items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}
