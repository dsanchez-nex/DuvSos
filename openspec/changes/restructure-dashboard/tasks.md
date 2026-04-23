## 1. Backend — Aggregation Endpoints

- [ ] 1.1 Implement endpoint to fetch critical tasks for a given date (ToDo + Reminder, max 5)
- [ ] 1.2 Implement endpoint to fetch critical habits for a given date with streak counters
- [ ] 1.3 Implement endpoint to fetch upcoming milestones within 7 days
- [ ] 1.4 Implement unified calendar events endpoint with color-coded module indicators
- [ ] 1.5 Implement workload analysis endpoint (or include in calendar payload)
- [ ] 1.6 Implement metrics endpoint: overall streak, active project count, pending task count, weekly compliance percentage
- [ ] 1.7 Implement low-progress items endpoint (habits/projects with low execution in last 7 days)
- [ ] 1.8 Add caching for metrics with daily invalidation

## 2. Frontend — Dashboard Layout & State

- [ ] 2.1 Create new dashboard page shell with three-section vertical layout
- [ ] 2.2 Implement shared date state (React context or URL param) between calendar and urgency sections
- [ ] 2.3 Add "Today" button to reset date filter to current date
- [ ] 2.4 Implement responsive layout: urgency + calendar primary on mobile, analytics collapsed or tabbed

## 3. Frontend — Urgency Module (Top Section)

- [ ] 3.1 Build critical tasks widget (max 5 items) with title, due info, and "Mark Done" button
- [ ] 3.2 Build critical habits widget with streak counter and "Realizado" button
- [ ] 3.3 Build upcoming milestones widget with days-remaining indicator
- [ ] 3.4 Wire direct action buttons to respective module APIs (ToDo complete, habit complete)
- [ ] 3.5 Handle empty states gracefully when no critical items exist

## 4. Frontend — Planning Module (Middle Section)

- [ ] 4.1 Build calendar component with month and week view selector
- [ ] 4.2 Implement color-coded event dots/indicators (green=Habit, red=ToDo, blue=Reminder)
- [ ] 4.3 Implement day click handler to update shared date state and filter urgency section
- [ ] 4.4 Build Energy/Load Map overlay on calendar days with workload intensity visualization
- [ ] 4.5 Implement overload warning banner when selected day exceeds workload threshold

## 5. Frontend — Analytics Module (Bottom Section)

- [ ] 5.1 Build metrics scorecard widget with overall streak, active projects, pending tasks
- [ ] 5.2 Build weekly compliance percentage widget with progress bar/chart
- [ ] 5.3 Build low-progress items list widget with 7-day trend indicator
- [ ] 5.4 Add progressive disclosure or collapse behavior for analytics widgets on mobile

## 6. Integration, Testing & Rollout

- [ ] 6.1 Write integration tests for aggregation endpoints
- [ ] 6.2 Test cross-section interactivity (calendar click → urgency filter update)
- [ ] 6.3 Verify direct action buttons complete items without page navigation
- [ ] 6.4 Test responsive behavior across desktop, tablet, and mobile viewports
- [ ] 6.5 Validate color coding consistency across calendar and action items
- [ ] 6.6 Deploy behind feature flag, collect feedback, and deprecate old dashboard
