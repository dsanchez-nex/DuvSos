## ADDED Requirements

### Requirement: Completed checklists are moved to an immutable history
The system SHALL preserve completed checklists in a read-only history when they are archived.

#### Scenario: Viewing checklist history
- **WHEN** user navigates to the history view
- **THEN** system displays all checklists with lifecycleState 'Archived'

### Requirement: History preserves original title and description
The system SHALL store the original title and description of the checklist at the time of archiving.

#### Scenario: History shows original title
- **WHEN** a checklist is archived
- **THEN** the history entry retains the checklist's original title and description

### Requirement: History records completion timestamp
The system SHALL record the date and time when the checklist was completed.

#### Scenario: History shows completion time
- **WHEN** a checklist is archived
- **THEN** the history entry includes the timestamp from the completedAt field

### Requirement: History includes productivity metrics
The system SHALL store and display productivity metrics for each archived checklist.

#### Scenario: History shows total estimated effort
- **WHEN** viewing an archived checklist
- **THEN** system displays the total estimated effort (sum of effortEstimate of all items)

#### Scenario: History shows item count
- **WHEN** viewing an archived checklist
- **THEN** system displays the total number of items

#### Scenario: History shows completion snapshot
- **WHEN** viewing an archived checklist
- **THEN** system displays a snapshot of which items were completed and when (if tracked)