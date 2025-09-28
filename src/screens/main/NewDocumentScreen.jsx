import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme, Title } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useStore } from '../../contexts/StoreContext';
import { typography } from '../../styles/typography';

const NewDocumentScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { activeStore } = useStore();

  const navigateToForm = (formName) => {
    navigation.navigate(formName, { document: null, storeId: activeStore?.storeId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={styles.screenTitle}>{t('create_new_document')}</Title>

      <Button
        mode="contained"
        onPress={() => navigateToForm('InvoiceForm')}
        style={styles.button}
        icon="file-document-outline"
        labelStyle={typography.button}
        disabled={!activeStore}
      >
        {t('create_invoice')}
      </Button>

      <Button
        mode="contained"
        onPress={() => navigateToForm('QuoteForm')}
        style={styles.button}
        icon="file-document-edit-outline"
        labelStyle={typography.button}
        disabled={!activeStore}
      >
        {t('create_quote')}
      </Button>

      <Button
        mode="contained"
        onPress={() => navigateToForm('DeliveryNoteForm')}
        style={styles.button}
        icon="truck-delivery-outline"
        labelStyle={typography.button}
        disabled={!activeStore}
      >
        {t('create_delivery_note')}
      </Button>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    width: '90%',
    marginBottom: 20,
    elevation: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    marginVertical: 10,
    elevation: 4,
  },
});

export default NewDocumentScreen;