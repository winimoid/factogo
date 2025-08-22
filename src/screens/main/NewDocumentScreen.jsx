import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme, Card, Title } from 'react-native-paper';
import { LanguageContext } from '../../contexts/LanguageContext';
import { addInvoice, updateInvoice, addQuote, updateQuote } from '../../services/Database';
import { typography } from '../../styles/typography';

const NewDocumentScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { colors } = useTheme();

  const navigateToInvoiceForm = () => {
    navigation.navigate('InvoiceForm', {
      dbActions: {
        add: addInvoice,
        update: updateInvoice,
      },
      document: null, // Explicitly pass null for a new document
    });
  };

  const navigateToQuoteForm = () => {
    navigation.navigate('QuoteForm', {
      dbActions: {
        add: addQuote,
        update: updateQuote,
      },
      document: null, // Explicitly pass null for a new document
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={styles.screenTitle}>{t('create_new_document')}</Title>

          <Button
            mode="contained"
            onPress={navigateToInvoiceForm}
            style={styles.button}
            icon="file-document-outline"
            labelStyle={typography.button}
          >
            {t('create_invoice')}
          </Button>

          <Button
            mode="contained"
            onPress={navigateToQuoteForm}
            style={styles.button}
            icon="file-document-edit-outline"
            labelStyle={typography.button}
          >
            {t('create_quote')}
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