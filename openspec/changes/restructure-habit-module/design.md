## Context

The current habit module stores only basic metadata (title, description). Users cannot plan habit lifecycles, set quantitative goals, track streaks, or analyze historical performance. The redesign introduces a planning-action-review lifecycle, automated metrics, dependency chains, contextual notifications, gamification, and optional energy correlation.

## Goals / Non-Goals

**Goals:**
- Transform the habit entity into a planning tool with cycles, states, categories, and structured goals.
- Provide automated, real-time progress metrics (streaks, completion rates).
- Deliver three focused UI experiences: planning, daily action, and historical analysis.
- Enable habit dependencies (blockers) for guided behavior sequencing.
- Increase engagement through contextual notifications and a lightweight gamification layer.
- Offer optional energy tracking to enrich behavioral insights.

**Non-Goals:**
- Social/sharing features (sharing habits with other users).
- AI-generated habit recommendations.
- Mobile-native push notifications (in-app/web notifications only within scope).
- Full calendar integration (Google/Outlook).
- Complex data visualization libraries (keep charts lightweight).

## Decisions

1. **Three-view UI separation over single unified view**
   - *Rationale*: Separating planning, action, and archive reduces cognitive load. The action view stays minimal; planning and archive can be richer without cluttering daily use.
   - *Alternative considered*: Tabbed single view — rejected because planning and archive are used infrequently and would add noise to the primary daily flow.

2. **Automated lifecycle transition via scheduled background job**
   - *Rationale*: When a habit’s `EndDate` passes, it should automatically move to `Archived` or `Paused` without manual intervention.
   - *Alternative considered*: Transition on client read — rejected because it creates inconsistent state across clients and complicates filtering logic.

3. **Streak and completion rate computed server-side on read, cached daily**
   - *Rationale*: These metrics are derived from completion logs. Computing on demand keeps the write path fast; caching prevents repeated expensive recalculation.
   - *Alternative considered*: Pre-computed counters on every completion — rejected because it complicates writes and risks drift when data is corrected.

4. **Blocker validation enforced at the API layer**
   - *Rationale*: Prevents marking a habit complete if prerequisites are unmet. Centralizing in the API avoids duplicating logic across clients.
   - *Alternative considered*: Client-side only validation — rejected because it is easily bypassed.

5. **Gamification as a separate progression service/table**
   - *Rationale*: Decouples XP/level logic from habits, making it easier to extend gamification to other modules later.
   - *Alternative considered*: Inline habit fields for XP — rejected because it tightly couples unrelated domains.

6. **Energy tracking stored as a daily log entry, not a habit field**
   - *Rationale*: Energy is a daily snapshot, not a habit attribute. A separate log table allows correlation queries without polluting the habit schema.

## Risks / Trade-offs

- **Performance risk**: Calculating streaks and completion rates for many habits daily could be slow for users with large histories.
  - *Mitigation*: Implement result caching (e.g., per-user daily cache) and index completion logs by `habitId + date`.

- **Data migration risk**: Existing habits lack cycles, goals, and categories.
  - *Mitigation*: Default existing habits to `IsPermanent = true`, `GoalType = Daily`, `GoalValue = 1`, and create a default “General” category. Provide a one-time migration script.

- **Notification fatigue risk**: Smart notifications can become noisy if over-triggered.
  - *Mitigation*: Respect user notification preferences, limit urgency-based reminders to once per habit per day, and allow per-habit notification toggles.

- **Scope creep risk**: Gamification and energy tracking are nice-to-have and could delay core habit improvements.
  - *Mitigation*: Implement the advanced model, metrics, and three views first. Treat gamification, notifications, and energy tracking as priority tiers in the task list.

## Migration Plan

1. **Schema migration**: Add new columns/tables for habit cycles, goals, categories, completions, blockers, gamification, and energy logs.
2. **Data backfill**: Run migration script to set sensible defaults for existing habits.
3. **API deployment**: Deploy new endpoints alongside existing ones; maintain backward compatibility where possible.
4. **UI rollout**: Release planning view first (low risk), then action view, then archive and advanced features.
5. **Rollback**: Keep old habit table columns until migration is verified; rollback by reverting to previous API version and UI.

## Open Questions

- Should the daily action view default to today, or should users be able to navigate to past/future days?
- What is the exact XP formula per habit completion (linear or weighted by goal difficulty)?
- Should archived habits retain their historical data indefinitely, or is there a retention policy?
