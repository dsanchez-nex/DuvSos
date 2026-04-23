## ADDED Requirements

### Requirement: Theme selection in settings
The system SHALL provide a theme selector in the Settings page allowing users to choose between "Classic" and "Modern".

#### Scenario: Changing theme to Modern
- **WHEN** a user selects "Modern" in the theme dropdown
- **THEN** the application immediately applies the Modern theme across all components

#### Scenario: Changing theme to Classic
- **WHEN** a user selects "Classic" in the theme dropdown
- **THEN** the application immediately applies the Classic theme across all components

### Requirement: Theme persistence
The system SHALL persist the user's theme preference in localStorage and synchronize it with the user's backend settings.

#### Scenario: Theme survives page reload
- **WHEN** a user sets the theme to "Modern" and reloads the page
- **THEN** the application loads with the Modern theme already applied

#### Scenario: Theme syncs across devices
- **WHEN** a user changes the theme on Device A
- **THEN** the preference is saved to the backend and reflected on Device B after login

### Requirement: No flash of un-themed content
The system SHALL apply the saved theme before any UI is rendered to prevent a flash of the wrong theme.

#### Scenario: Initial page load
- **WHEN** a user opens the application with "Modern" saved as preference
- **THEN** the theme is applied synchronously in the document head before React hydration
