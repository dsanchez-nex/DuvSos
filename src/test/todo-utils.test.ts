import { describe, it, expect } from 'vitest'
import { formatEffort, getPriorityColor, formatDate, isOverdue, calculateProgress, isDateInPast } from '../lib/todo-utils'

describe('formatEffort', () => {
  it('returns empty string for 0 minutes', () => {
    expect(formatEffort(0)).toBe('')
  })

  it('formats minutes only', () => {
    expect(formatEffort(30)).toBe('30m')
  })

  it('formats hours only', () => {
    expect(formatEffort(120)).toBe('2h')
  })

  it('formats hours and minutes', () => {
    expect(formatEffort(150)).toBe('2h 30m')
  })
})

describe('getPriorityColor', () => {
  it('returns red for high priority', () => {
    expect(getPriorityColor('high')).toBe('text-red-500')
  })

  it('returns amber for normal priority', () => {
    expect(getPriorityColor('normal')).toBe('text-amber-500')
  })

  it('returns green for low priority', () => {
    expect(getPriorityColor('low')).toBe('text-green-500')
  })

  it('returns slate for unknown priority', () => {
    expect(getPriorityColor('unknown')).toBe('text-slate-400')
  })
})

describe('formatDate', () => {
  it('returns empty string for undefined', () => {
    expect(formatDate()).toBe('')
  })

  it('returns Today for today date (YYYY-MM-DD)', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(formatDate(today)).toBe('Today')
  })

  it('returns Today for today date (ISO string)', () => {
    const today = new Date().toISOString()
    expect(formatDate(today)).toBe('Today')
  })

  it('returns Tomorrow for tomorrow date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(formatDate(tomorrow.toISOString())).toBe('Tomorrow')
  })

  it('formats other dates', () => {
    // Use noon UTC to avoid timezone boundary issues
    expect(formatDate('2026-12-25T12:00:00.000Z')).toBe('Dec 25')
  })
})

describe('isOverdue', () => {
  it('returns false for completed todo', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isOverdue(yesterday.toISOString(), true)).toBe(false)
  })

  it('returns false for future date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isOverdue(tomorrow.toISOString(), false)).toBe(false)
  })

  it('returns true for past date', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isOverdue(yesterday.toISOString(), false)).toBe(true)
  })
})

describe('isDateInPast', () => {
  it('returns false for today', () => {
    expect(isDateInPast(new Date().toISOString())).toBe(false)
  })

  it('returns true for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isDateInPast(yesterday.toISOString())).toBe(true)
  })
})

describe('calculateProgress', () => {
  it('returns 0 for empty subtasks', () => {
    expect(calculateProgress([])).toBe(0)
  })

  it('calculates 50% progress', () => {
    expect(calculateProgress([
      { completed: true },
      { completed: false }
    ])).toBe(50)
  })

  it('calculates 100% progress', () => {
    expect(calculateProgress([
      { completed: true },
      { completed: true }
    ])).toBe(100)
  })
})
