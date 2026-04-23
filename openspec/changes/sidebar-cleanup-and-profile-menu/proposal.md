## Why

The sidebar currently includes a Finances view that is no longer used, leaving dead code and navigation clutter. Additionally, Settings, Support, and Log Out links occupy permanent space at the bottom of the sidebar, contributing to visual noise. Consolidating these secondary actions into a profile dropdown menu will clean up the sidebar and follow modern UX patterns.

## What Changes

- **Remove Finances view and all related code**: Delete the Finances page/component, its route definitions, sidebar navigation item, and any associated utilities or types. **BREAKING** for any hardcoded links to /finances.
- **Add profile dropdown menu**: Move Settings, Support, and Log Out links into a dropdown menu triggered by clicking the user's profile photo/section in the sidebar.
- **Clean up dead references**: Ensure no imports, types, constants, or test files reference the removed Finances functionality.

## Capabilities

### New Capabilities
- `sidebar-profile-menu`: Dropdown menu anchored to the profile section containing Settings, Support, and Log Out links.

### Modified Capabilities
<!-- No existing specs found; no requirement-level modifications to prior capabilities. -->

## Impact

- **Frontend/UI**: Sidebar component updated to remove Finances link and add profile dropdown; Finances page/component deleted.
- **Routing**: Finances route removed from the router configuration.
- **Codebase**: Dead code elimination across components, types, constants, and tests related to Finances.
