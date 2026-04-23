'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import TodoItem from './TodoItem'

interface SubTask {
  id: number
  title: string
  completed: boolean
  position: number
}

interface Category {
  id: number
  name: string
  color: string
  icon: string
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

interface TodoMetrics {
  total: number
  completed: number
  pending: number
  completionRate: number
  today: { total: number; completed: number; pending: number }
  week: { total: number }
  overdue: number
  totalEffortMinutes: number
}

type ViewMode = 'all' | 'today' | 'week'
type GroupBy = 'none' | 'category' | 'priority' | 'status'

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [metrics, setMetrics] = useState<TodoMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Form state
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDescription, setNewTodoDescription] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState('normal')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')
  const [newTodoDueTime, setNewTodoDueTime] = useState('')
  const [newTodoEffort, setNewTodoEffort] = useState('')
  const [newTodoCategory, setNewTodoCategory] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Filters
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams()
      if (viewMode !== 'all') params.set('view', viewMode)
      if (groupBy !== 'none') params.set('groupBy', groupBy)
      if (searchQuery) params.set('search', searchQuery)
      
      // Advanced filters
      const filters = []
      if (filterPriority) filters.push({ field: 'priority', op: 'eq', value: filterPriority })
      if (filterCategory) filters.push({ field: 'category_id', op: 'eq', value: filterCategory })
      if (filterStatus) filters.push({ field: 'status', op: 'eq', value: filterStatus })
      if (filters.length > 0) params.set('filters', JSON.stringify(filters))
      
      const queryString = params.toString()
      const url = `/api/todos${queryString ? `?${queryString}` : ''}`
      
      const [todosRes, categoriesRes, metricsRes] = await Promise.all([
        fetch(url),
        fetch('/api/todo-categories'),
        fetch('/api/todos/metrics')
      ])
      
      if (!todosRes.ok) throw new Error('Failed to fetch todos')
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
      
      const todosData = await todosRes.json()
      const categoriesData = await categoriesRes.json()
      
      setTodos(Array.isArray(todosData) ? todosData : [])
      setCategories(categoriesData)
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }
    } catch (err) {
      setError('Error loading todos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [viewMode, groupBy, searchQuery, filterPriority, filterCategory, filterStatus])

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
      const effortMinutes = newTodoEffort ? parseInt(newTodoEffort) * 60 : 0
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodoTitle.trim(),
          description: newTodoDescription || undefined,
          priority: newTodoPriority,
          dueDate: newTodoDueDate || undefined,
          dueTime: newTodoDueTime || undefined,
          effortMinutes,
          categoryId: newTodoCategory ? parseInt(newTodoCategory) : undefined
        }),
      })
      if (!response.ok) throw new Error('Failed to create todo')
      const newTodo = await response.json()
      setTodos([...todos, newTodo])
      
      // Reset form
      setNewTodoTitle('')
      setNewTodoDescription('')
      setNewTodoPriority('normal')
      setNewTodoDueDate('')
      setNewTodoDueTime('')
      setNewTodoEffort('')
      setNewTodoCategory('')
      setShowAdvanced(false)
      
      // Refresh metrics
      fetchTodos()
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
        todos.map((t) => (t.id === id ? { ...t, ...updatedTodo } : t)).sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return a.position - b.position
        })
      )
      fetchTodos()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete todo')
      setTodos(todos.filter((t) => t.id !== id))
      fetchTodos()
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
      setTodos(todos.map((t) => (t.id === id ? { ...t, ...updatedTodo } : t)))
    } catch (err) {
      console.error(err)
    }
  }
  
  const formatEffort = (minutes: number): string => {
    if (minutes === 0) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'normal': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-slate-400'
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
      {/* Header with Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Todos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {metrics ? `${metrics.pending} pending · ${metrics.completed} completed · ${metrics.completionRate}% rate` : 'Loading...'}
          </p>
        </div>
        
        {/* Quick Stats */}
        {metrics && (
          <div className="flex gap-4 text-sm">
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{metrics.today.pending}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">today</span>
            </div>
            <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <span className="text-amber-600 dark:text-amber-400 font-medium">{metrics.overdue}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">overdue</span>
            </div>
            <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 font-medium">{formatEffort(metrics.totalEffortMinutes)}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">effort</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Views */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* View Mode */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['all', 'today', 'week'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Group By */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="none">No grouping</option>
          <option value="category">By Category</option>
          <option value="priority">By Priority</option>
          <option value="status">By Status</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>

        {/* Advanced Filters */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={handleCreateTodo} className="space-y-3">
        <div className="flex gap-2">
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
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Advanced options"
          >
            <span className="material-symbols-outlined text-slate-500">
              {showAdvanced ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <input
              type="text"
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              placeholder="Description..."
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <input
              type="time"
              value={newTodoDueTime}
              onChange={(e) => setNewTodoDueTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <input
              type="number"
              value={newTodoEffort}
              onChange={(e) => setNewTodoEffort(e.target.value)}
              placeholder="Effort (hours)"
              min="0"
              step="0.5"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <select
              value={newTodoCategory}
              onChange={(e) => setNewTodoCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
      </form>

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">checklist</span>
          <p className="text-slate-500 dark:text-slate-400 text-lg">No todos found</p>
          <p className="text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or add a new todo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {uncheckedTodos.map((todo) => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onToggle={handleToggle} 
              onDelete={handleDelete} 
              onEdit={handleEdit}
              categories={categories}
              formatEffort={formatEffort}
              getPriorityColor={getPriorityColor}
            />
          ))}
          {checkedTodos.length > 0 && (
            <>
              {uncheckedTodos.length > 0 && (
                <div className="py-2 text-sm text-slate-400 dark:text-slate-500">Completed</div>
              )}
              {checkedTodos.map((todo) => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={handleToggle} 
                  onDelete={handleDelete} 
                  onEdit={handleEdit}
                  categories={categories}
                  formatEffort={formatEffort}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
