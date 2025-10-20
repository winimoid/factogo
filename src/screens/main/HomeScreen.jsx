import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Text, Card, IconButton, List, Dialog, Portal, Button, useTheme, ActivityIndicator, TextInput, SegmentedButtons, Title, Paragraph } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useStore } from '../../contexts/StoreContext';
import { 
  getDocumentsForStore,
  deleteDocument
} from '../../services/DocumentService';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import fs from 'react-native-fs';
import { typography } from '../../styles/typography';
import { generatePdfHtml } from '../../utils/pdfUtils';

const HomeScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date_newest');

  const { t, locale } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { activeStore } = useStore();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const routes = React.useMemo(() => [
    { key: 'invoices', title: t('invoices') },
    { key: 'quotes', title: t('quotes') },
    { key: 'delivery_notes', title: t('delivery_notes_short') },
  ], [t]);

  const loadData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [invoicesData, quotesData, deliveryNotesData] = await Promise.all([
        getDocumentsForStore(activeStore.storeId, 'invoice'),
        getDocumentsForStore(activeStore.storeId, 'quote'),
        getDocumentsForStore(activeStore.storeId, 'delivery_note')
      ]);
      setInvoices(invoicesData);
      setQuotes(quotesData);
      setDeliveryNotes(deliveryNotesData);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData, activeStore]));

  const showDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const confirmDelete = async () => {
    if (itemToDelete && itemTypeToDelete) {
      await deleteDocument(itemToDelete.id, itemTypeToDelete);
      loadData();
      hideDeleteDialog();
    }
  };

  const filterAndSortDocuments = useCallback((documents) => {
    let filtered = documents.filter(doc => 
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.parse(doc.items).some(item => item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'date_newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [searchQuery, sortOrder]);

  const handlePdfAction = async (action, item, type) => {
    if (!activeStore) {
      setDialogVisible(true);
      setDialogMessage(t('settings_not_saved_pdf_alert'));
      return;
    }
    // Always include signature when generating from home screen
    const html = await generatePdfHtml(item, type, activeStore, t, locale, true, colors.primary);

    if (action === 'preview') {
      navigation.navigate('PdfPreview', { htmlContent: html });
      return;
    }

    const fileName = `${type}_${item.document_number.replace(/\//g, '-')}`;
    const options = { html, fileName, directory: 'Documents' };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      if (!file || !file.filePath) throw new Error('PDF conversion failed');

      if (action === 'download') {
        const downloadDir = Platform.OS === 'android' ? fs.DownloadDirectoryPath : fs.DocumentDirectoryPath;
        const destPath = `${downloadDir}/${options.fileName}.pdf`;
        await fs.moveFile(file.filePath, destPath);
        setDialogMessage(t('download_message', { documentType: t(type), path: destPath }));
        setDialogVisible(true);
      } else if (action === 'share') {
        const cachePath = `${fs.CachesDirectoryPath}/${options.fileName}.pdf`;
        await fs.copyFile(file.filePath, cachePath);
        await Share.open({ title: `Share ${t(type)}`, url: `file://${cachePath}`, type: 'application/pdf' });
      }
    } catch (error) {
      console.error(`Failed to ${action} PDF`, error);
      setDialogMessage(t('failed_download_pdf'));
      setDialogVisible(true);
    }
  };

  const navigateToForm = (type, document) => {
    const formMap = {
      invoice: 'InvoiceForm',
      quote: 'QuoteForm',
      delivery_note: 'DeliveryNoteForm'
    };
    navigation.navigate(formMap[type], { document });
  };

  const renderDocument = ({ item, type }) => {
    const iconMap = {
      invoice: 'file-document-outline',
      quote: 'file-document-edit-outline',
      delivery_note: 'truck-delivery-outline'
    };

    return (
      <Card style={styles.card} elevation={4}>
        <List.Item
          title={`${t(type)} ${t('document_number_prefix')} ${item.document_number}`}
          description={`${t('client')}: ${item.clientName}
${t('date')}: ${item.date}`}
          left={props => <List.Icon {...props} icon={iconMap[type]} />}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        <Card.Actions style={styles.cardActions}>
          <IconButton icon="file-eye-outline" onPress={() => handlePdfAction('preview', item, type)} size={20} />
          <IconButton icon="pencil-outline" onPress={() => navigateToForm(type, item)} size={20} />
          <IconButton icon="download" onPress={() => handlePdfAction('download', item, type)} size={20} />
          <IconButton icon="share-variant" onPress={() => handlePdfAction('share', item, type)} size={20} />
          <IconButton icon="delete-outline" onPress={() => showDeleteDialog(item, type)} size={20} />
        </Card.Actions>
      </Card>
    );
  };

  const DocumentList = ({ documents, type }) => (
    <FlatList
      data={filterAndSortDocuments(documents)}
      renderItem={(props) => renderDocument({ ...props, type })}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={styles.emptyText}>{t(`no_${type}s`)}</Text>}
      contentContainerStyle={styles.listContentContainer}
    />
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'invoices': return <DocumentList documents={invoices} type="invoice" />;
      case 'quotes': return <DocumentList documents={quotes} type="quote" />;
      case 'delivery_notes': return <DocumentList documents={deliveryNotes} type="delivery_note" />;
      default: return null;
    }
  };

  const renderTabBar = (props) => (
    <TabBar 
      {...props} 
      indicatorStyle={{ backgroundColor: colors.primary }} 
      style={{ backgroundColor: colors.surface }} 
      activeColor={colors.primary}
      inactiveColor={colors.onSurface}
      labelStyle={{ fontFamily: 'Outfit-SemiBold' }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={styles.headerTitle}>{t('your_documents')}</Title>
      <TextInput label={t('search_documents')} value={searchQuery} onChangeText={setSearchQuery} mode="outlined" style={styles.searchInput} left={<TextInput.Icon icon="magnify" />} labelStyle={typography.body} inputStyle={typography.body} />
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>{t('sort_by')}</Text>
        <SegmentedButtons value={sortOrder} onValueChange={setSortOrder} buttons={[{ value: 'date_newest', label: t('date_newest') }, { value: 'date_oldest', label: t('date_oldest') }]} style={styles.sortButtons} />
      </View>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />
      ) : (
        <TabView navigationState={{ index, routes }} renderScene={renderScene} onIndexChange={setIndex} initialLayout={{ width: layout.width }} renderTabBar={renderTabBar} />
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog} style={{ borderRadius: 8}}>
          <Dialog.Title style={styles.dialogTitle}>{t('confirm_deletion')}</Dialog.Title>
          <Dialog.Content><Paragraph style={styles.dialogParagraph}>{t('delete_confirmation_message', { type: t(itemTypeToDelete) })}</Paragraph></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog} labelStyle={typography.button}>{t('cancel')}</Button>
            <Button onPress={confirmDelete} labelStyle={typography.button}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ borderRadius: 8}}>
          <Dialog.Title style={styles.dialogTitle}>{t('information')}</Dialog.Title>
          <Dialog.Content><Paragraph style={styles.dialogParagraph}>{dialogMessage}</Paragraph></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDialogVisible(false)} labelStyle={typography.button}>{t('ok')}</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  headerTitle: { fontSize: 28, textAlign: 'center', marginBottom: 20, fontFamily: 'Outfit-Bold' },
  card: { marginBottom: 15, borderRadius: 8 },
  cardActions: { justifyContent: 'flex-end' },
  listItemTitle: { fontFamily: 'Outfit-SemiBold' },
  listItemDescription: { color: 'gray', fontFamily: 'Outfit-Regular' },
  emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  listContentContainer: { paddingBottom: 20 },
  searchInput: { marginHorizontal: 10, marginBottom: 15 },
  sortContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 15 },
  sortLabel: { ...typography.body, fontWeight: 'bold', marginRight: 10 },
  sortButtons: { ...typography.button, flex: 1 },
  dialogTitle: { ...typography.h3 },
  dialogParagraph: { ...typography.body },
});

export default HomeScreen;