import React, { createContext, useState, useMemo, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';
import { themes } from '../constants/themes';

export const ThemeContext = createContext();

const fontConfig = {
  android: {
    regular: {
      fontFamily: 'Outfit-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Outfit-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Outfit-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Outfit-Thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Outfit-Bold',
      fontWeight: 'bold',
    },
  },
  ios: {
    regular: {
      fontFamily: 'Outfit-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Outfit-Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Outfit-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Outfit-Thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Outfit-Bold',
      fontWeight: 'bold',
    },
  },
};

const AppTheme = (colors) => ({
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
  roundness: 20,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    onPrimary: '#ffffff',
  },
});

const AppDarkTheme = (colors) => ({
  ...MD3DarkTheme,
  fonts: configureFonts({config: fontConfig}),
  roundness: 20,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    onPrimary: '#ffffff',
  },
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [currentThemeColors, setCurrentThemeColors] = useState(themes[0]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    const loadSavedTheme = async () => {
      try {
        const savedThemeName = await AsyncStorage.getItem('appTheme');
        if (savedThemeName) {
          const savedTheme = themes.find(t => t.name === savedThemeName);
          if (savedTheme) {
            setCurrentThemeColors(savedTheme);
          }
        }
      } catch (e) {
        console.error('Failed to load theme from storage', e);
      }
    };

    loadSavedTheme();

    return () => subscription.remove();
  }, []);

  const setAppThemeColors = async (themeColors) => {
    setCurrentThemeColors(themeColors);
    try {
      await AsyncStorage.setItem('appTheme', themeColors.name);
    } catch (e) {
      console.error('Failed to save theme to storage', e);
    }
  };

  const theme = isDarkMode ? AppDarkTheme(currentThemeColors) : AppTheme(currentThemeColors);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeContextValue = useMemo(
    () => ({
      toggleTheme,
      isDarkMode,
      setAppThemeColors,
      themes,
      currentThemeColors,
    }),
    [isDarkMode, currentThemeColors]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};