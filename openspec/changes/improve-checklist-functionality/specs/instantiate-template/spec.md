## ADDED Requirements

### Requirement: User can instantiate an active checklist from a template
The system SHALL allow users to create an active checklist instance based on a template.

#### Scenario: Creating an instance from a template
- **WHEN** user selects a template and chooses to create an active checklist
- **THEN** system creates a new checklist with `isTemplate=false`, `lifecycleState='Active'`, and copies all items, metadata, and structure from the template
- **AND** the new instance has a clean state (no items completed, etc.)