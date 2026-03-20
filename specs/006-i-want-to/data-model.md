# Data Model: Welcome Board (What's New)

## AsyncStorage
The app persists the user's onboarding state on the local device using `AsyncStorage`.

| Key | Type | Description |
|-----|------|-------------|
| `last_version_seen` | `string` | The version string (e.g., "3.0.0") of the last "What's New" board the user dismissed. |

### Migration Logic
- **If missing**: Treat as an empty string (new install).
- **If `last_version_seen !== currentAppVersion`**: Show the modal and update the key upon dismissal.
- **Legacy check**: The app will also check for the old key `whats_new_v3_seen` for backward compatibility. If it exists and is `true`, and the current app version is `3.0.0`, it will set `last_version_seen` to `3.0.0` and remove the legacy key.

## Version Source
The version will be sourced from `package.json` to ensure a single source of truth.

```javascript
import { version } from '../../package.json';
```
