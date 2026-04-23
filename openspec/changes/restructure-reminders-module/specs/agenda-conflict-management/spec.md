## ADDED Requirements

### Requirement: Conflict detection at creation
The system SHALL detect scheduling conflicts when a user creates or edits a reminder that falls on a day with existing activities.

#### Scenario: Conflict warning on creation
- **WHEN** a user creates a reminder on a day that already has a habit "Exercise" and a critical ToDo "Client Meeting"
- **THEN** the system displays a warning: "This event falls on the same day as 'Exercise' and 'Client Meeting'. Consider rescheduling."

### Requirement: Conflict scope
Conflict detection SHALL consider all modules: Reminders, Habits, Checklists, and ToDos.

#### Scenario: Multi-module conflict
- **WHEN** a user schedules a reminder on a day with activities from multiple modules
- **THEN** the system lists all conflicting items from all modules in the warning
