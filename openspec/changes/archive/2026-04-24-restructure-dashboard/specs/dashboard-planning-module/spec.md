## ADDED Requirements

### Requirement: Calendar commitment view
The system SHALL provide a calendar view on the dashboard showing commitments from all modules with color-coded indicators.

#### Scenario: Viewing calendar with color coding
- **WHEN** a user views the planning section
- **THEN** the system displays a calendar where Habit events are green, ToDo events are red, and Reminder events are blue

### Requirement: Day selection filtering
The system SHALL allow users to click a day in the calendar to filter the urgency section to that date.

#### Scenario: Clicking a future date
- **WHEN** a user clicks on a future date in the calendar
- **THEN** the urgency section updates to show critical tasks, habits, and milestones for that selected date

### Requirement: Calendar view selector
The system SHALL support switching between month and week views in the calendar component.

#### Scenario: Switching to week view
- **WHEN** a user selects the week view option
- **THEN** the calendar displays the current week with daily event indicators
