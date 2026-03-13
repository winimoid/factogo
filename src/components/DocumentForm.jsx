import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Card, Title, ActivityIndicator, Portal, Dialog, Paragraph, Switch, HelperText } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { LanguageContext } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { getNextDocumentNumber, createDocumentForStore, updateDocument, getUniqueCustomers } from '../services/DocumentService';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import fs from 'react-native-fs';
import { typography } from '../styles/typography';
import { generatePdfHtml } from '../utils/pdfUtils';
import Autocomplete from './Autocomplete';
import { calculateTotals } from '../utils/calculations';
import { validateDocumentInputs } from '../utils/validation';

const DocumentForm = ({ route, navigation, documentType }) => {
  // Common State
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [downloadDialogVisible, setDownloadDialogVisible] = useState(false);
  const [downloadPath, setDownloadPath] = useState('');
  const [includeSignature, setIncludeSignature] = useState(true);
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [errors, setErrors] = useState({});

  // Numbering State
  const [officialDocumentNumber, setOfficialDocumentNumber] = useState('');
  const [displayNumber, setDisplayNumber] = useState('');

  // Document-specific State
  const [total, setTotal] = useState(0); // For invoices/quotes
  const [totalQuantity, setTotalQuantity] = useState(0); // For delivery notes
  const [orderReference, setOrderReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  
  // New Fields
  const [deposit, setDeposit] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [hasGst, setHasGst] = useState(false);
  const [gstRate, setGstRate] = useState(1.0);
  const [gstAmount, setGstAmount] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const { t, locale } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { activeStore } = useStore();
  const { document, storeId, convertedFrom } = route.params || {};

  const isDeliveryNote = useMemo(() => documentType === 'delivery_note', [documentType]);

  useEffect(() => {
    const loadCustomers = async () => {
      if (storeId) {
        const customers = await getUniqueCustomers(storeId);
        setUniqueCustomers(customers);
      }
    };
    loadCustomers();
  }, [storeId]);

  useEffect(() => {
    const loadDocument = async () => {
      if (document) {
        // Editing an existing document
        setClientName(document.clientName);
        setClientAddress(document.clientAddress || '');
        setClientEmail(document.clientEmail || '');
        setClientPhone(document.clientPhone || '');
        setOfficialDocumentNumber(document.document_number);
        setDisplayNumber(document.document_number);
        if (document.date && typeof document.date === 'string') {
          const parts = document.date.split('-');
          if (parts.length === 3) {
            setDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
          } else { setDate(new Date()); }
        } else { setDate(new Date()); }
        setItems(document.items ? JSON.parse(document.items) : []);
        setDiscountType(document.discountType || 'percentage');
        setDiscountValue(document.discountValue || 0);
        
        // Load new fields
        setDeposit(document.deposit || 0);
        setShowDeposit((document.deposit || 0) > 0);
        setHasGst(!!document.has_gst);
        setGstRate(document.gst_rate !== undefined ? document.gst_rate : (activeStore?.default_gst_rate || 1.0));

        if (isDeliveryNote) {
          setOrderReference(document.order_reference || '');
          setPaymentMethod(document.payment_method || '');
        }

        if (!document.document_number) {
          const newDocNumber = await getNextDocumentNumber(storeId, documentType);
          setOfficialDocumentNumber(newDocNumber);
          setDisplayNumber(newDocNumber);
        }
      } else {
        // Creating a new document
        const newDocNumber = await getNextDocumentNumber(storeId, documentType);
        setOfficialDocumentNumber(newDocNumber);
        setDisplayNumber(newDocNumber);
        // Default GST rate from store
        if (activeStore?.default_gst_rate) {
          setGstRate(activeStore.default_gst_rate);
        }
      }
    };

    loadDocument();
  }, [document, documentType, isDeliveryNote, storeId, activeStore]);

  useEffect(() => {
    const result = calculateTotals(
      items, 
      discountValue, 
      discountType === 'percentage', 
      hasGst ? gstRate : 0, 
      showDeposit ? deposit : 0
    );
    
    setTotal(result.netTotal); // Base total (after discount, before GST)
    setGstAmount(result.gstAmount);
    setGrandTotal(result.grandTotal);
    setBalanceDue(result.balanceDue);
    
    const newTotalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
  }, [items, discountType, discountValue, hasGst, gstRate, deposit, showDeposit]);

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

  const handleClientSelect = (client) => {
    setClientName(client.clientName);
    setClientAddress(client.clientAddress || '');
    setClientEmail(client.clientEmail || '');
    setClientPhone(client.clientPhone || '');
  };

  const handleSave = async () => {
    // Validation
    const validation = validateDocumentInputs({
      deposit: showDeposit ? deposit : 0,
      clientEmail
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert(t('error'), Object.values(validation.errors).join('\n'));
      return;
    }
    
    if (!clientName.trim()) {
      Alert.alert(t('error'), t('client_name_required'));
      return;
    }

    let newDocument = { 
      document_number: displayNumber, 
      clientName, 
      clientAddress,
      clientEmail,
      clientPhone,
      date: date.toISOString().split('T')[0], 
      items, 
      discountType,
      discountValue,
      deposit: showDeposit ? deposit : 0,
      has_gst: hasGst,
      gst_rate: gstRate,
      total: grandTotal // Saving grand total for consistency with existing "total" column meaning
    };

    if (isDeliveryNote) {
      newDocument = { 
        ...newDocument, 
        total: totalQuantity, 
        order_reference: orderReference, 
        payment_method: paymentMethod 
      };
      // Remove irrelevant fields for delivery note
      delete newDocument.deposit;
      delete newDocument.has_gst;
      delete newDocument.gst_rate;
      delete newDocument.discountType;
      delete newDocument.discountValue;
    }

    if (document && document.id) {
      await updateDocument(document.id, documentType, newDocument);
    } else {
      await createDocumentForStore(storeId, documentType, newDocument, document?.convertedFrom);
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
    // Same validation as save
    const validation = validateDocumentInputs({
        deposit: showDeposit ? deposit : 0,
        clientEmail
    });
  
    if (!validation.isValid) {
        setErrors(validation.errors);
        Alert.alert(t('error'), Object.values(validation.errors).join('\n'));
        return;
    }

    setLoadingPdf(true);
    try {
      if (!activeStore) { return; }

      const documentData = {
        id: document?.id,
        document_number: displayNumber,
        clientName,
        clientAddress,
        clientEmail,
        clientPhone,
        date: date.toISOString(),
        items: JSON.stringify(items),
        total: isDeliveryNote ? totalQuantity : grandTotal,
        subtotal: total, // Passing the net total (after discount) as subtotal
        order_reference: orderReference,
        payment_method: paymentMethod,
        discountType,
        discountValue,
        deposit: showDeposit ? deposit : 0,
        has_gst: hasGst,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        balance_due: balanceDue
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

  const headerContent = useMemo(() => (
    <View style={styles.contentPadding}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Title style={styles.cardTitle}>{getDocumentTitle(documentType)}</Title>
          <TextInput label={`${t(documentType)} ${t('document_number_prefix')}`} value={displayNumber} onChangeText={setDisplayNumber} style={styles.input} mode="outlined" />
          
          <Autocomplete
            label={t('client_name')}
            value={clientName}
            onChangeText={setClientName}
            onSelect={handleClientSelect}
            data={uniqueCustomers}
            filterKey="clientName"
            placeholder={t('client_name')}
            style={styles.input}
          />

          <TextInput label={t('client_address')} value={clientAddress} onChangeText={setClientAddress} style={styles.input} mode="outlined" />
          <TextInput label={t('client_email')} value={clientEmail} onChangeText={setClientEmail} style={styles.input} mode="outlined" error={!!errors.clientEmail} />
          <HelperText type="error" visible={!!errors.clientEmail}>{errors.clientEmail}</HelperText>
          
          <TextInput label={t('client_phone')} value={clientPhone} onChangeText={setClientPhone} style={styles.input} mode="outlined" keyboardType="phone-pad" />
          
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
  ), [documentType, displayNumber, clientName, uniqueCustomers, clientAddress, clientEmail, errors, clientPhone, date, isDatePickerVisible, isDeliveryNote, orderReference, paymentMethod, t, colors, handleClientSelect, handleAddItem]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
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
        ListHeaderComponent={headerContent}
        ListFooterComponent={(
          <View style={styles.contentPadding}>
            {!isDeliveryNote && (
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('discount')}</Title>
                <View style={styles.switchContainer}>
                  <Text>{t('percentage')}</Text>
                  <Switch
                    value={discountType === 'fixed'}
                    onValueChange={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')}
                  />
                  <Text>{t('fixed')}</Text>
                </View>
                <TextInput
                  label={t('discount_value')}
                  value={discountValue.toString()}
                  onChangeText={text => setDiscountValue(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />

                <Title style={[styles.cardTitle, { marginTop: 15 }]}>{t('deposit')}</Title>
                <View style={styles.switchContainer}>
                   <Text>{t('deposit')}</Text>
                   <Switch value={showDeposit} onValueChange={setShowDeposit} />
                </View>
                {showDeposit && (
                  <>
                  <TextInput
                    label={t('deposit_paid')}
                    value={deposit.toString()}
                    onChangeText={text => setDeposit(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.deposit}
                  />
                  <HelperText type="error" visible={!!errors.deposit}>{errors.deposit}</HelperText>
                  </>
                )}

                <Title style={[styles.cardTitle, { marginTop: 15 }]}>{t('gst_label')}</Title>
                <View style={styles.switchContainer}>
                   <Text>{t('has_gst')}</Text>
                   <Switch value={hasGst} onValueChange={setHasGst} />
                </View>
                {hasGst && (
                  <TextInput
                    label={t('gst_rate')}
                    value={gstRate.toString()}
                    onChangeText={text => setGstRate(parseFloat(text) || 0)}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                  />
                )}
              </Card.Content>
            </Card>
            )}

            <Card style={styles.card} elevation={4}>
              <Card.Content>
                {isDeliveryNote ? (
                  <Text style={styles.total}>{t('total_quantity')}: {totalQuantity}</Text>
                ) : (
                  <>
                    <Text style={styles.subtotal}>{t('total_ht')}: {total.toLocaleString(locale)}</Text>
                    {hasGst && <Text style={styles.subtotal}>{t('gst_label')} ({gstRate}%): {gstAmount.toLocaleString(locale)}</Text>}
                    <Text style={styles.total}>{t('total_ttc')}: {grandTotal.toLocaleString(locale)}</Text>
                    {showDeposit && (
                      <>
                        <Text style={styles.subtotal}>{t('deposit_paid')}: -{deposit.toLocaleString(locale)}</Text>
                        <Text style={[styles.total, {color: colors.primary}]}>{t('balance_due')}: {balanceDue.toLocaleString(locale)}</Text>
                      </>
                    )}
                  </>
                )}
              </Card.Content>
            </Card>

            <View style={[styles.switchContainer, {borderColor: colors.outline, borderWidth: 1, padding: 10, borderRadius: 8, justifyContent: 'space-between'}]}>
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
  total: { ...typography.bodyBold, textAlign: 'right', marginVertical: 5, fontSize: 18 },
  subtotal: { ...typography.body, textAlign: 'right', marginVertical: 2 },
  button: { marginTop: 10, paddingVertical: 8 },
  buttonLabel: { fontFamily: 'Outfit-SemiBold', fontSize: 16 },
  contentPadding: { padding: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
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
