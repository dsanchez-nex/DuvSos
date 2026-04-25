export type HabitState = 'Active' | 'Paused' | 'Archived'
export type GoalType = 'Daily' | 'Weekly' | 'Monthly' | 'Ratio'

export interface HabitCompletion {
    id: number
    habitId: number
    date: string | Date
    completedAt: string | Date
}

export interface Category {
    id: number
    name: string
    color: string
    icon: string
    userId?: number | null
    createdAt: string
}

export interface Objective {
    id: number
    name: string
    description?: string | null
    color: string
    userId?: number | null
    createdAt: string
}

export interface Habit {
    id: number
    title: string
    description?: string | null
    color: string
    state: HabitState
    isPermanent: boolean
    startDate?: string | null
    endDate?: string | null
    goalType: GoalType
    goalValue: number
    userId?: number | null
    categoryId?: number | null
    category?: Category | null
    objectiveId?: number | null
    objective?: Objective | null
    completions: HabitCompletion[]
    blockers?: { id: number; blockerHabit?: { title: string } }[]
    blocking?: { id: number; habit?: { title: string } }[]
    createdAt: string
    updatedAt: string
}

export interface HabitFormData {
    title: string
    description?: string | null
    color: string
    state?: HabitState
    isPermanent?: boolean
    startDate?: string | null
    endDate?: string | null
    goalType?: GoalType
    goalValue?: number
    categoryId?: number | null
    objectiveId?: number | null
}

export interface HabitMetrics {
    currentStreak: number
    completionRate: number // 0-100
    completionsThisPeriod: number
    periodTotal: number
}

export interface HabitWithMetrics extends Habit {
    metrics: HabitMetrics
}

export interface HabitBlocker {
    id: number
    habitId: number
    blockerHabitId: number
    blockerHabit?: Habit
}

export interface UserProgression {
    id: number
    userId: number
    totalXP: number
    currentLevel: number
}

export interface EnergyLog {
    id: number
    userId: number
    date: string
    level: number
}
