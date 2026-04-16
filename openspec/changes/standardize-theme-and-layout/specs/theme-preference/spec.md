## ADDED Requirements

### Requirement: User can select theme preference
The system SHALL allow authenticated users to select their preferred theme from light, dark, or system options.

#### Scenario: Select light theme
- **WHEN** user selects "Light" theme in settings
- **THEN** the application displays in light mode with light background and dark text

#### Scenario: Select dark theme
- **WHEN** user selects "Dark" theme in settings
- **THEN** the application displays in dark mode with dark background and light text

#### Scenario: Select system theme
- **WHEN** user selects "System" theme in settings
- **THEN** the application follows the device's system preference

### Requirement: Theme persists across sessions
The system SHALL save the user's theme preference in the database and apply it on subsequent logins.

#### Scenario: Theme persists after logout and login
- **WHEN** user logs out, changes device theme, then logs back in
- **THEN** the application uses the saved theme preference from the database

### Requirement: Theme can be changed from settings
The system SHALL provide a theme toggle control in the settings page.

#### Scenario: Change theme via settings
- **WHEN** user navigates to /settings and changes theme
- **THEN** the theme changes immediately and is saved to the database