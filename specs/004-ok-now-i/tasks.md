# Tasks: Deposit, Customer Suggestions, and GST Tax

**Input**: Design documents from `/specs/004-ok-now-i/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/service-interfaces.md

## Phase 3.1: Setup & Localization
- [x] T001 [P] Add English translations for "Deposit", "GST", "GST Rate", "Balance Due", "Customer Suggestions", and "What's New" onboarding labels in `src/i18n/locales/en.json`
- [x] T002 [P] Add French translations for "Deposit", "GST", "GST Rate", "Balance Due", "Customer Suggestions", and "What's New" onboarding labels in `src/i18n/locales/fr.json`

## Phase 3.2: Database & Migrations
- [x] T003 Update `src/services/Migration.js` to version 3: add `deposit`, `has_gst`, `gst_rate`, `clientAddress`, `clientEmail`, `clientPhone` to `invoices` and `quotes`; add `clientAddress`, `clientEmail`, `clientPhone` to `delivery_notes`; add `default_gst_rate` to `stores`.

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Unit test for `getUniqueCustomers` in `__tests__/services/DocumentService.test.js`
- [x] T005 [P] Unit test for GST and deposit calculation logic in a new file `__tests__/utils/calculations.test.js`
- [x] T006 [P] Unit test for input validation (deposit >= 0, gst_rate >= 0, clientEmail format) in `__tests__/utils/validation.test.js`

## Phase 3.4: Core Implementation (ONLY after tests are failing)
- [x] T007 [P] Update `src/services/DocumentService.js`: implement `getUniqueCustomers` and update `createDocumentForStore`/`updateDocument` to handle new fields.
- [x] T008 [P] Update `src/services/StoreService.js`: update `getStore`, `createStore`, and `updateStore` to handle `default_gst_rate`.
- [x] T009 [P] Create a reusable `Autocomplete` component in `src/components/Autocomplete.jsx` using `FlatList` and `TextInput`.
- [x] T010 Integrate `Autocomplete` into `src/components/DocumentForm.jsx` for the client name field, ensuring it auto-fills address, email, and phone.
- [x] T011 Update `src/components/DocumentForm.jsx`: add toggles for "Deposit" and "GST", implement calculation logic (post-discount), and add input validation for all new fields.
- [x] T012 Update `src/utils/pdfUtils.js`: update HTML templates to display GST line items and the deposit/balance breakdown.
- [x] T013 Update `src/screens/main/EditStoreScreen.jsx` to include a numeric input for `default_gst_rate` with validation.

## Phase 3.5: User Onboarding & Integration (Principle IX)
- [x] T014 Implement a version-aware "What's New" onboarding experience (modal or tooltip) for Version 3 features (Deposit, GST, Suggestions) in `src/screens/main/ManageStoresScreen.jsx` or a central navigator.

## Phase 3.6: Integration & Polish
- [x] T015 Verify data persistence for all new fields across creation, editing, and conversion (Quote -> Invoice).
- [x] T016 [P] Update `__tests__/DocumentBranding.test.js` to reflect new PDF field layouts.
- [x] T017 Run manual verification of all scenarios in `quickstart.md`.

## Dependencies
- T003 (Migration) must complete before T007 and T008 (Services).
- T007 (Services) and T009 (Autocomplete) must complete before T010 (Integration).
- T008 (Store Service) must complete before T013 (Edit Store UI).
- T001 and T002 (Localization) can run in parallel with Setup/Database tasks.
- All implementation tasks (T007-T014) depend on failing tests (T004-T006).

## Parallel Execution Examples
```powershell
# Phase 3.1: Localization
Task: "Add English translations in src/i18n/locales/en.json"
Task: "Add French translations in src/i18n/locales/fr.json"

# Phase 3.4: Services & Components (after T003)
Task: "Update DocumentService.js with getUniqueCustomers and new fields"
Task: "Update StoreService.js with default_gst_rate"
Task: "Create Autocomplete component in src/components/Autocomplete.jsx"
```
