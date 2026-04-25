'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Habit } from '@/types/habit';
import { Checklist } from '@/types/checklist';
import { Reminder } from '@/types/reminder';
import { getTodayDateString, isCompletedOnDate } from '@/lib/habit-utils';

const DEFAULT_CARD_LIMIT = 4;

function getChecklistProgress(c: Checklist) {
    const items = Array.isArray(c.items) ? c.items : [];
    if (items.length === 0) return 0;
    return Math.round((items.filter(i => i.completed).length / items.length) * 100);
}

function getDueBadge(dateStr: string) {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { text: 'Overdue', class: 'text-red-500' };
    if (diff === 0) return { text: 'Today', class: 'text-amber-600' };
    if (diff === 1) return { text: 'Tomorrow', class: 'text-amber-500' };
    return { text: `${diff}d left`, class: 'text-slate-500' };
}

export default function DashboardContent() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [cardLimit, setCardLimit] = useState(DEFAULT_CARD_LIMIT);

    useEffect(() => {
        // Read dynamic limit from localStorage
        const savedLimit = localStorage.getItem('dashboard-card-limit');
        if (savedLimit) setCardLimit(parseInt(savedLimit));

        const fetchData = async () => {
            try {
                const [habitsRes, checklistsRes, remindersRes] = await Promise.all([
                    fetch('/api/habits'),
                    fetch('/api/checklists'),
                    fetch('/api/reminders'),
                ]);
                if (habitsRes.ok) setHabits(await habitsRes.json());
                if (checklistsRes.ok) setChecklists(await checklistsRes.json());
                if (remindersRes.ok) setReminders(await remindersRes.json());
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleCompletion = async (id: number, completed: boolean) => {
        const date = getTodayDateString();
        try {
            if (completed) {
                const response = await fetch(`/api/habits/${id}/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date }),
                });
                if (response.ok) {
                    const newCompletion = await response.json();
                    setHabits(habits.map(h =>
                        h.id === id ? { ...h, completions: [...h.completions, newCompletion] } : h
                    ));
                }
            } else {
                const response = await fetch(`/api/habits/${id}/completions?date=${date}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setHabits(habits.map(h =>
                        h.id === id ? {
                            ...h,
                            completions: h.completions.filter(c => new Date(c.date).toISOString().split('T')[0] !== date)
                        } : h
                    ));
                }
            }
        } catch (error) {
            console.error('Error toggling completion', error);
        }
    };

    const todayDate = getTodayDateString();

    // Calculate Monthly Stats
    const getMonthlyStats = (habit: Habit) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const completionsInMonth = habit.completions.filter(c => {
            const d = new Date(c.date);
            // Verify date parsing handles timezone correctly or use string comparison if ISO
            // Since c.date is ISO string, new Date(c.date) works.
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        return { completions: completionsInMonth, total: daysInMonth };
    };

    const displayedHabits = habits.slice(0, cardLimit);
    const remainingCount = Math.max(0, habits.length - cardLimit);

    return (
        <div className="flex-1 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Central Hub 👋</h1>
                    <p className="text-[var(--color-text-secondary)]">Wednesday, October 25th • You have 6 tasks today</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-outline flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        Planner
                    </button>
                    <button className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Quick Add
                    </button>
                </div>
            </header>

            {/* Active Checklists */}
            <div className="dashboard-card rounded-2xl p-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[var(--color-primary)]">fact_check</span>
                        Active Checklists
                    </h2>
                    <Link href="/checklists" className="text-xs font-bold text-[var(--color-primary)] hover:underline">View All</Link>
                </div>
                {checklists.filter(c => {
                    const progress = getChecklistProgress(c);
                    return progress < 100;
                }).length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No active checklists</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {checklists.filter(c => getChecklistProgress(c) < 100).slice(0, 6).map(c => {
                            const progress = getChecklistProgress(c);
                            const items = Array.isArray(c.items) ? c.items : [];
                            const completed = items.filter(i => i.completed).length;
                            return (
                                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.title}</p>
                                        <span className="text-xs text-[var(--color-text-secondary)]">{completed}/{c.items.length}</span>
                                    </div>
                                    <div className="progress-track h-1.5 rounded-full overflow-hidden">
                                        <div className="progress-fill h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: c.color }} />
                                    </div>
                                    {c.endDate && (
                                        <p className={`text-[10px] mt-1 ${getDueBadge(c.endDate).class}`}>
                                            {getDueBadge(c.endDate).text}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Habit Tracker */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-lg font-bold flex items-center gap-2">
                        Habit Tracker
                        {remainingCount > 0 && (
                            <span className="text-xs font-normal px-2 py-0.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full">{remainingCount} more</span>
                        )}
                    </h2>
                    <Link href="/habits" className="text-sm font-medium text-[var(--color-primary)] hover:underline">Edit Habits</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {loading ? (
                        <div className="w-full text-center py-4 text-[var(--color-text-secondary)]">Loading habits...</div>
                    ) : displayedHabits.length === 0 ? (
                        <div className="w-full text-center py-4 text-[var(--color-text-secondary)]">No habits found. <Link href="/habits" className="text-[var(--color-primary)] hover:underline">Add one?</Link></div>
                    ) : (
                        displayedHabits.map(habit => {
                            const isCompleted = isCompletedOnDate(habit.completions, todayDate);
                            const stats = getMonthlyStats(habit);
                            const percent = Math.min(100, (stats.completions / stats.total) * 100);
                            const circumference = 2 * Math.PI * 28; // r=28
                            const offset = circumference - (percent / 100) * circumference;

                            return (
                                <div key={habit.id} className={`habit-card min-w-[200px] border p-5 rounded-2xl flex flex-col items-center group transition-colors cursor-pointer ${isCompleted ? 'active' : ''}`}>
                                    <div className="relative w-16 h-16 mb-4">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle className={isCompleted ? "text-white/20" : "text-slate-100 dark:text-slate-800"} cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                                            <circle className={isCompleted ? "text-white" : "text-[var(--color-primary)]"} cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={offset} strokeWidth="4"></circle>
                                        </svg>
                                        <span className={`material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isCompleted ? 'text-white' : 'text-[var(--color-primary)]'}`}>verified</span>
                                    </div>
                                    <h3 className={`font-bold mb-1 text-sm text-center ${isCompleted ? 'text-white' : 'card-title'}`}>{habit.title}</h3>
                                    <p className={`text-[10px] mb-4 ${isCompleted ? 'text-white/80' : 'card-label'}`}>{stats.completions} / {stats.total} days</p>

                                    {isCompleted ? (
                                        <button onClick={() => handleToggleCompletion(habit.id, false)}>
                                            <span className="material-symbols-outlined text-2xl text-white">check_circle</span>
                                        </button>
                                    ) : (
                                        <input
                                            type="checkbox"
                                            className="w-6 h-6 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                            checked={false}
                                            onChange={() => handleToggleCompletion(habit.id, true)}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Upcoming Reminders */}
            {reminders.filter(r => !r.completed).length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[var(--color-primary)]">notifications_active</span>
                            Upcoming Reminders
                        </h2>
                        <Link href="/reminders" className="text-sm font-medium text-[var(--color-primary)] hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {reminders.filter(r => !r.completed).slice(0, 3).map(r => {
                            const due = getDueBadge(r.dueDate);
                            return (
                                <div key={r.id} className="dashboard-card flex items-center gap-3 p-4 rounded-xl">
                                    <span className={`material-symbols-outlined text-lg ${r.priority === 'high' ? 'text-red-500' : r.priority === 'low' ? 'text-blue-400' : 'text-amber-500'}`}>
                                        {r.priority === 'high' ? 'priority_high' : 'schedule'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="card-title text-sm font-semibold truncate">{r.title}</p>
                                        <p className={`text-[10px] ${due.class}`}>{due.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
