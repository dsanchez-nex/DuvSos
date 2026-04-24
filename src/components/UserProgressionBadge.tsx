'use client'

import { useState, useEffect } from 'react'
import { UserProgression } from '@/types/habit'
import { getLevelName, getXPForNextLevel } from '@/lib/habit-utils'

export default function UserProgressionBadge() {
  const [progression, setProgression] = useState<UserProgression | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/progression')
      .then((res) => res.json())
      .then((data) => {
        setProgression(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !progression) return null

  const levelName = getLevelName(progression.currentLevel)
  const nextLevelXP = getXPForNextLevel(progression.currentLevel)
  const progress = Math.min(100, (progression.totalXP / nextLevelXP) * 100)

  return (
    <div className="px-3 py-2 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-sm font-bold">
          {progression.currentLevel}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            {levelName}
          </p>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {progression.totalXP} / {nextLevelXP} XP
          </p>
        </div>
      </div>
    </div>
  )
}
