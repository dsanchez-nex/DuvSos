## 1. Database Schema Changes

- [x] 1.1 Add `parent_id` nullable field to tasks table
- [x] 1.2 Add `effort_minutes` integer field to tasks table
- [x] 1.3 Make `due_date` and `due_time` required fields on tasks
- [x] 1.4 Create `categories` table with id, name, color, icon, description, parent_id, created_at
- [x] 1.5 Add `category_id` foreign key to tasks table
- [x] 1.6 Create default "General" category in migration

## 2. Task Hierarchy Implementation

- [x] 2.1 Implement recursive task loading with sub-tasks
- [x] 2.2 Add API endpoint for creating sub-tasks
- [x] 2.3 Implement progress calculation for parent tasks
- [x] 2.4 Add auto-complete logic when all sub-tasks are done

## 3. Category Management

- [x] 3.1 Implement CRUD for categories
- [x] 3.2 Add support for nested categories (parent_id)
- [x] 3.3 Add category metadata (color, icon, description)
- [x] 3.4 Assign default category to tasks without one

## 4. Dynamic Grouping Views

- [x] 4.1 Implement "Group by Category" query/view
- [x] 4.2 Implement "Group by Priority" query/view
- [x] 4.3 Implement "Group by Status" query/view

## 5. Effort Estimation

- [x] 5.1 Add effort_minutes field to UI task form
- [x] 5.2 Display effort in human-readable format (e.g., "2h 30m")
- [x] 5.3 Add effort to dashboard metrics

## 6. Dashboard & Temporal Views

- [x] 6.1 Create dashboard metrics endpoint (/todos/metrics)
- [x] 6.2 Implement "Today" view filter
- [x] 6.3 Implement "Week" view filter (7 days)
- [x] 6.4 Show upcoming and overdue tasks on dashboard

## 7. Advanced Filtering

- [x] 7.1 Implement query builder for combined filters
- [x] 7.2 Add search by title functionality
- [x] 7.3 Add search by category name
- [x] 7.4 Implement AND logic for multiple filters

## 8. Bug Fixes & Polish

- [x] 8.1 Fix "Invalid Date" display for ISO date strings from Prisma
- [x] 8.2 Fix subtasks disappearing after editing todo
- [x] 8.3 Prevent creating todos with past due dates
- [x] 8.4 Fix Today/Week filters to work with ISO date strings
- [x] 8.5 Move category creation UI from TodoList to Settings page
- [x] 8.6 Replace free color picker with curated palette (7 colors)
- [x] 8.7 Add search debounce (400ms) and clear button
- [x] 8.8 Add unit tests for date/format utilities (Vitest)
- [x] 8.9 Fix filters destroying nested where (AND/OR) causing subtareas to disappear
- [x] 8.10 Fix timezone mismatch: server UTC vs client local for Today/Week filters
- [x] 8.11 Fix isPastDate rejecting today's date due to UTC interpretation
- [x] 8.12 Add API error banner with user-friendly messages (e.g., past date rejected)
- [x] 8.13 Make completed section collapsible
- [x] 8.14 Group by: active items first, completed items grouped separately at bottom