'use client'

import { useState } from 'react'

interface Category {
  id: number
  name: string
  color: string
  icon: string
}

interface SubTask {
  id: number
  title: string
  completed: boolean
  position: number
}

interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: string
  dueDate?: string
  dueTime?: string
  effortMinutes: number
  position: number
  createdAt: string
  updatedAt: string
  parentId?: number
  categoryId?: number
  category?: Category
  subTasks?: SubTask[]
  progress?: number
  subTasksCount?: number
  completedSubTasksCount?: number
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  onEdit: (id: number, title: string) => void
  categories?: Category[]
  formatEffort?: (minutes: number) => string
  getPriorityColor?: (priority: string) => string
}

export default function TodoItem({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit,
  categories = [],
  formatEffort = (m) => m > 0 ? `${m}m` : '',
  getPriorityColor = () => 'text-slate-400'
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [showSubtasks, setShowSubtasks] = useState(false)

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      onEdit(todo.id, editTitle.trim())
    } else {
      setEditTitle(todo.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    else if (e.key === 'Escape') {
      setEditTitle(todo.title)
      setIsEditing(false)
    }
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date.getTime() === today.getTime()) return 'Today'
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (): boolean => {
    if (!todo.dueDate || todo.completed) return false
    const due = new Date(todo.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
          todo.completed
            ? 'bg-slate-50 dark:bg-slate-800/50'
            : 'bg-white dark:bg-slate-800'
        } border border-slate-100 dark:border-slate-700 group`}
      >
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-green-500'
          }`}
        >
          {todo.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-2 py-1 bg-transparent border-b-2 border-primary focus:outline-none text-slate-900 dark:text-white"
            />
          ) : (
            <div className="space-y-1">
              <span
                onDoubleClick={() => setIsEditing(true)}
                className={`block ${
                  todo.completed
                    ? 'text-slate-400 line-through'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {todo.title}
              </span>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Priority */}
                <span className={`font-medium ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
                
                {/* Due date */}
                {todo.dueDate && (
                  <span className={`flex items-center gap-1 ${isOverdue() ? 'text-red-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-sm">event</span>
                    {formatDate(todo.dueDate)}
                    {todo.dueTime && ` ${todo.dueTime}`}
                  </span>
                )}
                
                {/* Effort */}
                {todo.effortMinutes > 0 && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {formatEffort(todo.effortMinutes)}
                  </span>
                )}
                
                {/* Category */}
                {todo.category && (
                  <span 
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: todo.category.color }}
                  >
                    {todo.category.name}
                  </span>
                )}
                
                {/* Subtasks indicator */}
                {(todo.subTasksCount || 0) > 0 && (
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">account_tree</span>
                    {todo.completedSubTasksCount}/{todo.subTasksCount}
                    {todo.progress !== undefined && ` (${todo.progress}%)`}
                  </button>
                )}
                
                {/* Overdue badge */}
                {isOverdue() && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                    overdue
                  </span>
                )}
              </div>
              
              {/* Description */}
              {todo.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {todo.description}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
      
      {/* Subtasks */}
      {showSubtasks && todo.subTasks && todo.subTasks.length > 0 && (
        <div className="ml-8 space-y-2">
          {todo.subTasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                subtask.completed
                  ? 'bg-slate-50 dark:bg-slate-800/30'
                  : 'bg-slate-50 dark:bg-slate-800/50'
              } border border-slate-100 dark:border-slate-700`}
            >
              <button
                onClick={() => onToggle(subtask.id, !subtask.completed)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  subtask.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-300 dark:border-slate-600 hover:border-green-500'
                }`}
              >
                {subtask.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
