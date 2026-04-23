import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const filtersParam = searchParams.get('filters')
    const view = searchParams.get('view') // 'today', 'week', 'all'
    const groupBy = searchParams.get('groupBy') // 'category', 'priority', 'status'
    const search = searchParams.get('search')
    
    let where: any = { userId }
    
    // View filters
    if (view === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      where.dueDate = {
        gte: today,
        lt: tomorrow
      }
    } else if (view === 'week') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      where.dueDate = {
        gte: today,
        lt: nextWeek
      }
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }
    
    // Advanced filters
    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam)
        for (const filter of filters) {
          if (filter.field === 'category_id') {
            where.categoryId = filter.value
          } else if (filter.field === 'priority') {
            where.priority = filter.value
          } else if (filter.field === 'status') {
            where.completed = filter.value === 'completed'
          }
        }
      } catch (e) {
        console.error('Invalid filters:', e)
      }
    }
    
    // Only fetch top-level tasks (parentId is null)
    // Subtasks will be loaded via include
    where.parentId = null

    const todos = await prisma.todo.findMany({
      where,
      include: {
        subTasks: {
          orderBy: { position: 'asc' }
        },
        category: true
      },
      orderBy: [
        { completed: 'asc' },
        { position: 'asc' },
      ],
    })

    // Calculate progress for parent tasks
    const todosWithProgress = todos.map(todo => {
      const totalSubtasks = todo.subTasks.length
      const completedSubtasks = todo.subTasks.filter((st: any) => st.completed).length
      const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (todo.completed ? 100 : 0)
      
      return {
        ...todo,
        progress,
        subTasksCount: totalSubtasks,
        completedSubTasksCount: completedSubtasks
      }
    })

    // Grouping
    if (groupBy) {
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
      return NextResponse.json(grouped)
    }

    return NextResponse.json(todosWithProgress)
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
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const maxPositionResult = await prisma.todo.aggregate({
      where: {
        userId,
        completed: false,
        parentId: parentId || null,
      },
      _max: {
        position: true,
      },
    })

    const newPosition = (maxPositionResult._max.position ?? -1) + 1

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime,
        effortMinutes,
        userId,
        position: newPosition,
        parentId: parentId || null,
        categoryId: categoryId || null,
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
    const { id, title, completed, description, priority, dueDate, dueTime, effortMinutes, parentId, categoryId } = body

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
      include: {
        subTasks: true
      }
    })

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (dueTime !== undefined) updateData.dueTime = dueTime
    if (effortMinutes !== undefined) updateData.effortMinutes = effortMinutes
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (categoryId !== undefined) updateData.categoryId = categoryId || null

    if (completed !== undefined) {
      updateData.completed = completed

      if (completed) {
        // If completing a parent task, complete all subtasks too
        if (existingTodo.subTasks.length > 0) {
          await prisma.todo.updateMany({
            where: { parentId: id },
            data: { completed: true }
          })
        }
        
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

    // Auto-complete parent when all subtasks are done
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
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}
