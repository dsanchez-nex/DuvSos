import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)

    const categories = await prisma.todoCategory.findMany({
      where: { userId },
      include: {
        children: true,
        _count: {
          select: { todos: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const body = await request.json()
    
    const { name, color, icon, description, parentId } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.todoCategory.create({
      data: {
        name,
        color: color || '#3b82f6',
        icon: icon || 'folder',
        description,
        parentId: parentId || null,
        userId
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
