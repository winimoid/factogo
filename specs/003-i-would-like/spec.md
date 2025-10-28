# Feature Specification: Discount and Quote Conversion

**Feature Branch**: `003-i-would-like`
**Created**: 2025-10-20
**Status**: Draft
**Input**: User description: "I would like to add two main features: The ability to apply a discount to the total price of invoices and quotes in DocumentForm and to manage percentage discounts and fixed amount discounts; The ability to convert a quote into an invoice or delivery note (i.e. from a quote, have an ‘other options’ choice with the options ‘convert to invoice’ and ‘convert to delivery note’), which should redirect to an invoice or delivery note with the same data as the quote. You will need to ensure that each section of the code is sufficiently commented on so that it can be understood, but not overly commented on either. Make sure you read the existing code carefully so that you understand it and do not break it or make any monumental errors."

## Clarifications

### Session 2025-10-20
- Q: If a discount amount exceeds the document's total price, how should the system respond? → A: Cap the discount at the total amount, making the final price zero.
- Q: How should the system indicate that a quote has already been converted? → A: Display a status label (e.g., "Converted").

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

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a user, I want to be able to apply a discount to my invoices and quotes so that I can offer promotional prices to my clients. I also want to be able to convert a quote into an invoice or a delivery note to streamline my workflow.

### Acceptance Scenarios
1.  **Given** I am creating or editing an invoice or a quote, **When** I enter a discount percentage, **Then** the total price of the document should be reduced by that percentage.
2.  **Given** I am creating or editing an invoice or a quote, **When** I enter a fixed discount amount, **Then** the total price of the document should be reduced by that amount.
3.  **Given** I am viewing a quote, **When** I select the 'convert to invoice' option, **Then** I should be redirected to a new invoice form pre-filled with the data from the quote.
4.  **Given** I am viewing a quote, **When** I select the 'convert to delivery note' option, **Then** I should be redirected to a new delivery note form pre-filled with the data from the quote.

### Edge Cases
- What happens when a discount is applied that is greater than the total price?
- What happens when a user tries to convert a quote that has already been converted?
- How does the system handle negative discount values?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST allow users to apply a percentage-based discount to invoices and quotes.
- **FR-002**: The system MUST allow users to apply a fixed amount discount to invoices and quotes.
- **FR-003**: The system MUST recalculate the total price of the document when a discount is applied.
- **FR-004**: The system MUST provide an option to convert a quote into an invoice.
- **FR-005**: The system MUST provide an option to convert a quote into a delivery note.
- **FR-006**: When a quote is converted, the new document (invoice or delivery note) MUST be pre-filled with the data from the quote.
- **FR-007**: The system MUST handle discounts correctly, ensuring the total price does not become negative. If the discount is greater than the total, it will be capped at the total amount, making the final price zero.
- **FR-008**: The system should provide a visual indicator that a quote has already been converted by displaying a status label (e.g., "Converted").

### Key Entities *(include if feature involves data)*
- **Discount**: Represents a reduction in price for a document.
    - Attributes: type (percentage or fixed), value.
- **Document**: Represents an invoice, quote, or delivery note.
    - Attributes: discount (optional).

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

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---