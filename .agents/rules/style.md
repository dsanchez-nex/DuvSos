# Style Guide — Dual Theme System

> **MANDATORY RULE:** Every new UI component, page, or visual change MUST support **both** themes:
> - **Classic** (light + dark mode via `.dark` class)
> - **Retrofuturista** (dark-only neon sci-fi aesthetic via `data-visual-theme="retrofuturista"`)
>
> Never break Classic when adding Retrofuturista styling. Never add Retrofuturista-only visuals without the corresponding Classic fallback.

---

## 1. Architecture Overview

The theme system lives in a single file:

```
src/styles/themes.css
```

It has three layers:

| Layer | Selector | Purpose |
|-------|----------|---------|
| Base (Classic Light) | `:root` | Default light mode colors, shadows, typography |
| Classic Dark | `.dark` | Overrides for Tailwind dark mode (class-based) |
| Retrofuturista | `[data-visual-theme="retrofuturista"]` | Complete neon sci-fi override |

### How the active theme is applied

1. `data-visual-theme` is set on the `<html>` element by `ThemeHandler.tsx` / `ThemeLoader.tsx`
2. If `data-visual-theme="retrofuturista"` → Retrofuturista CSS rules take precedence
3. If `data-visual-theme="classic"` (or absent) → Classic rules apply; `.dark` class toggles light/dark
4. Retrofuturista is **always dark** — there is no light variant

---

## 2. Classic Theme

### 2.1 Description
Clean, professional, neutral aesthetic. Uses Tailwind's default slate/blue palette. Supports both light and dark mode via the `.dark` class on `<html>`.

### 2.2 Visual Characteristics
- **Light:** White backgrounds, slate borders, blue primary accent (`#3b82f6`)
- **Dark:** Slate-900 backgrounds, slate-700 borders, lighter blue accent (`#60a5fa`)
- **Radius:** Soft rounded corners (6–18px)
- **Shadows:** Subtle layered shadows for depth
- **Typography:** Inter font, neutral tracking

### 2.3 How to Apply
Use standard Tailwind utility classes. The CSS custom properties in `themes.css` are consumed by Tailwind via the `primary`, `background`, `foreground`, etc. tokens in `tailwind.config.ts`.

```tsx
// Classic card — works in both light and dark automatically
<div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
```

### 2.4 Key Tokens (Classic)

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg-base` | `#ffffff` | `#111827` |
| `--color-bg-surface` | `#f8f9fa` | `#1f2937` |
| `--color-primary` | `#3b82f6` | `#60a5fa` |
| `--color-text-primary` | `#171717` | `#f3f4f6` |
| `--color-text-secondary` | `#6b7280` | `#9ca3af` |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` |

---

## 3. Retrofuturista Theme

### 3.1 Description
Neon sci-fi aesthetic inspired by synthwave / cyberpunk. Deep space background, glowing cyan/magenta accents, grid overlay, angular typography. **Only dark mode.**

### 3.2 Visual Characteristics
- **Background:** Deep navy-black (`#0a0a12`) with subtle cyan grid overlay
- **Surface cards:** Dark raised panels (`#12121f`) with translucent cyan borders
- **Primary accent:** Neon cyan (`#00f0ff`) with glow effects
- **Secondary accents:** Neon magenta (`#ff00aa`), neon amber (`#ffea00`), neon green (`#39ff14`)
- **Glow effects:** All interactive elements have soft neon glows on hover/focus/active
- **Typography:** Orbitron font for headings (loaded from Google Fonts), Inter for body
- **Radius:** Slightly more angular than Classic (5–16px)
- **Grid overlay:** `body::before` renders a 40px cyan grid at 3% opacity

### 3.3 Editable Palette

Located at the top of the Retrofuturista block in `themes.css`:

```css
[data-visual-theme="retrofuturista"] {
  --rf-neon-cyan: #00f0ff;
  --rf-neon-magenta: #ff00aa;
  --rf-neon-amber: #ffea00;
  --rf-neon-green: #39ff14;
  --rf-deep-bg: #0a0a12;
  --rf-surface: #12121f;
  --rf-surface-hover: #1a1a2e;
  --rf-surface-elevated: #1e1e3a;
  --rf-text-primary: #e0e0ff;
  --rf-text-secondary: #8a8ab5;
  --rf-text-muted: #5a5a8a;
  --rf-border-glow: rgba(0, 240, 255, 0.25);
  --rf-danger: #ff3366;
  --rf-success: #39ff14;
  --rf-warning: #ffea00;
}
```

> **To change the palette:** edit ONLY these `--rf-*` variables. All component rules derive from them.

### 3.4 How to Apply

Retrofuturista styles are applied via **scoped CSS classes** that live in `themes.css` and are activated by the `[data-visual-theme="retrofuturista"]` ancestor selector.

**Step 1:** Add a semantic class name to the element in JSX.

```tsx
<div className="dashboard-card rounded-2xl p-6">
```

**Step 2:** Define the Retrofuturista override in `themes.css`.

```css
[data-visual-theme="retrofuturista"] .dashboard-card {
  background: var(--rf-surface) !important;
  border: 1px solid rgba(0, 240, 255, 0.12) !important;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(0, 240, 255, 0.05) !important;
}

[data-visual-theme="retrofuturista"] .dashboard-card:hover {
  border-color: rgba(0, 240, 255, 0.25) !important;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.08), inset 0 1px 0 rgba(0, 240, 255, 0.08) !important;
}
```

**Key rules:**
- Use `!important` in Retrofuturista rules to override Tailwind utilities
- Always preserve the Classic classes in JSX (e.g., `bg-white dark:bg-slate-800`)
- Use the CSS custom properties (`var(--rf-*)`) instead of hardcoding colors

---

## 4. CSS Class Naming Conventions

### 4.1 Semantic Component Classes
Add a short, descriptive class that identifies the component type. This makes the CSS rule scoped and self-documenting.

| Component Type | Example Class | Retrofuturista CSS Prefix |
|----------------|---------------|---------------------------|
| Card / Panel | `.dashboard-card` | `[data-visual-theme="retrofuturista"] .dashboard-card` |
| Button (primary) | `.btn-neon` | already global |
| Button (outline) | `.btn-outline` | already global |
| Input / Textarea | `.rf-input` | `[data-visual-theme="retrofuturista"] .rf-input` |
| Select dropdown | `.rf-select` | `[data-visual-theme="retrofuturista"] .rf-select` |
| Progress track | `.progress-track` | `[data-visual-theme="retrofuturista"] .progress-track` |
| Progress fill | `.progress-fill` | `[data-visual-theme="retrofuturista"] .progress-fill` |
| Modal / Dialog | `.delete-modal` | `[data-visual-theme="retrofuturista"] .delete-modal` |
| Empty state | `.empty-state` | `[data-visual-theme="retrofuturista"] .empty-state` |
| Badge (active) | `.badge-active` | `[data-visual-theme="retrofuturista"] .badge-active` |
| Badge (paused) | `.badge-paused` | `[data-visual-theme="retrofuturista"] .badge-paused` |
| Checkbox / Toggle | `.todo-checkbox` | `[data-visual-theme="retrofuturista"] .todo-checkbox` |
| Action button | `.todo-action-btn` | `[data-visual-theme="retrofuturista"] .todo-action-btn` |

### 4.2 Global Button Classes
These are reusable across any component:

```tsx
<button className="btn-neon">Primary Action</button>
<button className="btn-outline">Secondary Action</button>
```

Retrofuturista rules:
```css
[data-visual-theme="retrofuturista"] .btn-neon {
  background: linear-gradient(135deg, var(--rf-neon-cyan), var(--rf-neon-magenta)) !important;
  color: var(--rf-deep-bg) !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(255, 0, 170, 0.1) !important;
  border: none !important;
}

[data-visual-theme="retrofuturista"] .btn-outline {
  background: transparent !important;
  border: 1px solid rgba(0, 240, 255, 0.25) !important;
  color: var(--rf-neon-cyan) !important;
}
```

### 4.3 Page-Specific Classes
When a component is unique to a page, prefix the class with the page name to avoid collisions:

| Page | Example Classes |
|------|-----------------|
| Habits | `.habits-tabs`, `.habit-filter-btn`, `.habit-form-container` |
| Todos | `.todo-view-tabs`, `.todo-metric-card`, `.todo-search`, `.todo-item-card` |
| Checklists | `.checklist-tabs`, `.checklist-card`, `.checklist-mini-dashboard` |
| Reminders | `.reminder-filter-btn`, `.reminder-card`, `.reminder-modal` |

---

## 5. Full Component Examples

### 5.1 Card (Dashboard / Summary)

**JSX:**
```tsx
<div className="dashboard-card rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
  <h3 className="card-title text-lg font-bold text-slate-900 dark:text-white">Title</h3>
  <p className="card-label text-sm text-slate-500 dark:text-slate-400">Label</p>
</div>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .dashboard-card {
  background: var(--rf-surface) !important;
  border: 1px solid rgba(0, 240, 255, 0.12) !important;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(0, 240, 255, 0.05) !important;
}
[data-visual-theme="retrofuturista"] .dashboard-card:hover {
  border-color: rgba(0, 240, 255, 0.25) !important;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.08) !important;
}
[data-visual-theme="retrofuturista"] .dashboard-card .card-title {
  color: var(--rf-text-primary) !important;
}
[data-visual-theme="retrofuturista"] .dashboard-card .card-label {
  color: var(--rf-text-muted) !important;
}
```

### 5.2 Text Input

**JSX:**
```tsx
<input
  className="rf-input w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
  placeholder="Type here..."
/>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .rf-input {
  background: var(--rf-surface-elevated) !important;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  color: var(--rf-text-primary) !important;
  border-radius: var(--radius-md);
}
[data-visual-theme="retrofuturista"] .rf-input:focus {
  border-color: var(--rf-neon-cyan) !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15) !important;
  outline: none;
}
[data-visual-theme="retrofuturista"] .rf-input::placeholder {
  color: var(--rf-text-muted) !important;
}
```

### 5.3 Select Dropdown

**JSX:**
```tsx
<select className="rf-select w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
  <option>Option 1</option>
</select>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .rf-select {
  background: var(--rf-surface-elevated) !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  color: var(--rf-text-primary) !important;
  border-radius: var(--radius-md);
}
[data-visual-theme="retrofuturista"] .rf-select:focus {
  border-color: var(--rf-neon-cyan) !important;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15) !important;
  outline: none;
}
[data-visual-theme="retrofuturista"] .rf-select option {
  background: var(--rf-surface-elevated);
  color: var(--rf-text-primary);
}
```

### 5.4 Progress Bar

**JSX:**
```tsx
<div className="progress-track h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
  <div className="progress-fill h-full rounded-full" style={{ width: '75%', backgroundColor: '#00f0ff' }} />
</div>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .progress-track {
  background: rgba(0, 240, 255, 0.08) !important;
}
[data-visual-theme="retrofuturista"] .progress-fill {
  box-shadow: 0 0 8px currentColor !important;
}
```

### 5.5 Modal / Dialog

**JSX:**
```tsx
<div className="delete-modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="delete-modal bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm">
    <h4 className="text-lg font-bold">Confirm</h4>
    <button className="btn-danger">Delete</button>
    <button className="btn-outline">Cancel</button>
  </div>
</div>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .delete-modal-overlay {
  background: rgba(10, 10, 18, 0.85) !important;
}
[data-visual-theme="retrofuturista"] .delete-modal {
  background: var(--rf-surface) !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.1), 0 0 80px rgba(255, 0, 170, 0.05) !important;
}
[data-visual-theme="retrofuturista"] .delete-modal .btn-danger {
  background: var(--rf-danger) !important;
  color: var(--rf-deep-bg) !important;
  font-weight: 700;
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.3) !important;
}
```

### 5.6 Checkbox / Toggle

**JSX:**
```tsx
<button className={`todo-checkbox w-5 h-5 rounded-md border-2 ${completed ? 'todo-checkbox-checked bg-green-500 border-green-500' : 'border-slate-300'}`}>
  {completed && <span className="material-symbols-outlined text-white text-xs">check</span>}
</button>
```

**themes.css (Retrofuturista):**
```css
[data-visual-theme="retrofuturista"] .todo-checkbox {
  border-color: rgba(0, 240, 255, 0.3) !important;
  background: transparent !important;
}
[data-visual-theme="retrofuturista"] .todo-checkbox:hover {
  border-color: var(--rf-success) !important;
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.2) !important;
}
[data-visual-theme="retrofuturista"] .todo-checkbox-checked {
  background: var(--rf-success) !important;
  border-color: var(--rf-success) !important;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.35) !important;
}
```

---

## 6. Checklist for New Components

Before committing any new UI component, verify:

- [ ] **Classic Light** looks correct (white bg, slate borders, blue accent)
- [ ] **Classic Dark** looks correct (slate-800/900 bg, lighter borders, blue-400 accent)
- [ ] **Retrofuturista** looks correct (dark bg, cyan borders, glow effects)
- [ ] A semantic class name is added to the root element for Retrofuturista targeting
- [ ] The corresponding CSS rule exists in `themes.css` under the Retrofuturista block
- [ ] `!important` is used in Retrofuturista rules to override Tailwind utilities
- [ ] Colors are derived from `--rf-*` variables, never hardcoded
- [ ] Hover/focus/active states are styled for Retrofuturista
- [ ] Buttons use `.btn-neon` for primary actions and `.btn-outline` for secondary

---

## 7. Common Mistakes to Avoid

1. **Removing Classic classes from JSX.** Never delete `bg-white dark:bg-slate-800` etc. Retrofuturista uses `!important` to override them.
2. **Hardcoding Retrofuturista colors.** Always use `var(--rf-neon-cyan)`, not `#00f0ff`.
3. **Forgetting `!important`.** Tailwind utilities have high specificity; without `!important` the Retrofuturista rule may not win.
4. **Styling only one theme.** Every change must consider both Classic and Retrofuturista.
5. **Using `.dark` for Retrofuturista.** Retrofuturista does NOT use the `.dark` class. It uses `data-visual-theme="retrofuturista"`.
6. **Adding light-mode Retrofuturista.** There is no light Retrofuturista. Do not write `[data-visual-theme="retrofuturista"].light` rules.

---

## 8. Quick Reference: CSS Variables

### Classic (Base + Dark)
```css
var(--color-bg-base)
var(--color-bg-surface)
var(--color-bg-surface-hover)
var(--color-bg-input)
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-muted)
var(--color-primary)
var(--color-primary-hover)
var(--color-border)
var(--color-success)
var(--color-warning)
var(--color-danger)
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
```

### Retrofuturista (Palette)
```css
var(--rf-neon-cyan)        /* #00f0ff */
var(--rf-neon-magenta)     /* #ff00aa */
var(--rf-neon-amber)       /* #ffea00 */
var(--rf-neon-green)       /* #39ff14 */
var(--rf-deep-bg)          /* #0a0a12 */
var(--rf-surface)          /* #12121f */
var(--rf-surface-hover)    /* #1a1a2e */
var(--rf-surface-elevated) /* #1e1e3a */
var(--rf-text-primary)     /* #e0e0ff */
var(--rf-text-secondary)   /* #8a8ab5 */
var(--rf-text-muted)       /* #5a5a8a */
var(--rf-border-glow)      /* rgba(0,240,255,0.25) */
var(--rf-danger)           /* #ff3366 */
var(--rf-success)          /* #39ff14 */
var(--rf-warning)          /* #ffea00 */
```

### Retrofuturista (Mapped — same names as Classic)
```css
var(--color-bg-base)       /* → --rf-deep-bg */
var(--color-bg-surface)    /* → --rf-surface */
var(--color-primary)       /* → --rf-neon-cyan */
var(--color-text-primary)  /* → --rf-text-primary */
/* … etc. All Classic tokens are remapped in Retrofuturista */
```

---

## 9. File Locations

| File | Purpose |
|------|---------|
| `src/styles/themes.css` | All theme CSS (Classic base, Classic dark, Retrofuturista) |
| `src/app/layout.tsx` | Loads Google Fonts (Orbitron for Retrofuturista), sets `data-visual-theme` default |
| `src/components/ThemeHandler.tsx` | Switches theme attribute on `<html>` |
| `src/components/ThemeLoader.tsx` | Reads saved theme from user profile on mount |
| `src/app/settings/page.tsx` | Visual Style toggle UI (Classic / Retrofuturista) |
| `prisma/schema.prisma` | `User.visualTheme` field |
| `src/app/api/auth/me/route.ts` | Saves/loads `visualTheme` via PATCH |
| `tailwind.config.ts` | Maps CSS vars to Tailwind tokens (`primary`, `background`, etc.) |

---

## 10. Testing Both Themes

1. Open the app in **Classic Light** (default, no `.dark`)
2. Toggle **Classic Dark** (Settings → Dark Mode ON, Visual Style = Classic)
3. Toggle **Retrofuturista** (Settings → Visual Style = Retrofuturista)
4. Verify every page: Dashboard, Habits, Todos, Checklists, Reminders, Settings, Login
5. Check interactive states: hover, focus, active, disabled
6. Check modals, forms, selects, checkboxes, progress bars, badges

---

*Last updated: 2026-04-24*
*Applies to: all UI components, pages, and visual changes in this project*
