## Why

The application has inconsistent styling across views (different colors, missing sidebar on todo list, layout variations). The login uses a poor green color, dark mode preference isn't persisted per-user, and pages like /todos lack the shared sidebar navigation.

## What Changes

- Add theme preference field to User model (light/dark/system)
- Create theme context and hook for React
- Add theme toggle control in Settings page
- Wrap authenticated pages with sidebar layout
- Standardize color palette (replace login green with primary blue)
- Make all authenticated views use consistent layout

## Capabilities

### New Capabilities
- `theme-preference`: User can select preferred theme (light/dark/system) stored in database
- `unified-layout`: All authenticated pages share the same sidebar layout

### Modified Capabilities
- None

## Impact

- Prisma: Add theme field to User model
- Frontend: ThemeContext, Settings update, layout wrapper
- API: Update user endpoint to save theme preference