## MODIFIED Requirements

### Requirement: User can set due date with required time
The system SHALL require users to set both a due date (YYYY-MM-DD) and time (HH:mm) when creating or editing a task.

#### Scenario: Creating todo with due date and time
- **WHEN** user creates a task without due date
- **THEN** system shows validation error requiring due date

#### Scenario: Creating todo with time
- **WHEN** user creates a task without due time
- **THEN** system shows validation error requiring due time