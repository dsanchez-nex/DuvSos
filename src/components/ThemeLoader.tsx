'use client';

import { useEffect, useState } from 'react';

export default function ThemeLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        const userTheme = data.user?.theme || 'system';
        const userVisualTheme = data.user?.visualTheme || 'classic';

        if (['light', 'dark', 'system'].includes(userTheme)) {
          localStorage.setItem('app-theme', userTheme);

          const root = document.documentElement;
          let isDark: boolean;
          if (userTheme === 'dark') {
            isDark = true;
          } else if (userTheme === 'light') {
            isDark = false;
          } else {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          }

          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }

        // Apply visual theme (classic / retrofuturista)
        localStorage.setItem('app-visual-theme', userVisualTheme);
        const root = document.documentElement;
        root.setAttribute('data-visual-theme', userVisualTheme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
      setReady(true);
    };

    loadTheme();
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
