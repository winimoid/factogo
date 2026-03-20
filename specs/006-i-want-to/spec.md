# Feature Specification: Welcome Board (What's New)

**Feature Branch**: `006-i-want-to`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "I want to do a “Welcome Board” that appears the first time the app is launched after an update: per example 1. A nice modal window. 2. Title: “What's new in version 3.0? 🚀” 3. 3 key points: * 💰 Down payment management: Manage partial payments. * ⚖️ Customizable VAT/GST: Easily configure your taxes. * 🔍 Auto-fill: Find your customers in a flash. 4. A “Let's go!” button. Translated with DeepL.com (free version)"

## Clarifications
### Session 2026-03-13
- Q: Should a brand new user who just installed the app for the first time see this "What's New" board? → A: Yes: Show it to all new users so they see current highlights immediately.
- Q: If a user skips several versions (e.g., updates from 2.0 directly to 3.0), which information should they see? → A: Latest Only: Show only the most recent "What's New" (version 3.0).
- Q: If a user uses the same account on multiple devices, should seeing the "What's New" on one device dismiss it for all others? → A: Device-specific: Show it once on every device the user uses.

## Execution Flow (main)
```
1. Parse user description from Input
...
## User Scenarios & Testing *(mandatory)*

### Primary User Story
When an existing user opens the app for the first time after updating to version 3.0, or when a new user installs the app for the first time, they should see a clear summary of the most important features. This helps them discover and understand the key capabilities immediately, improving their onboarding experience.

### Acceptance Scenarios
...
3. **Given** the user has already dismissed the "What's new" modal for version 3.0, **When** they close and reopen the app, **Then** the modal does not appear again.

### Edge Cases
- **Fresh Install**: Show the "What's New" board to all new users upon their first installation to highlight current features.
- **Multiple Updates**: If a user skips versions (e.g. 2.0 to 3.0), only show the "What's New" content for the latest installed version (3.0).
- **Multi-Device**: Since tracking is device-specific, a user using multiple devices will see the board once on each device they update.
- **App Language**: The modal content must match the user's selected language (English or French).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST detect when the application is launched for the first time on a new version (including fresh installs).
- **FR-002**: System MUST display a visually distinct modal window upon detecting a first-time launch for a version.
- **FR-003**: The modal window MUST contain the title "What's new in Version {{version}}? 🚀" where {{version}} is dynamically sourced from package.json (or localized equivalent).
- **FR-004**: The modal MUST highlight three specific features with descriptive text and icons/emojis:
    - 💰 **Down payment management**: Informing users they can now manage partial payments.
    - ⚖️ **Customizable VAT/GST**: Informing users they can easily configure taxes.
    - 🔍 **Auto-fill**: Informing users they can find customers quickly.
- **FR-005**: System MUST provide a "Let's go!" button (or localized equivalent) that dismisses the modal.
- **FR-006**: System MUST persist the information that the "What's New" board for the current version has been viewed by the user on the local device.
- **FR-007**: The modal MUST NOT reappear for the same version once it has been dismissed by the user on that device.
- **FR-008**: System MUST only display the "What's New" board for the current application version, even if multiple intermediate updates were skipped.

### Non-Functional Requirements

- **NFR-001**: The version check operation MUST NOT delay app launch by more than 100ms.
- **NFR-002**: The modal MUST render within 16ms (one frame) once visibility is triggered.
- **NFR-003**: AsyncStorage operations MUST be performed asynchronously to avoid blocking the UI thread.

### Key Entities *(include if feature involves data)*
- **User Preference/Metadata**: Stores the version number of the last launch on the local device to compare against the current version.
- **AsyncStorage Schema**:
  - Key: `last_version_seen` (string, e.g., "3.0.0")
  - Legacy Key: `whats_new_v3_seen` (string "true", migrated to last_version_seen)

---
...
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

...
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
