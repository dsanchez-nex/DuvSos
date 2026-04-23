## Context

The application currently ships with a single visual style. To modernize the product without forcing all users into a new look, we are introducing a dual-theme system where users can choose between Classic (current) and Modern (new) styles from Settings.

## Goals / Non-Goals

**Goals:**
- Enable seamless switching between Classic and Modern themes with immediate effect.
- Preserve the existing Classic theme exactly as it is today.
- Deliver a Modern theme with updated visual language (spacing, typography, radii, shadows, colors).
- Provide documented style guides for both themes to ensure future features are implemented consistently.

**Non-Goals:**
- Supporting more than two themes (Classic and Modern only).
- Per-component theme overrides (themes apply globally).
- Real-time collaborative theme switching.

## Decisions

1. **CSS Custom Properties (variables) for design tokens**
   - *Rationale*: CSS variables are framework-agnostic, work with Tailwind, SCSS, or plain CSS, and allow dynamic theme switching without reloading stylesheets. The theme is toggled by changing a `data-theme` attribute on the root element.
   - *Alternative considered*: Two separate compiled stylesheets — rejected because it requires downloading extra CSS and complicates caching.

2. **Theme preference persisted in localStorage and synced to user settings**
   - *Rationale*: localStorage gives instant application on load without waiting for an API call. Syncing to the backend ensures the preference survives across devices.
   - *Alternative considered*: Backend-only storage — rejected because it creates a flash of un-themed content on initial load.

3. **Modern theme defined by a new set of design tokens, not duplicated components**
   - *Rationale*: Component structure (HTML/JSX) stays the same; only the token values change. This minimizes maintenance overhead and bug surface area.
   - *Alternative considered*: Separate component files per theme — rejected because it doubles the component count and invites drift.

4. **Style guides stored as markdown files in the repository**
   - *Rationale*: Keeping guides in version control alongside the code ensures they stay current. Future AI agents can read them directly from the repo.
   - *Alternative considered*: External documentation tool — rejected because it adds friction and can become out of sync.

5. **Classic theme tokens extracted from current styles to match existing behavior exactly**
   - *Rationale*: To ensure true preservation, we first extract the current colors, spacing, and typography into token variables before adding the Modern set.

## Risks / Trade-offs

- **Maintenance burden risk**: Every new component or style change must consider both themes.
  - *Mitigation*: Enforce the style guides via code review and lint rules. Keep the guides concise and actionable.

- **Inconsistency risk**: Developers might hardcode colors instead of using tokens, breaking one theme.
  - *Mitigation*: Add a lint rule that forbids literal color values in styles (where feasible) and require token usage.

- **Flash of un-themed content (FOUC) risk**: If the theme is applied too late, users see the wrong theme briefly.
  - *Mitigation*: Read localStorage and set the `data-theme` attribute in a synchronous script in the HTML `<head>` before React hydrates.

## Migration Plan

1. Audit current styles and extract Classic design tokens.
2. Define Modern design tokens.
3. Implement theme provider and Settings toggle.
4. Migrate components to use tokens instead of hardcoded values.
5. Write Classic and Modern style guides.
6. Release with Classic as default; Modern available via Settings.

## Open Questions

- Should the Modern theme include a dark mode variant in addition to light?
- Should the theme transition animate smoothly (e.g., 200ms color transition) or switch instantly?
