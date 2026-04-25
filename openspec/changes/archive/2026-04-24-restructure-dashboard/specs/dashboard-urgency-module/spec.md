## ADDED Requirements

### Requirement: Critical tasks widget
The system SHALL display a compact list of up to 5 critical tasks for the selected day at the top of the dashboard.

#### Scenario: Viewing today's critical tasks
- **WHEN** a user opens the dashboard
- **THEN** the system shows up to 5 tasks from ToDo or Reminder modules with due date today or priority high

### Requirement: Critical habits widget
The system SHALL display habits that have a high objective for the selected day, including streak counters.

#### Scenario: Viewing critical habits
- **WHEN** a user views the urgency section
- **THEN** the system shows habits requiring completion today with visible streak counters (e.g., "14-day streak at risk")

### Requirement: Upcoming milestones widget
The system SHALL display the nearest upcoming milestone or critical project deadline.

#### Scenario: Viewing upcoming milestone
- **WHEN** a user views the urgency section and there is a project milestone within 7 days
- **THEN** the system shows the milestone title and days remaining

### Requirement: Direct action buttons on urgency items
Each item in the urgency section SHALL provide a direct action button appropriate to its module.

#### Scenario: Marking a critical ToDo as done
- **WHEN** a user clicks "Mark Done" on a critical ToDo in the urgency widget
- **THEN** the system marks the ToDo complete and updates the dashboard without navigating away

#### Scenario: Marking a habit as done
- **WHEN** a user clicks "Realizado" on a critical habit in the urgency widget
- **THEN** the system records the habit completion and updates the streak counter
