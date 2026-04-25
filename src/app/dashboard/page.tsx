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

const MODULE_LABELS: Record<string, string> = {
  reminder: 'Reminder',
  habit: 'Habit',
  checklist: 'Checklist',
  todo: 'ToDo',
  milestone: 'Milestone',
}

// ─── Types ───

interface CriticalTask {
  id: string
  module: 'todo' | 'reminder'
  title: string
  dueDate: string
  priority: string
  completed: boolean
  sourceId?: number
  sourceModule?: string
}

interface CriticalHabit {
  id: number
  title: string
  color: string
  streak: number
  completedToday: boolean
  goalType: string
  goalValue: number
}

interface UpcomingMilestone {
  id: number
  title: string
  date: string
  color: string
  daysRemaining: number
}

interface DayData {
  count: number
  modules: Record<string, number>
}

interface WorkloadDay {
  score: number
  tasks: number
  habits: number
  reminders: number
  overloaded: boolean
}

interface DashboardMetrics {
  overallStreak: number
  activeProjects: number
  pendingTasks: number
  weeklyCompliance: number
  lastUpdated: string
}

interface LowProgressItem {
  id: number
  module: string
  title: string
  color?: string
  last7DaysCount: number
  trend: 'improving' | 'stable' | 'declining'
}

// ─── Component ───

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Data states
  const [criticalTasks, setCriticalTasks] = useState<CriticalTask[]>([])
  const [criticalHabits, setCriticalHabits] = useState<CriticalHabit[]>([])
  const [milestones, setMilestones] = useState<UpcomingMilestone[]>([])
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

  const fetchUrgency = useCallback(async (dateStr: string) => {
    try {
      const [tasksRes, habitsRes, mileRes] = await Promise.all([
        fetch(`/api/dashboard/critical-tasks?date=${dateStr}`),
        fetch(`/api/dashboard/critical-habits?date=${dateStr}`),
        fetch('/api/dashboard/milestones'),
      ])
      if (tasksRes.ok) setCriticalTasks(await tasksRes.json())
      if (habitsRes.ok) setCriticalHabits(await habitsRes.json())
      if (mileRes.ok) setMilestones(await mileRes.json())
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
    fetchCalendar()
  }, [fetchCalendar])

  useEffect(() => {
    fetchUrgency(selectedDateStr)
  }, [selectedDateStr, fetchUrgency])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

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

  const markTodoDone = async (id: number) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (res.ok) {
        setCriticalTasks((prev) => prev.map((t) => (t.id === `todo-${id}` ? { ...t, completed: true } : t)))
        fetchUrgency(selectedDateStr)
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
        setCriticalTasks((prev) => prev.map((t) => (t.id === `reminder-${id}` ? { ...t, completed: true } : t)))
        fetchUrgency(selectedDateStr)
        fetchAnalytics()
      }
    } catch (err) {
      console.error(err)
    }
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
        setCriticalHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completedToday: true } : h)))
        fetchUrgency(selectedDateStr)
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

      // Workload intensity (0-3)
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
          {/* Workload intensity background */}
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
                {selectedWorkload.score} items scheduled ({selectedWorkload.tasks} tasks, {selectedWorkload.habits} habits, {selectedWorkload.reminders} reminders). Consider rescheduling some items.
              </p>
            </div>
          </div>
        )}

        {/* ═══ SECTION 1: URGENCY ═══ */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Urgency — {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Critical Tasks */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Critical Tasks
                </h4>
                <span className="text-xs text-slate-400">{criticalTasks.filter((t) => !t.completed).length} pending</span>
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {criticalTasks.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No critical tasks for this day</p>
                )}
                {criticalTasks.map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${task.completed ? 'opacity-50 border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MODULE_COLORS[task.module] }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{task.title}</p>
                      <p className="text-xs text-slate-500">{task.dueDate} · {task.priority}</p>
                    </div>
                    {!task.completed && (
                      <button
                        onClick={() => (task.module === 'todo' ? markTodoDone(parseInt(task.id.replace('todo-', ''))) : markReminderDone(parseInt(task.id.replace('reminder-', ''))))}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 whitespace-nowrap"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Habits */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Critical Habits
                </h4>
                <span className="text-xs text-slate-400">{criticalHabits.filter((h) => !h.completedToday).length} pending</span>
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {criticalHabits.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No habits scheduled</p>
                )}
                {criticalHabits.map((habit) => (
                  <div key={habit.id} className={`flex items-center gap-3 p-3 rounded-xl border ${habit.completedToday ? 'opacity-50 border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${habit.completedToday ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{habit.title}</p>
                      <p className="text-xs text-slate-500">
                        {habit.streak > 0 ? `${habit.streak}-day streak` : 'Start a streak'}
                        {habit.streak > 0 && !habit.completedToday && ' · at risk'}
                      </p>
                    </div>
                    {!habit.completedToday && (
                      <button
                        onClick={() => markHabitDone(habit.id)}
                        className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 whitespace-nowrap"
                      >
                        Realizado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Milestones
                </h4>
                <span className="text-xs text-slate-400">Next 7 days</span>
              </div>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {milestones.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No upcoming milestones</p>
                )}
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.date}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.daysRemaining <= 2
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : m.daysRemaining <= 5
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {m.daysRemaining === 0 ? 'Today' : `${m.daysRemaining}d`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: PLANNING (Calendar) ═══ */}
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
                      <span className="text-xs text-slate-500 dark:text-slate-400">{MODULE_LABELS[mod]}</span>
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

            {/* Selected day summary */}
            <div className="space-y-4">
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="card-title font-semibold text-slate-900 dark:text-white mb-3">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
                {selectedWorkload && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Workload</span>
                      <span className={`text-sm font-medium ${selectedWorkload.overloaded ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{selectedWorkload.score}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((selectedWorkload.score / 8) * 100, 100)}%`,
                          backgroundColor: selectedWorkload.overloaded ? '#ef4444' : selectedWorkload.score > 5 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedWorkload.tasks}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Tasks</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedWorkload.habits}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Habits</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedWorkload.reminders}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Reminders</p>
                      </div>
                    </div>
                  </div>
                )}
                {!selectedWorkload && (
                  <p className="text-sm text-slate-400 py-4 text-center">No workload data</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: ANALYTICS ═══ */}
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
