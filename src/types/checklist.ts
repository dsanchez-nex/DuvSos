export type Priority = 'low' | 'normal' | 'high'

export interface ChecklistCategory {
  id: number
  name: string
  color: string
  icon: string
}

export interface ChecklistItem {
  id: number
  title: string
  completed: boolean
  position: number
  notes?: string | null
  priority: Priority
  checklistId: number
}

export interface Checklist {
  id: number
  title: string
  description?: string | null
  color: string
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
  categoryId?: number | null
  category?: ChecklistCategory | null
  items: ChecklistItem[]
}

export interface ChecklistFormData {
  title: string
  description?: string | null
  color: string
  startDate?: string | null
  endDate?: string | null
  categoryId?: number | null
}

export interface ChecklistItemFormData {
  title: string
  notes?: string | null
  priority?: Priority
}

export type ChecklistFilter = 'all' | 'active' | 'expired' | 'no-dates'
