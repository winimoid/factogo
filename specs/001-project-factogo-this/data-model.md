# Data Models

This document outlines the data models for the multi-store feature and future inventory management.

## Core Entities

### Store
Represents a single business location or entity.

- **Attributes**:
  - `storeId` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - `ownerUserId` (INTEGER, FOREIGN KEY to Users table)
  - `name` (TEXT, NOT NULL)
  - `logoUrl` (TEXT)
  - `documentTemplateId` (INTEGER, FOREIGN KEY to InvoiceTemplates table)
  - `customTexts` (TEXT) - A JSON object for storing custom text snippets (e.g., invoice footer).
  - `status` (TEXT, NOT NULL) - The status of the store (e.g., 'active', 'archived').

DocumentTemplate
Represents a customizable template for generating invoice PDFs.

- **Attributes**:
  - `templateId` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - `name` (TEXT, NOT NULL)
  - `htmlContent` (TEXT) - The HTML structure of the invoice.

## Future Roadmap Entities

### Product
Represents an item for sale.

- **Attributes**:
  - `productId` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - `name` (TEXT, NOT NULL)
  - `description` (TEXT)
  - `price` (REAL, NOT NULL)

### Inventory
Represents the stock of a product at a specific store.

- **Attributes**:
  - `inventoryId` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
  - `storeId` (INTEGER, FOREIGN KEY to Stores table)
  - `productId` (INTEGER, FOREIGN KEY to Products table)
  - `quantity` (INTEGER, NOT NULL, DEFAULT 0)

## Relationships

- A `User` can own multiple `Stores`.
- A `Store` has one `InvoiceTemplate`.
- An `Invoice` belongs to one `Store`.
- A `Client` belongs to one `Store`.
- An `Inventory` record links a `Product` to a `Store`.
