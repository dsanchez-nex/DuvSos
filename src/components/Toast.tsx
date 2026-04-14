'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
        isSuccess
          ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-800'
      }`}>
        <span className={`material-symbols-outlined text-lg ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {isSuccess ? 'check_circle' : 'error'}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
