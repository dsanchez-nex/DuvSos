## Why

The current dashboard lacks urgency-based focus, integrated planning visibility, and motivational analytics. Users need a single screen that immediately surfaces what requires action now, provides a calendar-based planning overview with workload warnings, and shows progress metrics to maintain motivation. This redesign transforms the dashboard from a passive landing page into an active productivity command center.

## What Changes

- **Urgency Module (Top Section)**: Compact widgets for today's critical tasks (max 5), critical habits with streak counters, and upcoming milestones. Each item has a direct action button to minimize navigation.
- **Planning Module (Middle/Lateral Section)**: Calendar commitment view with color-coded events (green=Habit, red=ToDo, blue=Reminder) and an Energy/Load Map that warns when a day is overloaded with critical tasks and complex habits.
- **Analytical Module (Bottom Section)**: Metrics scorecard with overall streak, active modules count, weekly compliance percentage, and a low-progress list for ignored habits or projects.
- **Cross-section interactivity**: Clicking a day in the calendar filters the urgency section to that date.

## Capabilities

### New Capabilities
- `dashboard-urgency-module`: Top-section widgets for critical tasks, habits, and milestones with direct actions.
- `dashboard-planning-module`: Calendar commitment view with color coding and day-click filtering.
- `dashboard-energy-load-map`: Workload analysis and overload warnings based on scheduled tasks and habits.
- `dashboard-analytics-module`: Bottom-section KPIs (streak, active modules, compliance) and low-progress list.
- `dashboard-cross-section-interactivity`: Calendar-to-urgency date filtering interaction.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Frontend/UI**: New dashboard layout with three distinct sections, new widget components, calendar integration, and metric visualizations.
- **Backend/API**: New aggregation endpoints for critical tasks, habit streaks, upcoming milestones, workload analysis, and compliance metrics.
- **State management**: Dashboard date selection state shared between planning calendar and urgency list.
- **Data aggregation**: Cross-module queries to compute streaks, active project counts, completion rates, and low-progress items.
