## ADDED Requirements

### Requirement: Checklist items can have sub-items (nested hierarchy)
The system SHALL allow checklist items to have child items, enabling a tree-like structure.

#### Scenario: Creating a sub-item
- **WHEN** user adds a new item and sets its `parentId` to an existing item's ID
- **THEN** the new item is created as a child of the specified parent item

### Requirement: Nested items inherit context from parents when appropriate
The system SHALL allow nested items to optionally inherit certain attributes (like tags or context) from their parent items.

#### Scenario: Viewing item hierarchy
- **WHEN** user views a checklist with nested items
- **THEN** items are displayed with indentation reflecting their depth in the tree

### Requirement: Completion of parent item does not automatically complete children
The system SHALL NOT automatically mark child items as completed when a parent item is marked as completed.

#### Scenario: Parent completion leaves children unchanged
- **WHEN** user marks a parent item as completed
- **THEN** child items retain their individual completion status