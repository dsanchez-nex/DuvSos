## ADDED Requirements

### Requirement: Calendar-to-urgency date filtering
The system SHALL update the urgency section when a user selects a different date in the calendar component.

#### Scenario: Filtering urgency by selected date
- **WHEN** a user clicks a date in the calendar
- **THEN** the urgency widgets reload to show only items relevant to that date

### Requirement: State synchronization
The system SHALL maintain the selected date state consistently between the calendar and urgency sections.

#### Scenario: Navigating back to today
- **WHEN** a user clicks a "Today" button after viewing a different date
- **THEN** both the calendar and urgency sections reset to the current date
