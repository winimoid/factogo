import React, { createContext, useState, useMemo, useEffect } from 'react';
import { Appearance } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';

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

const AppTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
  roundness: 20,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#b01c2e',
    secondary: '#008CBA',
    onPrimary: '#ffffff',
  },
};

const AppDarkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({config: fontConfig}),
  roundness: 20,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#b43745ff',
    secondary: '#008CBA',
    onPrimary: '#ffffff',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const theme = isDarkMode ? AppDarkTheme : AppTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeContextValue = useMemo(
    () => ({
      toggleTheme,
      isDarkMode,
    }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};