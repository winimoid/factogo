
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, useTheme } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { typography } from '../../styles/typography';

const PdfPreviewScreen = ({ route, navigation }) => {
  const { htmlContent } = route.params;
  const { colors } = useTheme();
  const { t } = useContext(LanguageContext);

  const injectedJavaScript = `
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=0.5, maximum-scale=1.0, user-scalable=yes');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.onPrimary} />
        <Appbar.Content title={t('preview_pdf')} color={colors.onPrimary} titleStyle={typography.h3} />
      </Appbar.Header>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
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
