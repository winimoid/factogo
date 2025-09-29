import React, { useContext, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import HomeScreen from '../screens/main/HomeScreen';
import NewDocumentScreen from '../screens/main/NewDocumentScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import InvoiceForm from '../screens/main/InvoiceForm';
import QuoteForm from '../screens/main/QuoteForm';
import DeliveryNoteForm from '../screens/main/DeliveryNoteForm';
import PdfPreviewScreen from '../screens/main/PdfPreviewScreen';
import BackupRestoreScreen from '../screens/main/BackupRestoreScreen';
import ManageStoresScreen from '../screens/main/ManageStoresScreen';
import EditStoreScreen from '../screens/main/EditStoreScreen';
import ManageTemplatesScreen from '../screens/main/ManageTemplatesScreen';
import EditTemplateScreen from '../screens/main/EditTemplateScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import StoreSwitcher from '../components/store/StoreSwitcher';
import { typography } from '../styles/typography';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();

  // By wrapping the headerTitle component in useCallback, we ensure that it's not
  // re-created on every render, which preserves the internal state of the StoreSwitcher.
  const headerTitleComponent = useCallback((props) => {
    return <StoreSwitcher {...props} />;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, // Show header to place the switcher
        headerTitle: headerTitleComponent,
        headerStyle: {
          backgroundColor: colors.background,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'New') {
            iconName = focused ? 'plus-circle' : 'plus-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurface,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarLabelStyle: {
          fontFamily: 'Outfit-Regular',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="New" component={NewDocumentScreen} options={{ title: t('new_document') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}

const MainNavigator = () => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();

  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontFamily: 'Outfit-Bold' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen 
        name="InvoiceForm" 
        component={InvoiceForm} 
        options={() => ({
          title: t('invoice'),
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="QuoteForm" 
        component={QuoteForm} 
        options={() => ({
          title: t('quote'),
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="DeliveryNoteForm" 
        component={DeliveryNoteForm} 
        options={() => ({
          title: t('delivery_note'),
          headerShown: true,
        })}
      />
      <Stack.Screen 
        name="PdfPreview" 
        component={PdfPreviewScreen} 
        options={{
          headerShown: false, // PdfPreviewScreen has its own Appbar.Header
        }}
      />
      <Stack.Screen 
        name="ManageStores" 
        component={ManageStoresScreen} 
        options={() => ({ 
          title: t('manage_stores'),
          headerShown: true,
        })} 
      />
      <Stack.Screen 
        name="EditStore" 
        component={EditStoreScreen} 
        options={() => ({ 
          title: t('configure_store'),
          headerShown: true,
        })} 
      />
      <Stack.Screen 
        name="ManageTemplates" 
        component={ManageTemplatesScreen} 
        options={() => ({ 
          title: t('manage_templates'),
          headerShown: true,
        })} 
      />
      <Stack.Screen 
        name="EditTemplate" 
        component={EditTemplateScreen} 
        options={() => ({ 
          title: t('configure_template'),
          headerShown: true,
        })} 
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;