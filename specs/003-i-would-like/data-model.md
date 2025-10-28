# Data Model: Discount and Quote Conversion

## Entities

### Document
The `Document` entity will be updated to include discount information.

**Fields:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `type`: TEXT (invoice, quote, delivery_note)
- `clientId`: INTEGER
- `storeId`: INTEGER
- `date`: TEXT
- `items`: TEXT (JSON array of line items)
- `total`: REAL
- `status`: TEXT
- `discountType`: TEXT (percentage, fixed)
- `discountValue`: REAL

**Relationships:**
- Belongs to a `Client`
- Belongs to a `Store`

## State Transitions

### Quote Conversion
A `quote` can be converted into an `invoice` or a `delivery_note`. When a quote is converted, a new `Document` is created with the same data, and the type is changed accordingly. The original quote's status should be updated to "Converted".

## Database Migration
The changes to the `Document` entity will be applied to the database using a migration script located in `src/services/Migration.js`. A new migration will be added to add the `discountType` and `discountValue` columns to the `invoices` and `quotes` tables.