## Context

The current reminders module is a static CRUD with simple date-based triggers. It does not support recurrence, cross-module linking, conflict detection, or dynamic priority management. The redesign transforms reminders into a central planning engine that coordinates Habits, Checklists, and ToDos through intelligent scheduling, dependency chains, and contextual awareness.

## Goals / Non-Goals

**Goals:**
- Transform reminders into a dynamic, recurrence-aware planning engine.
- Enable cross-module traceability via Source ID and Source Module linking.
- Provide a unified dashboard (calendar + action list) with color-coded module integration.
- Detect and warn about scheduling conflicts across all modules.
- Support milestone-based planning with auto-suggested tasks.
- Implement automatic priority escalation for items related to approaching critical deadlines.

**Non-Goals:**
- Full calendar application with invite/send functionality.
- External calendar sync (Google/Outlook) — in-app only.
- AI-generated task suggestions beyond milestone auto-suggestions.
- Real-time collaborative editing.

## Decisions

1. **Recurrence expansion generated server-side on read, not stored per-instance**
   - *Rationale*: Storing every recurring instance would bloat the database. Generating instances on demand from a recurrence rule keeps storage minimal and allows easy edits to the series.
   - *Alternative considered*: Store every instance as a row — rejected because it complicates series edits and scales poorly.

2. **Unified event feed for calendar and list views**
   - *Rationale*: Both views consume the same underlying data (reminders, habits, checklist milestones, todo deadlines). A single aggregation query simplifies consistency.
   - *Alternative considered*: Separate data pipelines per view — rejected because it risks showing different data between calendar and list.

3. **Color coding assigned at the module level, not user-customizable initially**
   - *Rationale*: Consistent module colors (blue=Reminder, green=Habit, orange=Checklist, red=ToDo) provide immediate visual recognition without configuration overhead.
   - *Alternative considered*: User-customizable colors — nice to have but adds complexity for initial release.

4. **Conflict detection runs at creation time, not continuous background scanning**
   - *Rationale*: Checking conflicts when the user creates/edits a reminder provides immediate feedback without constant background load.
   - *Alternative considered*: Background job scanning daily — rejected because real-time feedback at creation is more valuable.

5. **Priority escalation as a background job triggered by approaching deadlines**
   - *Rationale*: Scanning related items and escalating their priority when a critical deadline is near (e.g., 48 hours) ensures visibility without manual intervention.
   - *Alternative considered*: Real-time cascade on every edit — rejected because it is overly complex and the job-based approach is sufficient.

6. **Reminder metrics (views, actions) stored as lightweight event logs**
   - *Rationale*: A simple append-only log table for reminder interactions allows analytics without polluting the core reminder schema.

## Risks / Trade-offs

- **Performance risk**: Generating recurring instances and aggregating cross-module events for calendar views could be slow for users with extensive data.
  - *Mitigation*: Cache the expanded recurrence instances per day and paginate the unified feed. Index source references aggressively.

- **Data integrity risk**: Cross-module links (Source ID/Source Module) can become stale if the referenced item is deleted.
  - *Mitigation*: Implement soft deletes across modules and use foreign key constraints or cleanup jobs to handle orphaned links gracefully.

- **Notification overload risk**: A dynamic reminder engine with conflict warnings and escalations can overwhelm users.
  - *Mitigation*: Allow per-reminder notification preferences, batch conflict warnings, and limit escalation visual changes to the dashboard (not push notifications).

- **Scope creep risk**: Milestones, conflict detection, and escalation are complex features that could delay core reminder improvements.
  - *Mitigation*: Implement advanced reminder creation and the unified dashboard first. Treat conflict detection, milestones, and escalation as priority tiers.

## Migration Plan

1. **Schema migration**: Add recurrence rule tables, exception dates, lifecycle periods, blocker relationships, source references, metrics logs, milestones, and escalation rules.
2. **Data backfill**: Migrate existing static reminders to the new model with a simple once-only recurrence rule.
3. **API deployment**: Deploy new endpoints alongside existing ones; maintain backward compatibility for basic reminder CRUD.
4. **UI rollout**: Release the unified dashboard (calendar + list) first, then advanced creation, then conflict detection and milestones.
5. **Rollback**: Keep legacy reminder endpoints active until the new dashboard is verified; rollback by reverting to previous UI and API version.

## Open Questions

- Should recurring exceptions be stored as absolute dates or relative offsets from the series start?
- What is the exact threshold for priority escalation (e.g., 24 hours, 48 hours before deadline)?
- Should the calendar default to month view or week view on mobile?
