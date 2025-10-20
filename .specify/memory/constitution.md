<!--
Sync Impact Report
- Version: 1.1.0 → 1.2.0
- Added Principles:
  - IX. User Onboarding & Education
- Templates requiring updates:
  - ⚠ .specify/templates/plan-template.md (Check if onboarding tasks need specific planning criteria)
  - ⚠ .specify/templates/spec-template.md (Check if specs now require an 'Onboarding Experience' section)
  - ⚠ .specify/templates/tasks-template.md (Consider adding an 'onboarding' or 'nux' task type)
-->
# factogo Constitution

## Core Principles

### I. Code Quality
All code MUST be clean, maintainable, and well-commented React Native code. Follow established best practices and project conventions.

### II. State Management
Global application state MUST be managed using React's Context API. Redux or other third-party state management libraries are not to be introduced.

### III. Internationalization
All user-facing screens and components MUST support both French (FR) and English (EN) localization. Text must be sourced from the i18n resource files.

### IV. Theming
Consistent support for light and dark modes MUST be implemented across the entire application, using the shared theming context.

### V. Multi-Store Support
All new features and data models MUST be designed with multi-store capabilities from the outset. Assume the application will support more than one store.

### VI. Reusable Components
New UI elements should be built as modular and reusable components and placed within `src/components`. Avoid creating monolithic, single-use components.

### VII. Data Integrity
All data operations MUST include input validation and ensure data consistency across the application. Business logic should handle potential data conflicts gracefully.

### VIII. Scalability
Features, especially those related to data and business logic, MUST be designed to accommodate future growth, such as adding more stores or expanding inventory management capabilities.

### IX. User Onboarding & Education
The application MUST provide a version-aware onboarding experience. This system will trigger a full setup guide for new installations and targeted tutorials for users who have updated the application, ensuring a smooth and guided introduction to new or required functionalities.

## Development Workflow

New features or significant changes must follow a structured workflow:
1.  **Specification:** A clear specification must be written and approved.
2.  **Implementation:** Code must be written in adherence to the constitution.
3.  **Testing:** New code must be accompanied by relevant tests.
4.  **Review:** All code must be peer-reviewed before merging.

## Quality Assurance

- **Testing:** All new features require corresponding unit or integration tests. The `npm test` command must pass before any change is merged.
- **Linting:** All code must adhere to the project's ESLint rules. Run `npm run lint` to check for issues.

## Governance

This constitution is the single source of truth for development standards. Any proposed amendments must be reviewed and approved by the project maintainers. All development activities must align with these principles.

**Version**: 1.2.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-29