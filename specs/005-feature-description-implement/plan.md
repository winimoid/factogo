# Implementation Plan: Full System Backup and Restore

**Branch**: `005-feature-description-implement` | **Date**: vendredi 13 mars 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-feature-description-implement/spec.md`

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
The goal is to implement a robust, platform-independent backup and restore system for the Facto-Go application. This involves creating a `BackupService` that exports all SQLite database tables and AsyncStorage keys to a JSON format, collects all referenced image assets (logos, signatures, stamps), and packages them into a single compressed `.fctg` archive. The restore process will unzip the archive, validate the data, perform a destructive overwrite of the current application state, and relocate image assets to the app's local storage. The `BackupRestoreScreen` will be updated to provide a user-friendly interface for creating, sharing, and importing these backup files.

## Technical Context
**Language/Version**: React Native (JavaScript / ES6+)
**Primary Dependencies**: react-native-sqlite-storage, react-native-zip-archive, react-native-fs, @react-native-async-storage/async-storage, react-native-share, react-native-document-picker
**Storage**: SQLite (FactoGo.db) and AsyncStorage
**Testing**: Jest
**Target Platform**: Android & iOS (Cross-platform .fctg format)
**Project Type**: mobile
**Performance Goals**: Fast zip/unzip operations; minimal memory footprint during large data exports
**Constraints**: Destructive overwrite on restore; requires user confirmation; app restart required after restore
**Scale/Scope**: Full backup of all users, stores, invoices, quotes, and delivery notes across the entire system.

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
- **IX. User Onboarding & Education:** Version-aware onboarding must be respected.

## Project Structure

### Documentation (this feature)
```
specs/005-feature-description-implement/
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
├── components/          # Reusable UI components
├── contexts/            # Context API providers
├── services/            # Business logic (e.g., BackupService.js)
├── screens/             # UI Screens
└── utils/               # Utility functions
```

**Structure Decision**: Single project (Mobile) - using existing structure in `src/`.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Best practices for exporting large SQLite datasets to JSON in React Native.
   - Cross-platform file path management for document directory.
   - Permission handling for public storage (Documents/Downloads) on Android 13+.

2. **Generate and dispatch research agents**:
   ```
   Task: "Research SQLite export to JSON in React Native for full backup"
   Task: "Find best practices for cross-platform image asset relocation during restore"
   Task: "Investigate storage permissions for Documents/Downloads folder in React Native"
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
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each service function → unit test and implementation tasks
- UI updates for sharing and picking files
- Integration tests for full backup/restore cycle

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: BackupService before UI screens
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

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
| N/A | | |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.2.0 - See .specify/memory/constitution.md*
