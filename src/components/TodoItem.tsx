'use client'

import { useState } from 'react'

interface Todo {
  id: number
  title: string
  completed: boolean
  position: number
  createdAt: string
  updatedAt: string
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  onEdit: (id: number, title: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

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

  return (
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

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 px-2 py-1 bg-transparent border-b-2 border-primary focus:outline-none text-slate-900 dark:text-white"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 ${
            todo.completed
              ? 'text-slate-400 line-through'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {todo.title}
        </span>
      )}

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
  )
}
