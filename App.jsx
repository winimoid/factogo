import './src/i18n/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { StoreProvider } from './src/contexts/StoreContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/Database';
import { requestAppPermissions } from './src/helpers/PermissionHelper';
import ThemedStatusBar from './src/components/ThemedStatusBar';

const AppContent = () => {
  const { user } = useAuth();
  return (
    <StoreProvider userId={user ? user.id : null}>
      <AppNavigator />
    </StoreProvider>
  );
};

const App = () => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await requestAppPermissions();
      await initDatabase();
      setDbReady(true);
    };
    initializeApp();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
