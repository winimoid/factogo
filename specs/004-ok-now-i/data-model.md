# Data Model: Deposit, Customer Suggestions, and GST Tax

## Updated Entities

### Document (Invoices & Quotes)
**Table**: `invoices`, `quotes`
- `deposit` (REAL): The amount paid upfront.
- `has_gst` (INTEGER/BOOLEAN): Whether GST is applied (0 or 1).
- `gst_rate` (REAL): The GST percentage applied at the time of creation (defaults to store setting).
- `clientAddress` (TEXT): The customer's physical/billing address.
- `clientEmail` (TEXT): The customer's email address.
- `clientPhone` (TEXT): The customer's phone number.

**Note**: `delivery_notes` table should also receive `clientAddress`, `clientEmail`, and `clientPhone` for consistency, but `deposit` and `has_gst` are NOT required per specification.

### Store Settings
**Table**: `stores`
- `default_gst_rate` (REAL): The default GST percentage to be applied to new documents (Default: 1.0).

## Validation Rules
- `deposit` MUST be >= 0.
- `gst_rate` MUST be >= 0.
- `clientEmail` SHOULD be a valid email format (if provided).
- `clientName` remains REQUIRED.

## Migration Path (Version 3)
```sql
-- Invoices
ALTER TABLE invoices ADD COLUMN deposit REAL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN has_gst INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN gst_rate REAL DEFAULT 1.0;
ALTER TABLE invoices ADD COLUMN clientAddress TEXT;
ALTER TABLE invoices ADD COLUMN clientEmail TEXT;
ALTER TABLE invoices ADD COLUMN clientPhone TEXT;

-- Quotes
ALTER TABLE quotes ADD COLUMN deposit REAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN has_gst INTEGER DEFAULT 0;
ALTER TABLE quotes ADD COLUMN gst_rate REAL DEFAULT 1.0;
ALTER TABLE quotes ADD COLUMN clientAddress TEXT;
ALTER TABLE quotes ADD COLUMN clientEmail TEXT;
ALTER TABLE quotes ADD COLUMN clientPhone TEXT;

-- Delivery Notes
ALTER TABLE delivery_notes ADD COLUMN clientAddress TEXT;
ALTER TABLE delivery_notes ADD COLUMN clientEmail TEXT;
ALTER TABLE delivery_notes ADD COLUMN clientPhone TEXT;

-- Stores
ALTER TABLE stores ADD COLUMN default_gst_rate REAL DEFAULT 1.0;
```
