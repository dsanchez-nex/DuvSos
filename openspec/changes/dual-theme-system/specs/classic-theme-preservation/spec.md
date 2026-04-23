## ADDED Requirements

### Requirement: Classic theme preservation
The system SHALL maintain the existing Classic theme so that all components look and behave exactly as they do today when Classic is selected.

#### Scenario: Classic theme unchanged
- **WHEN** a user selects the Classic theme
- **THEN** all visual properties match the current production appearance pixel-for-pixel

### Requirement: Classic design tokens extraction
The system SHALL extract current hardcoded Classic styles into a dedicated set of design tokens.

#### Scenario: Classic tokens match production
- **WHEN** the Classic token set is applied
- **THEN** computed styles match the original hardcoded values

### Requirement: Classic remains default
The system SHALL use the Classic theme as the default for existing users until they explicitly change it.

#### Scenario: New user default
- **WHEN** a new user first accesses the application
- **THEN** the Classic theme is active by default
