## ADDED Requirements

### Requirement: User can filter tasks by multiple criteria
The system SHALL allow combining multiple filter criteria (AND logic).

#### Scenario: Combined filters
- **WHEN** user applies filters for category="Work" AND priority="High"
- **THEN** only tasks matching both criteria are displayed

### Requirement: User can search tasks by title
The system SHALL allow searching tasks by title text.

#### Scenario: Search by title
- **WHEN** user searches for "meeting"
- **THEN** tasks with "meeting" in title are displayed

### Requirement: User can search tasks by category name
The system SHALL allow searching tasks by category name.

#### Scenario: Search by category
- **WHEN** user searches for "Personal"
- **THEN** tasks in category "Personal" are displayed