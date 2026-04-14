'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}