## Context

The current dashboard is a passive landing page without clear prioritization, integrated planning, or motivational feedback. Users must navigate to individual modules to understand what needs attention. The redesign introduces a three-section command center: urgency (what to do now), planning (calendar and workload), and analytics (progress and motivation).

## Goals / Non-Goals

**Goals:**
- Surface critical items immediately upon login with direct action buttons.
- Provide an integrated calendar view with color-coded cross-module events.
- Warn users about overloaded days before they become unmanageable.
- Display motivational metrics (streaks, compliance, active projects) and surface low-progress items.
- Enable cross-section interaction (calendar date selection filters urgency list).

**Non-Goals:**
- Full project management or Gantt chart functionality.
- AI-powered task prioritization or automatic scheduling.
- Real-time collaborative dashboards.
- External calendar sync.

## Decisions

1. **Three-section vertical layout**
   - *Rationale*: Creates a natural top-to-bottom flow: act now → plan ahead → review progress. Urgency at the top ensures it is seen first.
   - *Alternative considered*: Side-by-side layout — rejected because it reduces vertical space for the urgency list and complicates mobile responsiveness.

2. **Client-side date filtering between calendar and urgency section**
   - *Rationale*: When a user clicks a day in the calendar, the urgency list should update to that date without a full page reload. A shared local state (React context or URL param) is sufficient.
   - *Alternative considered*: Server-side filtering with full page reload — rejected because it harms the fluid interaction experience.

3. **Energy/Load Map computed client-side from pre-fetched daily aggregates**
   - *Rationale*: The load calculation (count of critical tasks + complex habits per day) can be done on the client using the same data that populates the calendar, avoiding an extra API call.
   - *Alternative considered*: Dedicated backend endpoint for workload score — rejected because the data is already available in the calendar payload.

4. **Compliance metrics cached and recalculated daily**
   - *Rationale*: Weekly compliance percentages and streak calculations are derived from historical data. Computing them daily in a background job and caching the results keeps the dashboard load fast.
   - *Alternative considered*: Compute on every dashboard load — rejected because it creates unnecessary load for data that changes at most once per day.

5. **Direct action buttons trigger module-specific mutations**
   - *Rationale*: A "Mark Done" button on a ToDo item in the urgency widget should call the ToDo completion API directly. This avoids navigation and keeps the user in context.
   - *Alternative considered*: Buttons navigate to module detail pages — rejected because it defeats the purpose of a command center.

## Risks / Trade-offs

- **Performance risk**: Aggregating cross-module critical items, calendar events, and metrics on dashboard load could be slow.
  - *Mitigation*: Use dedicated aggregation endpoints with caching. Load the urgency section first, then calendar and analytics in parallel.

- **Information overload risk**: Showing too many critical items or too many metrics can overwhelm users.
  - *Mitigation*: Cap critical items at 5, use progressive disclosure for analytics, and allow widget collapse.

- **Mobile layout risk**: A three-section vertical layout may become excessively long on mobile.
  - *Mitigation*: Collapse analytics into a tab or accordion on narrow viewports; keep urgency and calendar as primary.

- **Stale data risk**: Cached compliance metrics or streaks could appear outdated if a user completes an action in another tab.
  - *Mitigation*: Invalidate relevant cache keys on completion mutations and use lightweight polling or revalidation on focus.

## Migration Plan

1. Build new aggregation endpoints for critical items, calendar data, workload analysis, and metrics.
2. Implement the three-section dashboard layout behind a feature flag.
3. Gradually roll out to users, collecting feedback on widget usefulness.
4. Deprecate the old dashboard once the new one is validated.

## Open Questions

- Should the calendar default to the current week or current month?
- What is the exact threshold for an "overloaded day" warning (e.g., 5 critical items + 3 habits)?
- Should low-progress items in the analytics section be clickable to navigate to the source module?
