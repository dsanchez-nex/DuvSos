## ADDED Requirements

### Requirement: User can mark a checklist as a template
The system SHALL allow users to designate a checklist as a template using an `isTemplate` flag.

#### Scenario: Creating a template
- **WHEN** user creates a checklist with `isTemplate` set to true
- **THEN** the checklist is saved as a template and appears in the template library

### Requirement: Templates support versioning
The system SHALL maintain version numbers for templates to track evolution.

#### Scenario: Creating a new version of a template
- **WHEN** user modifies an existing template and saves it as a new version
- **THEN** the system increments the version number and preserves the original

### Requirement: Template variants can be created from base templates
The system SHALL allow users to create adapted versions of base templates.

#### Scenario: Creating a template variant
- **WHEN** user creates a new template with a `templateId` pointing to a base template
- **THEN** the new template inherits the base structure but can be customized