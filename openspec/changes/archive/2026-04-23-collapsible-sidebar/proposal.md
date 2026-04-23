## Why

The current sidebar is always visible, consuming valuable screen space—especially on mobile devices where horizontal real estate is extremely limited. Users need the ability to collapse the sidebar to maximize content viewing area and improve usability on smaller screens.

## What Changes

- **Add a collapsible toggle mechanism** to the sidebar that allows users to expand or collapse it on demand.
- **Implement responsive behavior** where the sidebar is automatically collapsed (or hidden behind an overlay) on mobile viewports.
- **Add visual affordance** (e.g., a chevron or hamburger icon) to indicate the sidebar can be toggled.
- **Preserve sidebar state** (expanded/collapsed) across sessions where feasible (e.g., in local storage or user preferences).
- **Adjust main content layout** to dynamically expand when the sidebar is collapsed, reclaiming the freed horizontal space.

## Capabilities

### New Capabilities
- `collapsible-sidebar`: Toggle mechanism for expanding and collapsing the sidebar, with responsive mobile behavior and state persistence.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Frontend/UI**: Sidebar component and surrounding layout structure will require modifications to support collapsed state and dynamic width adjustments.
- **State management**: A mechanism to track and persist the sidebar toggle state (e.g., React state + localStorage).
- **Responsive styles**: CSS/layout changes to handle mobile breakpoints and overlay mode.
- **Accessibility**: Ensure toggle controls are keyboard-accessible and provide appropriate ARIA labels.
