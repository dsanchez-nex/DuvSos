## MODIFIED Requirements

### Requirement: User can create a todo item
The system SHALL allow authenticated users to create new todo items with a title text, due date, and optional priority.

#### Scenario: Creating todo with due date
- **WHEN** user creates a todo with title "Finish report" and due date "2026-04-25" at "14:00"
- **THEN** a new todo item appears with title, due_date="2026-04-25", due_time="14:00"

### Requirement: User can view all todo items
The system SHALL display all todo items for the authenticated user, sorted by due date (earliest first), then by priority.

#### Scenario: Sort by due date
- **WHEN** user navigates to the todo list page
- **THEN** all todo items are displayed with earliest due date at top