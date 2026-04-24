## ADDED Requirements

### Requirement: System calculates total estimated effort for a checklist
The system SHALL calculate the sum of effortEstimate for all items in a checklist (including nested items) and display it as total estimated effort.

#### Scenario: Viewing total estimated effort on an active checklist
- **WHEN** user views an active checklist that has items with effortEstimate values
- **THEN** system shows the total estimated effort (e.g., "Estimated effort: 5h 30m")

### Requirement: Total estimated effort is updated when items are added or modified
The system SHALL recalculate the total estimated effort whenever an item's effortEstimate is changed, or an item is added/removed.

#### Scenario: Adding an item updates total effort
- **WHEN** user adds a new item with an effortEstimate to a checklist
- **THEN** the checklist's total estimated effort increases by that amount

#### Scenario: Changing an item's effortEstimate updates total
- **WHEN** user updates the effortEstimate of an existing item
- **THEN** the checklist's total estimated effort is recalculated accordingly