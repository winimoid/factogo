
import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppNavigator from './AppNavigator';

const Main = () => {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <AppNavigator />
    </>
  );
};

export default Main;
