# Data Model: Full System Backup and Restore

## Entity: Backup Archive (.fctg)
The `.fctg` file is a standard ZIP archive containing the following structure:
```
/
├── data.json     # Metadata and serialized database + preferences
└── images/       # All referenced image assets
    ├── settings_logo.png
    ├── store_logo_1.png
    └── ...
```

## Structure of `data.json`
```json
{
  "version": "1.0",
  "timestamp": "2026-03-13T12:00:00Z",
  "database": {
    "users": [...],
    "settings": [...],
    "invoices": [...],
    "quotes": [...],
    "delivery_notes": [...],
    "stores": [...],
    "document_templates": [...],
    "db_versions": [...]
  },
  "asyncStorage": {
    "appTheme": "...",
    "language": "...",
    "whats_new_v3_seen": "...",
    "@activeStore_1": "...",
    "setupCompletedForVersion": "..."
  }
}
```

## Field-level Rules
- **Date Strings**: All dates in the database and `data.json` must be in ISO 8601 format.
- **Image Paths**: 
  - In `data.json`, image paths must be relative (e.g., `images/settings_logo.png`).
  - In the application, image paths must be absolute local paths prefixed with `file://`.
- **Primary Keys**: Database primary keys must be preserved to maintain relationships (e.g., `storeId` in `invoices`).

## State Transitions
- **Create**: 
  - Collect Data → Identify Images → Copy Images to Temp → Write JSON to Temp → Zip Temp → Return Path.
- **Restore**:
  - Unzip to Temp → Validate JSON → Confirm Overwrite → Clear DB → Insert Data → Relocate Images → Update DB Paths → Set AsyncStorage → App Restart.
