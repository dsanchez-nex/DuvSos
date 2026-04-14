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
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      onEdit(todo.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(todo.title)
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) {
      onDelete(todo.id)
    } else {
      setIsDeleting(true)
      setTimeout(() => setIsDeleting(false), 3000)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
        todo.completed
          ? 'bg-slate-50 dark:bg-slate-800/50'
          : 'bg-white dark:bg-slate-800'
      } border border-slate-100 dark:border-slate-700`}
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
          className="flex-1 px-2 py-1 bg-transparent border-b-2 border-primary focus:outline-none text-gray-800 dark:text-white"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 cursor-pointer ${
            todo.completed
              ? 'text-slate-400 line-through'
              : 'text-gray-800 dark:text-white'
          }`}
        >
          {todo.title}
        </span>
      )}

      <button
        onClick={handleDelete}
        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
          isDeleting
            ? 'bg-red-500 text-white'
            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
        title={isDeleting ? 'Click again to confirm' : 'Delete'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 21m5-12l6-12" />
        </svg>
      </button>
    </div>
  )
}