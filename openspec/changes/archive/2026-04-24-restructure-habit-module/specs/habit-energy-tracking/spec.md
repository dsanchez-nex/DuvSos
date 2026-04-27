## ADDED Requirements

### Requirement: Daily energy level logging
The system SHALL provide an optional end-of-day energy level selector ranging from 1 (lowest) to 5 (highest).

#### Scenario: Logging energy
- **WHEN** a user selects energy level "3" at the end of the day
- **THEN** the system stores the energy log entry associated with that date

### Requirement: Energy-performance correlation
The system SHALL display a simple correlation indicator between logged energy levels and habit completion rates over time.

#### Scenario: Viewing correlation insight
- **WHEN** a user reviews a habit's historical performance
- **THEN** the system shows whether lower energy days tend to coincide with lower completion rates for that habit
