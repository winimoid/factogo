import React, { useEffect } from 'react';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { openDatabase } from './src/services/Database';
import { requestAppPermissions } from './src/helpers/PermissionHelper';

// Open the database when the app starts
openDatabase();

const App = () => {
  useEffect(() => {
    const checkPermissions = async () => {
      const permissionsGranted = await requestAppPermissions();

      if (!permissionsGranted) {
        console.warn("Certaines permissions n'ont pas été accordées");
      }
    };
    checkPermissions();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;