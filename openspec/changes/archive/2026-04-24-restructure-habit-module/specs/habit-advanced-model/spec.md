## ADDED Requirements

### Requirement: Habit entity supports advanced planning attributes
The system SHALL allow a habit to store a title, description, category reference, availability state, lifecycle cycle, and structured goal.

#### Scenario: Creating a habit with full planning attributes
- **WHEN** a user creates a habit with title "Morning Run", category "Fitness", state "Active", cycle start date "2026-01-01", cycle end date "2026-01-31", goal type "Weekly", and goal value "3"
- **THEN** the system persists the habit with all provided attributes

### Requirement: Habit availability states
The system SHALL support three availability states for a habit: Active, Paused, and Archived.

#### Scenario: Pausing an active habit
- **WHEN** a user changes a habit's state from "Active" to "Paused"
- **THEN** the habit no longer appears in the daily action view and retains its historical data

#### Scenario: Archiving a habit
- **WHEN** a user changes a habit's state from "Active" to "Archived"
- **THEN** the habit is hidden from daily and planning views but remains accessible in the archive view

### Requirement: Habit lifecycle cycle
The system SHALL support both permanent habits and date-bounded cycles with start and end dates.

#### Scenario: Creating a permanent habit
- **WHEN** a user creates a habit with "IsPermanent" set to true
- **THEN** the system does not require an end date and the habit remains eligible indefinitely

#### Scenario: Creating a bounded cycle habit
- **WHEN** a user creates a habit with "IsPermanent" set to false, start date "2026-01-01", and end date "2026-01-31"
- **THEN** the system validates that the end date is on or after the start date and persists the cycle

### Requirement: Automatic lifecycle transition on end date
The system SHALL automatically transition a non-permanent habit to Archived when the current date exceeds its end date.

#### Scenario: End date passes
- **WHEN** the current date is "2026-02-01" and a habit has end date "2026-01-31"
- **THEN** the system transitions the habit state to "Archived"

### Requirement: Structured habit goals
The system SHALL support goal types Daily, Weekly, Monthly, and Ratio, each with a numeric minimum value.

#### Scenario: Setting a weekly goal
- **WHEN** a user sets a habit goal type to "Weekly" with value "3"
- **THEN** the system interprets the objective as at least 3 completions within any Monday–Sunday window

#### Scenario: Setting a ratio goal
- **WHEN** a user sets a habit goal type to "Ratio" with value "80"
- **THEN** the system interprets the objective as an 80% completion rate over the active cycle
