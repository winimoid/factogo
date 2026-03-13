# Research: Full System Backup and Restore

## Topic 1: SQLite Export to JSON in React Native
- **Decision**: Export data table by table to a single JSON object.
- **Rationale**: Since the total database size for an invoicing app is relatively small (mostly text and some JSON strings for items), loading all rows of a table into memory and then stringifying is feasible. For safety, we will process one table at a time and append to the main backup object.
- **Alternatives considered**: 
  - Direct DB file copy: Rejected because it is platform-dependent (different internal paths for Android/iOS) and prone to corruption if the DB is open.
  - CSV export: Rejected because JSON handles nested structures (like the `items` field) more naturally.

## Topic 2: Cross-platform Image Asset Relocation
- **Decision**: Store images in a flat `images/` directory within the ZIP archive. Use relative paths in the `data.json` metadata. During restore, move images to `RNFS.DocumentDirectoryPath` and update the database with the new absolute local paths.
- **Rationale**: Absolute paths change between devices and OS versions. Relative paths in the backup file ensure portability. `RNFS.DocumentDirectoryPath` is the standard location for persistent user data in React Native.
- **Alternatives considered**:
  - Base64 encoding in JSON: Rejected as it significantly increases the size of the `data.json` file and complicates memory management.

## Topic 3: Storage Permissions for Documents/Downloads
- **Decision**: Use `react-native-share` for exporting the backup file and `react-native-document-picker` for importing.
- **Rationale**: These libraries abstract away the complex scoped storage permissions on Android 11+ and iOS. `react-native-share` allows the user to save the file wherever they want (Drive, iCloud, Downloads), and `react-native-document-picker` provides a temporary URI that `react-native-fs` can read.
- **Alternatives considered**:
  - Manually requesting `WRITE_EXTERNAL_STORAGE`: Rejected because it is deprecated on newer Android versions and requires complex implementation.

## Topic 4: App Restart after Restore
- **Decision**: Use `react-native-restart` to reload the bundle immediately after a successful restore.
- **Rationale**: A full state overwrite (Database + AsyncStorage) requires a fresh start to ensure all services and components reload with the new data.
- **Alternatives considered**:
  - Manual state reset: Too complex and error-prone given the deep integration of Context API.
