# sidebar-profile-menu Specification

## Purpose
TBD - created by archiving change sidebar-cleanup-and-profile-menu. Update Purpose after archive.
## Requirements
### Requirement: Profile dropdown menu
The system SHALL provide a dropdown menu accessible from the user's profile section in the sidebar containing links to Settings, Support, and Log Out.

#### Scenario: Opening the profile menu
- **WHEN** a user clicks on their profile photo or name in the sidebar
- **THEN** a dropdown menu appears with links for Settings, Support, and Log Out

#### Scenario: Closing the profile menu
- **WHEN** a user clicks outside the dropdown menu
- **THEN** the dropdown menu closes

#### Scenario: Navigating from profile menu
- **WHEN** a user clicks "Settings" in the profile dropdown
- **THEN** the system navigates to the Settings page and the dropdown closes

### Requirement: Settings link moved to profile menu
The Settings link SHALL no longer appear as a permanent item in the sidebar; it SHALL only be accessible via the profile dropdown.

#### Scenario: Sidebar without Settings link
- **WHEN** a user views the sidebar
- **THEN** the Settings link is not visible as a standalone navigation item

### Requirement: Support link moved to profile menu
The Support link SHALL no longer appear as a permanent item in the sidebar; it SHALL only be accessible via the profile dropdown.

#### Scenario: Sidebar without Support link
- **WHEN** a user views the sidebar
- **THEN** the Support link is not visible as a standalone navigation item

### Requirement: Log Out link moved to profile menu
The Log Out link SHALL no longer appear as a permanent item in the sidebar; it SHALL only be accessible via the profile dropdown.

#### Scenario: Sidebar without Log Out link
- **WHEN** a user views the sidebar
- **THEN** the Log Out link is not visible as a standalone navigation item

