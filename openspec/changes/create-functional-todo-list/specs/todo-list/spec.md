## ADDED Requirements

### Requirement: User can create a todo item
The system SHALL allow authenticated users to create new todo items with a title text.

#### Scenario: Successful creation
- **WHEN** user submits a new todo with title "Buy milk"
- **THEN** a new todo item appears in the list with title "Buy milk", completed=false, and position at the bottom of unchecked items

### Requirement: User can view all todo items
The system SHALL display all todo items for the authenticated user, sorted with unchecked items first (by position), then checked items (by position).

#### Scenario: View todo list
- **WHEN** user navigates to the todo list page
- **THEN** all todo items are displayed with unchecked items at top, checked items below

### Requirement: User can mark todo as complete
The system SHALL allow users to mark a todo item as complete, which moves it below all unchecked items.

#### Scenario: Mark as complete
- **WHEN** user clicks the checkbox on an unchecked todo "Buy milk"
- **THEN** the todo is marked completed=true and moves below all unchecked items

### Requirement: User can uncheck todo
The system SHALL allow users to uncheck a completed todo, returning it to its original position.

#### Scenario: Uncheck todo
- **WHEN** user clicks the checkbox on a checked todo "Buy milk"
- **THEN** the todo is marked completed=false and returns to its original position in the list

### Requirement: User can delete todo
The system SHALL allow users to delete a todo item.

#### Scenario: Delete todo
- **WHEN** user clicks delete on a todo item
- **THEN** the todo is removed from the list

### Requirement: User can edit todo title
The system SHALL allow users to edit the title of an existing todo item.

#### Scenario: Edit todo
- **WHEN** user edits a todo title from "Buy milk" to "Buy eggs"
- **THEN** the todo title is updated to "Buy eggs"