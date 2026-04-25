'use client'

import { useState } from 'react'

interface EnergySelectorProps {
  onLog?: (level: number) => void
}

export default function EnergySelector({ onLog }: EnergySelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const levels = [
    { value: 1, label: 'Muy baja', emoji: '😫', color: 'bg-red-500' },
    { value: 2, label: 'Baja', emoji: '😕', color: 'bg-orange-500' },
    { value: 3, label: 'Media', emoji: '😐', color: 'bg-yellow-500' },
    { value: 4, label: 'Alta', emoji: '🙂', color: 'bg-lime-500' },
    { value: 5, label: 'Muy alta', emoji: '🤩', color: 'bg-green-500' },
  ]

  const handleSelect = async (level: number) => {
    setSelected(level)
    try {
      const response = await fetch('/api/user/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      })
      if (response.ok) {
        setSubmitted(true)
        onLog?.(level)
      }
    } catch (err) {
      console.error('Error logging energy:', err)
    }
  }

  if (submitted) {
    return (
      <div className="energy-selector dashboard-card bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          Nivel de energía registrado: {levels.find((l) => l.value === selected)?.emoji} {levels.find((l) => l.value === selected)?.label}
        </p>
      </div>
    )
  }

  return (
    <div className="energy-selector dashboard-card bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">¿Cómo te sientes hoy?</h4>
      <div className="flex justify-between gap-1">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value)}
            className={`energy-btn flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              selected === level.value
                ? 'energy-btn-selected bg-slate-100 dark:bg-slate-700 ring-2 ring-primary'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="text-2xl">{level.emoji}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{level.label}</span>
            <div className={`w-full h-1 rounded-full ${level.color} opacity-50`} />
          </button>
        ))}
      </div>
    </div>
  )
}
