## ADDED Requirements

### Requirement: Checklist instance has a lifecycle state
The system SHALL track the lifecycle state of each checklist instance (Active, Completed, Archived).

#### Scenario: Creating an active checklist instance
- **WHEN** user creates a checklist from a template (or manually without isTemplate)
- **THEN** the checklist's lifecycleState is set to 'Active'

### Requirement: Completing all items transitions checklist to Completed
The system SHALL automatically change a checklist's lifecycleState to 'Completed' when all its items are marked as completed.

#### Scenario: Auto-complete on last item done
- **WHEN** user marks the last incomplete item of an active checklist as completed
- **THEN** the checklist's lifecycleState becomes 'Completed' and completedAt is set to the current timestamp

### Requirement: User can archive a completed checklist
The system SHALL allow users to explicitly archive a completed checklist, changing its lifecycleState to 'Archived'.

#### Scenario: Archiving a completed checklist
- **WHEN** user selects the 'Archive' action on a completed checklist
- **THEN** the checklist's lifecycleState becomes 'Archived' and it is no longer editable