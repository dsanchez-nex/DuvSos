## Why

The current application uses a single visual style that may feel dated to some users while others prefer its familiarity. To cater to both audiences and modernize the product without alienating existing users, we need a dual-theme system that allows switching between a preserved Classic style and a new Modern style directly from Settings.

## What Changes

- **Introduce a theme toggle system** in Settings that lets users switch between "Classic" and "Modern" themes. The preference is persisted per user.
- **Preserve the Classic theme** as the existing visual style with no functional changes, ensuring backward compatibility for users who prefer it.
- **Implement a Modern theme** featuring a contemporary design language: refined spacing, modern typography, rounded corners, subtle shadows, updated color palette, and smooth transitions.
- **Apply theming globally** so all components (sidebar, dashboard, habits, reminders, checklists, todos) render correctly in both themes.
- **Create two living style guides** (one per theme) that document design tokens, component patterns, and usage rules so any future AI or developer can implement new features consistently in either style.

## Capabilities

### New Capabilities
- `theme-toggle-system`: User preference mechanism to switch between Classic and Modern themes, persisted in settings.
- `modern-theme-application`: Global application of the Modern visual style across all UI components.
- `classic-theme-preservation`: Maintenance of the existing Classic visual style as a fully supported alternative.
- `theme-style-guides`: Documented design tokens and component guidelines for both Classic and Modern themes to guide future implementations.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Frontend/UI**: All components need to be audited and updated to respond to the active theme. New CSS/SCSS/design token structure required.
- **State management**: User settings extended with a theme preference field; theme context/provider added to the React tree.
- **Settings module**: New theme selector control added to the Settings page.
- **Documentation**: Two style guide markdown files created in the project to serve as references for future AI agents and developers.
