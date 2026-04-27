import { NextResponse } from 'next/server'
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalTodos,
      completedTodos,
      todayTodos,
      todayCompleted,
      weekTodos,
      overdueTodos,
      totalEffort
    ] = await Promise.all([
      // Total todos
      prisma.todo.count({ where: { userId } }),
      
      // Completed todos
      prisma.todo.count({ where: { userId, completed: true } }),
      
      // Today's todos
      prisma.todo.count({
        where: {
          userId,
          dueDate: { gte: today, lt: tomorrow }
        }
      }),
      
      // Today's completed
      prisma.todo.count({
        where: {
          userId,
          completed: true,
          dueDate: { gte: today, lt: tomorrow }
        }
      }),
      
      // This week's todos
      prisma.todo.count({
        where: {
          userId,
          dueDate: {
            gte: today,
            lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Overdue todos
      prisma.todo.count({
        where: {
          userId,
          completed: false,
          dueDate: { lt: today }
        }
      }),
      
      // Total effort (in minutes)
      prisma.todo.aggregate({
        where: { userId },
        _sum: { effortMinutes: true }
      })
    ])

    return NextResponse.json({
      total: totalTodos,
      completed: completedTodos,
      pending: totalTodos - completedTodos,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
      today: {
        total: todayTodos,
        completed: todayCompleted,
        pending: todayTodos - todayCompleted
      },
      week: {
        total: weekTodos
      },
      overdue: overdueTodos,
      totalEffortMinutes: totalEffort._sum.effortMinutes || 0
    })
  } catch (error) {
    console.error('Error fetching todo metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
