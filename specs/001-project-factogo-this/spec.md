# Feature Specification: Multi-Store Support and Future Roadmap

**Feature Branch**: `001-project-factogo-this`
**Created**: 2025-09-27
**Status**: Draft
**Input**: User description: "Project: Factogo This is a React Native invoicing mobile application built with JavaScript. The current scope (based on gemini.md): - Invoicing system - Theming (light/dark) via Context API - Internationalization (French/English) using i18n with JSON translation files - React Navigation for authentication and main flows - Project structured with src/components, src/screens, src/services, src/utils, etc. 📌 Current limitation: supports only a single store (mono-boutique). 🎯 New goals: 1. Multi-store (multi-boutique) support: - Each store has its own configuration: name, document template - The owner can manage several stores and switch between them in-app. - Documents must use the correct template depending on the active store. 2. Future roadmap: - Add stock management per store (products, inventory, movements, alerts). - Extend reporting and analytics across stores. Constraints and principles: - Maintain React Native best practices. - Keep FR/EN i18n support for all new features. - Follow Context API for global state (no Redux). - Reuse the existing project structure (src/components, src/screens, etc.). - Make it easy to scale to additional stores without rewriting core logic. Expected output: - Specification of new data models (Store, InvoiceTemplate, Product, etc.). - UI/UX flow for multi-store selection and invoice generation. - Step-by-step migration plan from mono-store to multi-store. - Roadmap for stock management integration."

---

## Clarifications

### Session 2025-09-27
- Q: When a user tries to delete a store that has existing invoices, how should the system respond? → A: Soft Deletion: Mark the store as "archived" or "inactive". It will be hidden from the main UI but its data will be preserved for historical records.
- Q: How does the app behave if a store's logo or template is missing? → A: Block Action: Prevent document generation and show an error message requiring the user to upload the missing assets first.

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a business owner, I want to manage multiple stores within the Factogo application, so that I can generate invoices and eventually manage inventory for each of my business locations independently. I need to be able to switch between my stores easily, and the app must use the correct branding (logo, texts) for the currently selected store when creating documents.

### Acceptance Scenarios
1.  **Given** I am logged in as a store owner, **When** I navigate to a new "Manage Stores" screen, **Then** I can create, view, update, and delete my stores.
2.  **Given** I have multiple stores, **When** I am on the main dashboard, **Then** I can see which store is currently active and have an option to switch to another store.
3.  **Given** I have selected "Store B", **When** I create a new document, **Then** the document PDF is generated using the logo and template specific to "Store B".
4.  **Given** I am a new user, **When** I complete the registration process, **Then** a default first store is created for me automatically.

### Edge Cases
- When a user tries to delete a store with existing invoices, the store is soft-deleted (marked as 'archived') to preserve historical data.
- If a store's logo or invoice template is missing, the system MUST block document generation and show an error.
- What is the expected behavior for a user with a very large number of stores? (e.g., 100+).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST allow users to create, read, update, and delete (CRUD) store entities.
- **FR-002**: Each store entity MUST have its own configuration, including a name, logo, invoice template, and custom texts.
- **FR-003**: The application MUST provide a mechanism for the user to select an "active" store from their list of stores.
- **FR-004**: The selected "active" store MUST be persisted across application sessions using the Context API.
- **FR-005**: The invoice generation process MUST dynamically use the configuration (logo, template) of the currently active store.
- **FR-006**: All new database tables and application features MUST be designed to support association with a specific store.
- **FR-007**: All new UI screens and components MUST continue to support both French and English localization.
- **FR-008**: Deleting a store with existing invoices MUST result in the store being soft-deleted (marked as 'archived') to preserve data integrity.
- **FR-009**: The system MUST validate that a store's logo and invoice template are present before initiating document generation.

### Key Entities *(include if feature involves data)*
- **Store**: Represents a single business location or entity.
  - Attributes: `storeId` (PK), `ownerUserId` (FK), `name`, `logoUrl`, `documentTemplateId` (FK), `customTexts` (e.g., JSON object for footer, notes), `status` (e.g., 'active', 'archived').
- **DocumentTemplate**: Represents a customizable template for generating document PDFs.
  - Attributes: `templateId` (PK), `name`, `htmlContent`.
- **Product** (For Future Roadmap): Represents an item for sale.
  - Attributes: `productId` (PK), `name`, `description`, `price`.
- **Inventory** (For Future Roadmap): Represents the stock of a product at a specific store.
  - Attributes: `inventoryId` (PK), `storeId` (FK), `productId` (FK), `quantity`.

---

## Migration Plan

This section outlines the steps to migrate the application from a single-store to a multi-store architecture.

1.  **Database Schema Update**:
    - Introduce the new `Stores` and `InvoiceTemplates` tables.
    - Add a `storeId` foreign key column to all existing tables that should be store-specific (e.g., `Invoices`, `Clients`, etc.).
2.  **Data Migration Script**:
    - Create a script that runs once to perform the data transition.
    - For each existing user, create a single "Default Store" in the `Stores` table.
    - Update all existing records (invoices, clients) to be associated with this new default `storeId`.
3.  **Application Logic Refactoring**:
    - Update all database queries in `src/services/` to be store-aware (i.e., include a `WHERE storeId = ?` clause).
    - Implement a `StoreContext` to manage the globally active store.
4.  **UI/UX Implementation**:
    - Create the "Manage Stores" screen for CRUD operations.
    - Implement the store switcher UI element in the app's header or main menu.

## Future Roadmap

This roadmap outlines the planned integration of subsequent features.

1.  **Q1: Multi-Store Foundation (MVP)**
    - Implement the core multi-store functionality as defined in this specification.
2.  **Q2: Stock Management - Phase 1**
    - Introduce `Products` and `Inventory` tables.
    - Create screens for users to manage their products.
    - Display inventory levels per store.
3.  **Q3: Stock Management - Phase 2**
    - Implement inventory movements (e.g., sales, returns, adjustments).
    - Add low-stock alerts.
4.  **Q4: Reporting & Analytics**
    - Develop a dashboard to show sales and revenue reports.
    - Allow filtering of analytics by store or across all stores.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified