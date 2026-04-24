## 1. Database Schema & Migration

- [x] 1.1 Add `Category` table and seed a default "General" category
- [x] 1.2 Extend `Habit` table: add `categoryId`, `state` (Active/Paused/Archived), `isPermanent`, `startDate`, `endDate`, `goalType`, `goalValue`
- [x] 1.3 Create `HabitCompletion` table: `habitId`, `completedAt`, `date` (normalized)
- [x] 1.4 Create `HabitBlocker` table: `habitId`, `blockerHabitId`
- [x] 1.5 Create `UserProgression` table: `userId`, `totalXP`, `currentLevel`
- [x] 1.6 Create `EnergyLog` table: `userId`, `date`, `level` (1–5)
- [x] 1.7 Write and run data migration: set existing habits to `isPermanent = true`, `goalType = Daily`, `goalValue = 1`, `state = Active`, and assign default category
- [x] 1.8 Add indexes on `HabitCompletion` (`habitId`, `date`) and `Habit` (`state`, `endDate`)

## 2. Backend — Core Habit Model & API

- [x] 2.1 Update Habit domain model/entity with new fields and validation rules
- [x] 2.2 Implement Habit CRUD endpoints supporting advanced planning attributes
- [x] 2.3 Implement category association and category list endpoint
- [x] 2.4 Implement habit state transitions (Active ↔ Paused ↔ Archived) with authorization
- [x] 2.5 Implement cycle validation (endDate >= startDate when not permanent)
- [x] 2.6 Implement automated lifecycle background job: archive habits whose endDate has passed

## 3. Backend — Progress Metrics

- [x] 3.1 Implement streak calculation engine based on goal type (daily/weekly/monthly)
- [x] 3.2 Implement completion rate engine for current evaluation period
- [x] 3.3 Add daily recalculation job that updates cached metrics for active habits
- [x] 3.4 Expose metrics in habit list/detail responses or dedicated endpoint
- [x] 3.5 Add caching layer for per-user daily metrics to reduce repeated computation

## 4. Backend — Blockers, Notifications, Gamification, Energy

- [x] 4.1 Implement blocker relationship CRUD and validation
- [x] 4.2 Enforce blocker validation at the completion endpoint (reject if prerequisites unmet)
- [x] 4.3 Implement smart notification content generator (streak context, urgency)
- [x] 4.4 Implement notification scheduling and per-habit notification preferences
- [x] 4.5 Implement XP awarding on habit completion and level threshold evaluation
- [x] 4.6 Implement energy logging endpoint and basic correlation query

## 5. Frontend — Planning View

- [x] 5.1 Create planning view route/page shell
- [x] 5.2 Build habit creation form with all advanced fields (title, description, category, state, cycle, goal)
- [x] 5.3 Build habit editing form with cycle management toggle (permanent vs bounded)
- [x] 5.4 Implement planning list with filters: All, Active, Paused, Archived
- [x] 5.5 Implement habit-to-objective grouping UI (create/select objective, assign habits)

## 6. Frontend — Action View

- [x] 6.1 Create action view route/page shell
- [x] 6.2 Build compact daily/weekly habit list showing only active habits for current period
- [x] 6.3 Add progress indicators per habit (progress bar + text: "X of Y this period")
- [x] 6.4 Implement single-click completion with immediate visual feedback (animation/checkmark)
- [x] 6.5 Add objective reminder text per habit ("You need N executions this period")
- [x] 6.6 Build end-of-day summary panel (completed count, incomplete count, encouragement)

## 7. Frontend — Archive View

- [x] 7.1 Create archive view route/page shell
- [x] 7.2 Build period selector (month/year) for historical analysis
- [x] 7.3 Display total completions for the selected period
- [x] 7.4 Build streak chart component showing consecutive completion blocks per habit

## 8. Frontend — Gamification & Energy

- [x] 8.1 Display current XP and level in user profile or action view header
- [x] 8.2 Show level-up notification when threshold is crossed
- [x] 8.3 Show milestone reward messages (e.g., 30 completions)
- [x] 8.4 Build optional end-of-day energy level selector (1–5)
- [x] 8.5 Display energy-performance correlation insight in archive/habit detail

## 9. Integration, Testing & Rollout

- [ ] 9.1 Write unit tests for streak and completion rate calculators
- [ ] 9.2 Write integration tests for habit CRUD, blocker validation, and completion flow
- [ ] 9.3 Write tests for lifecycle transition job and notification scheduling
- [x] 9.4 Validate backward compatibility for existing habits after migration
- [x] 9.5 Perform end-to-end testing across planning, action, and archive views
- [ ] 9.6 Deploy with rollback plan and monitor for data drift or performance issues
