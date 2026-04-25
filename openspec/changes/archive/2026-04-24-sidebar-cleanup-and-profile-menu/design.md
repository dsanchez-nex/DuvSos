## Context

The sidebar currently exposes a Finances navigation link that is no longer part of the product, creating dead code and visual clutter. Settings, Support, and Log Out are rendered as permanent bottom links, consuming vertical space. The goal is to remove all Finances-related artifacts and consolidate secondary actions into a profile-attached dropdown menu.

## Goals / Non-Goals

**Goals:**
- Remove the Finances view, its route, and all related code references.
- Consolidate Settings, Support, and Log Out into a dropdown triggered by the profile section.
- Ensure no dead imports, types, or test files remain after removal.

**Non-Goals:**
- Redesigning the sidebar layout or navigation items beyond Finances removal and profile menu.
- Changing the behavior of Settings, Support, or Log Out pages.
- Introducing new user preferences or backend changes.

## Decisions

1. **Delete Finances component and route entirely rather than feature-flagging**
   - *Rationale*: The feature is permanently discontinued. Removing the code prevents technical debt and confusion.
   - *Alternative considered*: Keep code behind a flag — rejected because there is no plan to re-enable it.

2. **Use a native HTML/CSS dropdown for the profile menu**
   - *Rationale*: The menu has only three items. A lightweight custom dropdown avoids adding a dependency for such a simple use case.
   - *Alternative considered*: Install a dropdown component library — rejected because it is overkill for three static links.

3. **Click outside to close the profile menu**
   - *Rationale*: Standard UX pattern for dropdowns. Keeps the interface clean and intuitive.

4. **Remove all Finances-related types, constants, and tests in the same change**
   - *Rationale*: Dead code elimination should be thorough. Leaving types or tests creates confusion and misleading coverage.

## Risks / Trade-offs

- **Broken external links risk**: Any bookmarks or hardcoded links to /finances will 404.
  - *Mitigation*: The route is already unused in the app; no internal links should remain after cleanup. Consider a redirect if needed.

- **Accidental deletion risk**: Removing Finances code might inadvertently delete shared utilities.
  - *Mitigation*: Review deletions carefully; only remove files and imports explicitly scoped to Finances.

## Migration Plan

1. Identify and delete Finances page/component files.
2. Remove Finances route from the router.
3. Remove Finances navigation item from the sidebar.
4. Search the codebase for Finances references (imports, types, constants, tests) and delete them.
5. Add profile dropdown to the sidebar with Settings, Support, and Log Out links.
6. Verify the app builds and tests pass.

## Open Questions

- Should the /finances route redirect to the dashboard or show a 404?
