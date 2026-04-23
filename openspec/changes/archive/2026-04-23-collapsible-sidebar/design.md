## Context

The current sidebar is a persistent, fixed-width navigation panel. On desktop it always occupies horizontal space, and on mobile it can severely limit the usable content area. Users have requested the ability to hide it on demand to maximize the viewport for the main content.

## Goals / Non-Goals

**Goals:**
- Allow users to toggle the sidebar between expanded and collapsed states.
- Automatically adapt sidebar behavior on mobile (overlay or hidden by default).
- Persist the user's preferred state across reloads.
- Maintain full accessibility and keyboard navigability.

**Non-Goals:**
- Redesigning the sidebar content or navigation items.
- Introducing multiple sidebar sizes or resizable width.
- Changing the routing or page structure.

## Decisions

1. **State managed via React context + localStorage**
   - *Rationale*: The sidebar state is needed by the sidebar component and the main layout wrapper. A lightweight context avoids prop drilling. localStorage ensures the preference survives reloads.
   - *Alternative considered*: URL query parameter — rejected because it pollutes the URL and is unnecessary for a UI preference.

2. **Collapsed sidebar renders as a narrow rail (icons only) on desktop**
   - *Rationale*: Completely hiding the sidebar could disorient users; a narrow rail preserves quick navigation while reclaiming most of the space.
   - *Alternative considered*: Fully hidden with a floating toggle — acceptable but less discoverable; rail is the primary desktop behavior.

3. **Mobile sidebar renders as a slide-out overlay**
   - *Rationale*: On small screens, a rail still consumes space. An overlay triggered by a hamburger icon maximizes content area and follows mobile conventions.
   - *Alternative considered*: Same rail behavior as desktop — rejected because mobile viewports are too narrow.

4. **CSS transitions for smooth expand/collapse**
   - *Rationale*: Immediate jumps feel jarring. A 200–300ms width/translate transition improves perceived quality.
   - *Alternative considered*: No animation — simpler but poorer UX.

5. **Breakpoint at 768px for mobile behavior**
   - *Rationale*: Standard tablet/mobile breakpoint used in the existing codebase. Keeps consistency with other responsive patterns.

## Risks / Trade-offs

- **Accessibility risk**: Collapsing the sidebar could hide navigation from screen readers if not handled properly.
  - *Mitigation*: Use `aria-expanded`, `aria-controls`, and ensure focus moves into the sidebar when opened on mobile.

- **Layout shift risk**: Rapid toggling or animation glitches could cause content reflow issues.
  - *Mitigation*: Use fixed widths for rail and expanded states, and test with reduced-motion preferences.

- **State inconsistency risk**: If localStorage is unavailable or cleared, the default state should be sensible.
  - *Mitigation*: Default to expanded on desktop, hidden on mobile.

## Migration Plan

1. Implement the toggle state context and hook.
2. Update the sidebar component to support collapsed, expanded, and mobile overlay modes.
3. Update the main layout to adjust content width based on sidebar state.
4. Add the toggle button to the header or sidebar edge.
5. Verify responsive behavior across breakpoints.

## Open Questions

- Should the collapsed state be synced across tabs in real time (e.g., via `storage` event)?
- Should there be an option to completely disable the collapsible behavior per user preference?
