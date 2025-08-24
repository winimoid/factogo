
import React, { useEffect } from 'react';
import { requestAppPermissions} from './src/helpers/PermissionHelper';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import Main from './src/navigation/Main';
import { openDatabase } from './src/services/Database';

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
          <Main />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
