# Internal API: OnboardingService

This service manages the user's onboarding state, persisting it to `AsyncStorage`.

## Functions

### `getOnboardingState()`
Retrieves the user's onboarding state from `AsyncStorage`.

- **Returns**: `Promise<OnboardingState | null>`
  - Resolves with the `OnboardingState` object if it exists.
  - Resolves with `null` if it does not exist or if there is a parsing error.

### `saveOnboardingState(state: OnboardingState)`
Saves the user's onboarding state to `AsyncStorage`.

- **Parameters**:
  - `state` (`OnboardingState`): The state object to save. It must conform to the `OnboardingState` data model.
- **Returns**: `Promise<void>`
  - Resolves when the operation is complete.
  - Rejects if the input `state` is invalid or if the save operation fails.
