
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
This plan outlines the implementation of multi-store support, a foundational feature that allows users to manage multiple business entities within the application. It includes the necessary database schema changes, service layer adjustments, and UI/UX additions for store management and context switching. The plan also lays the groundwork for future inventory management capabilities.

## Technical Context
**Language/Version**: JavaScript (ES2021+)
**Primary Dependencies**: React Native, React Navigation, react-native-sqlite-storage
**Storage**: SQLite
**Testing**: Jest
**Target Platform**: iOS & Android
**Project Type**: Mobile
**Performance Goals**: UI interactions should remain at 60 fps; database queries should resolve in < 100ms.
**Constraints**: Must adhere to existing code style and project structure. No new major dependencies should be introduced without justification.
**Scale/Scope**: The initial implementation should be tested and validated for up to 50 stores per user. This is not a hard technical limit.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality:** Code MUST be clean, maintainable, and well-commented.
- **II. State Management:** Global state MUST use the Context API.
- **III. Internationalization:** All screens MUST support FR/EN localization.
- **IV. Theming:** The app MUST consistently support light/dark modes.
- **V. Multi-Store Support:** Features MUST be designed for multiple stores.
- **VI. Reusable Components:** UI elements MUST be modular and reusable.
- **VII. Data Integrity:** Operations MUST validate input and maintain consistency.
- **VIII. Scalability:** Design MUST allow for future growth.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── components/
│   └── store/              # New: Store switcher, store list items
├── contexts/
│   └── StoreContext.js     # New: To manage the active store
├── screens/
│   └── main/
│       ├── ManageStoresScreen.jsx # New: CRUD UI for stores
│       └── EditStoreScreen.jsx    # New: Form for editing a store
├── services/
│   ├── StoreService.js     # New: Logic for store data
│   └── ClientService.js    # New: Logic for client data per store
└── ... (existing files)

tests/
├── services/
│   └── StoreService.test.js # New: Unit tests for store service
└── ... (existing files)
```

**Structure Decision**: The feature will be integrated directly into the existing `src` directory structure, following the established patterns for screens, components, and services. A new `StoreContext` will be introduced to manage the global state of the active store, which aligns with the constitutional principle of using the Context API.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType gemini`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Generate tasks based on the `data-model.md` and `contracts/internal-api.md`.
- Create tasks for database schema migration.
- Create tasks for implementing each function in the `StoreService` and `ClientService`.
- Create tasks for building the new UI screens (`ManageStoresScreen`, `EditStoreScreen`) and components.
- Create tasks for implementing the `StoreContext`.
- Create tasks for writing unit tests for the new services.

**Ordering Strategy**:
- TDD order: Tests before implementation.
- Dependency order: Database migration → Services → Context → UI Screens → UI Components.

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | | |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.1.0 - See .specify/memory/constitution.md*
