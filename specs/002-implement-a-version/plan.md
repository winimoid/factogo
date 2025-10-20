
# Implementation Plan: Version-Aware Onboarding

**Branch**: `002-implement-a-version` | **Date**: 2025-09-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-implement-a-version/spec.md`

## Summary
This feature implements a version-aware onboarding system. On first launch, new users will be guided through a mandatory setup process. Existing users updating the app will be shown a mandatory tutorial detailing new features. The system will use `AsyncStorage` to track the version for which a user has completed setup/tutorial, and `react-native-device-info` to get the current app version. Conditional logic in the root navigator will route users appropriately.

## Technical Context
**Language/Version**: JavaScript (ES6+)
**Primary Dependencies**: React Native, React Navigation, `react-native-device-info`, `@react-native-async-storage/async-storage`
**Storage**: `AsyncStorage` for the onboarding state object.
**Testing**: Jest, React Native Testing Library
**Target Platform**: iOS & Android
**Project Type**: Mobile
**Constraints**: The implementation must not disrupt the existing application flow for users who are already up-to-date. What already works must continue to work.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality:** **PASS** - The new code will follow existing conventions.
- **II. State Management:** **PASS** - A new `OnboardingContext` will be created to manage the onboarding state, adhering to the Context API rule.
- **III. Internationalization:** **PASS** - All new screens in the onboarding flows will use the i18n library.
- **IV. Theming:** **PASS** - New screens will support light and dark modes.
- **V. Multi-Store Support:** **PASS** - The initial setup flow will include creating the first store, aligning with this principle.
- **VI. Reusable Components:** **PASS** - UI elements for the tutorials will be designed for reuse.
- **VII. Data Integrity:** **PASS** - The `OnboardingState` will be validated before being saved.
- **VIII. Scalability:** **PASS** - The design is scalable for future onboarding or tutorial steps.
- **IX. User Onboarding & Education:** **PASS** - This feature is the direct implementation of this principle.

## Project Structure

### Documentation (this feature)
```
specs/002-implement-a-version/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   └── internal-api.md
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── contexts/
│   └── OnboardingContext.jsx      # New context for onboarding state
├── services/
│   └── OnboardingService.js       # New service for AsyncStorage logic
├── navigation/
│   ├── InitialSetupNavigator.jsx  # New navigator for the first-time user flow
│   └── UpdateTutorialNavigator.jsx # New navigator for the "What's New" flow
└── screens/
    ├── setup/                   # New screens for the initial setup
    │   ├── WelcomeScreen.jsx
    │   └── ...
    └── tutorial/                  # New screens for the update tutorial
        └── WhatsNewScreen.jsx
```

**Structure Decision**: The feature will be implemented within the existing `src/` directory structure, following the Mobile project type. New contexts, services, navigators, and screens will be added in their respective directories as outlined above.

## Phase 0: Outline & Research
Research has been completed and consolidated in `research.md`. Key decisions include using `react-native-device-info` for version checking, `@react-native-async-storage/async-storage` for state persistence, and centralizing the conditional routing logic in the root navigator.

**Output**: `research.md`

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

The data model for the `OnboardingState` has been defined in `data-model.md`. The internal API contract for the `OnboardingService` has been defined in `contracts/internal-api.md`. Manual test scenarios have been documented in `quickstart.md`.

**Output**: `data-model.md`, `contracts/internal-api.md`, `quickstart.md`

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base.
- Generate tasks from the design artifacts:
  - Create `OnboardingContext` to manage state.
  - Implement `OnboardingService` based on the internal API contract.
  - Add `react-native-device-info` dependency.
  - Implement the core version-checking logic in `AppNavigator`.
  - Build the `InitialSetupNavigator` and its screens.
  - Build the `UpdateTutorialNavigator` and its screens.
  - Create Jest tests for the `OnboardingService` and the context.

**Ordering Strategy**:
- TDD: Tests for the service first.
- Dependency order: Context and Service -> Navigator Logic -> UI Screens.

**Estimated Output**: 15-20 numbered, ordered tasks in `tasks.md`.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [X] Phase 0: Research complete (/plan command)
- [X] Phase 1: Design complete (/plan command)
- [X] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [X] Initial Constitution Check: PASS
- [X] Post-Design Constitution Check: PASS
- [X] All NEEDS CLARIFICATION resolved
- [X] Complexity deviations documented: None

---
*Based on Constitution v1.2.0 - See .specify/memory/constitution.md*
