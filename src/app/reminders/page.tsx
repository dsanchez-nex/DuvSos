'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import { Reminder, ReminderPriority, ReminderFormData } from '@/types/reminder'

const priorityConfig: Record<ReminderPriority, { icon: string; class: string; bg: string }> = {
  high: { icon: 'arrow_upward', class: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  normal: { icon: 'remove', class: 'text-slate-400', bg: '' },
  low: { icon: 'arrow_downward', class: 'text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86400000)
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  if (diff < 0) return { text: `${formatted} (overdue)`, class: 'text-red-500 font-medium' }
  if (diff === 0) return { text: `Today`, class: 'text-amber-600 font-medium' }
  if (diff === 1) return { text: `Tomorrow`, class: 'text-amber-500' }
  if (diff <= 3) return { text: `${formatted} (${diff}d)`, class: 'text-amber-500' }
  return { text: formatted, class: 'text-slate-500 dark:text-slate-400' }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<ReminderPriority>('normal')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/reminders')
      if (res.ok) setReminders(await res.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchReminders() }, [fetchReminders])

  const api = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
    if (!res.ok) throw new Error('API error')
    return res.json()
  }

  const openNew = () => {
    setEditing(null); setTitle(''); setDescription(''); setDueDate(''); setPriority('normal'); setShowForm(true)
  }

  const openEdit = (r: Reminder) => {
    setEditing(r); setTitle(r.title); setDescription(r.description || '')
    setDueDate(new Date(r.dueDate).toISOString().split('T')[0])
    setPriority(r.priority); setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    const data: ReminderFormData = { title: title.trim(), description: description.trim() || null, dueDate, priority }
    if (editing) {
      const updated = await api(`/api/reminders/${editing.id}`, 'PUT', data)
      setReminders(prev => prev.map(r => r.id === updated.id ? updated : r))
    } else {
      const created = await api('/api/reminders', 'POST', data)
      setReminders(prev => [created, ...prev])
    }
    setShowForm(false)
  }

  const handleToggle = async (r: Reminder) => {
    const updated = await api(`/api/reminders/${r.id}`, 'PUT', { completed: !r.completed })
    setReminders(prev => prev.map(x => x.id === updated.id ? updated : x))
  }

  const handleDelete = async (id: number) => {
    await api(`/api/reminders/${id}`, 'DELETE')
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const filtered = reminders.filter(r => {
    if (filter === 'pending') return !r.completed
    if (filter === 'completed') return r.completed
    return true
  })

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reminders</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {reminders.filter(r => !r.completed).length} pending · {reminders.filter(r => r.completed).length} completed
            </p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
            <span className="material-symbols-outlined text-sm">add</span>
            New Reminder
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['pending', 'all', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">notifications_active</span>
            <p className="text-slate-500 dark:text-slate-400 text-lg">No reminders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const prio = priorityConfig[r.priority] || priorityConfig.normal
              const due = formatDate(r.dueDate)
              return (
                <div key={r.id} className={`p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group ${r.completed ? 'opacity-60' : ''} ${prio.bg}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(r)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${r.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600 hover:border-green-500'}`}>
                      {r.completed && <span className="material-symbols-outlined text-white text-xs">check</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${r.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{r.title}</span>
                        <span className={`material-symbols-outlined text-xs ${prio.class}`}>{prio.icon}</span>
                      </div>
                      {r.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{r.description}</p>}
                      <p className={`text-xs mt-0.5 ${due.class}`}>
                        <span className="material-symbols-outlined text-xs align-middle mr-0.5">schedule</span>
                        {due.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editing ? 'Edit Reminder' : 'New Reminder'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as ReminderPriority)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={!title.trim() || !dueDate}
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                    {editing ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
