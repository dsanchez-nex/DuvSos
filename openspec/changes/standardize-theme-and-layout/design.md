## Context

The DuvSos app uses Tailwind CSS with CSS variables for theming. Currently has ThemeHandler component and a basic layout. Login page uses inconsistent colors (green tones vs blue primary). The /todos page lacks sidebar navigation that other pages have.

## Goals / Non-Goals

**Goals:**
- Unified theme system with light/dark/system modes persisted per user
- Consistent sidebar on all authenticated pages (dashboard, habits, todos, settings)
- Standardized color palette across all views (use primary blue consistently)

**Non-Goals:**
- Multiple color themes - only light/dark
- Custom accent colors per user
- Complex layout options

## Decisions

### Decision 1: Theme stored in User model
**Rationale:** Persists across devices, follows existing User model pattern

**Alternative considered:** localStorage only - rejected because user wants cross-device consistency

### Decision 2: theme field with enum values 'light' | 'dark' | 'system'
**Rationale:** Simple, supports system preference detection via media query

### Decision 3: Create layout.tsx in app directory
**Rationale:** Next.js layout.tsx wraps all authenticated pages automatically

### Decision 4: Use CSS variables for theme colors
**Rationale:** Allows runtime theme switching without rebuild, existing CSS variables in globals.css

## Risks / Trade-offs

[Risk] Theme flash on load → Apply theme in middleware or initial SSR
[Risk] Login page needs different layout (no sidebar) → Use separate layout or conditional wrapper

## Migration Plan

1. Add theme field to User model
2. Update User API to handle theme preference
3. Create/use ThemeContext for theme state
4. Apply theme class to root element
5. Create layout wrapper for authenticated pages
6. Update Settings to include theme toggle
7. Verify all pages use consistent sidebar