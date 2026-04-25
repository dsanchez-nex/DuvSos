export type ReminderPriority = 'low' | 'normal' | 'high'

export interface Reminder {
  id: number
  title: string
  description?: string | null
  dueDate: string
  completed: boolean
  priority: ReminderPriority
  sourceModule?: string | null
  sourceId?: number | null
  isPaused: boolean
  lifecycleStartDate?: string | null
  lifecycleEndDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface ReminderFormData {
  title: string
  description?: string | null
  dueDate: string
  priority?: ReminderPriority
  sourceModule?: string | null
  sourceId?: number | null
  lifecycleStartDate?: string | null
  lifecycleEndDate?: string | null
}
