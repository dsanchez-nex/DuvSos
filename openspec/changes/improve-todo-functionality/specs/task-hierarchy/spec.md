## ADDED Requirements

### Requirement: User can create sub-tasks under a parent task
The system SHALL allow users to create sub-tasks that belong to a parent task by setting a `parent_id` reference.

#### Scenario: Creating a sub-task
- **WHEN** user creates a new task with `parent_id` pointing to an existing task
- **THEN** the sub-task is created and displayed under the parent task

### Requirement: Parent tasks display completion progress
The system SHALL display the progress of parent tasks as a ratio of completed sub-tasks (e.g., "3/5").

#### Scenario: Viewing parent task progress
- **WHEN** user views a parent task with sub-tasks
- **THEN** system shows "X/Y completed" indicating how many sub-tasks are done

### Requirement: Sub-tasks inherit due date and priority from parent
The system SHALL allow sub-tasks to optionally inherit or override the due date and priority of the parent task.

#### Scenario: Sub-task inherits parent attributes
- **WHEN** user creates a sub-task without due date or priority
- **THEN** sub-task inherits the values from its parent task

### Requirement: Completing all sub-tasks marks parent as complete
The system SHALL automatically mark a parent task as complete when all its sub-tasks are completed.

#### Scenario: Auto-complete parent task
- **WHEN** all sub-tasks of a parent are marked as complete
- **THEN** the parent task is automatically marked as complete