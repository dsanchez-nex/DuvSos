## ADDED Requirements

### Requirement: Overall streak metric
The system SHALL display the user's maximum consecutive days of complete habit and task compliance.

#### Scenario: Viewing overall streak
- **WHEN** a user views the analytics section
- **THEN** the system shows the current overall streak (e.g., "12 days")

### Requirement: Active modules summary
The system SHALL display the count of active projects and pending tasks.

#### Scenario: Viewing active modules summary
- **WHEN** a user views the analytics section
- **THEN** the system shows a checkpoint such as "3 active projects, 20 pending tasks"

### Requirement: Weekly compliance percentage
The system SHALL display the percentage of objectives completed in the current week.

#### Scenario: Viewing weekly compliance
- **WHEN** a user views the analytics section
- **THEN** the system shows a progress indicator with the weekly compliance percentage (e.g., "85% weekly compliance")

### Requirement: Low-progress items list
The system SHALL display a list of habits or projects with low execution or completion rates in the last 7 days.

#### Scenario: Viewing low-progress items
- **WHEN** a user views the analytics section
- **THEN** the system shows habits or projects that were ignored or had very low progress, acting as a gentle nudge
