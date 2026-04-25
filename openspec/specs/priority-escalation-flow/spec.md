## ADDED Requirements

### Requirement: Deadline-based priority escalation
The system SHALL automatically escalate the priority and visibility of related low-priority items when a high-priority deadline approaches.

#### Scenario: Escalating related todos
- **WHEN** a critical project deadline is 48 hours away and there are low-priority ToDos associated with that project
- **THEN** the system escalates those ToDos to high priority and changes their calendar indicator to red

### Requirement: Visual escalation indicators
The system SHALL visually indicate escalated items in both the calendar and action list views.

#### Scenario: Calendar color change on escalation
- **WHEN** a ToDo is escalated due to an approaching critical deadline
- **THEN** its calendar indicator changes to red and a warning badge appears in the action list

### Requirement: Escalation scope
Priority escalation SHALL apply to items associated with the same project, milestone, or source module as the approaching critical deadline.

#### Scenario: Scoped escalation
- **WHEN** a critical deadline approaches for "Project Alpha"
- **THEN** only items related to "Project Alpha" are escalated, not unrelated items
