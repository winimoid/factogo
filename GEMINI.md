# Project Overview

This is a React Native mobile application named "factogo". Based on the file structure and dependencies, it appears to be an invoicing application. The application is built using JavaScript and React Native, and it includes navigation, internationalization (i18n), and theming.

## Key Technologies

*   **Core Framework:** React Native
*   **Language:** JavaScript (with some JSX)
*   **Navigation:** React Navigation
*   **State Management:** React Context API (ThemeContext, LanguageContext)
*   **Internationalization:** i18n library with JSON translation files for English and French.

## Project Structure

The project follows a standard React Native structure:

*   `src/`: Contains the main source code.
    *   `assets/`: Fonts and images.
    *   `components/`: Reusable UI components.
    *   `constants/`: Application constants.
    *   `contexts/`: React context providers for theming and language.
    *   `data/`: Data-related modules.
    *   `hooks/`: Custom React hooks.
    *   `i18n/`: Internationalization setup and locale files.
    *   `navigation/`: Navigation setup (App, Auth, and Main navigators).
    *   `screens/`: Application screens, organized into `auth` and `main` sections.
    *   `services/`: Services like database interactions.
    *   `styles/`: Global styles.
    *   `utils/`: Utility functions.
*   `android/`: Android-specific code and configuration.
*   `ios/`: iOS-specific code and configuration.

# Building and Running

## Prerequisites

*   Node.js
*   npm or yarn
*   React Native development environment (see [React Native documentation](https://reactnative.dev/docs/environment-setup))

## Running the Application

1.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

2.  **Run on Android:**
    ```bash
    npx react-native run-android
    ```

3.  **Run on iOS:**
    ```bash
    npx react-native run-ios
    ```

## Testing

To run the tests, use the following command:

```bash
npm test
```

# Development Conventions

*   **Styling:** The project appears to use a combination of inline styles and stylesheets defined in the `src/styles` directory.
*   **Theming:** The application supports theming through the `ThemeContext`.
*   **Internationalization:** The application supports both English and French languages. New translations should be added to the `src/i18n/locales/en.json` and `src/i18n/locales/fr.json` files.
*   **Navigation:** The application uses a nested navigation structure with an authentication flow and a main application flow.
