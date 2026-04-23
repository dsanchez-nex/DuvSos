## 1. Database Schema Changes

- [ ] 1.1 Add `parent_id` nullable field to tasks table
- [ ] 1.2 Add `effort_minutes` integer field to tasks table
- [ ] 1.3 Make `due_date` and `due_time` required fields on tasks
- [ ] 1.4 Create `categories` table with id, name, color, icon, description, parent_id, created_at
- [ ] 1.5 Add `category_id` foreign key to tasks table
- [ ] 1.6 Create default "General" category in migration

## 2. Task Hierarchy Implementation

- [ ] 2.1 Implement recursive task loading with sub-tasks
- [ ] 2.2 Add API endpoint for creating sub-tasks
- [ ] 2.3 Implement progress calculation for parent tasks
- [ ] 2.4 Add auto-complete logic when all sub-tasks are done

## 3. Category Management

- [ ] 3.1 Implement CRUD for categories
- [ ] 3.2 Add support for nested categories (parent_id)
- [ ] 3.3 Add category metadata (color, icon, description)
- [ ] 3.4 Assign default category to tasks without one

## 4. Dynamic Grouping Views

- [ ] 4.1 Implement "Group by Category" query/view
- [ ] 4.2 Implement "Group by Priority" query/view
- [ ] 4.3 Implement "Group by Status" query/view

## 5. Effort Estimation

- [ ] 5.1 Add effort_minutes field to UI task form
- [ ] 5.2 Display effort in human-readable format (e.g., "2h 30m")
- [ ] 5.3 Add effort to dashboard metrics

## 6. Dashboard & Temporal Views

- [ ] 6.1 Create dashboard metrics endpoint (/todos/metrics)
- [ ] 6.2 Implement "Today" view filter
- [ ] 6.3 Implement "Week" view filter (7 days)
- [ ] 6.4 Show upcoming and overdue tasks on dashboard

## 7. Advanced Filtering

- [ ] 7.1 Implement query builder for combined filters
- [ ] 7.2 Add search by title functionality
- [ ] 7.3 Add search by category name
- [ ] 7.4 Implement AND logic for multiple filters