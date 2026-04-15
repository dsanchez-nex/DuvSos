export type ReminderPriority = 'low' | 'normal' | 'high'

export interface Reminder {
  id: number
  title: string
  description?: string | null
  dueDate: string
  completed: boolean
  priority: ReminderPriority
  createdAt: string
  updatedAt: string
}

export interface ReminderFormData {
  title: string
  description?: string | null
  dueDate: string
  priority?: ReminderPriority
}
