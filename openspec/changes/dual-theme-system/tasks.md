## 1. Design Token Foundation

- [ ] 1.1 Audit current stylesheets and extract Classic design tokens (colors, typography, spacing, radii, shadows)
- [ ] 1.2 Create CSS custom properties file for Classic tokens mapped to `data-theme="classic"`
- [ ] 1.3 Define Modern design tokens (updated palette, refined type scale, larger radii, softer shadows)
- [ ] 1.4 Create CSS custom properties file for Modern tokens mapped to `data-theme="modern"`
- [ ] 1.5 Add lint rule to forbid hardcoded color/spacing literals in styles (where feasible)

## 2. Theme Engine & Settings

- [ ] 2.1 Implement synchronous theme hydration script in HTML `<head>` to read localStorage and set `data-theme` before React loads
- [ ] 2.2 Create ThemeContext/Provider to manage active theme in React
- [ ] 2.3 Add theme toggle/select component to Settings page with Classic and Modern options
- [ ] 2.4 Persist theme selection to localStorage and sync to backend user settings
- [ ] 2.5 Ensure theme preference loads correctly on subsequent visits without flash of wrong theme

## 3. Component Migration

- [ ] 3.1 Migrate global layout components (app shell, sidebar, header) to use design tokens
- [ ] 3.2 Migrate dashboard components to use design tokens
- [ ] 3.3 Migrate habits module components to use design tokens
- [ ] 3.4 reminders module components to use design tokens
- [ ] 3.5 Migrate checklists and todos components to use design tokens
- [ ] 3.6 Migrate shared UI primitives (buttons, inputs, cards, badges, modals) to use design tokens
- [ ] 3.7 Add CSS transition for color/shadow properties when theme switches

## 4. Style Guides Documentation

- [ ] 4.1 Write `docs/style-guide-classic.md` documenting Classic tokens, colors, typography, spacing, radii, shadows, and component patterns
- [ ] 4.2 Write `docs/style-guide-modern.md` documenting Modern tokens, colors, typography, spacing, radii, shadows, and component patterns
- [ ] 4.3 Include usage examples and do/don't rules in both guides
- [ ] 4.4 Add a note in both guides explaining how to implement new features consistently in either theme

## 5. Testing & Rollout

- [ ] 5.1 Verify Classic theme renders identically to pre-change production (pixel/behavior parity)
- [ ] 5.2 Verify Modern theme renders correctly across all major views
- [ ] 5.3 Test theme toggle in Settings and confirm immediate application
- [ ] 5.4 Test persistence: reload page, verify saved theme loads correctly
- [ ] 5.5 Test cross-device sync: change theme on one device, verify on another after login
- [ ] 5.6 Run visual regression tests or manual QA on both themes
- [ ] 5.7 Release with Classic as default
