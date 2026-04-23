## Why

The current habit tracking functionality is too simplistic, offering only basic title/description tracking without planning cycles, progress metrics, or behavioral insights. Users need a robust system that supports goal-based planning, automated lifecycle management, streak tracking, and motivational feedback to build and maintain habits effectively.

## What Changes

- **Redesign the Habit data model** to support planning cycles (permanent or date-bounded), categorical organization, availability states (Active/Paused/Archived), and structured goals (Daily/Weekly/Monthly/Ratio targets).
- **Introduce automated progress metrics**: `CurrentStreak` calculation and `CompletionRate` computed against period objectives.
- **Separate the UI into three distinct views**:
  - **Configuration/Planning View**: For creating, editing, and managing habit lifecycles and goals.
  - **Daily/Weekly Action View**: A compact, frictionless interface for checking off habits with real-time progress indicators and daily summaries.
  - **Historical Archive View**: For analyzing past performance with streak charts and completion statistics over selectable periods.
- **Add Habit Blocker system**: Allow defining prerequisite habits that must be completed before another habit can be marked done.
- **Add Smart Notifications**: Context-aware reminders that reference current streaks or goal risk, not just static time alerts.
- **Add Gamification layer**: Experience points, levels (Beginner → Aspirant → Master), and rewards tied to habit completion.
- **Add optional Energy Tracking**: End-of-day energy level logging (1–5) to correlate performance with energy patterns.

## Capabilities

### New Capabilities
- `habit-advanced-model`: Extended habit entity with lifecycle states, planning cycles, categorization, and structured goal definitions.
- `habit-progress-metrics`: Automated calculation of current streaks and completion rates based on goal type and tracking history.
- `habit-planning-view`: Configuration interface for habit creation, editing, cycle management, and historical/archived habit review.
- `habit-action-view`: Compact daily/weekly dashboard for rapid habit completion, progress visualization, and end-of-day summaries.
- `habit-archive-view`: Historical analysis interface with streak charts and period-based completion statistics.
- `habit-blocker`: Prerequisite dependency system requiring one habit to be completed before another becomes completable.
- `habit-smart-notifications`: Context-aware reminder system referencing streak status and goal urgency.
- `habit-gamification`: Experience points, leveling system, and rewards for habit completion.
- `habit-energy-tracking`: Optional end-of-day energy logging to correlate performance with energy levels.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Database schema**: New tables or columns for habit cycles, goals, categories, completion logs, streak history, blocker relationships, XP/levels, and energy records.
- **Backend/API**: New endpoints for habit CRUD with advanced fields, progress calculation engines, blocker validation, notification scheduling, and gamification logic.
- **Frontend/UI**: Three new primary views (Planning, Action, Archive) plus widget components for progress bars, streak counters, and daily summaries.
- **Background jobs**: Automated lifecycle transitions when `EndDate` is exceeded, daily streak recalculation, and notification dispatch.
