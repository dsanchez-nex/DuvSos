## 1. Database Schema & Migration

- [ ] 1.1 Add `ReminderRecurrenceRule` table: frequency, interval, daysOfWeek, dayOfMonth, monthOfYear, startDate, endDate
- [ ] 1.2 Add `ReminderException` table: reminderId, exceptionDate, reason
- [ ] 1.3 Extend `Reminder` table: add sourceModule, sourceId, isPaused, lifecycleStartDate, lifecycleEndDate
- [ ] 1.4 Create `ReminderBlocker` table: reminderId, blockerModule, blockerId
- [ ] 1.5 Create `ReminderMetrics` table: reminderId, viewedAt, actionTaken
- [ ] 1.6 Create `Milestone` table: title, description, date, color
- [ ] 1.7 Create `MilestoneItem` table: milestoneId, itemModule, itemId
- [ ] 1.8 Create `PriorityEscalationRule` table: sourceModule, sourceId, thresholdHours, escalationLevel
- [ ] 1.9 Write migration to convert existing static reminders to recurrence rules with once-only frequency
- [ ] 1.10 Add indexes on source references, dates, and blocker relationships

## 2. Backend — Recurrence & Core Reminder Engine

- [ ] 2.1 Implement recurrence expansion engine (daily, weekly, monthly, annual)
- [ ] 2.2 Implement exception handling in recurrence generation
- [ ] 2.3 Implement lifecycle period validation and filtering
- [ ] 2.4 Implement pause/resume logic for reminder series
- [ ] 2.5 Implement advanced reminder CRUD endpoints with recurrence configuration
- [ ] 2.6 Implement blocker dependency validation and suppression logic
- [ ] 2.7 Implement cross-module source linking and traceability endpoints

## 3. Backend — Dashboard & Aggregation

- [ ] 3.1 Implement unified event aggregation query (reminders + habits + checklists + todos)
- [ ] 3.2 Implement calendar data endpoint for month/week views with color coding
- [ ] 3.3 Implement day summary endpoint with activity counts per module
- [ ] 3.4 Implement chronological action list endpoint for selected date
- [ ] 3.5 Add caching for daily event aggregates to reduce repeated computation

## 4. Backend — Conflict Detection, Milestones & Escalation

- [ ] 4.1 Implement conflict detection service scanning all modules for a given date
- [ ] 4.2 Implement conflict warning API triggered at reminder creation/editing
- [ ] 4.3 Implement milestone CRUD endpoints
- [ ] 4.4 Implement milestone-item association and auto-suggestion engine
- [ ] 4.5 Implement priority escalation background job scanning approaching deadlines
- [ ] 4.6 Implement escalation scope filtering (same project/milestone only)
- [ ] 4.7 Implement metrics tracking endpoints (view counter, action logging)

## 5. Frontend — Calendar Dashboard

- [ ] 5.1 Create calendar dashboard route/page shell
- [ ] 5.2 Build month view calendar component with color-coded event indicators
- [ ] 5.3 Build week view calendar component
- [ ] 5.4 Implement day hover/select summary panel ("1 Reminder, 2 Habits, 1 ToDo")
- [ ] 5.5 Add calendar navigation (previous/next month, today button)
- [ ] 5.6 Implement color legend for modules (blue, green, orange, red)

## 6. Frontend — Action List & Reminder Creation

- [ ] 6.1 Create action list panel showing chronological feed for selected date
- [ ] 6.2 Build action item component with module icon, title, context, due time
- [ ] 6.3 Implement direct action buttons per item type (Go to Project, Mark Habit, etc.)
- [ ] 6.4 Build advanced reminder creation form with recurrence options
- [ ] 6.5 Implement exception date picker in creation/editing form
- [ ] 6.6 Implement lifecycle period selector and pause/resume controls

## 7. Frontend — Conflict, Milestones & Escalation

- [ ] 7.1 Build conflict warning modal triggered during reminder creation/editing
- [ ] 7.2 Create milestone creation and management UI
- [ ] 7.3 Implement milestone auto-suggestion component with one-click add
- [ ] 7.4 Display milestone grouping in calendar and action list
- [ ] 7.5 Implement visual priority escalation indicators (red calendar markers, warning badges)
- [ ] 7.6 Build blocker dependency selector in reminder creation form

## 8. Frontend — Metrics & Traceability

- [ ] 8.1 Display source module and source link in reminder detail views
- [ ] 8.2 Show reminder view count and action history in detail panel
- [ ] 8.3 Implement cross-module navigation from reminder to source item
- [ ] 8.4 Add metrics tracking hooks on reminder views and action button clicks

## 9. Integration, Testing & Rollout

- [ ] 9.1 Write unit tests for recurrence expansion engine (all frequencies, exceptions, lifecycle)
- [ ] 9.2 Write integration tests for blocker dependency and conflict detection
- [ ] 9.3 Write tests for priority escalation background job
- [ ] 9.4 Validate unified dashboard data consistency across calendar and list views
- [ ] 9.5 Perform end-to-end testing for reminder creation with advanced options
- [ ] 9.6 Test responsive behavior of calendar dashboard on mobile viewports
- [ ] 9.7 Deploy with rollback plan and monitor for performance issues on event aggregation
