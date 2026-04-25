## ADDED Requirements

### Requirement: Unified calendar view
The system SHALL provide a calendar view (month and week) that aggregates events from all modules: Reminders, Habits, Checklists, and ToDos.

#### Scenario: Viewing monthly calendar
- **WHEN** a user opens the calendar dashboard in month view
- **THEN** the system displays all events for the month color-coded by module

### Requirement: Color coding by module
Each module SHALL have a distinct, persistent color in the calendar view: Reminder (blue), Habit (green), Checklist (orange), ToDo (red).

#### Scenario: Identifying modules by color
- **WHEN** a user views a day with multiple events
- **THEN** each event indicator uses the color assigned to its source module

### Requirement: Day activity summary
The system SHALL display a summary of event types when a user hovers over or selects a date in the calendar.

#### Scenario: Hovering over a date
- **WHEN** a user hovers over a date that has 1 Reminder, 2 Habits, and 1 ToDo
- **THEN** the system shows a tooltip or panel summarizing "1 Reminder, 2 Habits, 1 ToDo"
