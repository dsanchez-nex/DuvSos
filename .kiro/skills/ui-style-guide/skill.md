# UI Style Guide — DuvSos

## Stack

- Tailwind CSS v4 (no `tailwind.config` file)
- Dark mode via `@custom-variant dark` (class-based, not media query)
- Material Symbols Outlined (Google Fonts)
- Inter font family

---

## Dark Mode

Dark mode is toggled by adding/removing the `.dark` class on `<html>`.

CSS variables switch automatically:

```
:root        → --background: #ffffff; --foreground: #171717;
.dark        → --background: #111827; --foreground: #f3f4f6;
```

### Rules

- EVERY `bg-*`, `text-*`, `border-*` that uses a light color MUST have a `dark:` variant.
- NEVER use `@media (prefers-color-scheme: dark)` — the app uses class-based switching.
- NEVER use `bg-white` without `dark:bg-slate-800` (or similar).
- NEVER use `text-gray-800` without `dark:text-white` (or similar).

### Common Pairs

| Light | Dark |
|---|---|
| `bg-white` | `dark:bg-slate-800` |
| `bg-slate-50` | `dark:bg-slate-800/50` |
| `bg-slate-100` | `dark:bg-slate-700` |
| `text-slate-900` | `dark:text-white` |
| `text-slate-700` | `dark:text-slate-300` |
| `text-slate-500` | `dark:text-slate-400` |
| `border-slate-200` | `dark:border-slate-700` |
| `border-slate-100` | `dark:border-slate-700` |
| `hover:bg-slate-50` | `dark:hover:bg-slate-800/50` |

### Containers

- Page backgrounds: `bg-background-light dark:bg-background-dark`
- Cards/panels: `bg-white dark:bg-background-dark/40 border border-primary/10`
- Sidebar: `bg-white dark:bg-background-dark/50 border-r border-primary/10`
- Modals: `bg-white dark:bg-slate-800` with `bg-black/50` overlay

---

## Color Tokens

Defined in `globals.css` via `@theme inline`:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#3b82f6` | Buttons, links, active states, accents |
| `background-light` | `#f8f9fa` | Light mode page background |
| `background-dark` | `#111827` | Dark mode page background |

### Rules

- ALWAYS use `bg-primary` for primary buttons, NEVER `bg-blue-600` or `bg-blue-500`.
- ALWAYS use `hover:bg-primary/90` for primary button hover.
- Use `text-primary` for links and active navigation items.
- Use `bg-primary/10` for subtle active/selected backgrounds.
- Use `shadow-primary/20` for primary button shadows.

---

## Typography

- Font: Inter (loaded via Google Fonts in `layout.tsx`)
- Page titles: `text-3xl font-bold text-slate-900 dark:text-white`
- Section titles: `text-lg font-bold` or `text-2xl font-bold`
- Subtitles/descriptions: `text-slate-500 dark:text-slate-400`
- Small labels: `text-xs text-slate-500` or `text-[10px] uppercase font-bold text-slate-400`

---

## Components

### Buttons

Primary:
```
bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform
```

Secondary:
```
border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors
```

Danger:
```
border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-all
```

### Inputs

```
w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
```

For inputs inside settings/forms with lighter background:
```
bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none
```

### Cards (SettingCard pattern)

```
bg-white dark:bg-background-dark/50 border border-primary/10 rounded-xl p-6 shadow-sm
```

### Navigation Links (Sidebar)

Active:
```
bg-primary/10 text-primary
```

Inactive:
```
text-slate-500 hover:bg-primary/5 hover:text-primary
```

### Toggle Switches

```html
<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer" />
  <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all rounded-full"></div>
</label>
```

---

## Icons

- Use Material Symbols Outlined: `<span class="material-symbols-outlined">icon_name</span>`
- NEVER use inline SVGs for icons that exist in Material Symbols.
- SVGs are acceptable only for custom graphics (progress circles, charts).
- Default size inherits from text. Use `text-lg`, `text-sm`, etc. to size.

---

## Layout

- Sidebar: fixed, `w-20 lg:w-64`, left side
- Main content: `ml-20 lg:ml-64 p-4 lg:p-8`
- Max content width for forms/settings: `max-w-4xl`
- Max content width for single-column pages: `max-w-2xl`

---

## Feedback & Notifications

- NEVER use `alert()` or `confirm()` — use the `Toast` component (`src/components/Toast.tsx`).
- Toast types: `success` (green check) and `error` (red icon).
- Toast auto-dismisses in 3 seconds.
- Toast renders at `fixed top-6 right-6 z-50`.

---

## Responsive

- Mobile-first approach.
- Sidebar collapses to icon-only (`w-20`) on mobile, full (`w-64`) on `lg:`.
- Use `flex-col md:flex-row` or `grid-cols-1 md:grid-cols-2` for responsive layouts.
- Hide text labels on mobile sidebar: `hidden lg:block`.

---

## Anti-Patterns (DO NOT)

- ❌ `bg-gray-*` — use `bg-slate-*` for consistency
- ❌ `bg-blue-600` / `bg-blue-700` — use `bg-primary` / `hover:bg-primary/90`
- ❌ `text-gray-800` without dark variant
- ❌ `bg-white` without dark variant
- ❌ `alert()` or `confirm()` for user feedback
- ❌ `@media (prefers-color-scheme: dark)` in CSS
- ❌ Inline SVGs when a Material Symbol exists
- ❌ `bg-opacity-*` — use Tailwind v4 syntax: `bg-black/50`
- ❌ `text-background-dark` or `text-background-light` as text colors — these are background tokens
