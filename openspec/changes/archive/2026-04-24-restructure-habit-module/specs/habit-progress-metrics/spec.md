## ADDED Requirements

### Requirement: Current streak calculation
The system SHALL compute the current streak as the count of consecutive periods (days, weeks, or months depending on goal type) in which the habit goal was met.

#### Scenario: Seven-day streak
- **WHEN** a daily-goal habit has been completed each day for the last 7 days
- **THEN** the system reports "CurrentStreak" as 7

#### Scenario: Streak broken
- **WHEN** a daily-goal habit was completed for 5 consecutive days but not on the current day
- **THEN** the system reports "CurrentStreak" as 0

### Requirement: Completion rate calculation
The system SHALL compute the completion rate as the percentage of required goal executions achieved within the current evaluation period.

#### Scenario: Weekly goal partial completion
- **WHEN** a weekly-goal habit with value "3" has been completed 2 times in the current week
- **THEN** the system reports "CompletionRate" as approximately 66.7%

#### Scenario: Monthly goal full completion
- **WHEN** a monthly-goal habit with value "10" has been completed 10 times in the current month
- **THEN** the system reports "CompletionRate" as 100%

### Requirement: Metrics recalculation trigger
The system SHALL recalculate streak and completion rate at least once per day for active habits.

#### Scenario: Daily recalculation
- **WHEN** the daily background job executes
- **THEN** the system updates cached streak and completion rate values for all active habits
