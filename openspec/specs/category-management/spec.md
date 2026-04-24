## ADDED Requirements

### Requirement: User can create categories with metadata
The system SHALL allow users to create categories with a name, color (hex), icon, and description.

#### Scenario: Creating a category with metadata
- **WHEN** user creates a category with name, color, icon, and description
- **THEN** the category is saved with all metadata

### Requirement: Categories can be nested
The system SHALL support hierarchical categories where a category can have a parent category.

#### Scenario: Creating nested category
- **WHEN** user creates a category with `parent_id` pointing to another category
- **WHEN** the category is displayed in a tree structure

### Requirement: Tasks can be assigned to categories
The system SHALL allow assigning a category to a task.

#### Scenario: Assigning category to task
- **WHEN** user assigns a category to a task
- **THEN** the task is associated with that category

### Requirement: Default category for unassigned tasks
The system SHALL provide a default "General" category for tasks without category assignment.

#### Scenario: Default category assignment
- **WHEN** a task is created without a category
- **THEN** the task is assigned to the default "General" category