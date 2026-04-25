## ADDED Requirements

### Requirement: Recurrence frequency support
The system SHALL support recurrence frequencies of Daily, Weekly (specific days), Monthly (specific date), and Annual.

#### Scenario: Creating a weekly reminder
- **WHEN** a user creates a reminder with frequency "Weekly" and selects Monday and Wednesday
- **THEN** the system generates occurrences for every Monday and Wednesday within the reminder's lifecycle

#### Scenario: Creating a monthly reminder
- **WHEN** a user creates a reminder with frequency "Monthly" and selects day 15
- **THEN** the system generates an occurrence on the 15th of each month within the reminder's lifecycle

### Requirement: Recurrence exceptions
The system SHALL allow users to define exception dates where a recurrence instance is skipped.

#### Scenario: Adding an exception date
- **WHEN** a user adds an exception date "2026-12-25" to a daily reminder
- **THEN** the system does not generate a reminder occurrence on that date

### Requirement: Recurrence lifecycle period
The system SHALL allow users to define a validity period (start and end date) for a recurring reminder series.

#### Scenario: Setting a lifecycle period
- **WHEN** a user creates an annual reminder with start date "2026-01-01" and end date "2030-12-31"
- **THEN** the system only generates occurrences within that date range

### Requirement: Pausing and resuming a series
The system SHALL allow users to pause a recurring series and resume it later without losing the original configuration.

#### Scenario: Pausing a weekly series
- **WHEN** a user pauses a weekly reminder series
- **THEN** the system stops generating new occurrences until the series is resumed
