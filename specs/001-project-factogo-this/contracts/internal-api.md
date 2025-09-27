# Internal API Contracts

This document defines the function signatures for the services that will manage the application's data logic. These services will be implemented in the `src/services/` directory.

## StoreService (`src/services/StoreService.js`)

- `createStore(storeData)`: Creates a new store.
- `getStore(storeId)`: Retrieves a single store by its ID.
- `updateStore(storeId, storeData)`: Updates a store's information.
- `archiveStore(storeId)`: Marks a store as 'archived'.
- `getStoresForUser(userId)`: Retrieves all stores (active and archived) for a given user.

## DocumentService (`src/services/DocumentService.js`)

- `createDocumentForStore(storeId, documentData)`: Creates a new document associated with a specific store.
- `getDocumentsForStore(storeId)`: Retrieves all documents for a specific store.

## ClientService (`src/services/ClientService.js`)

- `createClientForStore(storeId, clientData)`: Creates a new client associated with a specific store.
- `getClientsForStore(storeId)`: Retrieves all clients for a specific store.

## ProductService (`src/services/ProductService.js`) - Future

- `createProduct(productData)`: Creates a new product.
- `getProduct(productId)`: Retrieves a single product.
- `updateProduct(productId, productData)`: Updates a product.
- `deleteProduct(productId)`: Deletes a product.

## InventoryService (`src/services/InventoryService.js`) - Future

- `getInventoryForStore(storeId)`: Retrieves the entire inventory for a specific store.
- `updateInventory(storeId, productId, quantityChange)`: Updates the stock level for a product in a store.
