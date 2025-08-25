import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Card, Title, ActivityIndicator, Portal, Dialog, Paragraph } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { LanguageContext } from '../contexts/LanguageContext';
import { getSettings } from '../services/Database';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import fs from 'react-native-fs';
import { toWords } from '../utils/numberToWords';
import { typography } from '../styles/typography';


const DocumentForm = ({ route, navigation, documentType, dbActions }) => {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [total, setTotal] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);
  const { t, locale } = useContext(LanguageContext);
  const { colors } = useTheme();
  const { document } = route.params || {};

  useEffect(() => {
    if (document) {
      setClientName(document.clientName);
      if (document.date && typeof document.date === 'string') {
        const parts = document.date.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          setDate(new Date(year, month, day));
        } else {
          setDate(new Date()); // Fallback for invalid date format
        }
      } else {
        setDate(new Date()); // Fallback for missing date
      }
      setItems(document.items ? JSON.parse(document.items) : []);
      setTotal(document.total);
    }
  }, [document]);

  const calculateTotal = useCallback(() => {
    const newTotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    setTotal(newTotal);
  }, [items]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

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
    const newDocument = { clientName, date: date.toISOString().split('T')[0], items, total };
    if (document) {
      await dbActions.update(document.id, newDocument);
    } else {
      await dbActions.add(newDocument);
    }
    navigation.goBack();
  };

  const generatePdfHtml = async () => {
    const settings = await getSettings();
    const totalInWords = toWords(total, locale, { currency: true });

    const getBase64Image = async (uri) => {
      if (!uri) return '';
      try {
        const base64 = await fs.readFile(uri.replace('file://', ''), 'base64');
        const mimeType = uri.split('.').pop();
        return `data:image/${mimeType};base64,${base64}`;
      } catch (error) {
        console.error('Error reading image file', uri, error);
        return '';
      }
    };

    const loadFontAsBase64 = async (fontName) => {
      try {
        const fontPath = Platform.OS === 'android' ? `fonts/${fontName}.ttf` : `${fs.MainBundlePath}/fonts/${fontName}.ttf`;
        const fontData = await fs.readFileAssets(fontPath, 'base64');
        return fontData;
      } catch (error) {
        console.error(`Error loading font ${fontName}:`, error);
        return null;
      }
    };

    const outfitRegularBase64 = await loadFontAsBase64('Outfit-Regular');
    const outfitBoldBase64 = await loadFontAsBase64('Outfit-Bold');

    const logoBase64 = await getBase64Image(settings?.logo);
    const signatureBase64 = await getBase64Image(settings?.signature);
    const stampBase64 = await getBase64Image(settings?.stamp);

    const formattedDate = `${t('pdf_location_prefix')}${date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
    const stoppedAtPrefix = documentType === 'invoice' ? t('pdf_stopped_at_prefix_invoice') : t('pdf_stopped_at_prefix_quote');

    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const documentIdPadded = String(document?.id || '0').padStart(3, '0');
    const formattedDocumentNumber = `${documentIdPadded}/${currentMonth}/${currentYear}`;

    const headerHeight = 150; // px
    const footerHeight = 100; // px

    return `
    <html>
      <head>
        <style>
          @font-face {
            font-family: 'Outfit';
            src: url(data:font/truetype;base64,${outfitRegularBase64}) format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'Outfit';
            src: url(data:font/truetype;base64,${outfitBoldBase64}) format('truetype');
            font-weight: bold;
            font-style: normal;
          }
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 12px;
            color: #333;
            width: 210mm;
          }
          .document-wrapper {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
            display: table;
          }
          
          /* HEADER STYLES */
          thead {
            display: table-header-group;
          }
          #page-header {
            height: ${headerHeight}px;
          }
          #page-header-content {
            padding: 20px 40px;
            border-bottom: 8px solid #000;
            position: relative;
          }
          #page-header-content::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            right: 0;
            border-bottom: 4px solid #b01c2e;
          }
          .header-flex {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .header-logo {
            max-width: 120px;
            max-height: 80px;
          }
          .header-company-details {
            text-align: right;
          }

          /* FOOTER STYLES */
          tfoot {
            display: table-footer-group;
          }
          #page-footer {
            height: ${footerHeight}px;
          }
          #page-footer-content {
            padding: 20px 40px;
            border-top: 8px solid #000;
            text-align: center;
            font-size: 12px;
            position: relative;
          }
          #page-footer-content::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 0;
            right: 0;
            border-top: 4px solid #b01c2e;
          }

          /* BODY STYLES */
          tbody {
            display: table-row-group;
          }
          #main-content {
            padding: 20px 40px;
            vertical-align: top;
          }
          .document-details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
          }
          .document-title {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .client-info {
            border: 1px solid #ccc;
            padding: 15px;
            min-width: 250px;
            text-align: center;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .items-table th, .items-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          .items-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
          }
          .items-table .text-right { text-align: right; }
          .items-table .text-center { text-align: center; }
          
          .totals-section {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 50%;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 8px;
            border: 1px solid #ccc;
          }
          .totals-table .label {
            font-weight: bold;
          }
          .total-in-words {
            margin-top: 20px;
            font-style: italic;
          }
          .signature-section {
            margin-top: 50px;
            text-align: right;
          }
          .signature-images {
            margin-top: 10px;
          }
          .signature-images img {
            max-height: 60px;
            margin-left: 20px;
          }
          .text-bold, b, strong {
            font-weight: bold;
          }

        </style>
      </head>
      <body>
        <table class="document-wrapper">
          
          <thead>
            <tr>
              <td>
                <div id="page-header">
                  <div id="page-header-content">
                    <div class="header-flex">
                      <div>
                        ${logoBase64 ? `<img src="${logoBase64}" class="header-logo" />` : '<h1>Logo</h1>'}
                      </div>
                      <div class="header-company-details">
                        <p>${settings?.description || 'Company Description'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td id="main-content">
                <div class="document-details">
                  <div>
                    <div class="document-title">${documentType === 'invoice' ? t('invoice') : t('quote')} N° ${formattedDocumentNumber}</div>
                    <div>${formattedDate}</div>
                  </div>
                  <div class="client-info">
                    <span class="text-bold">${t('pdf_client_label')}</span><br/>
                    ${clientName}<br/>
                    ${t('pdf_client_location')}
                  </div>
                </div>

                <table class="items-table">
                  <thead>
                    <tr>
                      <th>${t('pdf_th_designation')}</th>
                      <th class="text-center">${t('pdf_th_quantity')}</th>
                      <th class="text-right">${t('pdf_th_unit_price')}</th>
                      <th class="text-right">${t('pdf_th_amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(i => `
                      <tr>
                        <td>${i.description}</td>
                        <td class="text-center">${i.quantity}</td>
                        <td class="text-right">${i.price.toLocaleString(t('pdf_locale'))}</td>
                        <td class="text-right">${(i.quantity * i.price).toLocaleString(t('pdf_locale'))}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <div class="totals-section">
                  <table class="totals-table">
                    <tbody>
                      <tr>
                        <td class="label">${t('pdf_total_ht')}</td>
                        <td class="text-right"><b>${total.toLocaleString(t('pdf_locale'))} ${t('pdf_currency')}</b></td>
                      </tr>
                      <!-- Add other rows for VAT, etc. if needed -->
                      <!-- <tr>
                        <td class="label">${t('pdf_total_ttc')}</td>
                        <td class="text-right"><b>${total.toLocaleString(t('pdf_locale'))} ${t('pdf_currency')}</b></td>
                      </tr> -->
                    </tbody>
                  </table>
                </div>

                <div class="total-in-words">
                  ${stoppedAtPrefix} <span class="text-bold">${totalInWords}</span>.
                </div>

                <div class="signature-section">
                  <span class="text-bold">${t('pdf_manager_label')}</span>
                  <div class="signature-images">
                    ${signatureBase64 ? `<img src="${signatureBase64}" />` : ''}
                    ${stampBase64 ? `<img src="${stampBase64}" />` : ''}
                  </div>
                </div>

              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td>
                <div id="page-footer">
                  <div id="page-footer-content">
                    <p>${settings?.informations || 'Company Information - Address - Phone - Email'}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>

        </table>
      </body>
    </html>
    `;
  };

  const handlePdfAction = async (action) => {
    setLoadingPdf(true);
    try {
      const settings = await getSettings();
      if (!settings || !settings.companyName) {
        setSettingsDialogVisible(true);
        setLoadingPdf(false);
        return;
      }

      const htmlContent = await generatePdfHtml();
      const fileName = `${documentType === 'invoice' ? 'Invoice' : 'Quote'}_${document?.id || 'new'}`;
      const options = {
        html: htmlContent,
        fileName,
        directory: 'Documents',
        pageSize: 'A4',
      };

      const file = await RNHTMLtoPDF.convert(options);
      if (!file || !file.filePath) {
        console.error(t('pdf_file_path_null_error'), file);
        // You can replace this with a dialog as well if you want
        alert(t('failed_generate_pdf_settings_alert'));
        setLoadingPdf(false);
        return;
      }

      if (action === 'download') {
        const destPath = `${fs.DownloadDirectoryPath}/${fileName}.pdf`;
        await fs.moveFile(file.filePath, destPath);
        // You can replace this with a dialog as well if you want
        alert(`${documentType === 'invoice' ? t('invoice') : t('quote')} ${t('downloaded_to')} ${destPath}`);
      } else if (action === 'share') {
        const cachePath = `${fs.CachesDirectoryPath}/${fileName}.pdf`;
        await fs.copyFile(file.filePath, cachePath);
        await Share.open({
          title: `Share ${documentType === 'invoice' ? t('invoice') : t('quote')}`,
          url: `file://${cachePath}`,
          type: 'application/pdf',
        });
      } else if (action === 'preview') {
        navigation.navigate('PdfPreview', { htmlContent });
      }
    } catch (error) {
      console.error(`Failed to ${action} PDF`, error);
      // You can replace this with a dialog as well if you want
      alert(`${t('failed_to')} ${action} PDF.`);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownload = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setPermissionDialogVisible(true);
      return;
    }
    handlePdfAction('download');
  };

  const handleShare = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setPermissionDialogVisible(true);
      return;
    }
    handlePdfAction('share');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              label={t('item')}
              value={item.description}
              onChangeText={(value) => handleItemChange(index, 'description', value)}
              style={[styles.itemInput, { backgroundColor: colors.background }]}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('quantity')}
              value={item.quantity.toString()}
              onChangeText={(value) => handleItemChange(index, 'quantity', parseInt(value, 10) || 0)}
              keyboardType="numeric"
              style={[styles.itemInput, { backgroundColor: colors.background }]}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <TextInput
              label={t('unit_price')}
              value={item.price.toString()}
              onChangeText={(value) => handleItemChange(index, 'price', parseFloat(value) || 0)}
              keyboardType="numeric"
              style={[styles.itemInput, { backgroundColor: colors.background }]}
              mode="outlined"
              labelStyle={typography.body}
              inputStyle={typography.body}
            />
            <IconButton
              icon="close-circle"
              color={colors.error}
              size={20}
              onPress={() => handleRemoveItem(index)}
              style={styles.removeButton}
            />
          </View>
        )}
        ListHeaderComponent={(
          <View style={styles.contentPadding}>
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('client')}</Title>
                <TextInput
                  label={t('client_name')}
                  value={clientName}
                  onChangeText={setClientName}
                  style={styles.input}
                  mode="outlined"
                  labelStyle={typography.body}
                  inputStyle={typography.body}
                />
                <TextInput
                  label={t('date')}
                  value={date.toISOString().split('T')[0]}
                  onFocus={() => setIsDatePickerVisible(true)}
                  showSoftInputOnFocus={false} // Prevent keyboard from opening
                  style={styles.input}
                  mode="outlined"
                  labelStyle={typography.body}
                  inputStyle={typography.body}
                  right={<TextInput.Icon icon="calendar" onPress={() => setIsDatePickerVisible(true)} />}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('items')}</Title>
                <Button onPress={handleAddItem} mode="outlined" icon="plus-circle-outline" style={styles.addItemButton} labelStyle={typography.button}>
                  {t('add_item')}
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.contentPadding}>
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Text style={styles.total}>{t('total')}: {total.toFixed(2)} {t('pdf_currency')}</Text>
              </Card.Content>
            </Card>

            <Button mode="contained" onPress={handleSave} style={styles.button} icon="content-save" disabled={loadingPdf} labelStyle={typography.button}>
              {loadingPdf ? <ActivityIndicator color={colors.onPrimary} /> : t('save')}
            </Button>

            <Button mode="outlined" onPress={() => handlePdfAction('preview')} style={styles.button} icon="file-pdf-box" disabled={loadingPdf} labelStyle={typography.button}>
              {loadingPdf ? <ActivityIndicator color={colors.primary} /> : t('preview_pdf')}
            </Button>
            <Button mode="outlined" onPress={handleDownload} style={styles.button} icon="download" disabled={loadingPdf} labelStyle={typography.button}>
              {loadingPdf ? <ActivityIndicator color={colors.primary} /> : t('download')}
            </Button>
            <Button mode="outlined" onPress={handleShare} style={styles.button} icon="share-variant" disabled={loadingPdf} labelStyle={typography.button}>
              {loadingPdf ? <ActivityIndicator color={colors.primary} /> : t('share')}
            </Button>
          </View>
        )}
        contentContainerStyle={styles.flatListContentContainer}
      />

      <DatePickerModal
        locale={locale} // e.g., 'en' or 'fr'
        mode="single"
        visible={isDatePickerVisible}
        onDismiss={() => setIsDatePickerVisible(false)}
        date={date}
        onConfirm={({ date: newDate }) => {
          setIsDatePickerVisible(false);
          if (newDate) {
            setDate(newDate);
          }
        }}
      />

      <Portal>
        <Dialog visible={permissionDialogVisible} onDismiss={() => setPermissionDialogVisible(false)} style={{ borderRadius: 8}}>
          <Dialog.Title>{t('storage_permission_denied')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('storage_permission_denied_message')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPermissionDialogVisible(false)}>{t('dismiss')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={settingsDialogVisible} onDismiss={() => setSettingsDialogVisible(false)} style={{ borderRadius: 8}}>
          <Dialog.Title>{t('settings_not_saved_pdf_alert_title')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('settings_not_saved_pdf_alert_message')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsDialogVisible(false)}>{t('cancel')}</Button>
            <Button onPress={() => { setSettingsDialogVisible(false); navigation.navigate('MainTabs', { screen: 'Settings' }); }}>{t('go_to_settings')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20, // Removed padding from here as it's applied to contentPadding
  },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
  },
  itemInput: {
    flex: 1,
    marginHorizontal: 2,
  },
  removeButton: {
    marginLeft: 5,
  },
  addItemButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  total: {
    ...typography.bodyBold,
    textAlign: 'right',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  flatListContentContainer: {
    paddingBottom: 20,
  },
  contentPadding: {
    padding: 20,
  },
});

export default DocumentForm;
