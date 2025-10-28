# Tasks for Discount and Quote Conversion

This document outlines the tasks required to implement the discount and quote conversion features.

## Task List

### Phase 1: Setup

- **[X] T001: Setup Development Environment**
  - **File**: `README.md`
  - **Instructions**: Ensure you have a working React Native development environment. Follow the instructions in the `README.md` to install dependencies and run the application.
  - **Dependencies**: None

### Phase 2: Database Migration

- **[X] T002: Create Migration Test File [P]**
  - **File**: `__tests__/services/Migration.test.js`
  - **Instructions**: Create a new test file to verify the database migration.
  - **Dependencies**: T001

- **[X] T003: Update Migration Script**
  - **File**: `src/services/Migration.js`
  - **Instructions**: Add a new migration to add the `discountType` (TEXT) and `discountValue` (REAL) columns to the `invoices` and `quotes` tables.
  - **Dependencies**: T002

### Phase 3: Discount Feature

- **[X] T004: Create Discount Feature Test File [P]**
  - **File**: `__tests__/components/DocumentForm.test.js`
  - **Instructions**: Create a new test file or add to the existing one to test the discount functionality in the `DocumentForm` component.
  - **Dependencies**: T001

- **[X] T005: Update DocumentForm UI**
  - **File**: `src/components/DocumentForm.jsx`
  - **Instructions**: Modify the `DocumentForm` component to include UI elements for applying discounts. This should include a way to select the discount type (percentage or fixed) and input the discount value.
  - **Dependencies**: T004

- **[X] T006: Update DocumentService**
  - **File**: `src/services/DocumentService.js`
  - **Instructions**: Update the `saveDocument` function in `DocumentService` to handle the discount logic. The total price of the document should be recalculated based on the discount.
  - **Dependencies**: T005

- **[X] T007: Write Discount Logic Unit Tests**
  - **File**: `__tests__/services/DocumentService.test.js`
  - **Instructions**: Write unit tests for the discount calculation logic in `DocumentService`.
  - **Dependencies**: T006

### Phase 4: Quote Conversion Feature

- **[X] T008: Create Quote Conversion Test File [P]**
  - **File**: `__tests__/screens/main/QuoteViewScreen.test.js` (Assuming a `QuoteViewScreen` exists)
  - **Instructions**: Create a new test file to test the quote conversion functionality.
  - **Dependencies**: T001

- **[X] T009: Add Conversion Options to UI**
  - **File**: `src/screens/main/QuoteViewScreen.jsx` (Assuming a `QuoteViewScreen` exists)
  - **Instructions**: Add an "Other options" menu to the quote view screen with "Convert to Invoice" and "Convert to Delivery Note" options.
  - **Dependencies**: T008

- **[X] T010: Implement Convert to Invoice**
  - **File**: `src/screens/main/QuoteViewScreen.jsx`
  - **Instructions**: Implement the logic to navigate to the invoice form with the data from the current quote pre-filled.
  - **Dependencies**: T009

- **[X] T011: Implement Convert to Delivery Note**
  - **File**: `src/screens/main/QuoteViewScreen.jsx`
  - **Instructions**: Implement the logic to navigate to the delivery note form with the data from the current quote pre-filled.
  - **Dependencies**: T010

- **[X] T012: Update Quote Status**
  - **File**: `src/services/DocumentService.js`
  - **Instructions**: After a quote is converted, update its status to "Converted" in the database.
  - **Dependencies**: T011

- **[X] T013: Write Quote Conversion Unit Tests**
  - **File**: `__tests__/services/DocumentService.test.js`
  - **Instructions**: Write unit tests for the quote conversion logic in `DocumentService`.
  - **Dependencies**: T012

### Phase 5: Integration and Polish

- **[X] T014: Manual Discount Feature Test [P]**
  - **File**: `specs/003-i-would-like/quickstart.md`
  - **Instructions**: Follow the steps in the `quickstart.md` to manually test the discount feature.
  - **Dependencies**: T007

- **[X] T015: Manual Quote Conversion Test [P]**
  - **File**: `specs/003-i-would-like/quickstart.md`
  - **Instructions**: Follow the steps in the `quickstart.md` to manually test the quote conversion feature.
  - **Dependencies**: T013

- **[X] T016: Manual Migration Test [P]**
  - **File**: `specs/003-i-would-like/quickstart.md`
  - **Instructions**: Follow the steps in the `quickstart.md` to manually test the database migration.
  - **Dependencies**: T003

- **[X] T017: Code Review and Refactor**
  - **File**: All modified files
  - **Instructions**: Review the code for clarity, performance, and adherence to the constitution. Refactor as needed.
  - **Dependencies**: T014, T015, T016

## Parallel Execution

The following tasks can be executed in parallel:
- T002, T004, T008
- T014, T015, T016
