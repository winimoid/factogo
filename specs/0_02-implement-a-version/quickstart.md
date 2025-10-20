# Quickstart: Testing Version-Aware Onboarding

This guide provides the steps to manually test the new onboarding and update tutorial flows.

## Prerequisites
- A development build of the application is running on an emulator or physical device.
- You have a way to clear the application's data (e.g., through Android settings or by uninstalling/reinstalling the app).

## Scenario 1: New User Onboarding

1.  **Action**: Clear all application data or perform a fresh install.
2.  **Action**: Launch the application and log in.
3.  **Expected Result**: You should be immediately redirected to the mandatory, multi-step initial setup guide.
4.  **Action**: Complete all the steps in the guide.
5.  **Expected Result**: After the final step, you should be taken to the main application home screen. The app should now function normally.
6.  **Verification**: Relaunch the app. You should be taken directly to the home screen without seeing the setup guide again.

## Scenario 2: Existing User Update Tutorial

1.  **Action**: Manually edit the `setupCompletedForVersion` value in `AsyncStorage` to an older version (e.g., `{"version": "1.1.0", "completedAt": "..."}`). *This simulates a user who has updated the app.*
2.  **Action**: Relaunch the application.
3.  **Expected Result**: You should be shown a mandatory tutorial for the new version's features.
4.  **Action**: Complete the tutorial.
5.  **Expected Result**: You should be taken to the main application home screen.
6.  **Verification**: Relaunch the app. You should be taken directly to the home screen without seeing the update tutorial again.
