# Quickstart: Welcome Board (What's New)

Follow these steps to test the "What's New" feature in version 3.0.

## Prerequisites
- The app should be running in a simulator or on a physical device.
- You have access to the app's home screen.

## Test Scenarios

### 1. First Launch (Fresh Install)
1. **Action**: Uninstall and reinstall the app (or clear all data).
2. **Action**: Open the app and log in.
3. **Expected Outcome**: The "What's new in version 3.0? 🚀" modal appears automatically.
4. **Action**: Click "Let's go!".
5. **Expected Outcome**: The modal closes and you see the `HomeScreen`.

### 2. Launch After Dismissal
1. **Action**: Close the app and reopen it.
2. **Expected Outcome**: The modal does NOT appear.

### 3. Simulation of an Update (Manual Test)
1. **Action**: Open the React Native Debugger or manually modify the `last_version_seen` in `AsyncStorage` to a lower version (e.g., `2.1.0`).
   ```javascript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   await AsyncStorage.setItem('last_version_seen', '2.1.0');
   ```
2. **Action**: Refresh the app (e.g., via `Cmd + R` or `R, R` in the terminal).
3. **Expected Outcome**: The modal "What's new in version 3.0? 🚀" appears because the current version (e.g., `3.0.0`) is greater than `2.1.0`.

### 4. Language Check
1. **Action**: Change the app language to French in the Settings.
2. **Action**: Trigger the modal again (by reset or version simulation).
3. **Expected Outcome**: All content in the modal, including the "Let's go!" button ("C'est parti !"), is correctly translated.
