import React from 'react';

export default function RightSidebar() {
    return (
        <aside className="w-full lg:w-80 space-y-6">
            <div className="score-widget text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-primary)]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-4">Daily Productivity Score</p>
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-bold">84</span>
                    <div className="flex flex-col">
                        <span className="text-emerald-400 text-xs font-bold">↑ 12%</span>
                        <span className="text-slate-400 text-[10px]">vs yesterday</span>
                    </div>
                </div>
                <p className="text-slate-400 text-xs mb-6">You're more productive than 88% of DuvSos users today!</p>
                <button className="btn-neon w-full py-2.5 rounded-xl text-sm font-bold transition-all">See Detailed Report</button>
            </div>

            <div className="dashboard-card rounded-2xl p-6">
                <h3 className="card-title font-bold mb-4">Upcoming Reminders</h3>
                <div className="space-y-4">
                    <div className="flex gap-3 items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="card-title text-xs font-bold truncate">Dentist Appointment</h4>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">Today, 2:30 PM</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm">notifications</span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="card-title text-xs font-bold truncate">Project Sync</h4>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">Tomorrow, 10:00 AM</p>
                        </div>
                    </div>
                </div>
                <button className="w-full mt-4 py-2 text-[var(--color-text-muted)] font-bold text-xs hover:text-[var(--color-primary)] transition-colors">+ Set Reminder</button>
            </div>

            <div className="dashboard-card rounded-2xl p-6">
                <h3 className="card-title font-bold mb-6">Overall Goals</h3>
                <div className="flex items-center justify-center py-4 relative">
                    <svg className="w-32 h-32 -rotate-90">
                        <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                        <circle className="text-[var(--color-primary)]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeDashoffset="110" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="card-title text-2xl font-bold">68%</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Completed</span>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
                        <span>Habits</span>
                        <span>90%</span>
                    </div>
                    <div className="progress-track w-full h-1 rounded-full">
                        <div className="progress-fill bg-[var(--color-primary)] h-full rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)] uppercase pt-2">
                        <span>Tasks</span>
                        <span>45%</span>
                    </div>
                    <div className="progress-track w-full h-1 rounded-full">
                        <div className="progress-fill bg-amber-400 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
