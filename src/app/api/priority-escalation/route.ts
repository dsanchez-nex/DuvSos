import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

async function getUserId() {
  const h = await headers()
  const id = h.get('x-user-id')
  return id ? parseInt(id, 10) : null
}

/**
 * GET /api/priority-escalation/run
 * Scans approaching deadlines and escalates priority of related items.
 * In production this would be a background job (cron).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const escalated: { id: number; module: string; title: string; newPriority: string }[] = []

    const rules = await prisma.priorityEscalationRule.findMany({
      where: { sourceModule: { in: ['reminder', 'todo', 'checklist'] } },
    })

    for (const rule of rules) {
      const thresholdMs = rule.thresholdHours * 3600000

      if (rule.sourceModule === 'reminder') {
        const reminder = await prisma.reminder.findFirst({
          where: { id: rule.sourceId, userId, completed: false },
        })
        if (reminder && reminder.dueDate.getTime() - now.getTime() <= thresholdMs) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { priority: rule.escalationLevel },
          })
          escalated.push({ id: reminder.id, module: 'reminder', title: reminder.title, newPriority: rule.escalationLevel })
        }
      }

      if (rule.sourceModule === 'todo') {
        const todo = await prisma.todo.findFirst({
          where: { id: rule.sourceId, userId, completed: false },
        })
        if (todo && todo.dueDate && todo.dueDate.getTime() - now.getTime() <= thresholdMs) {
          await prisma.todo.update({
            where: { id: todo.id },
            data: { priority: rule.escalationLevel },
          })
          escalated.push({ id: todo.id, module: 'todo', title: todo.title, newPriority: rule.escalationLevel })
        }
      }

      if (rule.sourceModule === 'checklist') {
        const checklist = await prisma.checklist.findFirst({
          where: { id: rule.sourceId, userId, lifecycleState: { not: 'Completed' } },
        })
        if (checklist && checklist.endDate && checklist.endDate.getTime() - now.getTime() <= thresholdMs) {
          // Checklists don't have priority field; log escalation for UI indicator
          escalated.push({ id: checklist.id, module: 'checklist', title: checklist.title, newPriority: rule.escalationLevel })
        }
      }
    }

    return NextResponse.json({
      runAt: now.toISOString(),
      escalatedCount: escalated.length,
      escalated,
    })
  } catch (error) {
    console.error('Error running priority escalation:', error)
    return NextResponse.json({ error: 'Failed to run escalation' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sourceModule, sourceId, thresholdHours, escalationLevel } = await request.json()
    if (!sourceModule || !sourceId || !thresholdHours || !escalationLevel) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const rule = await prisma.priorityEscalationRule.create({
      data: { sourceModule, sourceId: parseInt(sourceId), thresholdHours, escalationLevel },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('Error creating escalation rule:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}
