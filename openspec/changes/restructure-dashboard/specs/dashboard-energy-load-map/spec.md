## ADDED Requirements

### Requirement: Daily workload calculation
The system SHALL calculate a workload score for each day based on the number and complexity of scheduled tasks and habits.

#### Scenario: Calculating a heavy day
- **WHEN** a day has 5 critical tasks and 3 complex habits scheduled
- **THEN** the system identifies the day as heavily loaded

### Requirement: Overload warning
The system SHALL display a warning when a selected or upcoming day exceeds the defined workload threshold.

#### Scenario: Warning on overloaded day
- **WHEN** a user views a day that exceeds the workload threshold
- **THEN** the system displays a warning: "This day is very loaded. Consider pausing habit X or moving task Y."

### Requirement: Load map visualization
The system SHALL provide a visual load indicator (e.g., color intensity or bar) per day in the calendar view.

#### Scenario: Visual load indicator
- **WHEN** a user views the calendar
- **THEN** days with higher workload appear with stronger visual indicators than lighter days
