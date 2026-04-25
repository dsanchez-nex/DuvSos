import { ReminderRecurrenceRule, ReminderException } from '@prisma/client'

export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'annual'

export interface ExpandedInstance {
  date: Date
  isException: boolean
  exceptionReason?: string | null
}

/**
 * Expand a recurrence rule into concrete dates within a date range.
 * Server-side generation — instances are not stored in DB.
 */
export function expandRecurrence(
  rule: ReminderRecurrenceRule,
  exceptions: ReminderException[],
  rangeStart: Date,
  rangeEnd: Date,
): ExpandedInstance[] {
  const instances: ExpandedInstance[] = []
  const exceptionMap = new Map(
    exceptions.map((e) => [e.exceptionDate.toISOString().split('T')[0], e]),
  )

  const start = new Date(rule.startDate)
  const end = rule.endDate ? new Date(rule.endDate) : null

  // Clamp range to rule boundaries
  const effectiveStart = start > rangeStart ? start : rangeStart
  const effectiveEnd = end && end < rangeEnd ? end : rangeEnd

  if (effectiveStart > effectiveEnd) return []

  switch (rule.frequency) {
    case 'daily':
      expandDaily(rule, effectiveStart, effectiveEnd, exceptionMap, instances)
      break
    case 'weekly':
      expandWeekly(rule, effectiveStart, effectiveEnd, exceptionMap, instances)
      break
    case 'monthly':
      expandMonthly(rule, effectiveStart, effectiveEnd, exceptionMap, instances)
      break
    case 'annual':
      expandAnnual(rule, effectiveStart, effectiveEnd, exceptionMap, instances)
      break
    case 'once':
    default:
      expandOnce(rule, effectiveStart, effectiveEnd, exceptionMap, instances)
      break
  }

  return instances
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

function expandOnce(
  rule: ReminderRecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  exceptionMap: Map<string, ReminderException>,
  instances: ExpandedInstance[],
) {
  const d = new Date(rule.startDate)
  d.setHours(0, 0, 0, 0)
  if (d >= rangeStart && d <= rangeEnd) {
    const key = toDateKey(d)
    const exc = exceptionMap.get(key)
    instances.push({
      date: new Date(d),
      isException: !!exc,
      exceptionReason: exc?.reason,
    })
  }
}

function expandDaily(
  rule: ReminderRecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  exceptionMap: Map<string, ReminderException>,
  instances: ExpandedInstance[],
) {
  const current = new Date(rangeStart)
  current.setHours(0, 0, 0, 0)
  const interval = rule.interval || 1

  // Align to rule start + interval offsets
  const ruleStart = new Date(rule.startDate)
  ruleStart.setHours(0, 0, 0, 0)
  const dayDiff = Math.floor((current.getTime() - ruleStart.getTime()) / 86400000)
  const offset = ((dayDiff % interval) + interval) % interval
  if (offset !== 0) {
    current.setDate(current.getDate() + (interval - offset))
  }

  while (current <= rangeEnd) {
    if (current >= ruleStart) {
      const key = toDateKey(current)
      const exc = exceptionMap.get(key)
      instances.push({
        date: new Date(current),
        isException: !!exc,
        exceptionReason: exc?.reason,
      })
    }
    current.setDate(current.getDate() + interval)
  }
}

function expandWeekly(
  rule: ReminderRecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  exceptionMap: Map<string, ReminderException>,
  instances: ExpandedInstance[],
) {
  const daysOfWeek = rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [0] // default Sunday
  const interval = rule.interval || 1
  const current = new Date(rangeStart)
  current.setHours(0, 0, 0, 0)

  const ruleStart = new Date(rule.startDate)
  ruleStart.setHours(0, 0, 0, 0)

  while (current <= rangeEnd) {
    if (current >= ruleStart) {
      const weekDiff = Math.floor(
        (current.getTime() - ruleStart.getTime()) / (7 * 86400000),
      )
      if (weekDiff % interval === 0) {
        const dow = current.getDay()
        if (daysOfWeek.includes(dow)) {
          const key = toDateKey(current)
          const exc = exceptionMap.get(key)
          instances.push({
            date: new Date(current),
            isException: !!exc,
            exceptionReason: exc?.reason,
          })
        }
      }
    }
    current.setDate(current.getDate() + 1)
  }
}

function expandMonthly(
  rule: ReminderRecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  exceptionMap: Map<string, ReminderException>,
  instances: ExpandedInstance[],
) {
  const dayOfMonth = rule.dayOfMonth || 1
  const interval = rule.interval || 1
  const current = new Date(rangeStart)
  current.setDate(1)
  current.setHours(0, 0, 0, 0)

  const ruleStart = new Date(rule.startDate)
  ruleStart.setHours(0, 0, 0, 0)

  while (current <= rangeEnd) {
    if (current >= ruleStart) {
      const monthDiff =
        (current.getFullYear() - ruleStart.getFullYear()) * 12 +
        (current.getMonth() - ruleStart.getMonth())
      if (monthDiff % interval === 0) {
        const instance = new Date(current)
        instance.setDate(Math.min(dayOfMonth, daysInMonth(current)))
        if (instance >= rangeStart && instance <= rangeEnd) {
          const key = toDateKey(instance)
          const exc = exceptionMap.get(key)
          instances.push({
            date: new Date(instance),
            isException: !!exc,
            exceptionReason: exc?.reason,
          })
        }
      }
    }
    current.setMonth(current.getMonth() + 1)
  }
}

function expandAnnual(
  rule: ReminderRecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  exceptionMap: Map<string, ReminderException>,
  instances: ExpandedInstance[],
) {
  const dayOfMonth = rule.dayOfMonth || 1
  const monthOfYear = (rule.monthOfYear || 1) - 1 // 0-based
  const interval = rule.interval || 1

  const ruleStart = new Date(rule.startDate)
  ruleStart.setHours(0, 0, 0, 0)

  let year = rangeStart.getFullYear()
  const month = monthOfYear

  while (true) {
    const instance = new Date(year, month, dayOfMonth)
    instance.setHours(0, 0, 0, 0)
    if (instance > rangeEnd) break

    if (instance >= rangeStart && instance >= ruleStart) {
      const yearDiff = year - ruleStart.getFullYear()
      if (yearDiff % interval === 0) {
        const key = toDateKey(instance)
        const exc = exceptionMap.get(key)
        instances.push({
          date: new Date(instance),
          isException: !!exc,
          exceptionReason: exc?.reason,
        })
      }
    }
    year++
  }
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/**
 * Check if a specific date falls within a reminder's lifecycle period.
 */
export function isWithinLifecycle(
  reminder: { lifecycleStartDate: Date | null; lifecycleEndDate: Date | null },
  date: Date,
): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  if (reminder.lifecycleStartDate) {
    const start = new Date(reminder.lifecycleStartDate)
    start.setHours(0, 0, 0, 0)
    if (d < start) return false
  }

  if (reminder.lifecycleEndDate) {
    const end = new Date(reminder.lifecycleEndDate)
    end.setHours(23, 59, 59, 999)
    if (d > end) return false
  }

  return true
}

/**
 * Check if all blockers for a reminder are completed.
 * Requires cross-module lookup — caller provides a resolver.
 */
export async function checkBlockers(
  blockers: { blockerModule: string; blockerId: number }[],
  resolver: (module: string, id: number) => Promise<boolean>,
): Promise<{ blocked: boolean; pendingBlockers: { blockerModule: string; blockerId: number }[] }> {
  const pending: { blockerModule: string; blockerId: number }[] = []

  for (const b of blockers) {
    const completed = await resolver(b.blockerModule, b.blockerId)
    if (!completed) pending.push(b)
  }

  return { blocked: pending.length > 0, pendingBlockers: pending }
}
