'use client'

import { useState, useMemo } from 'react'
import { Habit } from '@/types/habit'
import { calculateStreak, calculateCompletionRate } from '@/lib/habit-utils'

interface ArchiveViewProps {
  habits: Habit[]
  loading?: boolean
}

export default function ArchiveView({ habits, loading }: ArchiveViewProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  }, [])

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  const periodStart = new Date(selectedYear, selectedMonth - 1, 1)
  const periodEnd = new Date(selectedYear, selectedMonth, 1)

  const periodData = useMemo(() => {
    return habits.map((habit) => {
      const periodCompletions = habit.completions.filter((c) => {
        const d = new Date(c.date)
        return d >= periodStart && d < periodEnd
      })

      const streak = calculateStreak(habit.completions, habit.goalType, habit.goalValue)
      const rate = calculateCompletionRate(periodCompletions, habit.goalType, habit.goalValue)

      return {
        habit,
        completions: periodCompletions.length,
        streak,
        rate,
      }
    })
  }, [habits, selectedYear, selectedMonth])

  const totalCompletions = periodData.reduce((sum, d) => sum + d.completions, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Archivo Histórico</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Analiza tu progreso pasado</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Completaciones</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalCompletions}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Hábitos Activos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{habits.filter((h) => h.state === 'Active').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Mejor Racha</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {Math.max(0, ...periodData.map((d) => d.streak))}
          </p>
        </div>
      </div>

      {/* Habit Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detalle por Hábito</h3>
        {periodData.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No hay hábitos para mostrar</p>
          </div>
        ) : (
          periodData.map(({ habit, completions, streak, rate }) => (
            <div
              key={habit.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: habit.color }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{habit.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {completions} completaciones · Racha actual: {streak} · Tasa: {rate}%
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    habit.state === 'Active'
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                      : habit.state === 'Paused'
                      ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {habit.state === 'Active' ? 'Activo' : habit.state === 'Paused' ? 'Pausado' : 'Archivado'}
                  </span>
                </div>
              </div>

              {/* Streak chart - simple bar representation */}
              {habit.completions.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-0.5 flex-wrap">
                    {Array.from({ length: Math.min(30, habit.completions.length) }, (_, i) => {
                      const completion = habit.completions[i]
                      return (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: habit.color }}
                          title={new Date(completion.date).toLocaleDateString('es')}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Últimas completaciones</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
