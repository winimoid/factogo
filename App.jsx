
import React from 'react';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import Main from './src/navigation/Main';
import { openDatabase } from './src/services/Database';

// Open the database when the app starts
openDatabase();

const App = () => {
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
