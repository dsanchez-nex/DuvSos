## ADDED Requirements

### Requirement: User can set effort estimate on a task
The system SHALL allow users to set an estimated effort in minutes for a task.

#### Scenario: Setting effort estimate
- **WHEN** user sets effort estimate to 120 minutes on a task
- **THEN** the effort is stored and displayed as "2h"

### Requirement: Dashboard shows total effort for period
The system SHALL display total effort hours planned for the current week.

#### Scenario: Viewing weekly effort
- **WHEN** user views dashboard
- **THEN** system shows "This week: X hours of work scheduled"