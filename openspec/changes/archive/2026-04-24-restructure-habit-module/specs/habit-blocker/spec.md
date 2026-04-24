## ADDED Requirements

### Requirement: Habit blocker definition
The system SHALL allow a habit to declare one or more prerequisite habits that must be completed before it can be marked as done.

#### Scenario: Setting a blocker
- **WHEN** a user configures habit "Summarize Concepts" to require completion of habit "Read 5 Pages"
- **THEN** the system persists the blocker relationship

### Requirement: Blocker validation on completion
The system SHALL prevent marking a habit as completed if any of its defined blocker habits are not completed within the same evaluation period.

#### Scenario: Blocked habit completion attempt
- **WHEN** a user attempts to complete "Summarize Concepts" but "Read 5 Pages" is not yet completed today
- **THEN** the system rejects the completion and informs the user that the prerequisite habit is pending

#### Scenario: Unblocked habit completion
- **WHEN** a user attempts to complete "Summarize Concepts" after "Read 5 Pages" has already been completed today
- **THEN** the system allows the completion and records it
