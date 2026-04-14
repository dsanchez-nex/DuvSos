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
        
        // Store in localStorage for ThemeHandler to use
        if (userTheme && ['light', 'dark', 'system'].includes(userTheme)) {
          localStorage.setItem('app-theme', userTheme);
        }
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