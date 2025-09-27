# Tasks: Multi-Store Support

**Input**: Design documents from `/specs/001-project-factogo-this/`

This task list is generated based on the implementation plan and design artifacts. Tasks are ordered by dependency.

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- All paths are relative to the repository root (`/`).

## Phase 3.1: Database & Migration
*These tasks modify the core database structure and must be completed first.*

- [ ] T001 [DB] Create a new database migration script in `src/services/Database.js` to add the `Stores` and `DocumentTemplates` tables based on `data-model.md`.
- [ ] T002 [DB] In the same migration script, add the `storeId` foreign key column to the existing `Documents` and `Clients` tables.
- [ ] T003 [DB] In the migration script, add logic to create a "Default Store" for existing users and associate all their current documents and clients with it.

## Phase 3.2: Services (Data Layer)
*Depends on Phase 3.1. These tasks create the data access layer.*

- [ ] T004 [P] [Test] Create the test file `tests/services/StoreService.test.js` with failing tests for all CRUD functions.
- [ ] T005 [Service] Create `src/services/StoreService.js` and implement the `createStore`, `getStore`, `getStoresForUser`, `updateStore`, and `archiveStore` functions to make the tests in T004 pass.
- [ ] T006 [Service] Refactor `src/services/DocumentService.js` to be store-aware. Implement `createDocumentForStore` and `getDocumentsForStore`.
- [ ] T007 [Service] Refactor `src/services/ClientService.js` to be store-aware. Implement `createClientForStore` and `getClientsForStore`.

## Phase 3.3: State Management (Context API)
*Depends on Phase 3.2. This task provides global access to the active store.*

- [ ] T008 [Context] Create and implement the provider and hook for the active store in `src/contexts/StoreContext.js`.

## Phase 3.4: UI (Screens & Components)
*Depends on Phase 3.3. These tasks build the user-facing elements.*

- [ ] T009 [P] [UI] Create the `StoreListItem` component in `src/components/store/StoreListItem.jsx`.
- [ ] T010 [UI] Create the `ManageStoresScreen` in `src/screens/main/ManageStoresScreen.jsx` to list stores using `StoreListItem` and allow deletion/archiving.
- [ ] T011 [UI] Create the `EditStoreScreen` in `src/screens/main/EditStoreScreen.jsx` as a form to add or edit store details.
- [ ] T012 [UI] Create the `StoreSwitcher` component in `src/components/store/StoreSwitcher.jsx` (e.g., a dropdown menu).

## Phase 3.5: Integration & Refactoring
*Depends on all previous phases. This connects the new features to the existing app.*

- [ ] T013 [Integration] Integrate the `StoreProvider` from `StoreContext.js` into the main application component (`App.jsx`).
- [ ] T014 [Integration] Add the `StoreSwitcher` component to a global location, like the main application header.
- [ ] T015 [Refactor] Refactor existing screens (`HomeScreen`, `NewDocumentScreen`, etc.) to use the `useStore()` hook from `StoreContext` to filter their data.
- [ ] T016 [Refactor] Update the document generation logic (e.g., in `src/utils/pdfUtils.js`) to use the active store's `documentTemplateId` and logo.
- [ ] T017 [Refactor] Ensure all data-fetching calls on existing screens use the new store-aware service functions (e.g., `getDocumentsForStore(activeStore.id)`).

## Phase 3.6: Testing & Polish
*Final validation and cleanup.*

- [ ] T018 [P] [Test] Write an integration test for the full store management flow (Create, Read, Update, Archive) as described in `quickstart.md`.
- [ ] T019 [P] [Test] Write an integration test to verify that switching stores correctly changes the branding on a generated document.
- [ ] T020 [Polish] Review all new screens and components for style consistency with the existing theme.

## Dependencies
- **T001-T003** must be done first.
- **T004-T007** depend on **T001-T003**.
- **T008** depends on **T005**.
- **T009-T012** depend on **T008**.
- **T013-T020** depend on all previous tasks.

## Parallel Example
```
# The following UI components and initial tests can be worked on in parallel:
Task: "[P] [Test] Create the test file tests/services/StoreService.test.js with failing tests for all CRUD functions."
Task: "[P] [UI] Create the StoreListItem component in src/components/store/StoreListItem.jsx."
Task: "[P] [Test] Write an integration test for the full store management flow (Create, Read, Update, Archive) as described in quickstart.md."
```
