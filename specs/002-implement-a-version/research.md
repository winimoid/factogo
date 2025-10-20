# Research: Version-Aware Onboarding

**Feature**: Implement a version-aware onboarding system for new users and application updates.

## 1. Reading `package.json` in React Native

- **Decision**: Use the `react-native-device-info` library.
- **Rationale**: This is a well-maintained and widely used library that provides access to a wealth of device information, including the application version from `package.json` via `DeviceInfo.getVersion()`. Direct file system access to `package.json` is not reliable or recommended in a bundled React Native application. This handles the native-side implementation for both iOS and Android.
- **Alternatives considered**:
  - Custom native modules: This would add unnecessary complexity and maintenance overhead.
  - Fetching from a server: This introduces a network dependency for a core startup logic, which is undesirable.

## 2. `AsyncStorage` for Onboarding State

- **Decision**: Use `@react-native-async-storage/async-storage`.
- **Rationale**: It is the community-standard, simple key-value storage system for React Native. It's suitable for storing small amounts of unstructured data, like our onboarding state object. The data is persistent across app launches. We will create a simple service wrapper around it for type safety and to centralize access.
- **Alternatives considered**:
  - SQLite or other databases: Overkill for storing a single object. These are better suited for complex, relational data.
  - Storing in a global state (Context): This is not persistent. The state would be lost when the app is closed.

## 3. Conditional Navigation with React Navigation

- **Decision**: Implement the conditional logic in the root navigator (`AppNavigator.jsx`).
- **Rationale**: The `AppNavigator` is the earliest point in the navigation tree where we can make a decision after a user is authenticated but before the main UI is rendered. We will introduce a loading screen and a new context (e.g., `OnboardingContext`) to manage the onboarding state. The root navigator will check this context and decide whether to show the `InitialSetupNavigator`, `UpdateTutorialNavigator`, or the `MainNavigator`. This keeps the logic centralized and prevents flashes of incorrect screens.
- **Alternatives considered**:
  - Logic inside `HomeScreen`: This would cause a "flash" of the home screen before redirecting the user, which is a poor user experience.
  - A separate "Auth" navigator for this logic: This mixes authentication concerns with onboarding concerns. It's cleaner to handle this in the main app navigator after authentication is confirmed.