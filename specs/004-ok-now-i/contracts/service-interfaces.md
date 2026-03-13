# Service Interfaces: Deposit, Customer Suggestions, and GST Tax

## DocumentService.js
New and updated methods:

### `getUniqueCustomers(storeId)`
- **Purpose**: Retrieve a list of unique customer details (Name, Address, Email, Phone) from previously created documents.
- **Parameters**: `storeId` (INTEGER).
- **Return**: `Promise<Array<{ clientName: string, clientAddress: string, clientEmail: string, clientPhone: string }>>`.
- **Strategy**: Union query across `invoices`, `quotes`, and `delivery_notes`, grouped by `clientName`.

### `createDocumentForStore(storeId, docType, docData, convertedFrom)`
- **Update**: Now includes `deposit`, `has_gst`, `gst_rate`, `clientAddress`, `clientEmail`, `clientPhone`.

### `updateDocument(docId, docType, docData)`
- **Update**: Now includes `deposit`, `has_gst`, `gst_rate`, `clientAddress`, `clientEmail`, `clientPhone`.

## StoreService.js
Update for GST settings:

### `updateStore(storeId, storeData)`
- **Update**: Handle `default_gst_rate` field.

### `getStoreById(storeId)`
- **Return**: Now includes `default_gst_rate` in the returned store object.

## Calculation Service (Internal to DocumentForm)
- **NetTotal**: `SUM(item.price * item.quantity)`
- **DiscountAmount**: `NetTotal * (discountValue / 100)` or `discountValue`
- **GstAmount**: `(NetTotal - DiscountAmount) * (gst_rate / 100)` (only if `has_gst` is true)
- **GrandTotal**: `(NetTotal - DiscountAmount) + GstAmount`
- **BalanceDue**: `GrandTotal - deposit` (only if `deposit` > 0)
