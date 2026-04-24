## ADDED Requirements

### Requirement: System shows progress metrics in the history view
The system SHALL display productivity metrics for each archived checklist in the history view.

#### Scenario: Viewing completion percentage in history
- **WHEN** user views an archived checklist in the history
- **THEN** system displays the percentage of items that were completed (based on completion snapshot)

#### Scenario: Viewing time spent vs estimated
- **WHEN** user views an archived checklist and time tracking data is available
- **THEN** system displays a comparison of actual time spent vs estimated effort

#### Scenario: Viewing average time per item
- **WHEN** user views an archived checklist
- **THEN** system displays the average time spent per completed item (if tracked)