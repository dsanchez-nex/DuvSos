## ADDED Requirements

### Requirement: Milestone creation
The system SHALL allow users to mark a date as a milestone with a title and description.

#### Scenario: Creating a milestone
- **WHEN** a user creates a milestone titled "Website Launch" with date "2026-12-30"
- **THEN** the system persists the milestone and displays it prominently on the calendar

### Requirement: Milestone grouping
The system SHALL allow users to associate multiple items (checklist items, todos, reminders) with a milestone.

#### Scenario: Grouping items under milestone
- **WHEN** a user associates checklist items "Review Copywriting", "Beta Testing", and "Validate Server" with milestone "Website Launch"
- **THEN** the system groups these items under the milestone and shows them together in views

### Requirement: Auto-suggested tasks for milestones
The system SHALL auto-suggest related tasks when a milestone is created.

#### Scenario: Milestone auto-suggestions
- **WHEN** a user creates a milestone "Website Launch"
- **THEN** the system suggests tasks such as "Review Copywriting", "Beta Testing", and "Validate Server" that the user can add with one click
