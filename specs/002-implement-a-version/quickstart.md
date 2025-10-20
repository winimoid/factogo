# Quickstart & File Overview

This feature introduces a new user onboarding flow. The core logic is managed by a `useOnboardingStatus` hook and integrated into the root `AppNavigator`.

## New Files & Directories

- **`src/hooks/useOnboardingStatus.js`**: A new custom hook that encapsulates all the logic for checking the app version and determining the user's onboarding status (`NEEDS_INITIAL_SETUP`, `NEEDS_UPDATE_TUTORIAL`, `COMPLETED`).

- **`src/navigation/SetupNavigator.jsx`**: A new stack navigator for the initial, one-time setup process.

- **`src/navigation/UpdateNavigator.jsx`**: A new stack navigator for displaying "What's New" screens when the app is updated.

- **`src/screens/setup/`**: New directory containing screens for the initial setup flow.
  - `WelcomeScreen.jsx`: The entry point of the setup flow.
  - `StoreSetupScreen.jsx`: A form to create the first store.
  - `FinalizeSetupScreen.jsx`: The last screen of the setup flow.

- **`src/screens/updates/`**: New directory to hold version-specific update screens.
  - `WhatsNew_1-2-0.jsx`: (Example) A screen explaining the new features of version 1.2.0.
