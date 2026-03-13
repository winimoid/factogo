# Implementation Plan: Deposit, Customer Suggestions, and GST Tax

**Branch**: `004-ok-now-i` | **Date**: 2026-03-07 | **Spec**: [specs/004-ok-now-i/spec.md](spec.md)
**Input**: Feature specification from `specs/004-ok-now-i/spec.md`

## Summary
The goal is to implement three main features in the factogo invoicing app:
1.  **Deposit**: A toggle to show/hide a deposit field on Invoices and Quotes, with a dedicated breakdown on the PDF.
2.  **Customer Suggestions**: An auto-fill system for the customer name field that suggests previous customers and populates all available details (address, contact, etc.).
3.  **GST Tax**: A configurable GST tax (default 1%) that can be toggled on/off for Invoices and Quotes, calculated on the net amount (after discounts), and displayed as a separate line item on the PDF.

The implementation requires database migrations to store new document fields and store settings, UI updates to `DocumentForm.jsx`, and PDF generation updates in `pdfUtils.js`.

## Technical Context
**Language/Version**: JavaScript (React Native)
**Primary Dependencies**: React Native, React Navigation, i18next, react-native-sqlite-storage
**Storage**: SQLite (handled via `src/services/Database.js`)
**Testing**: Jest (`npm test`)
**Target Platform**: Android, iOS
**Project Type**: Mobile
**Performance Goals**: < 100ms for customer search/suggestions, smooth PDF generation
**Constraints**: Offline-capable, zero data loss during migrations, multi-store aware
**Scale/Scope**: Supports multiple languages (EN/FR), multiple stores, and versioned data migrations

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality:** PASS. Will follow existing patterns in `src/services` and `src/components`.
- **II. State Management:** PASS. Will use `StoreContext` for GST settings and existing state in `DocumentForm`.
- **III. Internationalization:** PASS. New strings will be added to `src/i18n/locales/en.json` and `fr.json`.
- **IV. Theming:** PASS. Will use `ThemeContext` for new UI elements.
- **V. Multi-Store Support:** PASS. GST settings will be store-specific.
- **VI. Reusable Components:** PASS. Will extend `DocumentForm` and potentially create a reusable `Autocomplete` component.
- **VII. Data Integrity:** PASS. Will implement a new migration in `src/services/Migration.js`.
- **VIII. Scalability:** PASS. Versioned migrations ensure backward compatibility.
- **IX. User Onboarding:** PASS. Targeted tutorials/tooltips for new features if needed.

## Project Structure

### Documentation (this feature)
```
specs/004-ok-now-i/
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
│   ├── DocumentForm.jsx       # Update for Deposit/GST toggles & Autocomplete
├── services/
│   ├── Database.js            # Update schema
│   ├── Migration.js           # Add migration logic
│   ├── DocumentService.js     # Update persistence
│   ├── StoreService.js        # Update for GST settings
├── utils/
│   ├── pdfUtils.js            # Update PDF layout for GST and Deposit
├── i18n/
│   └── locales/               # Add new translations
```

**Structure Decision**: Single project (Mobile App).

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - How to efficiently query unique customers from the `documents` table for suggestions.
   - Best practices for adding a searchable autocomplete/suggestion list in a React Native `TextInput`.
   - SQLite migration path for adding columns to existing tables without data loss.

2. **Generate and dispatch research agents**:
   ```
   Task: "Research efficient SQLite queries for unique customer suggestions in factogo"
   Task: "Find best practices for React Native autocomplete components suitable for DocumentForm.jsx"
   Task: "Verify SQLite migration steps in src/services/Migration.js for adding 'deposit', 'has_gst', and 'gst_rate' columns"
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
   - For each user action → endpoint (internal service calls for mobile)
   - Output service interface definitions to `/contracts/`

3. **Generate contract tests** from contracts:
   - Service unit tests for `DocumentService` and `StoreService`.

4. **Extract test scenarios** from user stories:
   - Story validation steps for Deposit, GST, and Suggestions.

5. **Update agent file incrementally**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType gemini`

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs
- Database migration [P]
- Service updates (persistence, settings) [P]
- UI implementation (toggles, inputs, autocomplete)
- PDF generation logic
- Localization and Onboarding

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

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
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.2.0 - See .specify/memory/constitution.md*
