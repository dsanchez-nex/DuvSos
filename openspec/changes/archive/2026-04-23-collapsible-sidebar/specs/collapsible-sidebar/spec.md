## ADDED Requirements

### Requirement: Sidebar toggle control
The system SHALL provide a visible control that allows the user to expand or collapse the sidebar.

#### Scenario: Toggling sidebar closed
- **WHEN** a user clicks the sidebar toggle control while the sidebar is expanded
- **THEN** the sidebar collapses and the main content area expands to reclaim the space

#### Scenario: Toggling sidebar open
- **WHEN** a user clicks the sidebar toggle control while the sidebar is collapsed
- **THEN** the sidebar expands and the main content area adjusts accordingly

### Requirement: Mobile overlay behavior
On viewports at or below 768px, the system SHALL render the sidebar as a hidden overlay that slides in when triggered and closes when the user selects a link or taps outside.

#### Scenario: Opening sidebar on mobile
- **WHEN** a user taps the menu icon on a mobile viewport
- **THEN** the sidebar slides in as an overlay above the main content

#### Scenario: Closing sidebar on mobile via backdrop
- **WHEN** a user taps outside the sidebar overlay
- **THEN** the sidebar closes and the overlay disappears

### Requirement: Sidebar state persistence
The system SHALL persist the user's sidebar expanded/collapsed preference across page reloads using local storage.

#### Scenario: Remembering collapsed state after reload
- **WHEN** a user collapses the sidebar and then reloads the page
- **THEN** the sidebar loads in the collapsed state

### Requirement: Accessibility of sidebar toggle
The sidebar toggle control SHALL be keyboard accessible and provide appropriate ARIA attributes indicating the current state.

#### Scenario: Keyboard toggle
- **WHEN** a user focuses the sidebar toggle and presses Enter or Space
- **THEN** the sidebar toggles between expanded and collapsed states

#### Scenario: Screen reader state announcement
- **WHEN** a screen reader user focuses the sidebar toggle
- **THEN** the toggle announces whether the sidebar is expanded or collapsed
