## ADDED Requirements

### Requirement: Blocker dependency definition
The system SHALL allow a reminder to define one or more prerequisite tasks/items that must be completed before the reminder becomes active.

#### Scenario: Setting a blocker on a reminder
- **WHEN** a user configures reminder "Review Marketing Report" to depend on checklist item "Collect Marketing Data"
- **THEN** the system persists the blocker relationship

### Requirement: Blocker enforcement on trigger
The system SHALL suppress reminder notifications/appearances until all defined blocker prerequisites are completed.

#### Scenario: Blocked reminder suppressed
- **WHEN** the current date matches a reminder occurrence but its blocker checklist item is not completed
- **THEN** the system does not display or notify the reminder

#### Scenario: Unblocked reminder activated
- **WHEN** a user completes the checklist item "Collect Marketing Data"
- **THEN** the system activates the reminder "Review Marketing Report" and makes it visible in the dashboard
