# Service Contract: BackupService

The `BackupService` is responsible for the full serialization and restoration of application data and assets.

## Service Interface

### `createBackup()`
- **Input**: None
- **Output**: `Promise<string>` - The absolute file path to the generated `.fctg` backup file.
- **Exceptions**: `BackupError` - If zipping fails, disk space is insufficient, or database is inaccessible.
- **Behavior**:
  - Fetches all rows from `users`, `settings`, `invoices`, `quotes`, `delivery_notes`, `stores`, `document_templates`, and `db_versions`.
  - Fetches all `AsyncStorage` key-value pairs.
  - Copies referenced images (logos, signatures, stamps) from local storage to a temporary directory.
  - Serializes database and preference data to `data.json`.
  - Compresses the temporary directory into a `.fctg` ZIP archive.

### `restoreBackup(filePath: string)`
- **Input**: `filePath: string` - The absolute path to the `.fctg` file to restore.
- **Output**: `Promise<boolean>` - `true` if restoration and data integrity checks are successful.
- **Exceptions**: 
  - `InvalidBackupError`: If the file is not a valid ZIP, `data.json` is missing, or version is incompatible.
  - `RestoreError`: If database operations fail or file system permissions are denied.
- **Behavior**:
  - Extracts the archive to a temporary directory.
  - Parses and validates `data.json`.
  - Deletes all current data from the SQLite tables.
  - Inserts all rows from the backup, preserving primary keys.
  - Relocates images to the app's document directory and updates absolute paths in the database.
  - Overwrites `AsyncStorage` with the values from the backup.
  - Triggers an application restart via `react-native-restart`.

## Data Schema (data.json)
See [Data Model](../data-model.md) for detailed JSON structure.
