## ADDED Requirements

### Requirement: System adjusts reminder dates for seasonal templates
The system SHALL calculate the next occurrence date for templates with a recurrence pattern when creating an instance.

#### Scenario: Creating instance from a monthly template
- **WHEN** user creates an instance from a template with recurrencePattern "FIRST_FRIDAY_OF_MONTH"
- **THEN** the instance's startDate and/or endDate are set to the next first Friday of the month from today

### Requirement: User can define recurrence patterns on templates
The system SHALL allow users to set a recurrencePattern field on templates to indicate seasonal repetition.

#### Scenario: Setting a recurrence pattern
- **WHEN** user edits a template and sets recurrencePattern to "EVERY_MONDAY"
- **THEN** the template is marked as recurrent and will generate instances on the specified cadence