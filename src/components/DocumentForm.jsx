import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Card, Title, ActivityIndicator, Portal, Dialog, Paragraph, Switch } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { LanguageContext } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { getNextDocumentNumber, createDocumentForStore, updateDocument } from '../services/DocumentService';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import fs from 'react-native-fs';
import { typography } from '../styles/typography';
import { generatePdfHtml } from '../utils/pdfUtils';

const DocumentForm = ({ route, navigation, documentType }) => {
  // Common State
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [downloadDialogVisible, setDownloadDialogVisible] = useState(false);
  const [downloadPath, setDownloadPath] = useState('');
  const [includeSignature, setIncludeSignature] = useState(true);

  // Numbering State
  const [officialDocumentNumber, setOfficialDocumentNumber] = useState('');
  const [displayNumber, setDisplayNumber] = useState('');

  // Document-specific State
  const [total, setTotal] = useState(0); // For invoices/quotes
  const [totalQuantity, setTotalQuantity] = useState(0); // For delivery notes
  const [orderReference, setOrderReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const { t, locale } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { activeStore } = useStore();
  const { document, storeId } = route.params || {};

  const isDeliveryNote = useMemo(() => documentType === 'delivery_note', [documentType]);

  useEffect(() => {
    const loadDocument = async () => {
      if (document) {
        // Editing an existing document
        setClientName(document.clientName);
        setOfficialDocumentNumber(document.document_number);
        setDisplayNumber(document.document_number);
        if (document.date && typeof document.date === 'string') {
          const parts = document.date.split('-');
          if (parts.length === 3) {
            setDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
          } else { setDate(new Date()); }
        } else { setDate(new Date()); }
        setItems(document.items ? JSON.parse(document.items) : []);
        setTotal(document.total);

        if (isDeliveryNote) {
          setOrderReference(document.order_reference || '');
          setPaymentMethod(document.payment_method || '');
        }
      } else {
        // Creating a new document
        const newDocNumber = await getNextDocumentNumber(storeId, documentType);
        setOfficialDocumentNumber(newDocNumber);
        setDisplayNumber(newDocNumber);
      }
    };

    loadDocument();
  }, [document, documentType, isDeliveryNote, storeId]);

  const calculateTotals = useCallback(() => {
    const newTotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    setTotal(newTotal);
    const newTotalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
  }, [items]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = async () => {
    let newDocument = { 
      document_number: displayNumber, // Always save the official number
      clientName, 
      date: date.toISOString().split('T')[0], 
      items 
    };

    if (isDeliveryNote) {
      newDocument = { 
        ...newDocument, 
        total: totalQuantity, 
        order_reference: orderReference, 
        payment_method: paymentMethod 
      };
    } else {
      newDocument = { ...newDocument, total };
    }

    if (document) {
      await updateDocument(document.id, documentType, newDocument);
    } else {
      await createDocumentForStore(storeId, documentType, newDocument);
    }
    navigation.goBack();
  };

  const getDocumentTitle = (type) => {
    switch (type) {
      case 'invoice': return t('invoice');
      case 'quote': return t('quote');
      case 'delivery_note': return t('delivery_note');
      default: return '';
    }
  }

  const handlePdfAction = async (action) => {
    setLoadingPdf(true);
    try {
      if (!activeStore) { return; }

      const documentData = {
        id: document?.id,
        document_number: displayNumber, // Use the display number for the PDF
        clientName,
        date: date.toISOString(),
        items: JSON.stringify(items),
        total: isDeliveryNote ? totalQuantity : total,
        order_reference: orderReference,
        payment_method: paymentMethod,
      };

      const htmlContent = await generatePdfHtml(documentData, documentType, activeStore, t, locale, includeSignature, colors.primary);
      const fileName = `${getDocumentTitle(documentType)}_${displayNumber.replace(/\//g, '-')}`;
      
      if (action === 'preview') {
        navigation.navigate('PdfPreview', { htmlContent });
        setLoadingPdf(false);
        return;
      }

      if (action === 'print') {
        await RNPrint.print({
          html: htmlContent,
          fileName,
        });
        setLoadingPdf(false);
        return;
      }

      const options = {
        html: htmlContent,
        fileName,
        directory: 'Documents',
        fonts: ['fonts/Outfit-Regular.ttf', 'fonts/Outfit-Bold.ttf', 'fonts/Outfit-Light.ttf'],
        pageSize: 'A4',
      };

      const file = await RNHTMLtoPDF.convert(options);
      if (!file || !file.filePath) { return; }

      if (action === 'download') {
        const downloadDir = Platform.OS === 'android' ? fs.DownloadDirectoryPath : fs.DocumentDirectoryPath;
        const destPath = `${downloadDir}/${fileName}.pdf`;
        await fs.moveFile(file.filePath, destPath);
        setDownloadPath(destPath);
        setDownloadDialogVisible(true);
      } else if (action === 'share') {
        const cachePath = `${fs.CachesDirectoryPath}/${fileName}.pdf`;
        await fs.copyFile(file.filePath, cachePath);
        await Share.open({ title: `Share ${getDocumentTitle(documentType)}`, url: `file://${cachePath}`, type: 'application/pdf' });
      }
    } catch (error) {
      console.error(`Failed to ${action} PDF`, error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
            <TextInput label={t('item')} value={item.description} onChangeText={(value) => handleItemChange(index, 'description', value)} style={styles.itemInput} mode="outlined" />
            <TextInput label={t('quantity')} value={item.quantity.toString()} onChangeText={(value) => handleItemChange(index, 'quantity', parseInt(value, 10) || 0)} keyboardType="numeric" style={[styles.itemInput, { maxWidth: 80 }]} mode="outlined" />
            {!isDeliveryNote && (
              <TextInput label={t('unit_price')} value={item.price.toString()} onChangeText={(value) => handleItemChange(index, 'price', parseFloat(value) || 0)} keyboardType="numeric" style={styles.itemInput} mode="outlined" />
            )}
            <IconButton icon="close-circle" color={colors.error} size={20} onPress={() => handleRemoveItem(index)} />
          </View>
        )}
        ListHeaderComponent={(
          <View style={styles.contentPadding}>
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Title style={styles.cardTitle}>{getDocumentTitle(documentType)}</Title>
                <TextInput label={`${t(documentType)} N°`} value={displayNumber} onChangeText={setDisplayNumber} style={styles.input} mode="outlined" />
                <TextInput label={t('client_name')} value={clientName} onChangeText={setClientName} style={styles.input} mode="outlined" />
                <TextInput label={t('date')} value={date.toISOString().split('T')[0]} onFocus={() => setIsDatePickerVisible(true)} showSoftInputOnFocus={false} style={styles.input} mode="outlined" right={<TextInput.Icon icon="calendar" onPress={() => setIsDatePickerVisible(true)} />} />
              </Card.Content>
            </Card>

            {isDeliveryNote && (
              <Card style={styles.card} elevation={4}>
                <Card.Content>
                  <Title style={styles.cardTitle}>{t('delivery_note')}</Title>
                  <TextInput label={t('order_reference')} value={orderReference} onChangeText={setOrderReference} style={styles.input} mode="outlined" />
                  <TextInput label={t('payment_method')} value={paymentMethod} onChangeText={setPaymentMethod} style={styles.input} mode="outlined" />
                </Card.Content>
              </Card>
            )}

            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('items')}</Title>
                <Button onPress={handleAddItem} mode="outlined" icon="plus-circle-outline" style={styles.addItemButton} labelStyle={styles.buttonLabel}>{t('add_item')}</Button>
              </Card.Content>
            </Card>
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.contentPadding}>
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                {isDeliveryNote ? (
                  <Text style={styles.total}>{t('total_quantity')}: {totalQuantity}</Text>
                ) : (
                  <Text style={styles.total}>{t('total')}: {total.toLocaleString(locale)}</Text>
                )}
              </Card.Content>
            </Card>

            <View style={[styles.signatureSwitchContainer, {borderColor: colors.outline}]}>
              <Text style={[typography.body, {color: colors.onSurface}]}>{t('include_signature_stamp')}</Text>
              <Switch value={includeSignature} onValueChange={setIncludeSignature} />
            </View>

            <Button mode="contained" onPress={handleSave} style={styles.button} icon="content-save" disabled={loadingPdf} labelStyle={styles.buttonLabel}>{t('save')}</Button>
            
            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={() => handlePdfAction('preview')} style={styles.halfButton} icon="file-pdf-box" disabled={loadingPdf} labelStyle={styles.buttonLabel}>{t('preview_pdf')}</Button>
              <Button mode="outlined" onPress={() => handlePdfAction('print')} style={styles.halfButton} icon="printer" disabled={loadingPdf} labelStyle={styles.buttonLabel}>{t('print')}</Button>
              <Button mode="outlined" onPress={() => handlePdfAction('download')} style={styles.halfButton} icon="download" disabled={loadingPdf} labelStyle={styles.buttonLabel}>{t('download')}</Button>
              <Button mode="outlined" onPress={() => handlePdfAction('share')} style={styles.halfButton} icon="share-variant" disabled={loadingPdf} labelStyle={styles.buttonLabel}>{t('share')}</Button>
            </View>
          </View>
        )}
      />

      <DatePickerModal
        locale={locale}
        mode="single"
        visible={isDatePickerVisible}
        onDismiss={() => setIsDatePickerVisible(false)}
        date={date}
        onConfirm={({ date: newDate }) => {
          setIsDatePickerVisible(false);
          if (newDate) setDate(newDate);
        }}
      />

      <Portal>
        <Dialog visible={downloadDialogVisible} onDismiss={() => setDownloadDialogVisible(false)} style={{ borderRadius: 8}}>
          <Dialog.Title style={styles.dialogTitle}>{t('download_complete')}</Dialog.Title>
          <Dialog.Content><Paragraph style={styles.dialogParagraph}>{t('download_message', { documentType: getDocumentTitle(documentType), path: downloadPath })}</Paragraph></Dialog.Content>
          <Dialog.Actions><Button labelStyle={styles.buttonLabel} onPress={() => setDownloadDialogVisible(false)}>{t('dismiss')}</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 20, borderRadius: 8 },
  cardTitle: { ...typography.h3, marginBottom: 15 },
  input: { marginBottom: 15, fontFamily: 'Outfit-Regular' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 8 },
  itemInput: { flex: 1, marginHorizontal: 2, fontFamily: 'Outfit-Regular' },
  addItemButton: { marginTop: 10, marginBottom: 10 },
  total: { ...typography.bodyBold, textAlign: 'right', marginVertical: 10 },
  button: { marginTop: 10, paddingVertical: 8 },
  buttonLabel: { fontFamily: 'Outfit-SemiBold', fontSize: 16 },
  contentPadding: { padding: 20 },
  signatureSwitchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15, padding: 10, borderRadius: 8, borderWidth: 1 },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfButton: {
    width: '48%',
    marginTop: 10,
    paddingVertical: 8,
  },
  dialogTitle: { ...typography.h3 },
  dialogParagraph: { ...typography.body },
});

export default DocumentForm;
