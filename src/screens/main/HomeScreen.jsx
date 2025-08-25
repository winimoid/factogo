import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, IconButton, List, Dialog, Portal, Provider, ActivityIndicator, TextInput, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import { LanguageContext } from '../../contexts/LanguageContext';
import { 
  getInvoices, 
  getQuotes, 
  deleteInvoice, 
  updateInvoice,
  addInvoice,
  deleteQuote, 
  updateQuote,
  addQuote,
  getSettings
} from '../../services/Database';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import fs from 'react-native-fs';
import { toWords } from '../../utils/numberToWords';
import { typography } from '../../styles/typography';

const generatePdfHtml = async (item, type, settings, t, locale) => {
  const totalInWords = toWords(item.total, locale, { currency: true });

  const getBase64Image = async (uri) => {
    if (!uri) return '';
    try {
      const base64 = await fs.readFile(uri.replace('file://', ''), 'base64');
      const mimeType = uri.split('.').pop(); // Simple mime type guess
      return `data:image/${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error reading image file', uri, error);
      return '';
    }
  };

  const logoBase64 = await getBase64Image(settings?.logo);
  const signatureBase64 = await getBase64Image(settings?.signature);
  const stampBase64 = await getBase64Image(settings?.stamp);

  const date = new Date(item.date);
  const formattedDate = `Libreville, ${date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Outfit', sans-serif; }
          @font-face {
            font-family: 'Outfit';
            src: url('file:///android_asset/fonts/Outfit-Regular.ttf');
          }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { max-width: 100px; max-height: 100px; margin-bottom: 10px; }
          .company-details, .document-details { margin-bottom: 20px; }
          .company-details p, .document-details p { margin: 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total-section { text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 50px; }
          .footer img { max-width: 100px; max-height: 100px; margin: 0 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" />` : ''}
          <h1>${settings?.companyName || ''}</h1>
        </div>
        <div class="company-details">
          <p>${settings?.managerName || ''}</p>
        </div>
        <div class="document-details">
          <p>${t(type)} #: ${item?.id || ''}</p>
          <p>${t('date')}: ${formattedDate}</p>
          <p>${t('client_name')}: ${item.clientName}</p>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>${t('item')}</th>
              <th>${t('quantity')}</th>
              <th>${t('unit_price')}</th>
              <th>${t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            ${JSON.parse(item.items).map(i => `
              <tr>
                <td>${i.description}</td>
                <td>${i.quantity}</td>
                <td>${i.price.toFixed(2)}</td>
                <td>${(i.quantity * i.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <h2>${t('total')}: ${item.total.toFixed(2)}</h2>
          <p>${t('total_in_words')}: ${totalInWords}</p>
        </div>
        <div class="footer">
          ${signatureBase64 ? `<img src="${signatureBase64}" />` : ''}
          ${stampBase64 ? `<img src="${stampBase64}" />` : ''}
        </div>
      </body>
    </html>
  `;
};

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to download PDFs.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const HomeScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date_newest'); // 'date_newest' or 'date_oldest'

  const { t, locale } = useContext(LanguageContext);
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'invoices', title: t('invoices') },
    { key: 'quotes', title: t('quotes') },
  ]);

  const loadData = useCallback(async () => {
    setLoading(true); // Set loading to true
    try {
      const invoicesData = await getInvoices();
      const quotesData = await getQuotes();
      setInvoices(invoicesData);
      setQuotes(quotesData);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const showDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setItemToDelete(null);
    setItemTypeToDelete(null);
  };

  const confirmDelete = async () => {
    if (itemToDelete && itemTypeToDelete) {
      if (itemTypeToDelete === 'invoice') {
        await deleteInvoice(itemToDelete.id);
      } else if (itemTypeToDelete === 'quote') {
        await deleteQuote(itemToDelete.id);
      }
      loadData();
      hideDeleteDialog();
    }
  };

  const filterAndSortDocuments = useCallback((documents) => {
    let filtered = documents.filter(doc => {
      const clientMatch = doc.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const itemsMatch = JSON.parse(doc.items).some(item => 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return clientMatch || itemsMatch;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOrder === 'date_newest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    return filtered;
  }, [searchQuery, sortOrder]);

  const filteredAndSortedInvoices = filterAndSortDocuments(invoices);
  const filteredAndSortedQuotes = filterAndSortDocuments(quotes);

  const handleDownloadPdf = async (item, type) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setPermissionDialogVisible(true);
      return;
    }

    const settings = await getSettings();
    if (!settings) {
      alert('Please save your company settings (logo, signature, stamp) in the Settings screen before generating a PDF.');
      return;
    }
    const html = await generatePdfHtml(item, type, settings, t);
    const options = {
      html,
      fileName: `${type === 'invoice' ? 'Invoice' : 'Quote'}_${item.id}`,
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      const destPath = `${fs.DownloadDirectoryPath}/${type === 'invoice' ? 'Invoice' : 'Quote'}_${item.id}.pdf`;
      await fs.moveFile(file.filePath, destPath);
      alert(`${type === 'invoice' ? t('invoice_downloaded') : t('quote_downloaded')} ${destPath}`);
    } catch (error) {
      console.error('Failed to download PDF', error);
      alert(t('failed_download_pdf'));
    }
  };

  const handleSharePdf = async (item, type) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setPermissionDialogVisible(true);
      return;
    }

    const settings = await getSettings();
    if (!settings) {
      alert(t('settings_not_saved_pdf_alert'));
      return;
    }
    const html = await generatePdfHtml(item, type, settings, t);
    const options = {
      html,
      fileName: `${type === 'invoice' ? 'Invoice' : 'Quote'}_${item.id}`,
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      if (!file || !file.filePath) {
        console.error(t('pdf_file_path_null_error'), file);
        alert(t('failed_generate_pdf_settings_alert'));
        return;
      }
      const cachePath = `${fs.CachesDirectoryPath}/${options.fileName}.pdf`;
      await fs.copyFile(file.filePath, cachePath);
      
      await Share.open({
        title: `Share ${type === 'invoice' ? t('invoice') : t('quote')}`,
        url: `file://${cachePath}`,
        type: 'application/pdf',
      });
    } catch (error) {
      console.error('Failed to share PDF', error);
      alert(t('failed_share_pdf'));
    }
  };

  const navigateToInvoiceForm = (invoice) => {
    navigation.navigate('InvoiceForm', {
      document: invoice,
      dbActions: {
        add: addInvoice,
        update: updateInvoice,
      },
    });
  };

  const navigateToQuoteForm = (quote) => {
    navigation.navigate('QuoteForm', {
      document: quote,
      dbActions: {
        add: addQuote,
        update: updateQuote,
      },
    });
  };

  const renderDocument = ({ item, type }) => (
    <Card style={styles.card} elevation={4}>
      <List.Item
        title={item.clientName}
        description={`${t('date')}: ${item.date}
${t('total')}: ${item.total.toFixed(2)}`}
        left={props => <List.Icon {...props} icon={type === 'invoice' ? "file-document-outline" : "file-document-edit-outline"} />}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      <Card.Actions style={styles.cardActions}>
        <IconButton 
          icon="pencil-outline" 
          onPress={() => type === 'invoice' ? navigateToInvoiceForm(item) : navigateToQuoteForm(item)} 
          size={20}
        />
        <IconButton 
          icon="download" 
          onPress={() => handleDownloadPdf(item, type)} 
          size={20}
        />
        <IconButton 
          icon="share-variant" 
          onPress={() => handleSharePdf(item, type)} 
          size={20}
        />
        <IconButton 
          icon="delete-outline" 
          onPress={() => showDeleteDialog(item, type)} 
          size={20}
        />
      </Card.Actions>
    </Card>
  );

  const InvoicesRoute = () => (
    <FlatList
      data={filteredAndSortedInvoices}
      renderItem={(props) => renderDocument({ ...props, type: 'invoice' })}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={[styles.emptyText, typography.placeholder]}>{t('no_invoices')}</Text>}
      contentContainerStyle={styles.listContentContainer}
    />
  );

  const QuotesRoute = () => (
    <FlatList
      data={filteredAndSortedQuotes}
      renderItem={(props) => renderDocument({ ...props, type: 'quote' })}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={[styles.emptyText, typography.placeholder]}>{t('no_quotes')}</Text>}
      contentContainerStyle={styles.listContentContainer}
    />
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'invoices':
        return <InvoicesRoute />;
      case 'quotes':
        return <QuotesRoute />;
      default:
        return null;
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.surface }}
      labelStyle={{ color: colors.onSurface, fontWeight: 'bold' }}
      activeColor={colors.primary}
      inactiveColor={colors.onSurfaceVariant}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={styles.headerTitle}>{t('your_documents')}</Title>

      <TextInput
        label={t('search_documents')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        mode="outlined"
        style={styles.searchInput}
        labelStyle={typography.body}
        inputStyle={typography.body}
        left={<TextInput.Icon icon="magnify" />}
      />

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>{t('sort_by')}</Text>
        <SegmentedButtons
          value={sortOrder}
          onValueChange={setSortOrder}
          buttons={[
            {
              value: 'date_newest',
              label: t('date_newest'),
            },
            {
              value: 'date_oldest',
              label: t('date_oldest'),
            },
          ]}
          style={styles.sortButtons}
        />
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating={true} size="large" color={colors.primary} />
        </View>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog} style={{ borderRadius: 8}}>
          <Dialog.Title>{t('confirm_deletion')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('delete_confirmation_message', { type: itemTypeToDelete })}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>{t('cancel')}</Button>
            <Button onPress={confirmDelete}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={permissionDialogVisible} onDismiss={() => setPermissionDialogVisible(false)} style={{ borderRadius: 8}}>
          <Dialog.Title>{t('storage_permission_denied')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('storage_permission_denied_message')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPermissionDialogVisible(false)}>{t('dismiss')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's above other content
  },
  headerTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Outfit-Bold',
  },
  sectionTitle: {
    fontSize: 22,
    marginVertical: 15,
    marginLeft: 5,
    fontWeight: '600',
  },
  card: {
    marginBottom: 15,
    borderRadius: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  listItemTitle: {
    fontSize: 18,
    fontFamily: 'Outfit-SemiBold',
  },
  listItemDescription: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Outfit-Regular',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 16,
    color: 'gray',
  },
  listContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom of the list
  },
  tabView: {
    flex: 1,
  },
  searchInput: {
    marginHorizontal: 10,
    marginBottom: 15,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 15,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  sortButtons: {
    flex: 1,
  },
});

export default HomeScreen;