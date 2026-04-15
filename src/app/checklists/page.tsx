'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import ChecklistList from '@/components/ChecklistList'
import ChecklistForm from '@/components/ChecklistForm'
import CategoryManager from '@/components/CategoryManager'
import Toast from '@/components/Toast'
import { Checklist, ChecklistCategory, ChecklistFilter, ChecklistFormData, ChecklistItem, Priority } from '@/types/checklist'
import { SortOption } from '@/components/ChecklistList'

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [categories, setCategories] = useState<ChecklistCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [filter, setFilter] = useState<ChecklistFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [toast, setToast] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [cl, cat] = await Promise.all([
        fetch('/api/checklists').then(r => r.json()),
        fetch('/api/checklist-categories').then(r => r.json()),
      ])
      setChecklists(cl)
      setCategories(cat)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const api = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
    if (!res.ok) throw new Error('API error')
    return res.json()
  }

  // Checklist CRUD
  const handleSaveChecklist = async (data: ChecklistFormData) => {
    if (editingChecklist) {
      const updated = await api(`/api/checklists/${editingChecklist.id}`, 'PUT', data)
      setChecklists(prev => prev.map(c => c.id === updated.id ? updated : c))
    } else {
      const created = await api('/api/checklists', 'POST', data)
      setChecklists(prev => [created, ...prev])
      setExpandedId(created.id) // auto-expand after create
    }
    setShowForm(false)
    setEditingChecklist(null)
  }

  const handleDeleteChecklist = async (id: number) => {
    await api(`/api/checklists/${id}`, 'DELETE')
    setChecklists(prev => prev.filter(c => c.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleDuplicate = async (id: number) => {
    const copy = await api(`/api/checklists/${id}/duplicate`, 'POST')
    setChecklists(prev => [copy, ...prev])
  }

  // Item operations (now take checklistId)
  const handleAddItem = async (checklistId: number, title: string, priority: Priority) => {
    const item = await api(`/api/checklists/${checklistId}/items`, 'POST', { title, priority })
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, items: [...c.items, item] } : c))
  }

  const handleToggleItem = async (checklistId: number, item: ChecklistItem) => {
    const updated = await api(`/api/checklists/${checklistId}/items/${item.id}`, 'PUT', { completed: !item.completed })
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, items: c.items.map(i => i.id === updated.id ? updated : i) } : c))
  }

  const handleDeleteItem = async (checklistId: number, itemId: number) => {
    await api(`/api/checklists/${checklistId}/items/${itemId}`, 'DELETE')
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }

  const handleUpdateItem = async (checklistId: number, item: ChecklistItem, data: Partial<ChecklistItem>) => {
    const updated = await api(`/api/checklists/${checklistId}/items/${item.id}`, 'PUT', data)
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, items: c.items.map(i => i.id === updated.id ? updated : i) } : c))
  }

  const handleReorder = async (checklistId: number, items: ChecklistItem[]) => {
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, items } : c))
    await Promise.all(items.map(item => api(`/api/checklists/${checklistId}/items/${item.id}`, 'PUT', { position: item.position })))
  }

  const handleCreateReminder = async (checklistId: number, item: ChecklistItem) => {
    const checklist = checklists.find(c => c.id === checklistId)
    const dueDate = checklist?.endDate || new Date(Date.now() + 86400000).toISOString()
    await api('/api/reminders', 'POST', {
      title: item.title,
      description: checklist ? `From checklist: ${checklist.title}` : null,
      dueDate,
      priority: item.priority,
    })
    setToast(`Reminder created for "${item.title}"`)
  }

  // Category CRUD
  const handleAddCategory = async (name: string, color: string, icon: string) => {
    const cat = await api('/api/checklist-categories', 'POST', { name, color, icon })
    setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const handleUpdateCategory = async (id: number, data: Partial<ChecklistCategory>) => {
    const updated = await api(`/api/checklist-categories/${id}`, 'PUT', data)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
  }

  const handleDeleteCategory = async (id: number) => {
    await api(`/api/checklist-categories/${id}`, 'DELETE')
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ChecklistList
        checklists={checklists} categories={categories}
        filter={filter} categoryFilter={categoryFilter} expandedId={expandedId}
        search={search} sort={sort}
        onSearchChange={setSearch} onSortChange={setSort}
        onFilterChange={setFilter} onCategoryFilterChange={setCategoryFilter}
        onToggleExpand={id => setExpandedId(expandedId === id ? null : id)}
        onEdit={c => { setEditingChecklist(c); setShowForm(true) }}
        onNew={() => { setEditingChecklist(null); setShowForm(true) }}
        onDuplicate={handleDuplicate} onDelete={handleDeleteChecklist}
        onToggleItem={handleToggleItem} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem}
        onUpdateItem={handleUpdateItem} onReorder={handleReorder}
        onCreateReminder={handleCreateReminder}
      />

      {showForm && (
        <ChecklistForm
          checklist={editingChecklist} categories={categories}
          onSave={handleSaveChecklist}
          onCancel={() => { setShowForm(false); setEditingChecklist(null) }}
          onManageCategories={() => setShowCategories(true)}
        />
      )}

      {showCategories && (
        <CategoryManager
          categories={categories}
          onAdd={handleAddCategory} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory}
          onClose={() => setShowCategories(false)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
