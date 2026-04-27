'use client';

import { useEffect } from 'react';

export default function ThemeHandler() {
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            const storedTheme = localStorage.getItem('app-theme');
            const theme = storedTheme || 'system';

            let isDark: boolean;
            if (theme === 'dark') {
                isDark = true;
            } else if (theme === 'light') {
                isDark = false;
            } else {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }

            // Apply visual theme
            const storedVisual = localStorage.getItem('app-visual-theme') || 'classic';
            root.setAttribute('data-visual-theme', storedVisual);
        };

        applyTheme();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'app-theme' || e.key === 'app-visual-theme') {
                applyTheme();
            }
        };
        window.addEventListener('storage', handleStorage);

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
