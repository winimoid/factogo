# Research: Deposit, Customer Suggestions, and GST Tax

## Decision: SQLite Migration Path
- **Decision**: Add Migration Version 3.
- **Rationale**: The current schema (Version 2) lacks fields for deposits, GST status, and detailed customer information (Address, Email, Phone). To maintain data integrity and support multi-store configurations, new columns must be added via the established migration system in `src/services/Migration.js`.
- **Alternatives considered**: 
    - Creating a separate `customers` table: Rejected for now to keep the architecture simple and aligned with the current document-centric model, though it would be more "normalized".
    - Storing extra data in a JSON string: Rejected as it makes querying and reporting harder.

## Decision: Customer Suggestions Implementation
- **Decision**: Query unique customer details from existing documents across all tables (`invoices`, `quotes`, `delivery_notes`).
- **Rationale**: Since there is no dedicated `customers` table, the most reliable source of "previously registered" customers is the history of created documents.
- **Fields to Add**: `clientAddress`, `clientEmail`, `clientPhone` will be added to document tables to fulfill the "auto-fill all available fields" requirement.
- **UI**: A custom `Autocomplete` overlay for the `clientName` field in `DocumentForm.jsx`.

## Decision: GST Calculation & Display
- **Decision**: Store `has_gst` (boolean/integer) and `gst_rate` (real) per document.
- **Rationale**: Even if the store's default GST rate changes, existing documents must retain the rate used at the time of creation to ensure financial consistency.
- **Calculation**: `(Subtotal - Discount) * (gst_rate / 100)`.
- **PDF**: Update `pdfUtils.js` to include a dedicated line for GST and a balance breakdown for deposits.

## Decision: Localization
- **Decision**: Add translations for "Deposit", "GST", "GST Rate", "Balance Due", "Customer Suggestions", etc., in `en.json` and `fr.json`.
- **Rationale**: To comply with constitutional mandate III (Internationalization).
