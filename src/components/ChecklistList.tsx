'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Checklist, ChecklistCategory, ChecklistFilter, ChecklistItem, Priority } from '@/types/checklist'

const priorityConfig: Record<Priority, { icon: string; class: string }> = {
  high: { icon: 'arrow_upward', class: 'text-red-500' },
  normal: { icon: 'remove', class: 'text-slate-400' },
  low: { icon: 'arrow_downward', class: 'text-blue-400' },
}

export function getStatus(c: Checklist): { label: string; class: string } {
  if (!c.startDate && !c.endDate) return { label: 'No dates', class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
  const now = new Date()
  const end = c.endDate ? new Date(c.endDate) : null
  const start = c.startDate ? new Date(c.startDate) : null
  if (end && end < now) return { label: 'Expired', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  if (end) {
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
    if (days <= 3) return { label: `${days}d left`, class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  }
  if (start && start > now) return { label: 'Upcoming', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
  return { label: 'Active', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
}

function getProgress(c: Checklist) {
  if (c.items.length === 0) return 0
  return Math.round((c.items.filter(i => i.completed).length / c.items.length) * 100)
}

export type SortOption = 'newest' | 'name' | 'progress' | 'due-date'

interface Props {
  checklists: Checklist[]
  categories: ChecklistCategory[]
  filter: ChecklistFilter
  categoryFilter: number | null
  expandedId: number | null
  search: string
  sort: SortOption
  onSearchChange: (s: string) => void
  onSortChange: (s: SortOption) => void
  onFilterChange: (f: ChecklistFilter) => void
  onCategoryFilterChange: (id: number | null) => void
  onToggleExpand: (id: number) => void
  onEdit: (c: Checklist) => void
  onNew: () => void
  onDuplicate: (id: number) => void
  onDelete: (id: number) => void
  onToggleItem: (checklistId: number, item: ChecklistItem) => void
  onAddItem: (checklistId: number, title: string, priority: Priority) => void
  onUpdateItem: (checklistId: number, item: ChecklistItem, data: Partial<ChecklistItem>) => void
  onDeleteItem: (checklistId: number, itemId: number) => void
  onReorder: (checklistId: number, items: ChecklistItem[]) => void
  onCreateReminder: (checklistId: number, item: ChecklistItem) => void
}

const filterOptions: { value: ChecklistFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'no-dates', label: 'No dates' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
  { value: 'progress', label: 'Progress' },
  { value: 'due-date', label: 'Due date' },
]

// --- Undo Toast ---
function UndoToast({ message, onUndo, onClose }: { message: string; onUndo: () => void; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <span className="material-symbols-outlined text-lg text-amber-500">delete</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{message}</span>
        <button onClick={onUndo} className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg">Undo</button>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  )
}

// --- Inline Add Item ---
function InlineItemInput({ onAdd }: { onAdd: (title: string, priority: Priority) => void }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), priority)
    setTitle('')
    setPriority('normal')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input ref={inputRef} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Add item..."
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400" />
      <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
        className="px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary">
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={!title.trim()}
        className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
        Add
      </button>
    </form>
  )
}

// --- Expanded Items with notes editor, hide completed, drag-reorder, inline edit ---
function ExpandedItems({ checklist: c, onToggleItem, onUpdateItem, onDeleteItem, onAddItem, onReorder, onCreateReminder }: {
  checklist: Checklist
  onToggleItem: (checklistId: number, item: ChecklistItem) => void
  onUpdateItem: (checklistId: number, item: ChecklistItem, data: Partial<ChecklistItem>) => void
  onDeleteItem: (checklistId: number, itemId: number) => void
  onAddItem: (checklistId: number, title: string, priority: Priority) => void
  onReorder: (checklistId: number, items: ChecklistItem[]) => void
  onCreateReminder: (checklistId: number, item: ChecklistItem) => void
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [notesId, setNotesId] = useState<number | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [undoItem, setUndoItem] = useState<{ item: ChecklistItem; timer: NodeJS.Timeout } | null>(null)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      dragItem.current = null; dragOver.current = null; return
    }
    const visible = getVisibleItems()
    const [moved] = visible.splice(dragItem.current, 1)
    visible.splice(dragOver.current, 0, moved)
    // Merge back hidden completed items at end
    const hidden = hideCompleted ? c.items.filter(i => i.completed) : []
    const all = [...visible, ...hidden].map((item, i) => ({ ...item, position: i }))
    onReorder(c.id, all)
    dragItem.current = null; dragOver.current = null
  }

  const startEdit = (item: ChecklistItem) => { setEditingId(item.id); setEditTitle(item.title) }
  const saveEdit = (item: ChecklistItem) => {
    if (editTitle.trim() && editTitle !== item.title) onUpdateItem(c.id, item, { title: editTitle.trim() })
    setEditingId(null)
  }

  const handleDeleteItem = (itemId: number) => {
    const item = c.items.find(i => i.id === itemId)
    if (!item) return
    if (undoItem) { clearTimeout(undoItem.timer); onDeleteItem(c.id, undoItem.item.id) }
    const timer = setTimeout(() => { onDeleteItem(c.id, itemId); setUndoItem(null) }, 5000)
    setUndoItem({ item, timer })
  }

  const handleUndo = () => {
    if (!undoItem) return
    clearTimeout(undoItem.timer)
    setUndoItem(null)
  }

  const dismissUndo = useCallback(() => {
    if (!undoItem) return
    clearTimeout(undoItem.timer)
    onDeleteItem(c.id, undoItem.item.id)
    setUndoItem(null)
  }, [undoItem, c.id, onDeleteItem])

  const getVisibleItems = () => {
    let items = [...c.items]
    if (undoItem) items = items.filter(i => i.id !== undoItem.item.id)
    if (hideCompleted) items = items.filter(i => !i.completed)
    return items
  }

  const visibleItems = getVisibleItems()
  const completedCount = c.items.filter(i => i.completed).length

  return (
    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
      {/* Hide completed toggle */}
      {completedCount > 0 && (
        <div className="flex items-center justify-end mb-2">
          <button onClick={() => setHideCompleted(!hideCompleted)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <span className="material-symbols-outlined text-xs">{hideCompleted ? 'visibility' : 'visibility_off'}</span>
            {hideCompleted ? `Show completed (${completedCount})` : 'Hide completed'}
          </button>
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3">
          {hideCompleted ? 'All items completed!' : 'No items yet — add one below'}
        </p>
      ) : (
        <div className="space-y-1">
          {visibleItems.map((item, idx) => {
            const prio = priorityConfig[item.priority as Priority] || priorityConfig.normal
            return (
              <div key={item.id}>
                <div draggable onDragStart={() => { dragItem.current = idx }}
                  onDragEnter={() => { dragOver.current = idx }} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                  className={`flex items-center gap-2.5 py-1.5 group/item ${item.completed ? 'opacity-60' : ''}`}>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 cursor-grab text-xs">drag_indicator</span>
                  <button onClick={() => onToggleItem(c.id, item)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}>
                    {item.completed && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </button>
                  {editingId === item.id ? (
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus
                      onBlur={() => saveEdit(item)} onKeyDown={e => { if (e.key === 'Enter') saveEdit(item); if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 text-sm px-1 py-0.5 bg-transparent border-b-2 border-primary focus:outline-none text-slate-900 dark:text-white" />
                  ) : (
                    <span onDoubleClick={() => startEdit(item)}
                      className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.title}
                    </span>
                  )}
                  <button onClick={() => { setNotesId(notesId === item.id ? null : item.id); setNotesValue(item.notes || '') }}
                    title={item.notes || 'Add notes'}
                    className={`p-0.5 transition-opacity ${item.notes ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover/item:opacity-100'}`}>
                    <span className="material-symbols-outlined text-xs">sticky_note_2</span>
                  </button>
                  <button onClick={() => {
                      const next: Record<string, Priority> = { normal: 'high', high: 'low', low: 'normal' }
                      onUpdateItem(c.id, item, { priority: next[item.priority] || 'normal' })
                    }} title={`Priority: ${item.priority}`}
                    className={`material-symbols-outlined text-xs cursor-pointer hover:scale-125 transition-transform ${prio.class}`}>{prio.icon}</button>
                  <button onClick={() => startEdit(item)}
                    className="p-0.5 text-slate-300 hover:text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => onCreateReminder(c.id, item)} title="Set reminder"
                    className="p-0.5 text-slate-300 hover:text-amber-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">notifications</span>
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)}
                    className="p-0.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                {/* Notes editor */}
                {notesId === item.id && (
                  <div className="ml-10 mt-1 mb-2">
                    <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} rows={2} placeholder="Add notes..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => { onUpdateItem(c.id, item, { notes: notesValue || null }); setNotesId(null) }}
                        className="px-3 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
                      <button onClick={() => setNotesId(null)}
                        className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <InlineItemInput onAdd={(title, priority) => onAddItem(c.id, title, priority)} />

      {undoItem && <UndoToast message={`"${undoItem.item.title}" deleted`} onUndo={handleUndo} onClose={dismissUndo} />}
    </div>
  )
}

// --- Main Component ---
export default function ChecklistList({
  checklists, categories, filter, categoryFilter, expandedId, search, sort,
  onSearchChange, onSortChange,
  onFilterChange, onCategoryFilterChange, onToggleExpand, onEdit, onNew, onDuplicate, onDelete,
  onToggleItem, onAddItem, onUpdateItem, onDeleteItem, onReorder, onCreateReminder,
}: Props) {
  const [undoChecklist, setUndoChecklist] = useState<{ checklist: Checklist; timer: NodeJS.Timeout } | null>(null)

  const handleDelete = (id: number) => {
    const cl = checklists.find(c => c.id === id)
    if (!cl) return
    if (undoChecklist) { clearTimeout(undoChecklist.timer); onDelete(undoChecklist.checklist.id) }
    const timer = setTimeout(() => { onDelete(id); setUndoChecklist(null) }, 5000)
    setUndoChecklist({ checklist: cl, timer })
  }

  const handleUndo = () => {
    if (!undoChecklist) return
    clearTimeout(undoChecklist.timer)
    setUndoChecklist(null)
  }

  const dismissUndo = useCallback(() => {
    if (!undoChecklist) return
    clearTimeout(undoChecklist.timer)
    onDelete(undoChecklist.checklist.id)
    setUndoChecklist(null)
  }, [undoChecklist, onDelete])

  let filtered = checklists.filter(c => {
    if (undoChecklist && c.id === undoChecklist.checklist.id) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter && c.categoryId !== categoryFilter) return false
    if (filter === 'all') return true
    const status = getStatus(c).label
    if (filter === 'active') return status === 'Active' || status.includes('left') || status === 'Upcoming'
    if (filter === 'expired') return status === 'Expired'
    if (filter === 'no-dates') return status === 'No dates'
    return true
  })

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title)
    if (sort === 'progress') return getProgress(b) - getProgress(a)
    if (sort === 'due-date') {
      const aEnd = a.endDate ? new Date(a.endDate).getTime() : Infinity
      const bEnd = b.endDate ? new Date(b.endDate).getTime() : Infinity
      return aEnd - bEnd
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Checklists</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{checklists.length} checklists</p>
        </div>
        <button onClick={onNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
          <span className="material-symbols-outlined text-sm">add</span>
          New Checklist
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input type="text" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search checklists..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400 text-sm" />
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map(f => (
          <button key={f.value} onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {f.label}
          </button>
        ))}
        {categories.length > 0 && (
          <select value={categoryFilter ?? ''} onChange={e => onCategoryFilterChange(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 focus:ring-2 focus:ring-primary">
            <option value="">All categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        )}
        <div className="ml-auto flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-slate-400">sort</span>
          <select value={sort} onChange={e => onSortChange(e.target.value as SortOption)}
            className="px-2 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 focus:ring-2 focus:ring-primary">
            {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">fact_check</span>
          <p className="text-slate-500 dark:text-slate-400 text-lg">{search ? 'No results' : 'No checklists yet'}</p>
          <p className="text-slate-400 dark:text-slate-500 mt-1">{search ? 'Try a different search' : 'Create one to get started'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(c => {
            const progress = getProgress(c)
            const status = getStatus(c)
            const isExpanded = expandedId === c.id
            return (
              <div key={c.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all ${isExpanded ? 'border-primary/40 shadow-sm' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="p-4 cursor-pointer group" onClick={() => onToggleExpand(c.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-sm text-slate-400 transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : '' }}>
                          chevron_right
                        </span>
                        {c.category && (
                          <span className="material-symbols-outlined text-sm" style={{ color: c.category.color }}>{c.category.icon}</span>
                        )}
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{c.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>{status.label}</span>
                      </div>
                      {c.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate ml-6">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={e => { e.stopPropagation(); onEdit(c) }} title="Edit"
                        className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={e => { e.stopPropagation(); onDuplicate(c.id) }} title="Duplicate"
                        className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(c.id) }} title="Delete"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 ml-6">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-16 text-right">
                      {c.items.filter(i => i.completed).length}/{c.items.length} ({progress}%)
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <ExpandedItems checklist={c}
                    onToggleItem={onToggleItem} onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem} onAddItem={onAddItem} onReorder={onReorder}
                    onCreateReminder={onCreateReminder} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {undoChecklist && <UndoToast message={`"${undoChecklist.checklist.title}" deleted`} onUndo={handleUndo} onClose={dismissUndo} />}
    </div>
  )
}
