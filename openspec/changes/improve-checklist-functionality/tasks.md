## 1. Database Migration

- [x] 1.1 Add columns to Checklist model: isTemplate, version, lifecycleState, templateId, recurrencePattern, completedAt
- [x] 1.2 Add columns to ChecklistItem model: parentId, blockedByItemId, effortEstimate
- [x] 1.3 Add indexes for parentId and blockedByItemId on checklist_item
- [x] 1.4 Add index for lifecycleState on checklist
- [x] 1.5 Update Prisma client and generate migration

## 2. Core API Endpoints

- [x] 2.1 Create POST /api/checklists/templates endpoint for creating templates
- [x] 2.2 Create POST /api/checklists/templates/:id/instantiate endpoint
- [x] 2.3 Create GET /api/checklists/history endpoint for archived checklists
- [x] 2.4 Create POST /api/checklists/:id/archive endpoint
- [x] 2.5 Create POST /api/checklist-items/:id/convert-to-todo endpoint

## 3. Backend Logic

- [x] 3.1 Implement auto-complete logic: set lifecycleState to 'Completed' when all items done
- [x] 3.2 Implement effort calculation: sum effortEstimate with priority weighting
- [x] 3.3 Implement dependency blocking logic: prevent completing blocked items
- [x] 3.4 Implement template instantiation: copy structure with clean state
- [x] 3.5 Implement recurrence pattern calculation for seasonal templates

## 4. UI - Checklist Page Updates

- [x] 4.1 Add tabs/filters for Templates, Active, and History views
- [x] 4.2 Add mini-Dashboard component (deadline, priority badge, progress bar)
- [x] 4.3 Implement nested items display with indentation
- [x] 4.4 Add UI for setting item dependencies (blockedByItemId)
- [x] 4.5 Add UI for setting effortEstimate on items
- [x] 4.6 Add visual indicator for blocked items

## 5. UI - Template Features

- [x] 5.1 Create template library view
- [x] 5.2 Add "Create from template" flow in new checklist modal
- [x] 5.3 Add version display on templates
- [x] 5.4 Add template variant creation (copy with templateId)

## 6. UI - History View

- [x] 6.1 Create history page listing archived checklists
- [x] 6.2 Display productivity metrics (completion %, estimated vs actual effort)
- [x] 6.3 Add archived checklist detail view
- [x] 6.4 Implement view-only mode for archived checklists