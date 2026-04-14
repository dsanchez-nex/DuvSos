'use client';

import AppLayout from '@/components/AppLayout';
import HabitList from '@/components/HabitList';

export default function HabitsPage() {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Habit Management</h1>
                <div className="bg-white dark:bg-background-dark/40 border border-primary/10 rounded-2xl p-6 shadow-sm">
                    <HabitList />
                </div>
            </div>

            {/* Mobile Action Button */}
            <div className="fixed bottom-6 right-6 lg:hidden z-30">
                <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">bolt</span>
                </button>
            </div>
        </AppLayout>
    );
}