## ADDED Requirements

### Requirement: Chronological action feed
The system SHALL display a vertical list of actionable items for a selected day, sorted chronologically.

#### Scenario: Viewing daily action list
- **WHEN** a user selects a date in the calendar
- **THEN** the system shows a feed of all actionable items for that day ordered by time

### Requirement: Action item structure
Each item in the action list SHALL display: module icon (color-coded), title, context/description, source module, due time, and a direct action button.

#### Scenario: Viewing a habit action item
- **WHEN** a user views an action item for a habit
- **THEN** the system shows a green icon, the habit title, context, and a "Mark Habit" button

#### Scenario: Viewing a checklist action item
- **WHEN** a user views an action item for a checklist milestone
- **THEN** the system shows an orange icon, the milestone title, context, and a "Go to Checklist" button

### Requirement: Direct action buttons
Each action item SHALL provide a button that performs the primary action for that item type rather than just a generic checkbox.

#### Scenario: Navigating to project from action item
- **WHEN** a user clicks "Go to Project" on a reminder action item
- **THEN** the system navigates to the linked project/source

#### Scenario: Marking habit progress from action item
- **WHEN** a user clicks "Mark Habit" on a habit action item
- **THEN** the system records the habit completion and updates the item state
