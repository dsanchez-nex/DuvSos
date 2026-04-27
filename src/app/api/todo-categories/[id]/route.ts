import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const { id: idParams } = await params
    const id = parseInt(idParams, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, color, icon, description, parentId } = body

    const existingCategory = await prisma.todoCategory.findFirst({
      where: { id, userId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (description !== undefined) updateData.description = description
    if (parentId !== undefined) updateData.parentId = parentId || null

    const category = await prisma.todoCategory.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const { id: idParams } = await params
    const id = parseInt(idParams, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Get the default "General" category to reassign todos
    const generalCategory = await prisma.todoCategory.findFirst({
      where: { userId, name: 'General' }
    })

    // Reassign todos to General category before deleting
    if (generalCategory) {
      await prisma.todo.updateMany({
        where: { categoryId: id },
        data: { categoryId: generalCategory.id }
      })
    }

    const result = await prisma.todoCategory.deleteMany({
      where: { id, userId }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
