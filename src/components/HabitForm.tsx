'use client'

import { useState, useEffect } from 'react'
import { HabitFormData, Category, Objective, HabitState, GoalType } from '@/types/habit'

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void
  onCancel?: () => void
  initialData?: Partial<HabitFormData>
  categories?: Category[]
  objectives?: Objective[]
}

const colors = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Morado', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Cyan', value: '#06b6d4' },
]

const goalTypes: { value: GoalType; label: string }[] = [
  { value: 'Daily', label: 'Diario' },
  { value: 'Weekly', label: 'Semanal' },
  { value: 'Monthly', label: 'Mensual' },
  { value: 'Ratio', label: 'Ratio (%)' },
]

export default function HabitForm({ onSubmit, onCancel, initialData, categories = [], objectives = [] }: HabitFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [color, setColor] = useState(initialData?.color || '#3b82f6')
  const [state, setState] = useState<HabitState>(initialData?.state || 'Active')
  const [isPermanent, setIsPermanent] = useState(initialData?.isPermanent !== false)
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [goalType, setGoalType] = useState<GoalType>(initialData?.goalType || 'Daily')
  const [goalValue, setGoalValue] = useState(initialData?.goalValue || 1)
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [objectiveId, setObjectiveId] = useState(initialData?.objectiveId || '')
  const [cycleError, setCycleError] = useState('')

  useEffect(() => {
    if (!isPermanent) {
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        setCycleError('La fecha de fin debe ser posterior o igual a la de inicio')
      } else {
        setCycleError('')
      }
    } else {
      setCycleError('')
    }
  }, [isPermanent, startDate, endDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (cycleError) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      color,
      state,
      isPermanent,
      startDate: isPermanent ? null : startDate || null,
      endDate: isPermanent ? null : endDate || null,
      goalType,
      goalValue: parseInt(String(goalValue), 10) || 1,
      categoryId: categoryId ? parseInt(String(categoryId), 10) : null,
      objectiveId: objectiveId ? parseInt(String(objectiveId), 10) : null,
    })

    if (!initialData) {
      setTitle('')
      setDescription('')
      setColor('#3b82f6')
      setState('Active')
      setIsPermanent(true)
      setStartDate('')
      setEndDate('')
      setGoalType('Daily')
      setGoalValue(1)
      setCategoryId('')
      setObjectiveId('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Título del hábito *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Ejercicio diario"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={2}
            placeholder="Ej: 30 minutos de ejercicio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full transition-all ${color === c.value
                    ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800 scale-110'
                    : 'hover:scale-105'
                  }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as HabitState)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Active">Activo</option>
            <option value="Paused">Pausado</option>
            <option value="Archived">Archivado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Objetivo</label>
          <select
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sin objetivo</option>
            {objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>{obj.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <input
              type="checkbox"
              checked={isPermanent}
              onChange={(e) => setIsPermanent(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            Hábito permanente (sin fecha de fin)
          </label>
        </div>

        {!isPermanent && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {cycleError && (
              <div className="md:col-span-2 text-sm text-red-500">{cycleError}</div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de meta</label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as GoalType)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {goalTypes.map((gt) => (
              <option key={gt.value} value={gt.value}>{gt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Valor de meta {goalType === 'Ratio' ? '(%)' : '(veces)'}
          </label>
          <input
            type="number"
            min={1}
            max={goalType === 'Ratio' ? 100 : 999}
            value={goalValue}
            onChange={(e) => setGoalValue(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {initialData ? 'Actualizar' : 'Crear Hábito'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
