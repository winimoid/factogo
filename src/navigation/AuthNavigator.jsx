
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BackupRestoreScreen from '../screens/main/BackupRestoreScreen';
import { useTheme } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontFamily: 'Outfit-Bold' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen 
        name="BackupRestore" 
        component={BackupRestoreScreen} 
        options={{ 
          title: t('backupRestore.title'),
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
