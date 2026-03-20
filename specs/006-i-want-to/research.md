# Research: Welcome Board (What's New)

## Decision: Global Version-Aware Onboarding
- **Decision**: Implement a centralized `WhatsNewModal` triggered from `HomeScreen.jsx`.
- **Rationale**: Currently, a "What's New" dialog exists only in `ManageStoresScreen.jsx`, which is not the first screen users see. Moving it to `HomeScreen` ensures all users see it upon launch (after login).
- **Alternatives considered**: 
  - Keeping it in `ManageStoresScreen`: Rejected because it's too deep in the navigation.
  - Putting it in `AppNavigator`: Rejected because it might interfere with navigation transitions before the UI is ready.

## Decision: Version Persistence Logic
- **Decision**: Use `AsyncStorage` key `last_version_seen` storing a string (e.g., "3.0.0").
- **Rationale**: Allows for future-proofing. Instead of boolean flags for every version (e.g., `whats_new_v3_seen`), we compare the current app version with the last one the user acknowledged.
- **Implementation**: 
  - Get `currentVersion` from `package.json`.
  - Get `lastVersionSeen` from `AsyncStorage`.
  - If `lastVersionSeen !== currentVersion`, show modal.
  - On dismissal, set `lastVersionSeen = currentVersion`.

## Decision: UI Components
- **Decision**: Use `react-native-paper` `Portal` and `Dialog` components.
- **Rationale**: Maintains consistency with the app's existing UI style and theming.
- **Content**: 
  - Title: `t('whats_new_title')` with rocket emoji.
  - Items: `List.Item` with specific icons and localized text.
  - Action: "Let's go!" button (new translation key needed).

## Decision: Version Source
- **Decision**: Centralize version in `package.json`.
- **Rationale**: `ProfileScreen.jsx` currently has a hardcoded string `2.3.0` while `package.json` has `2.1`. We should use the one in `package.json` and eventually bump it to `3.0.0` as requested by the user's context.

## Findings from Codebase
- `src/screens/main/ManageStoresScreen.jsx` already contains a dialog with the requested features (Deposit, GST, Suggestions). This code will be refactored into a reusable component.
- The `i18n` keys `whats_new_title`, `whats_new_deposit`, `whats_new_gst`, `whats_new_suggestions` already exist in `fr.json` and `en.json`.
- `react-native-async-storage` is already a dependency.
