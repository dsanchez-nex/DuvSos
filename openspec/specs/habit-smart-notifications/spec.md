# habit-smart-notifications Specification

## Purpose
TBD - created by archiving change restructure-habit-module. Update Purpose after archive.
## Requirements
### Requirement: Context-aware reminder content
The system SHALL generate reminder messages that include contextual information such as current streak length or goal urgency.

#### Scenario: Streak risk reminder
- **WHEN** a daily habit with a current streak of 7 has not been completed by a configured reminder time
- **THEN** the system sends a reminder such as "Reminder: Do your morning run today — your 7-day streak is at risk!"

### Requirement: Configurable reminder scheduling
The system SHALL allow users to configure reminder times per habit and enable or disable notifications per habit.

#### Scenario: Setting a habit reminder
- **WHEN** a user sets a reminder for a habit at 08:00 and enables notifications
- **THEN** the system schedules a daily notification for that habit at 08:00

### Requirement: Notification frequency guardrails
The system SHALL limit urgency-based contextual reminders to one per habit per day to prevent notification fatigue.

#### Scenario: Duplicate prevention
- **WHEN** a habit already received one contextual reminder today
- **THEN** the system does not send additional contextual reminders for the same habit until the next day

