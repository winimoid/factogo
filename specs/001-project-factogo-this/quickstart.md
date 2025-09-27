# Quickstart Guide: Multi-Store Functionality

This guide provides the steps to manually test and validate the core multi-store features.

## Prerequisites

- The application is installed and running.
- You are logged in as a user.

## Testing Scenarios

### 1. Create and Manage Stores

1.  Navigate to the "Settings" screen.
2.  Find and tap on the "Manage Stores" option.
3.  Verify that you can see a list of your stores (initially, one default store).
4.  Tap the "Add New Store" button.
5.  Fill in the store details (Name, Logo, etc.) and save.
6.  Verify that the new store appears in the list.
7.  Select the new store and choose to edit it. Update its name and save.
8.  Verify the name change is reflected in the list.

### 2. Switch Active Store

1.  From the main dashboard or a global menu, locate the store switcher UI.
2.  Tap the switcher to open the list of your available stores.
3.  Select a different store from the list.
4.  Verify that the UI updates to indicate the newly selected store is now active.
5.  Close and reopen the app. Verify that the selected store is persisted as the active one.

### 3. Verify Document Generation

1.  Ensure you have selected a store that has a unique logo and document template.
2.  Navigate to the document creation screen.
3.  Create a document with some sample data.
4.  Generate the PDF preview for the document.
5.  **Crucially, verify that the generated PDF contains the correct logo and formatting for the currently active store.**
6.  Switch to a different store and repeat steps 2-5. Verify that the new document reflects the branding of the second store.

### 4. Test Store Deletion (Archiving)

1.  Navigate to "Manage Stores".
2.  Select a store that has at least one document associated with it.
3.  Attempt to delete the store.
4.  Verify that the store is no longer visible in the main store switcher list.
5.  Verify that you can still view the historical documents associated with the archived store (e.g., through a general "All Documents" list).