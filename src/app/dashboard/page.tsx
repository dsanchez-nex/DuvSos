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

interface DayData {
  count: number
  modules: Record<string, number>
}

interface ActionItem {
  id: string
  module: string
  title: string
  completed?: boolean
  priority?: string
  context?: string
  directAction?: { label: string; route: string }
}

export default function CalendarDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({})
  const [summary, setSummary] = useState<Record<string, { count: number; pending: number; completed: number }> | null>(null)
  const [actions, setActions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/calendar?year=${year}&month=${month}`)
      if (res.ok) setCalendarData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const selectDate = async (date: Date) => {
    setSelectedDate(date)
    const dateStr = date.toISOString().split('T')[0]
    try {
      const [summaryRes, actionsRes] = await Promise.all([
        fetch(`/api/dashboard/summary?date=${dateStr}`),
        fetch(`/api/dashboard/actions?date=${dateStr}`),
      ])
      if (summaryRes.ok) setSummary(await summaryRes.json())
      if (actionsRes.ok) setActions(await actionsRes.json())
    } catch (err) {
      console.error(err)
    }
  }

  const goToday = () => {
    const now = new Date()
    setCurrentDate(now)
    selectDate(now)
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

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const renderMonthGrid = () => {
    const days: React.ReactElement[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = calendarData[dateStr]
      const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr
      const isToday = new Date().toISOString().split('T')[0] === dateStr

      days.push(
        <button
          key={day}
          onClick={() => selectDate(new Date(year, month - 1, day))}
          className={`h-24 rounded-xl border p-2 text-left transition-all ${
            isSelected
              ? 'border-primary/40 shadow-sm bg-primary/5'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          } ${isToday ? 'ring-2 ring-primary/20' : ''}`}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
          {dayData && dayData.count > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(dayData.modules).slice(0, 4).map(([mod, count]) => (
                <span key={mod} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: MODULE_COLORS[mod] }}>
                  {count}
                </span>
              ))}
              {dayData.count > 4 && (
                <span className="text-[10px] text-slate-400">+{dayData.count - 4}</span>
              )}
            </div>
          )}
        </button>
      )
    }
    return days
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Unified view of all your activities</p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(MODULE_COLORS).map(([mod, color]) => (
            <div key={mod} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{MODULE_LABELS[mod]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
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

          {/* Side panel */}
          <div className="space-y-4">
            {selectedDate && summary && (
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <div className="space-y-2">
                  {Object.entries(summary).map(([mod, data]) => (
                    <div key={mod} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODULE_COLORS[mod] }} />
                        <span className="text-slate-600 dark:text-slate-300 capitalize">{mod}</span>
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {data.completed}/{data.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actions.length > 0 && (
              <div className="dashboard-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Actions</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {actions.map((action) => (
                    <div key={action.id} className={`flex items-center gap-3 p-3 rounded-xl border ${action.completed ? 'opacity-50 border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MODULE_COLORS[action.module] }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${action.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{action.title}</p>
                        {action.context && <p className="text-xs text-slate-500 truncate">{action.context}</p>}
                      </div>
                      {action.directAction && (
                        <button className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
                          {action.directAction.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
