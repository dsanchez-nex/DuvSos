'use client'

import { useState, useEffect, useCallback } from 'react'
import HabitCard from './HabitCard'
import HabitForm from './HabitForm'
import { Habit, Category, Objective, HabitFormData, HabitState } from '@/types/habit'

interface PlanningViewProps {
  habits: Habit[]
  categories: Category[]
  objectives: Objective[]
  onCreate: (data: HabitFormData) => Promise<void>
  onUpdate: (id: number, data: HabitFormData) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onStateChange: (id: number, state: HabitState) => Promise<void>
  loading?: boolean
}

export default function PlanningView({
  habits,
  categories,
  objectives,
  onCreate,
  onUpdate,
  onDelete,
  onStateChange,
  loading,
}: PlanningViewProps) {
  const [filter, setFilter] = useState<HabitState | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const filteredHabits = filter === 'All'
    ? habits
    : habits.filter((h) => h.state === filter)

  const handleUpdate = async (id: number, data: HabitFormData) => {
    await onUpdate(id, data)
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Planificación</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {habits.length} hábito{habits.length !== 1 ? 's' : ''} configurado{habits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 btn-neon bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {showForm ? 'Cancelar' : 'Nuevo Hábito'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Active', 'Paused', 'Archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`habit-filter-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'habit-filter-btn-active bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'All' ? 'Todos' : f === 'Active' ? 'Activos' : f === 'Paused' ? 'Pausados' : 'Archivados'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="habit-form-container bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Crear Nuevo Hábito</h3>
          <HabitForm
            onSubmit={async (data) => { await onCreate(data); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
            categories={categories}
            objectives={objectives}
          />
        </div>
      )}

      {filteredHabits.length === 0 ? (
        <div className="empty-state text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No hay hábitos en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHabits.map((habit) => (
            <div key={habit.id}>
              {editingId === habit.id ? (
                <div className="dashboard-card bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: habit.color }}>
                  <HabitForm
                    initialData={habit}
                    onSubmit={(data) => handleUpdate(habit.id, data)}
                    onCancel={() => setEditingId(null)}
                    categories={categories}
                    objectives={objectives}
                  />
                </div>
              ) : (
                <HabitCard
                  habit={habit}
                  onUpdate={(id, data) => handleUpdate(id, data)}
                  onDelete={onDelete}
                  onStateChange={onStateChange}
                  onEdit={() => setEditingId(habit.id)}
                  mode="planning"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
