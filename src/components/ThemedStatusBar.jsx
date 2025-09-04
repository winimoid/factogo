import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedStatusBar = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { colors } = useTheme();

  return (
            <StatusBar 
      barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
      backgroundColor={colors.primary} 
    />
  );
};

export default ThemedStatusBar;
