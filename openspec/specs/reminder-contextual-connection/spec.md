## ADDED Requirements

### Requirement: Source ID and Source Module linking
Every reminder SHALL store a Source ID and Source Module to identify the originating entity (e.g., checklist item, habit, todo).

#### Scenario: Linking reminder to checklist item
- **WHEN** a user creates a reminder from checklist item ID 456
- **THEN** the system stores Source Module "Checklist" and Source ID 456 on the reminder

### Requirement: Cross-module traceability
The system SHALL display the source module and source context when showing a reminder in any view.

#### Scenario: Viewing reminder context
- **WHEN** a user views a reminder in the action list
- **THEN** the system shows the originating module name and a link to the source item
