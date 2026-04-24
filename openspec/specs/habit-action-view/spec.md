# habit-action-view Specification

## Purpose
TBD - created by archiving change restructure-habit-module. Update Purpose after archive.
## Requirements
### Requirement: Compact daily/weekly habit list
The action view SHALL display only active habits for the current day (or week) in a compact format.

#### Scenario: Viewing today's habits
- **WHEN** a user opens the action view on a given day
- **THEN** the system lists only habits whose state is "Active" and whose cycle includes the current date

### Requirement: Progress indicators per habit
Each habit in the action view SHALL display its current progress toward the period goal.

#### Scenario: Weekly habit progress bar
- **WHEN** a weekly-goal habit with value "3" has been completed 2 times
- **THEN** the action view shows a progress indicator at 66% and text "2 of 3 this week"

### Requirement: Immediate completion interaction
The action view SHALL allow users to mark a habit as completed with a single interaction and provide immediate visual feedback.

#### Scenario: Marking habit complete
- **WHEN** a user clicks the completion control for a habit
- **THEN** the system records the completion, updates the progress indicator, and displays a checkmark or animation

### Requirement: Daily summary
At the end of the day, the action view SHALL present a summary of completed and incomplete habits.

#### Scenario: End-of-day summary
- **WHEN** the day ends and the user has completed 2 out of 3 daily habits
- **THEN** the system displays a summary stating "Today you completed 2/3 habits" and optionally encourages continuation

### Requirement: Habit objective reminder text
The action view SHALL display the minimum required executions and the current evaluation period for each habit.

#### Scenario: Weekly objective reminder
- **WHEN** a habit has a weekly goal of 3
- **THEN** the action view displays text such as "You need 3 executions this week (Monday – Sunday)"

