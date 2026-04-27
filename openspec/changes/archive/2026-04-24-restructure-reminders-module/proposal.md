## Why

The current reminders module is a static CRUD with simple date-based triggers. Users need a dynamic planning engine that integrates all modules (Habits, Checklists, ToDos) through intelligent repetition logic, contextual linking, conflict detection, and priority escalation. This transforms reminders from isolated alerts into the central coordination hub of the application.

## What Changes

- **Advanced event creation with dynamic recurrence**: Support frequency (daily, weekly on specific days, monthly on specific date, annual), exceptions (skip dates, resume series after pause), and lifecycle periods (validity windows like "next 5 years").
- **Blocking dependency**: A reminder can be configured to trigger only after another task/item is completed.
- **Contextual connection**: Every reminder must link to a Source ID and Source Module (e.g., Checklist item 456) to maintain full traceability.
- **Reminder metrics**: Track how many times a reminder was viewed (to detect ignored reminders) and what action was taken (edit, navigate to checklist, create ToDo item).
- **Master dashboard with calendar view**: Month/week view showing activity density per day, color-coded by module (blue=Reminder, green=Habit, orange=Checklist, red=ToDo).
- **Detailed action list**: Chronological vertical feed of actionable items for a selected day with module icon, title, context, due info, and direct action buttons (not just checkboxes).
- **Agenda conflict detection**: Warn users when creating an event on a day that already has overlapping habits or critical ToDos.
- **Milestone management**: Allow marking dates as milestones that group multiple items and auto-suggest related tasks.
- **Priority escalation flow**: Auto-escalate priority and visibility (including calendar color change) of related low-priority items when a high-priority deadline approaches.

## Capabilities

### New Capabilities
- `advanced-reminder-creation`: Dynamic recurrence logic with frequency, exceptions, and lifecycle period management.
- `reminder-blocking-dependency`: Prerequisite task completion required before a reminder becomes active/triggered.
- `reminder-contextual-connection`: Source ID and Source Module linking for cross-module traceability.
- `reminder-metrics`: Tracking views count and action outcomes per reminder.
- `reminder-calendar-dashboard`: Calendar view with color-coded activity density and day summary on hover/select.
- `reminder-action-list`: Detailed chronological list with contextual info and direct action buttons.
- `agenda-conflict-management`: Conflict detection and warnings when scheduling overlapping activities.
- `milestone-management`: Milestone creation, grouping, and auto-suggestion of related tasks.
- `priority-escalation-flow`: Automatic priority and visibility escalation of related items based on approaching critical deadlines.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Database schema**: New tables or columns for recurrence rules, exception dates, reminder lifecycle periods, blocker relationships, source references, view counters, action logs, milestones, and priority escalation rules.
- **Backend/API**: New endpoints for advanced reminder CRUD, recurrence expansion engine, blocker validation, conflict detection, milestone management, priority escalation logic, and metrics tracking.
- **Frontend/UI**: New calendar dashboard component, action list feed, color-coded event indicators, conflict warning modals, milestone creation UI, and priority escalation visual indicators.
- **Background jobs**: Recurrence expansion/generation, automated priority escalation checks, daily conflict scanning.
