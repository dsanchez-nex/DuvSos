'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import TodoItem from './TodoItem'

interface Todo {
  id: number
  title: string
  completed: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) throw new Error('Failed to fetch todos')
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      setError('Error loading todos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Keyboard shortcut: "n" to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodoTitle.trim() }),
      })
      if (!response.ok) throw new Error('Failed to create todo')
      const newTodo = await response.json()
      setTodos([...todos, newTodo])
      setNewTodoTitle('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      })
      if (!response.ok) throw new Error('Failed to update todo')
      const updatedTodo = await response.json()
      setTodos(
        todos.map((t) => (t.id === id ? updatedTodo : t)).sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return a.position - b.position
        })
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete todo')
      setTodos(todos.filter((t) => t.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = async (id: number, title: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title }),
      })
      if (!response.ok) throw new Error('Failed to update todo')
      const updatedTodo = await response.json()
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)))
    } catch (err) {
      console.error(err)
    }
  }

  const uncheckedTodos = todos.filter((t) => !t.completed)
  const checkedTodos = todos.filter((t) => t.completed)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchTodos} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Todos</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {todos.length === 0
            ? 'No todos yet'
            : `${uncheckedTodos.length} remaining · ${checkedTodos.length} completed`}
        </p>
      </div>

      {/* Always-visible input */}
      <form onSubmit={handleCreateTodo} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new todo... (press N to focus)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!newTodoTitle.trim()}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">checklist</span>
          <p className="text-slate-500 dark:text-slate-400 text-lg">No todos yet</p>
          <p className="text-slate-400 dark:text-slate-500 mt-1">Type above and press Enter to add one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {uncheckedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
          {checkedTodos.length > 0 && (
            <>
              {uncheckedTodos.length > 0 && (
                <div className="py-2 text-sm text-slate-400 dark:text-slate-500">Completed</div>
              )}
              {checkedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
