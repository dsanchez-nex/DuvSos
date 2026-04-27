## ADDED Requirements

### Requirement: Dashboard displays upcoming due tasks
The system SHALL show tasks due in the next 7 days prominently on the dashboard.

#### Scenario: Viewing upcoming tasks
- **WHEN** user views dashboard
- **THEN** tasks due within 7 days are shown prominently

### Requirement: Dashboard displays overdue tasks
The system SHALL highlight tasks that are past their due date on the dashboard.

#### Scenario: Viewing overdue tasks
- **WHEN** user views dashboard
- **THEN** overdue tasks are shown with visual warning

### Requirement: "Today" view shows tasks due today
The system SHALL provide a "Today" view showing only tasks due today.

#### Scenario: Viewing today's tasks
- **WHEN** user selects "Today" view
- **THEN** only tasks with due date today are displayed

### Requirement: "Week" view shows tasks due this week
The system SHALL provide a "Week" view showing tasks due within 7 days.

#### Scenario: Viewing week's tasks
- **WHEN** user selects "Week" view
- **THEN** tasks due within 7 days are displayed