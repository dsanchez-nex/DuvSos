# Theme System — DuvSos

## Architecture

The theme system has 3 components:

1. **ThemeLoader** (`src/components/ThemeLoader.tsx`) — Runs in root layout, fetches user theme from DB on mount, saves to localStorage, applies `.dark` class to `<html>`. Blocks rendering until theme is resolved (prevents flash).

2. **ThemeHandler** (`src/components/ThemeHandler.tsx`) — Listens for localStorage changes and system `prefers-color-scheme` changes. Keeps the `.dark` class in sync if theme changes from another tab or system preference changes while `system` mode is active.

3. **Settings page** (`src/app/settings/page.tsx`) — Reads initial theme from localStorage (set by ThemeLoader). Applies theme immediately on button click via `applyTheme()`. Persists to DB + localStorage on Save.

## Flow

```
Page Load:
  ThemeLoader → fetch /api/auth/me → get user.theme
    → localStorage.setItem('app-theme', theme)
    → apply .dark class to <html>
    → render children (ThemeHandler + page)

Theme Change (Settings):
  User clicks theme button
    → applyTheme() immediately toggles .dark class
    → User clicks Save
    → PATCH /api/auth/me with { theme }
    → localStorage.setItem('app-theme', theme)

Navigation:
  ThemeHandler reads localStorage on mount → applies .dark class
  (ThemeLoader already set it, ThemeHandler is a safety net)
```

## Storage

- **Database**: `User.theme` field — `'light' | 'dark' | 'system'` — source of truth
- **localStorage**: `app-theme` — synced from DB by ThemeLoader, used for instant access

## Rules for AI Agents

- NEVER add a new theme component. Use the existing 3.
- NEVER use `@media (prefers-color-scheme: dark)` in CSS — dark mode is class-based.
- When adding new pages, they automatically get theme support via the root layout (ThemeLoader + ThemeHandler).
- When adding new components, follow the dark mode pairs in the UI Style Guide skill.
- The `.dark` class is on `<html>`, not `<body>`.
- Theme values are: `'light'`, `'dark'`, `'system'` — no other values.
