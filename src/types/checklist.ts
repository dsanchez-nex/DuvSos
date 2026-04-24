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
  parentId?: number | null
  blockedByItemId?: number | null
  effortEstimate?: number | null
}

export interface Checklist {
  id: number
  title: string
  description?: string | null
  color: string
  startDate?: string | null
  endDate?: string | null
  isTemplate?: boolean
  version?: number
  lifecycleState?: string
  templateId?: number | null
  recurrencePattern?: string | null
  completedAt?: string | null
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
  isTemplate?: boolean
  recurrencePattern?: string | null
}

export interface ChecklistItemFormData {
  title: string
  notes?: string | null
  priority?: Priority
  effortEstimate?: number | null
  blockedByItemId?: number | null
  parentId?: number | null
}

export type ChecklistFilter = 'all' | 'active' | 'expired' | 'no-dates'
export type ChecklistTab = 'active' | 'templates' | 'history'