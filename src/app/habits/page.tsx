'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import PlanningView from '@/components/PlanningView';
import ActionView from '@/components/ActionView';
import ArchiveView from '@/components/ArchiveView';
import { Habit, Category, Objective, HabitFormData, HabitState } from '@/types/habit';

type ViewTab = 'planning' | 'action' | 'archive';

export default function HabitsPage() {
    const [activeTab, setActiveTab] = useState<ViewTab>('action');
    const [habits, setHabits] = useState<Habit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchHabits = useCallback(async () => {
        try {
            setLoading(true);
            const [habitsRes, catsRes, objsRes] = await Promise.all([
                fetch('/api/habits'),
                fetch('/api/habits/categories'),
                fetch('/api/habits/objectives'),
            ]);

            if (!habitsRes.ok) throw new Error('Failed to fetch habits');
            if (!catsRes.ok) throw new Error('Failed to fetch categories');
            if (!objsRes.ok) throw new Error('Failed to fetch objectives');

            const [habitsData, catsData, objsData] = await Promise.all([
                habitsRes.json(),
                catsRes.json(),
                objsRes.json(),
            ]);

            setHabits(habitsData);
            setCategories(catsData);
            setObjectives(objsData);
            setError('');
        } catch (err) {
            setError('Error al cargar los datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleCreateHabit = async (data: HabitFormData) => {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create habit');
        await fetchHabits();
    };

    const handleUpdateHabit = async (id: number, data: HabitFormData) => {
        const response = await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update habit');
        await fetchHabits();
    };

    const handleDeleteHabit = async (id: number) => {
        const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete habit');
        setHabits((prev) => prev.filter((h) => h.id !== id));
    };

    const handleStateChange = async (id: number, state: HabitState) => {
        const response = await fetch(`/api/habits/${id}/state`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state }),
        });
        if (!response.ok) throw new Error('Failed to change state');
        await fetchHabits();
    };

    const handleToggleCompletion = async (id: number, date: string, completed: boolean) => {
        if (completed) {
            const response = await fetch(`/api/habits/${id}/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date }),
            });
            if (!response.ok) {
                const err = await response.json();
                alert(err.message || 'Error al completar');
                throw new Error(err.error);
            }
            const data = await response.json();
            await fetchHabits();
            return data;
        } else {
            const response = await fetch(`/api/habits/${id}/completions?date=${date}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete completion');
            await fetchHabits();
            return null;
        }
    };

    const tabs: { id: ViewTab; label: string; icon: string }[] = [
        { id: 'action', label: 'Acción', icon: 'bolt' },
        { id: 'planning', label: 'Planificación', icon: 'edit_calendar' },
        { id: 'archive', label: 'Archivo', icon: 'archive' },
    ];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-background-dark/40 border border-primary/10 rounded-2xl p-6 shadow-sm">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="text-center py-4 mb-4">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={fetchHabits}
                                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {activeTab === 'planning' && (
                        <PlanningView
                            habits={habits}
                            categories={categories}
                            objectives={objectives}
                            onCreate={handleCreateHabit}
                            onUpdate={handleUpdateHabit}
                            onDelete={handleDeleteHabit}
                            onStateChange={handleStateChange}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'action' && (
                        <ActionView
                            habits={habits}
                            onToggleCompletion={handleToggleCompletion}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'archive' && (
                        <ArchiveView
                            habits={habits}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
