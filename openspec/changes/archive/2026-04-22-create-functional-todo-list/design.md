## Context

The DuvSos app has a habits system using Prisma with PostgreSQL and Next.js. The sidebar has a non-functional "To-Do List" link that needs to become a working feature. The existing habits system provides a template for how todos should work.

## Goals / Non-Goals

**Goals:**
- Create todo list with full CRUD operations (create, read, update, delete)
- Checkbox to mark tasks as complete, moving them to the bottom
- Uncheck to move tasks back to their original position
- Todo items tied to user account

**Non-Goals:**
- Due dates, priorities, categories, or subtasks
- Drag-and-drop reordering
- Recurring todos

## Decisions

### Decision 1: Todo belongs to User (not global)
**Rationale:** Consistent with habits model, enables per-user data isolation

**Alternative considered:** Global todo list shared across users

### Decision 2: Use position field for ordering
**Rationale:** Enables unchecking to return to original position rather than top of list

**Alternative considered:** Only sort by createdAt - rejected because unchecking would move to top

### Decision 3: Single API endpoint with method handling
**Rationale:** Consistent with existing habits API pattern

GET /api/todos → list all
POST /api/todos → create
PUT /api/todos → update (toggle complete, edit title)
DELETE /api/todos → delete

### Decision 4: Checked position behavior
**Rationale:** When checked, the todo moves below all unchecked items; when unchecked, returns to original position so items don't jump around unexpectedly

## Risks / Trade-offs

[Risk] Todos not deleted when user is deleted → Use cascade delete like habits
[Risk] Many checked todos accumulating → Consider adding "clear completed" action in future

## Migration Plan

1. Add Todo model to schema.prisma
2. Run prisma migrate
3. Create API routes
4. Create frontend page and components
5. Update sidebar link