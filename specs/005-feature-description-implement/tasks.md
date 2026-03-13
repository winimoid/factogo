# Tasks: Full System Backup and Restore

**Input**: Design documents from `/specs/005-feature-description-implement/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Phase 3.1: Setup
- [x] T001 Verify installation of required dependencies: `react-native-zip-archive`, `react-native-fs`, `@react-native-async-storage/async-storage`, `react-native-share`, `react-native-document-picker` in `package.json`.
- [x] T002 [P] Create the directory `specs/005-feature-description-implement/contracts/` if not already present.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T003 [P] Contract test for `BackupService.createBackup()` in `__tests__/services/BackupService.contract.test.js`.
- [x] T004 [P] Contract test for `BackupService.restoreBackup()` in `__tests__/services/BackupService.contract.test.js`.
- [x] T005 [P] Integration test for "Scenario 1: Successful Backup and Restore" in `__tests__/integration/BackupRestore.integration.test.js`.
- [x] T006 [P] Integration test for "Scenario 2: Restore from Invalid File" in `__tests__/integration/BackupRestore.integration.test.js`.
- [x] T007 [P] Integration test for "Scenario 3: Restore with Destructive Overwrite Confirmation" in `__tests__/integration/BackupRestore.integration.test.js`.

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T008 [P] Implement SQLite table data extraction helper in `src/services/BackupService.js`.
- [x] T009 [P] Implement image asset collection and relative path mapping in `src/services/BackupService.js`.
- [x] T010 [P] Implement `createBackup()` function (JSON serialization + ZIP compression) in `src/services/BackupService.js`, including error handling for insufficient disk space.
- [x] T011 [P] Implement `restoreBackup()` function (ZIP extraction + destructive DB overwrite + image relocation + AsyncStorage restore) in `src/services/BackupService.js`.
- [x] T012 Implement confirmation dialog and app restart trigger using `react-native-restart` in `src/screens/main/BackupRestoreScreen.jsx`.

## Phase 3.4: Integration
- [x] T013 Update `BackupRestoreScreen.jsx` to use `BackupService.createBackup()` and trigger native share dialog via `react-native-share`.
- [x] T014 Update `BackupRestoreScreen.jsx` to use `react-native-document-picker` for selecting `.fctg` files and calling `BackupService.restoreBackup()`.
- [x] T015 Ensure proper permission handling for reading/writing files in `BackupRestoreScreen.jsx`.

## Phase 3.5: Polish
- [x] T016 [P] Unit tests for data validation logic in `__tests__/services/BackupService.unit.test.js`.
- [x] T017 [P] Add detailed logging for backup/restore operations in `src/services/BackupService.js`.
- [x] T018 Verify cross-platform path handling (Android vs iOS) in `BackupService.js`.
- [x] T019 Run full manual validation as per `quickstart.md`, including a check for memory usage stability during large data exports.

## Dependencies
- T001 blocks all subsequent tasks.
- Tests (T003-T007) MUST be implemented and failing before T008-T012.
- T008-T011 block integration tasks T013-T015.
- Implementation before polish (T016-T019).

## Parallel Example
```
# Launch T003-T007 together (all are new test files or independent scenarios):
Task: "Contract test createBackup in __tests__/services/BackupService.contract.test.js"
Task: "Integration test Successful Backup and Restore in __tests__/integration/BackupRestore.integration.test.js"
```

## Notes
- [P] tasks involve different files or independent logic blocks within the same service (when noted).
- `react-native-restart` is already in dependencies and should be used for the mandatory app restart.
- The `.fctg` file is essentially a renamed `.zip` file for better user recognition.
