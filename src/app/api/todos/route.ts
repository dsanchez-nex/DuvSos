import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

/**
 * Parse a YYYY-MM-DD string as LOCAL midnight (not UTC).
 * This avoids timezone issues where 2026-04-23 becomes 2026-04-22 19:00 in some zones.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isPastDate(dateStr: string): boolean {
  const d = parseLocalDate(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * Get today's date range in UTC for Prisma queries.
 * We convert local midnight to UTC to match how Prisma stores dates.
 */
function getTodayRange(): { gte: Date; lt: Date } {
  const now = new Date()
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const localTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { gte: localMidnight, lt: localTomorrow }
}

function getWeekRange(): { gte: Date; lt: Date } {
  const now = new Date()
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const localNextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  return { gte: localMidnight, lt: localNextWeek }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const { searchParams } = new URL(request.url)

    const filtersParam = searchParams.get('filters')
    const view = searchParams.get('view')
    const groupBy = searchParams.get('groupBy')
    const search = searchParams.get('search')

    const baseWhere: any = { userId, parentId: null }
    const andConditions: any[] = []

    // View filters (date-based)
    if (view === 'today') {
      const range = getTodayRange()
      andConditions.push({ dueDate: { gte: range.gte, lt: range.lt } })
    } else if (view === 'week') {
      const range = getWeekRange()
      andConditions.push({ dueDate: { gte: range.gte, lt: range.lt } })
    }

    // Search filter (also searches inside subtasks so parents remain visible)
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } },
          { subTasks: { some: { title: { contains: search, mode: 'insensitive' } } } }
        ]
      })
    }

    // Advanced filters
    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam)
        for (const filter of filters) {
          if (filter.field === 'category_id' && filter.value) {
            andConditions.push({ categoryId: parseInt(filter.value, 10) })
          } else if (filter.field === 'priority' && filter.value) {
            andConditions.push({ priority: filter.value })
          } else if (filter.field === 'status' && filter.value) {
            andConditions.push({ completed: filter.value === 'completed' })
          }
        }
      } catch (e) {
        console.error('Invalid filters:', e)
      }
    }

    const where = andConditions.length > 0
      ? { AND: [baseWhere, ...andConditions] }
      : baseWhere

    const todos = await prisma.todo.findMany({
      where,
      include: {
        subTasks: { orderBy: { position: 'asc' } },
        category: true
      },
      orderBy: [
        { completed: 'asc' },
        { position: 'asc' },
      ],
    })

    const todosWithProgress = todos.map(todo => {
      const totalSubtasks = todo.subTasks.length
      const completedSubtasks = todo.subTasks.filter((st: any) => st.completed).length
      const progress = totalSubtasks > 0
        ? Math.round((completedSubtasks / totalSubtasks) * 100)
        : (todo.completed ? 100 : 0)

      return {
        ...todo,
        progress,
        subTasksCount: totalSubtasks,
        completedSubTasksCount: completedSubtasks
      }
    })

    if (groupBy && groupBy !== 'none') {
      const grouped: any = {}
      for (const todo of todosWithProgress) {
        let key: string
        if (groupBy === 'category') {
          key = todo.category?.name || 'Uncategorized'
        } else if (groupBy === 'priority') {
          key = todo.priority || 'normal'
        } else if (groupBy === 'status') {
          key = todo.completed ? 'Completed' : 'Pending'
        } else {
          key = 'All'
        }

        if (!grouped[key]) grouped[key] = []
        grouped[key].push(todo)
      }

      // Sort each group: active first, then completed
      for (const key of Object.keys(grouped)) {
        grouped[key].sort((a: any, b: any) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return a.position - b.position
        })
      }

      return NextResponse.json(grouped)
    }

    return NextResponse.json(todosWithProgress)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
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
    const {
      title,
      description,
      priority = 'normal',
      dueDate,
      dueTime,
      effortMinutes = 0,
      parentId,
      categoryId
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (dueDate && isPastDate(dueDate)) {
      return NextResponse.json(
        { error: 'Due date cannot be in the past' },
        { status: 400 }
      )
    }

    const maxPositionResult = await prisma.todo.aggregate({
      where: {
        userId,
        completed: false,
        parentId: parentId || null,
      },
      _max: { position: true },
    })

    const newPosition = (maxPositionResult._max.position ?? -1) + 1

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? parseLocalDate(dueDate) : null,
        dueTime,
        effortMinutes,
        userId,
        position: newPosition,
        parentId: parentId || null,
        categoryId: categoryId || null,
      },
      include: {
        subTasks: true,
        category: true
      }
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers()
    const userIdHeader = headersList.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdHeader, 10)
    const body = await request.json()
    const { id, title, completed, description, priority, dueDate, dueTime, effortMinutes, parentId, categoryId } = body

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId },
      include: { subTasks: true }
    })

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    if (dueDate && isPastDate(dueDate)) {
      return NextResponse.json(
        { error: 'Due date cannot be in the past' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? parseLocalDate(dueDate) : null
    if (dueTime !== undefined) updateData.dueTime = dueTime
    if (effortMinutes !== undefined) updateData.effortMinutes = effortMinutes
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (categoryId !== undefined) updateData.categoryId = categoryId || null

    if (completed !== undefined) {
      updateData.completed = completed

      if (completed) {
        if (existingTodo.subTasks.length > 0) {
          await prisma.todo.updateMany({
            where: { parentId: id },
            data: { completed: true }
          })
        }

        const minCheckedPositionResult = await prisma.todo.aggregate({
          where: { userId, completed: true },
          _min: { position: true },
        })
        updateData.position = (minCheckedPositionResult._min.position ?? 0) - 1
      } else {
        if (existingTodo.subTasks.length > 0) {
          await prisma.todo.updateMany({
            where: { parentId: id },
            data: { completed: false }
          })
        }

        const maxUncheckedPositionResult = await prisma.todo.aggregate({
          where: { userId, completed: false },
          _max: { position: true },
        })
        updateData.position = (maxUncheckedPositionResult._max.position ?? -1) + 1
      }
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
      include: {
        subTasks: true,
        category: true
      }
    })

    if (completed !== undefined && existingTodo.parentId) {
      const siblings = await prisma.todo.findMany({
        where: { parentId: existingTodo.parentId }
      })
      const allCompleted = siblings.every((s: any) => s.completed)
      if (allCompleted) {
        await prisma.todo.update({
          where: { id: existingTodo.parentId },
          data: { completed: true }
        })
      }
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}
