## ADDED Requirements

### Requirement: Checklist items can have dependencies on other items
The system SHALL allow users to mark an item as dependent on another item, meaning it cannot be started until the dependency is completed.

#### Scenario: Setting a dependency
- **WHEN** user edits an item and sets its `blockedByItemId` to another item's ID
- **THEN** the item is marked as blocked and cannot be completed until the dependency is done

### Requirement: Blocked items are visually indicated and cannot be completed
The system SHALL prevent users from marking a blocked item as completed and show a visual indicator.

#### Scenario: Attempting to complete a blocked item
- **WHEN** user tries to mark a blocked item as completed
- **THEN** system shows an error and does not change the completion status

#### Scenario: Dependency completed unblocks the item
- **WHEN** the item that a blocked item depends on is marked as completed
- **THEN** the blocked item becomes unblocked and can be completed