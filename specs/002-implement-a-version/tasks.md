# Tasks: Version-Aware Onboarding

**Input**: Design documents from `specs/002-implement-a-version/`

## Phase 3.1: Setup
- [ ] T001 [P] Add `react-native-device-info` dependency to `package.json`.
- [ ] T002 [P] Add `@react-native-async-storage/async-storage` dependency to `package.json` (if not already present).
- [ ] T003 Run `npm install` to install the new dependencies.

## Phase 3.2: Tests First (TDD)
- [ ] T004 [P] Create a test file `__tests__/services/OnboardingService.test.js` to test the `OnboardingService`. Write failing tests for `getOnboardingState` and `saveOnboardingState` based on the contract in `specs/002-implement-a-version/contracts/internal-api.md`. Mock `@react-native-async-storage/async-storage`.

## Phase 3.3: Core Implementation
- [ ] T005 Create the `OnboardingService.js` file in `src/services/`. Implement `getOnboardingState` and `saveOnboardingState` functions. These functions should handle the full `OnboardingState` object, which includes not only the completed version but also the current step of the setup process if it's in progress. This will make the tests in `T004` pass.
- [ ] T006 Create the `OnboardingContext.jsx` file in `src/contexts/`. This context will provide the onboarding status (`NEEDS_INITIAL_SETUP`, `NEEDS_UPDATE_TUTORIAL`, `COMPLETED`), the current step in the setup flow, and functions to update the step and to mark onboarding as complete.
- [ ] T007 Create the `InitialSetupNavigator.jsx` file in `src/navigation/`. This will be a stack navigator containing the screens for the initial setup.
- [ ] T008 Create the `UpdateTutorialNavigator.jsx` file in `src/navigation/`. This will be a stack navigator for the "What's New" tutorial screens.
- [ ] T009 Create the initial setup screen `WelcomeScreen.jsx` in `src/screens/setup/`.
- [ ] T010 Create the update tutorial screen `WhatsNewScreen.jsx` in `src/screens/tutorial/`.

## Phase 3.4: Integration
- [ ] T011 Modify the root navigator `AppNavigator.jsx` in `src/navigation/`. Use the `OnboardingContext` to implement the conditional logic that decides which navigator to show (`InitialSetupNavigator`, `UpdateTutorialNavigator`, or `MainNavigator`).
- [ ] T012 Integrate the `OnboardingService` within the `OnboardingContext` to fetch and update the onboarding status. The context should also handle the "Version Read Failure" edge case by using a `try/catch` block when getting the version and logging an error with `console.error` if it fails.

## Phase 3.5: Polish
- [ ] T013 [P] Ensure all new user-facing text in the new screens is added to the i18n files (`src/i18n/locales/en.json` and `fr.json`).
- [ ] T014 [P] Ensure all new screens correctly apply styles from the `ThemeContext` for both light and dark modes.
- [ ] T015 Manually test the entire flow as described in `specs/002-implement-a-version/quickstart.md`.

## Dependencies
- `T001`, `T002` must be done before `T003`.
- `T003` must be done before any other implementation task.
- `T004` (failing tests) must be done before `T005`.
- `T005` (service implementation) must be done before `T012`.
- `T006` (context) must be done before `T011` and `T012`.
- `T007`, `T008`, `T009`, `T010` (navigators and screens) must be done before `T011`.

## Parallel Example
The following setup and polish tasks can be run in parallel:
```
Task: "T001 [P] Add react-native-device-info dependency to package.json."
Task: "T002 [P] Add @react-native-async-storage/async-storage dependency to package.json."
---
Task: "T013 [P] Ensure all new user-facing text in the new screens is added to the i18n files."
Task: "T014 [P] Ensure all new screens correctly apply styles from the ThemeContext."
```