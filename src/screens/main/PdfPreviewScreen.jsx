
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, useTheme } from 'react-native-paper';
import { typography } from '../../styles/typography';

const PdfPreviewScreen = ({ route, navigation }) => {
  const { htmlContent } = route.params;
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.onPrimary} />
        <Appbar.Content title="PDF Preview" color={colors.onPrimary} titleStyle={typography.h3} />
      </Appbar.Header>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default PdfPreviewScreen;
