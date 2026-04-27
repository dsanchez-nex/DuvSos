## ADDED Requirements

### Requirement: Users can create template variants based on base templates
The system SHALL allow users to create new templates that derive from an existing base template.

#### Scenario: Creating a template variant
- **WHEN** user creates a new template and specifies a `templateId` pointing to a base template
- **THEN** the new template inherits all items, structure, and metadata from the base template
- **AND** the user can modify the inherited properties (title, description, color, items, etc.) to create a customized variant

### Requirement: Base templates remain unchanged when variants are created
The system SHALL ensure that creating a variant does not modify the original base template.

#### Scenario: Variant creation does not affect base template
- **WHEN** user creates a variant from a base template
- **THEN** the base template's `isTemplate`, `version`, and all its properties remain unchanged