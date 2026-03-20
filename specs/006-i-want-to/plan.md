
# Implementation Plan: Welcome Board (What's New)

**Branch**: `006-i-want-to` | **Date**: 2026-03-13 | **Spec**: `/specs/006-i-want-to/spec.md`
**Input**: Feature specification from `/specs/006-i-want-to/spec.md`

## Execution Flow (/plan command scope)
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, GEMINI.md
7. Re-evaluate Constitution Check section
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command

## Summary
The goal is to implement a visually appealing "What's New" modal (Welcome Board) that appears the first time the app is launched after a version update or a fresh install. This follows the constitutional principle of providing a version-aware onboarding experience. The implementation will use `AsyncStorage` to track the last version the user has acknowledged and will show a localized modal with the key highlights for version 3.0.

## Technical Context
**Language/Version**: JavaScript (React Native 0.81.0)
**Primary Dependencies**: `react-native-paper`, `react-native-async-storage`
**Storage**: `AsyncStorage` (last_version_seen)
**Testing**: `jest`
**Target Platform**: iOS, Android
**Project Type**: mobile
**Performance Goals**: Minimal impact (single AsyncStorage check on launch)
**Constraints**: Must match existing theme and support French/English.
**Scale/Scope**: App-wide onboarding trigger.

## Constitution Check
- **I. Code Quality:** PASS. Clean React Native code with modular components.
- **II. State Management:** PASS. Local component state for visibility; persistence via AsyncStorage.
- **III. Internationalization:** PASS. New keys added to EN/FR locales.
- **IV. Theming:** PASS. Uses React Native Paper components which respect the app's theme.
- **V. Multi-Store Support:** PASS. Independent of store-specific data.
- **VI. Reusable Components:** PASS. `WhatsNewModal` is a modular UI component.
- **VII. Data Integrity:** PASS. Simple version string comparison.
- **VIII. Scalability:** PASS. Scalable version tracking for future updates.
- **IX. User Onboarding & Education:** PASS. Core feature implementation.

## Project Structure

### Documentation (this feature)
```
specs/006-i-want-to/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)
```
src/
├── components/
│   └── WhatsNewModal.jsx  # New component
├── screens/
│   └── main/
│       └── HomeScreen.jsx # Updated to trigger modal
├── i18n/
│   └── locales/
│       ├── en.json       # Updated translations
│       └── fr.json       # Updated translations
```

**Structure Decision**: Single project (Mobile) structure.

## Phase 0: Outline & Research
- Research version comparison logic and `AsyncStorage` persistence.
- Refactor existing dialog from `ManageStoresScreen.jsx` into `WhatsNewModal.jsx`.
- Consolidate results in `research.md`.

## Phase 1: Design & Contracts
- Create `data-model.md` for version tracking.
- Document `WhatsNewModal` interface in `contracts/WhatsNewModal.md`.
- Provide `quickstart.md` for manual testing.
- Update `GEMINI.md`.

## Phase 2: Task Planning Approach
**Task Generation Strategy**:
- Create `WhatsNewModal` component.
- Add translation keys to locales.
- Implement version check logic in `HomeScreen`.
- Clean up old logic in `ManageStoresScreen`.
- Write unit tests for the component and logic.

**Ordering Strategy**:
- 1. UI (Component & Locales)
- 2. Logic (Version check)
- 3. Integration (HomeScreen)
- 4. Refactoring (ManageStoresScreen)
- 5. Testing

## Progress Tracking
- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [ ] Phase 2: Task planning complete
- [ ] Phase 3: Tasks generated
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented
