# Feature Specification: Deposit, Customer Suggestions, and GST Tax

**Feature Branch**: `004-ok-now-i`  
**Created**: Saturday, March 7, 2026  
**Status**: Draft  
**Input**: User description: "OK, now I would like to add three new main features: Feature 1: Deposit (give the option to choose whether to display the deposit (if the customer pays a deposit) or not with a React Native switch, similar to what we did for discounts on the DocumentForm.jsx screen. Feature 2: Choose from companies (or customers) (when creating or modifying an invoice, quote, or delivery note, it would be better to suggest the names of previous customers who have already been registered in the application during data entry, to avoid having to enter the same customer name each time). Functionality 3: GST tax of 1% of the total amount (give the option to choose whether or not to apply the Goods and Services Tax (GST). This tax is 1% by default, but I would like to be able to change this value in the store settings in the future). Don't forget to translate the texts for the new features into all languages supported in the i18n locales. Of course, all this must be done while maintaining the database versioning system so that adding new columns or tables does not break the functionality for users who were using the previous version of the application, as no loss of data can be tolerated or forgiven."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

## Clarifications
### Session 2026-03-07
- Q: When selecting a suggested customer name, should the system also auto-fill other fields like address or contact information from that previous record? → A: All available fields (Address, Email, Phone, etc.)
- Q: Should the GST percentage be calculated on the subtotal before or after any discounts are applied? → A: After discounts (calculated on net amount)
- Q: Should the GST and Deposit features be available for all document types (Invoice, Quote, Delivery Note)? → A: Only for Invoices and Quotes
- Q: When the GST toggle is enabled on a document, should the calculated GST amount be displayed as a separate line item on the final PDF/preview, or just included in the total? → A: Separate line item (Total, GST, Grand Total)
- Q: When the "Display Deposit" switch is enabled, how should the deposit amount be presented on the PDF? → A: Total Amount: Deposit Paid: BalanceDue:

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a business owner using factogo, I want to manage deposits on my documents, quickly select repeat customers from a list, and apply a configurable GST tax so that I can create professional and accurate invoices more efficiently while ensuring compliance and data integrity.

### Acceptance Scenarios
1. **Given** a user is on the document creation or editing screen for an **Invoice** or **Quote**, **When** they toggle the "Deposit" switch, **Then** an input field to specify the deposit amount should appear.
2. **Given** a user is entering a customer name on a new document, **When** they select a suggestion, **Then** all available fields (Address, Email, Phone) should be automatically populated.
3. **Given** a user is creating an **Invoice** or **Quote**, **When** they toggle the "GST" switch, **Then** a 1% tax (by default) should be calculated based on the document total AFTER any discounts are applied and displayed as a separate line item.
4. **Given** a user is in the store settings, **When** they modify the GST percentage value, **Then** future documents should use this new rate when the GST toggle is active.
5. **Given** a document with a deposit enabled, **When** the PDF is generated, **Then** it MUST display: Total Amount, Deposit Paid, and Balance Due.

### Edge Cases
- **Customer Selection**: System MUST populate all available fields (Address, Email, etc.) when a suggestion is selected.
- **Calculation Order**: GST MUST be calculated on the net amount (Subtotal - Discount).
- **Document Types**: "GST" and "Deposit" switches MUST NOT be visible/available for **Delivery Notes**.
- **PDF Display**: GST MUST be shown as a distinct line item (Subtotal, GST, Grand Total). Deposit MUST be shown as a deduction (Total Amount, Deposit Paid, Balance Due).
- **Zero/Negative Rates**: How does the system handle a GST rate set to 0% or a negative value in the settings?
- **Data Integrity**: Ensure that documents created in previous versions of the application remain unchanged and functional after the update.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a toggle on the document form to enable/disable "Deposit" visibility for Invoices and Quotes.
- **FR-002**: System MUST allow input of a deposit amount when the toggle is enabled.
- **FR-003**: System MUST suggest existing customer names during text entry and AUTO-FILL all associated fields upon selection.
- **FR-004**: System MUST provide a toggle on the document form to apply or remove "GST" for Invoices and Quotes.
- **FR-005**: System MUST calculate GST based on the document total AFTER discounts are subtracted.
- **FR-006**: System MUST allow users to customize the default GST rate in the store settings.
- **FR-007**: System MUST persist the "Deposit" amount and "GST" status for each individual document.
- **FR-008**: System MUST localize all new labels and messages in English and French.
- **FR-009**: System MUST perform a database migration to add necessary fields while preserving all existing user data.
- **FR-010**: System MUST NOT display GST or Deposit options for Delivery Notes.
- **FR-011**: System MUST display GST as a separate line item (Net Total, GST Amount, Grand Total) on document previews and PDFs when enabled.
- **FR-012**: System MUST display a balance breakdown (Total Amount, Deposit Paid, Balance Due) on document previews and PDFs when a deposit is active.

### Key Entities *(include if feature involves data)*
- **Document**: The core entity (Invoice, Quote, Delivery Note). Needs to store deposit info, GST status, and the GST rate used at the time of creation.
- **Customer**: Extracted from previous documents to provide suggestions.
- **Store Settings**: Global configuration for the default GST rate.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (with warnings for clarifications)

---
