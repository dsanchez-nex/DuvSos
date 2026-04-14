import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(userIdHeader, 10)

    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      orderBy: [
        { completed: 'asc' },
        { position: 'asc' },
      ],
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(userIdHeader, 10)

    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const maxPositionResult = await prisma.todo.aggregate({
      where: {
        userId,
        completed: false,
      },
      _max: {
        position: true,
      },
    })

    const newPosition = (maxPositionResult._max.position ?? -1) + 1

    const todo = await prisma.todo.create({
      data: {
        title,
        userId,
        position: newPosition,
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(userIdHeader, 10)

    const body = await request.json()
    const { id, title, completed } = body

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    const updateData: { title?: string; completed?: boolean; position?: number } = {}

    if (title !== undefined) {
      updateData.title = title
    }

    if (completed !== undefined) {
      updateData.completed = completed

      if (completed) {
        const minCheckedPositionResult = await prisma.todo.aggregate({
          where: {
            userId,
            completed: true,
          },
          _min: {
            position: true,
          },
        })
        updateData.position = (minCheckedPositionResult._min.position ?? 0) - 1
      } else {
        const maxUncheckedPositionResult = await prisma.todo.aggregate({
          where: {
            userId,
            completed: false,
          },
          _max: {
            position: true,
          },
        })
        updateData.position = (maxUncheckedPositionResult._max.position ?? -1) + 1
      }
    }

    const todo = await prisma.todo.update({
      where: {
        id,
      },
      data: updateData,
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}