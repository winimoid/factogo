import fs from 'react-native-fs';
import { toWords } from './numberToWords.js';
import { Platform } from 'react-native';

// This function is the single source of truth for generating document HTML.
export const generatePdfHtml = async (item, type, activeStore, t, locale, includeSignature = true, primaryColor) => {
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

  const isDeliveryNote = type === 'delivery_note';
  const total = item.total || 0;
  const items = item.items ? JSON.parse(item.items) : [];

  const totalInWords = toWords(total, locale, { currency: !isDeliveryNote });
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalQuantityInWords = toWords(totalQuantity, locale, { currency: false });

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

  const logoBase64 = await getBase64Image(activeStore?.logoUrl);
  const signatureBase64 = await getBase64Image(activeStore?.signatureUrl);
  const stampBase64 = await getBase64Image(activeStore?.stampUrl);

  const date = new Date(item.date);
  const formattedDate = `Libreville, ${date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const headerHeight = 150;
  const footerHeight = 100;

  const getDocumentTitle = (docType) => {
    switch (docType) {
      case 'invoice': return t('invoice');
      case 'quote': return t('quote');
      case 'delivery_note': return t('delivery_note');
      default: return '';
    }
  }

  const styles = `
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
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; font-family: 'Outfit', Arial, sans-serif; font-size: 12px; color: #333; width: 210mm; }
      .document-wrapper { width: 100%; height: 100%; border-collapse: collapse; display: table; }
      thead { display: table-header-group; }
      #page-header { height: ${headerHeight}px; }
      #page-header-content { padding: 20px 40px; border-bottom: 8px solid #000; position: relative; }
      #page-header-content::after { content: ''; position: absolute; bottom: -8px; left: 0; right: 0; border-bottom: 4px solid ${primaryColor}; }
      .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
      .header-logo { max-width: 120px; max-height: 80px; }
      .header-company-details { text-align: right; }
      tfoot { display: table-footer-group; }
      #page-footer { height: ${footerHeight}px; }
      #page-footer-content { padding: 20px 40px; border-top: 8px solid #000; text-align: center; font-size: 10px; position: relative; }
      #page-footer-content::before { content: ''; position: absolute; top: -8px; left: 0; right: 0; border-top: 4px solid ${primaryColor}; }
      tbody { display: table-row-group; }
      #main-content { padding: 20px 40px; vertical-align: top; }
      .document-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .document-title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
      .client-info, .order-info { border: 1px solid #ccc; padding: 15px; flex: 1; text-align: left; }
      .order-info { margin-right: 20px; }
      .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      .items-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
      .items-table .text-right { text-align: right; }
      .items-table .text-center { text-align: center; }
      .items-table .col-numero { width: 10%; }
      .items-table .col-quantity { width: 15%; }
      .totals-section { margin-top: 20px; display: flex; justify-content: flex-end; }
      .totals-table { width: 50%; border-collapse: collapse; }
      .totals-table td { padding: 8px; border: 1px solid #ccc; }
      .totals-table .label { font-weight: bold; }
      .total-in-words { margin-top: 20px; font-style: italic; }
      .signature-section { margin-top: 50px; }
      .signature-section.multi { display: flex; justify-content: space-between; text-align: center; }
      .signature-section.single { text-align: right; }
      .signature-box { display: flex; flex-direction: column; }
      .signature-images { margin-top: 10px; }
      .signature-images img { max-height: 60px; margin-left: 20px; }
      .text-bold { font-weight: bold; }
  `;

  const docTitleHtml = `<div class="document-title">${getDocumentTitle(type)} N° ${item?.document_number || ''}</div><div>${formattedDate}</div>`;
  let headerDetailsHtml, itemsTableHtml, totalsHtml, signatureHtml;

  // The shouldIncludeSignature parameter is now passed directly.

  if (isDeliveryNote) {
    headerDetailsHtml = `
      <div>
        ${docTitleHtml}
      </div>
      <div class="document-details" style="margin-top: 20px;">
        <div class="order-info">
          <span class="text-bold">${t('order_reference')}:</span> <span style="color: red;">${item.order_reference || ''}</span><br/>
          <span class="text-bold">${t('payment_method')}:</span> ${item.payment_method || ''}
        </div>
        <div class="client-info">
          <span class="text-bold">${t('client')}:</span><br/>
          ${item.clientName}<br/>
          - Libreville -
        </div>
      </div>
    `;
    itemsTableHtml = `<table class="items-table"><thead><tr><th class="col-numero">N°</th><th>Désignation</th><th class="col-quantity text-center">Qté</th></tr></thead><tbody>${items.map((i, index) => `<tr><td class="text-center">${index + 1}</td><td>${i.description}</td><td class="text-center">${i.quantity}</td></tr>`).join('')}</tbody></table>`;
    totalsHtml = `
        <div class="totals-section">
          <table class="totals-table">
            <tbody>
              <tr>
                <td class="label">${t('total_quantity')}</td>
                <td class="text-right">${totalQuantity}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    signatureHtml = `<div class="signature-section multi"><div class="signature-box"><span class="text-bold">${t('reception_acknowledgement')}</span><div style="height: 80px;"></div></div><div class="signature-box"><span class="text-bold">Le Gérant</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div></div>`;
  } else {
    headerDetailsHtml = `
      <div>
        ${docTitleHtml}
      </div>
      <div style="text-align: right; margin-top: 20px;">
        <div class="client-info" style="display: inline-block; width: 250px;">
          <span class="text-bold">${t('client')}:</span><br/>
          ${item.clientName}<br/>
          - Libreville -
        </div>
      </div>
    `;
    itemsTableHtml = `<table class="items-table"><thead><tr><th>Désignation</th><th class="text-center">Qté</th><th class="text-right">P.U. HT</th><th class="text-right">Montant</th></tr></thead><tbody>${items.map(i => `<tr><td>${i.description}</td><td class="text-center">${i.quantity}</td><td class="text-right">${i.price.toLocaleString('fr-FR')}</td><td class="text-right">${(i.quantity * i.price).toLocaleString('fr-FR')}</td></tr>`).join('')}</tbody></table>`;
    totalsHtml = `<div class="totals-section"><table class="totals-table"><tbody><tr><td class="label">Total HT</td><td class="text-right">${total.toLocaleString('fr-FR')} FCFA</td></tr><tr><td class="label">Total TTC</td><td class="text-right">${total.toLocaleString('fr-FR')} FCFA</td></tr></tbody></table></div><div class="total-in-words">${t(type === 'invoice' ? 'total_summary_invoice' : 'total_summary_quote', { documentType: getDocumentTitle(type) })} <span class="text-bold">${totalInWords}</span>.</div>`;
    signatureHtml = `<div class="signature-section single"><span class="text-bold">Le Gérant</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div>`;
  }

  return `<html><head><style>${styles}</style></head><body><table class="document-wrapper"><thead><tr><td><div id="page-header"><div id="page-header-content"><div class="header-flex"><div>${logoBase64 ? `<img src="${logoBase64}" class="header-logo" />` : ''}</div><div class="header-company-details"><p>${activeStore?.customTexts || ''}</p></div></div></div></div></td></tr></thead><tbody><tr><td id="main-content">${headerDetailsHtml}${itemsTableHtml}${totalsHtml}${signatureHtml}</td></tr></tbody><tfoot><tr><td><div id="page-footer"><div id="page-footer-content"><p>${activeStore?.customTexts || ''}</p></div></div></td></tr></tfoot></table></body></html>`;
};
