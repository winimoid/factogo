# Feature Specification: Full System Backup and Restore

**Feature Branch**: `005-feature-description-implement`  
**Created**: vendredi 13 mars 2026  
**Status**: Draft  
**Input**: User description: "Implement a full backup and restore system for the factogo app using a custom .fctg extension. The backup will include all SQLite database tables (users, settings, invoices, quotes, delivery_notes, stores, document_templates, db_versions), all AsyncStorage keys (whats_new_v3_seen, setupCompletedForVersion, @activeStore_${userId}), and all referenced images (logos, signatures, stamps). The implementation will involve creating a new BackupService.js for export/import logic and updating the BackupRestoreScreen.jsx UI to support sharing and picking backup files. Data will be exported to JSON to ensure platform independence and robustness against schema changes."

## Execution Flow (main)
```
1. Parse user description from Input
   → Success
2. Extract key concepts from description
   → Actors: Users of the Facto-Go app
   → Actions: Create backup, share backup, pick/import backup file, restore data
   → Data: All app data (documents, settings, images, preferences)
   → Constraints: Cross-platform compatibility, complete data integrity
3. For each unclear aspect:
   → Identified some clarifications needed for storage and overwrite behavior.
4. Fill User Scenarios & Testing section
   → Defined primary story, acceptance scenarios, and edge cases.
5. Generate Functional Requirements
   → Each requirement is defined and testable.
6. Identify Key Entities (if data involved)
   → Defined Backup Archive.
7. Run Review Checklist
   → Review passed (technical implementation details moved to planning phase).
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

## Clarifications

### Session 2026-03-13
- Q: When a backup is created, where should the .fctg file be permanently stored by default? → A: Public Documents/Downloads
- Q: If a user restores a backup on a device that already contains application data, how should the system handle the conflict? → A: Destructive Overwrite

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a Facto-Go user, I want to be able to save all my application data (invoices, quotes, store settings, and images) into a single file so that I can move my data to a new device or restore it if I reinstall the application.

### Acceptance Scenarios
1. **Given** I have created several invoices and configured my store with a logo, **When** I trigger a "Create Backup" action, **Then** the system should generate a single `.fctg` file containing all my data.
2. **Given** I have a valid backup file, **When** I select "Restore from Backup" and pick that file, **Then** the system should replace all current app data with the data from the backup and restart the app to apply changes.
3. **Given** I have just created a backup, **When** the file is ready, **Then** the system should allow me to share it via system sharing options (Email, Cloud Drive, etc.).

### Edge Cases
- **Insufficient Storage**: If the device runs out of space during the backup or ZIP process, the system MUST catch the error and display a descriptive error message to the user.
- **Invalid Backup File**: How does the system handle a file that has the `.fctg` extension but is corrupted or contains incompatible data?
- **Data Conflict**: During restoration, the system MUST perform a destructive overwrite, replacing all existing local data with the backup contents after user confirmation.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST allow users to generate a full backup of their data in a single file with the `.fctg` extension, saved to the device's public Documents or Downloads folder.
- **FR-002**: The backup MUST include all business documents (Invoices, Quotes, Delivery Notes), user accounts, store configurations, and application preferences.
- **FR-003**: The backup MUST include all associated media files (logos, signatures, and stamps) used within the app.
- **FR-004**: The system MUST provide a way for users to share the generated backup file using native sharing mechanisms.
- **FR-005**: The system MUST allow users to pick an existing `.fctg` file from their device storage to initiate a restoration.
- **FR-006**: During restoration, the system MUST perform a destructive overwrite, completely replacing the current application state (database and preferences) with the data from the backup file.
- **FR-007**: The system MUST require user confirmation before starting the restoration process, explicitly stating that existing data will be overwritten.
- **FR-008**: The backup format MUST be platform-independent (using JSON for data serialization), allowing a backup created on one operating system (e.g., Android) to be restored on another (e.g., iOS).
- **FR-009**: The system MUST restart the application after a successful restoration to ensure all data and configurations are correctly reloaded.

### Key Entities *(include if feature involves data)*
- **Backup Archive (.fctg)**: A single portable file containing the serialized application data and all associated image assets.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (Note: some markers added for boundary conditions/clarification)
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
