## ADDED Requirements

### Requirement: All authenticated pages display sidebar
The system SHALL display the sidebar navigation on all authenticated pages including dashboard, habits, todos, and settings.

#### Scenario: Sidebar visible on dashboard
- **WHEN** user navigates to dashboard (/)
- **THEN** sidebar is displayed on the left side

#### Scenario: Sidebar visible on todos page
- **WHEN** user navigates to /todos
- **THEN** sidebar is displayed on the left side

### Requirement: Sidebar has consistent links
The system SHALL show the same navigation links in the sidebar across all authenticated pages.

#### Scenario: Consistent navigation links
- **WHEN** user is on any authenticated page
- **THEN** sidebar shows: Dashboard, To-Do List, Finances, Reminders, Habits, Settings

### Requirement: Sidebar shows active page highlight
The system SHALL highlight the current page in the sidebar navigation.

#### Scenario: Active page highlighted
- **WHEN** user is on /todos page
- **THEN** the "To-Do List" link in sidebar is highlighted as active