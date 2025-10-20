# Data Model: Onboarding State

This document defines the structure of the data related to the user's onboarding and update tutorial completion status.

## `OnboardingState`

This object is stored as a JSON string in `AsyncStorage` under the key `setupCompletedForVersion`.

**Type**: `Object`

| Field         | Type   | Description                                                              | Example                           |
|---------------|--------|--------------------------------------------------------------------------|-----------------------------------|
| `version`     | String | The application version for which the setup or tutorial was completed.   | `"1.2.0"`                         |
| `completedAt` | String | An ISO 8601 timestamp indicating when the process was completed.         | `"2025-09-29T10:00:00Z"`          |

### Validation Rules
- `version` MUST be a valid semantic version string.
- `completedAt` MUST be a valid ISO 8601 date string.

### State Transitions
- **On new install**: The `setupCompletedForVersion` key does not exist in `AsyncStorage`.
- **After initial setup**: The `OnboardingState` object is created with the current app version.
- **After update tutorial**: The `OnboardingState` object is updated with the new app version.