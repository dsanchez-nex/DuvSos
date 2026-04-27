## ADDED Requirements

### Requirement: Habit creation and editing interface
The system SHALL provide a planning view where users can create and edit habits using the advanced data model.

#### Scenario: Creating a habit in planning view
- **WHEN** a user opens the planning view and submits a new habit form with title, category, cycle, and goal
- **THEN** the system persists the habit and returns the user to the planning list

### Requirement: Cycle management interface
The planning view SHALL provide intuitive controls to select between a permanent habit and a date-bounded cycle.

#### Scenario: Switching to bounded cycle
- **WHEN** a user toggles a habit from permanent to bounded and selects start and end dates
- **THEN** the form validates the date range and persists the cycle configuration

### Requirement: Segmentation and filtering
The planning view SHALL allow filtering and viewing habits by state, including inactive and archived habits.

#### Scenario: Viewing archived habits
- **WHEN** a user selects the "Archived" filter in the planning view
- **THEN** the system displays all archived habits with their historical configuration

### Requirement: Habit-to-objective grouping
The system SHALL allow users to associate multiple habits with a higher-level objective or goal name.

#### Scenario: Grouping habits under an objective
- **WHEN** a user assigns habits "Morning Run", "Evening Stretch", and "Weekly Long Run" to the objective "Prepare for 10K"
- **THEN** the planning view shows these habits grouped under "Prepare for 10K"
