# Quickstart: Full System Backup and Restore Testing

## Overview
This document outlines the validation scenarios for the backup and restore system.

## Scenario 1: Successful Backup and Restore
1.  **Initial Setup**:
    -   Create a user account.
    -   Set up a store with a name, header text, and logo.
    -   Create two invoices and one quote.
    -   Set the application theme to "Dark Mode".
2.  **Backup**:
    -   Go to the "Backup & Restore" screen.
    -   Click "Create Backup".
    -   **Expected Outcome**: A `.fctg` file is created and the "Share" dialog appears.
3.  **App State Modification**:
    -   Change the store name and delete the logo.
    -   Delete one invoice.
    -   Set the theme to "Light Mode".
4.  **Restore**:
    -   Go to the "Backup & Restore" screen.
    -   Click "Restore from Backup" and pick the `.fctg` file created in Step 2.
    -   Confirm the overwrite when prompted.
    -   **Expected Outcome**: The app restarts automatically.
5.  **Final Validation**:
    -   Log in again.
    -   Verify the store name, header text, and logo are restored correctly.
    -   Verify the two invoices and the quote are back in the lists.
    -   Verify the theme is back to "Dark Mode".

## Scenario 2: Restore from Invalid File
1.  **Action**: Attempt to restore using a ZIP file that does not have a `data.json` or uses an unsupported version.
2.  **Expected Outcome**: An error message is displayed: "Invalid backup file: data.json missing" or "Incompatible backup version".

## Scenario 3: Restore with Destructive Overwrite Confirmation
1.  **Action**: Click "Restore from Backup" and select a valid file.
2.  **Expected Outcome**: A warning dialog appears: "Are you sure you want to restore from this backup? All current data will be overwritten."
3.  **Action**: Click "Cancel".
4.  **Expected Outcome**: The restoration process is aborted, and current data remains unchanged.
