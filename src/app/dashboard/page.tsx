'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'

const MODULE_COLORS: Record<string, string> = {
  reminder: '#3b82f6',
  habit: '#10b981',
  checklist: '#f59e0b',
  todo: '#ef4444',
  milestone: '#8b5cf6',
}

// ─── Types ───

interface HabitTracker {
  id: number
  title: string
  color: string
  streak: number
  completedToday: boolean
  goalType: string
  goalValue: number
}

interface ChecklistItem {
  id: number
  title: string
  completed: boolean
  priority: string
  checklistId: number
  checklistTitle: string
  checklistColor: string
}

interface TodoItem {
  id: number
  title: string
  completed: boolean
  priority: string
  dueDate?: string
  category?: { name?: string; color?: string }
}

interface UpcomingReminder {
  id: number | string
  title: string
  dueDate: string
  priority: string
  daysUntil: number
  sourceModule?: string
  sourceId?: number
}

interface DayData {
  count: number
  modules: Record<string, number>
}

interface WorkloadDay {
  score: number
  overloaded: boolean
}

interface DashboardMetrics {
  overallStreak: number
  activeProjects: number
  pendingTasks: number
  weeklyCompliance: number
}

interface LowProgressItem {
  id: number
  module: string
  title: string
  color?: string
  last7DaysCount: number
  trend: 'improving' | 'stable' | 'declining'
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2 }

function sortByPriority<T extends { priority: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
}

// ─── Component ───

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Data states
  const [habits, setHabits] = useState<HabitTracker[]>([])
  const [checklists, setChecklists] = useState<ChecklistItem[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingReminder[]>([])
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({})
  const [workloadData, setWorkloadData] = useState<Record<string, WorkloadDay>>({})
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [lowProgress, setLowProgress] = useState<LowProgressItem[]>([])

  const [loading, setLoading] = useState(false)
  const [analyticsCollapsed, setAnalyticsCollapsed] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const selectedDateStr = selectedDate.toISOString().split('T')[0]

  // ─── Fetchers ───

  const fetchHabits = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch(`/api/dashboard/critical-habits?date=${today}`)
      if (res.ok) setHabits(await res.json())
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchChecklistsAndTodos = useCallback(async () => {
    try {
      const [clRes, tdRes] = await Promise.all([
        fetch('/api/checklists'),
        fetch('/api/todos'),
      ])

      if (clRes.ok) {
        const rawChecklists = await clRes.json()
        // Flatten checklist items and add checklist info
        const items: ChecklistItem[] = []
        for (const cl of rawChecklists) {
          if (cl.items && Array.isArray(cl.items)) {
            for (const item of cl.items) {
              if (!item.completed) {
                items.push({
                  id: item.id,
                  title: item.title,
                  completed: item.completed,
                  priority: item.priority || 'normal',
                  checklistId: cl.id,
                  checklistTitle: cl.title,
                  checklistColor: cl.color || MODULE_COLORS.checklist,
                })
              }
            }
          }
        }
        setChecklists(sortByPriority(items))
      }

      if (tdRes.ok) {
        const rawTodos = await tdRes.json()
        const activeTodos = (rawTodos || [])
          .filter((t: TodoItem) => !t.completed)
          .map((t: TodoItem) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            priority: t.priority || 'normal',
            dueDate: t.dueDate,
            category: t.category,
          }))
        setTodos(sortByPriority(activeTodos))
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchUpcomingReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/upcoming-reminders')
      if (res.ok) setUpcomingReminders(await res.json())
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const [calRes, wlRes] = await Promise.all([
        fetch(`/api/dashboard/calendar?year=${year}&month=${month}`),
        fetch(`/api/dashboard/workload?start=${year}-${String(month).padStart(2, '0')}-01&end=${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`),
      ])
      if (calRes.ok) setCalendarData(await calRes.json())
      if (wlRes.ok) setWorkloadData(await wlRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  const fetchAnalytics = useCallback(async () => {
    try {
      const [metRes, lowRes] = await Promise.all([
        fetch('/api/dashboard/metrics'),
        fetch('/api/dashboard/low-progress'),
      ])
      if (metRes.ok) setMetrics(await metRes.json())
      if (lowRes.ok) setLowProgress(await lowRes.json())
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
    fetchChecklistsAndTodos()
    fetchUpcomingReminders()
    fetchCalendar()
    fetchAnalytics()
  }, [fetchHabits, fetchChecklistsAndTodos, fetchUpcomingReminders, fetchCalendar, fetchAnalytics])

  // ─── Actions ───

  const selectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const goToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  const goPrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const goNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const markHabitDone = async (id: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/habits/${id}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      })
      if (res.ok) {
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completedToday: true } : h)))
        fetchAnalytics()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markTodoDone = async (id: number) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id))
        fetchAnalytics()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markChecklistItemDone = async (checklistId: number, itemId: number) => {
    try {
      const res = await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (res.ok) {
        setChecklists((prev) => prev.filter((i) => i.id !== itemId))
        fetchAnalytics()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markReminderDone = async (id: number) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (res.ok) {
        setUpcomingReminders((prev) => prev.filter((r) => r.id !== id && !String(r.id).startsWith(`${id}-`)))
        fetchCalendar()
        fetchAnalytics()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ─── Calendar Grid ───

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const renderMonthGrid = () => {
    const days: React.ReactElement[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = calendarData[dateStr]
      const wl = workloadData[dateStr]
      const isSelected = selectedDateStr === dateStr
      const isToday = new Date().toISOString().split('T')[0] === dateStr

      let intensity = 0
      if (wl) {
        if (wl.score > 8) intensity = 3
        else if (wl.score > 5) intensity = 2
        else if (wl.score > 2) intensity = 1
      }

      days.push(
        <button
          key={day}
          onClick={() => selectDate(new Date(year, month - 1, day))}
          className={`relative h-20 sm:h-24 rounded-xl border p-1.5 sm:p-2 text-left transition-all overflow-hidden ${
            isSelected
              ? 'border-primary/40 shadow-sm bg-primary/5'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          } ${isToday ? 'ring-2 ring-primary/20' : ''}`}
        >
          {intensity > 0 && (
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundColor:
                  intensity === 3 ? '#ef4444' : intensity === 2 ? '#f59e0b' : '#10b981',
              }}
            />
          )}
          <span className={`relative text-sm font-medium ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
          {dayData && dayData.count > 0 && (
            <div className="relative mt-1 flex flex-wrap gap-0.5 sm:gap-1">
              {Object.entries(dayData.modules).slice(0, 4).map(([mod, count]) => (
                <span key={mod} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: MODULE_COLORS[mod] }}>
                  {count}
                </span>
              ))}
              {dayData.count > 4 && (
                <span className="text-[10px] text-slate-400">+{dayData.count - 4}</span>
              )}
            </div>
          )}
          {wl?.overloaded && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" title="Overloaded day" />
          )}
        </button>
      )
    }
    return days
  }

  const selectedWorkload = workloadData[selectedDateStr]
  const isOverloaded = selectedWorkload?.overloaded ?? false

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Your productivity command center</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>Month</button>
              <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>Week</button>
            </div>
            <button onClick={goToday} className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg">Today</button>
            <div className="flex items-center gap-1">
              <button onClick={goPrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-sm font-medium min-w-[120px] text-center text-slate-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={goNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overload Warning */}
        {isOverloaded && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">This day is very loaded</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {selectedWorkload.score} items scheduled. Consider rescheduling some items.
              </p>
            </div>
          </div>
        )}

        {/* ═══ SECTION 1: HABIT TRACKERS ═══ */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Habit Trackers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {habits.length === 0 && (
              <div className="col-span-full dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-sm text-slate-400">No active habits. Start building one!</p>
              </div>
            )}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`dashboard-card rounded-2xl border p-4 transition-all ${
                  habit.completedToday
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <h4 className={`font-semibold text-sm truncate ${habit.completedToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {habit.title}
                    </h4>
                  </div>
                  {habit.completedToday && (
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      {habit.streak > 0 ? `${habit.streak}-day streak` : 'Start a streak'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {habit.goalType === 'Daily' ? 'Daily goal' : `${habit.goalValue} per ${habit.goalType.toLowerCase()}`}
                    </p>
                  </div>
                  {!habit.completedToday && (
                    <button
                      onClick={() => markHabitDone(habit.id)}
                      className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                      Realizado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 2: CHECKLISTS & TODOS ═══ */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Checklists & ToDos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Checklists */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Checklists
                </h4>
                <span className="text-xs text-slate-400">{checklists.length} pending</span>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {checklists.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No pending checklist items</p>
                )}
                {checklists.map((item) => (
                  <div key={`cl-${item.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.checklistColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.checklistTitle} · {item.priority}</p>
                    </div>
                    <button
                      onClick={() => markChecklistItemDone(item.checklistId, item.id)}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 whitespace-nowrap"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ToDos */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  ToDos
                </h4>
                <span className="text-xs text-slate-400">{todos.length} pending</span>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {todos.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No pending ToDos</p>
                )}
                {todos.map((todo) => (
                  <div key={`td-${todo.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{todo.title}</p>
                      <p className="text-xs text-slate-500">
                        {todo.dueDate && `${todo.dueDate} · `}{todo.priority}
                        {todo.category?.name && ` · ${todo.category.name}`}
                      </p>
                    </div>
                    <button
                      onClick={() => markTodoDone(todo.id)}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 whitespace-nowrap"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: CALENDAR + UPCOMING REMINDERS ═══ */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Planning</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {Object.entries(MODULE_COLORS).map(([mod, color]) => (
                    <div key={mod} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{mod}</span>
                    </div>
                  ))}
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
                  {renderMonthGrid()}
                </div>
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Upcoming Reminders
                </h4>
                <span className="text-xs text-slate-400">Next 14 days</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {upcomingReminders.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No upcoming reminders</p>
                )}
                {upcomingReminders.map((r) => (
                  <div key={String(r.id)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.dueDate} · {r.priority}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.daysUntil <= 1
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : r.daysUntil <= 3
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {r.daysUntil === 0 ? 'Today' : `${r.daysUntil}d`}
                      </span>
                      <button
                        onClick={() => {
                          const numericId = typeof r.id === 'string' ? parseInt(r.id.split('-')[0], 10) : r.id
                          markReminderDone(numericId)
                        }}
                        className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 whitespace-nowrap"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: ANALYTICS ═══ */}
        <section>
          <button
            onClick={() => setAnalyticsCollapsed((p) => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">{analyticsCollapsed ? 'expand_more' : 'expand_less'}</span>
            Analytics
          </button>
          {!analyticsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Metrics Scorecard */}
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white mb-4">Scorecard</h4>
                {metrics ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{metrics.overallStreak}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Day Streak</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-500">{metrics.activeProjects}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Active Projects</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-500">{metrics.pendingTasks}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Pending Tasks</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-500">{metrics.weeklyCompliance}%</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Weekly Compliance</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-4 text-center">Loading metrics...</p>
                )}
              </div>

              {/* Weekly Compliance */}
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white mb-4">Weekly Compliance</h4>
                {metrics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">This Week</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{metrics.weeklyCompliance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{ width: `${metrics.weeklyCompliance}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {metrics.weeklyCompliance >= 80
                        ? 'Great job! You are on track this week.'
                        : metrics.weeklyCompliance >= 50
                        ? 'Good progress. Keep pushing to reach your goals.'
                        : 'Let us get back on track. Small steps matter.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-4 text-center">Loading...</p>
                )}
              </div>

              {/* Low Progress */}
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white mb-4">Low Progress</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {lowProgress.length === 0 && (
                    <p className="text-sm text-slate-400 py-4 text-center">No low-progress items. You are doing great!</p>
                  )}
                  {lowProgress.map((item) => (
                    <div key={`${item.module}-${item.id}`} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || MODULE_COLORS[item.module] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          {item.last7DaysCount} in last 7 days · {item.trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
