## ADDED Requirements

### Requirement: Period-based historical selection
The archive view SHALL allow users to select a time period (month/year) to analyze past habit performance.

#### Scenario: Selecting a past month
- **WHEN** a user selects "March 2025" in the archive view
- **THEN** the system loads all completion data for active habits during that month

### Requirement: Total completions per period
The archive view SHALL display the total number of habit completions within the selected period.

#### Scenario: Viewing total completions
- **WHEN** a user views the archive for a selected month
- **THEN** the system shows the total count of habit completions recorded during that period

### Requirement: Streak chart visualization
The archive view SHALL include a streak chart that visually represents consecutive completion periods for each habit.

#### Scenario: Visual streak history
- **WHEN** a user views the archive for a habit with mixed completion history
- **THEN** the streak chart shows blocks or bars indicating consecutive days/weeks of completion and gaps where the streak was broken
