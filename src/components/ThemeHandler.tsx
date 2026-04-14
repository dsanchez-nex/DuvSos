'use client';

import { useEffect } from 'react';

export default function ThemeHandler() {
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            const storedTheme = localStorage.getItem('app-theme');
            const theme = storedTheme || 'system';

            // Apply theme based on preference or system
            let isDark: boolean;
            if (theme === 'dark') {
                isDark = true;
            } else if (theme === 'light') {
                isDark = false;
            } else {
                // system
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();

        // Listen for localStorage changes
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'app-theme') {
                applyTheme();
            }
        };
        window.addEventListener('storage', handleStorage);

        // Listen for system theme changes if set to system
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            const storedTheme = localStorage.getItem('app-theme') || 'system';
            if (storedTheme === 'system') {
                applyTheme();
            }
        };
        mediaQuery.addEventListener('change', handleSystemChange);

        return () => {
            window.removeEventListener('storage', handleStorage);
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, []);

    return null;
}