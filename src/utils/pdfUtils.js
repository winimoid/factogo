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

  let headerText = '';
  let footerText = '';
  if (activeStore?.customTexts) {
    try {
      const parsedTexts = JSON.parse(activeStore.customTexts);
      headerText = parsedTexts.header || '';
      footerText = parsedTexts.footer || '';
    } catch (e) {
      // Fallback for old plain text data
      headerText = activeStore.customTexts;
      footerText = activeStore.customTexts;
    }
  }

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

  const templateId = activeStore?.documentTemplateId;
  let finalHtml;

  // Common HTML generation logic can be defined here if it doesn't change between templates.
  // For this example, we'll regenerate the full HTML inside the switch to be safe.

  switch (templateId) {
    case 2: { // Modern Template
      const modernPrimaryColor = '#4A90E2'; // A distinct blue for the modern template
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
        #page-header-content::after { content: ''; position: absolute; bottom: -8px; left: 0; right: 0; border-bottom: 4px solid ${modernPrimaryColor}; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-logo { max-width: 120px; max-height: 80px; }
        .header-company-details { text-align: right; }
        tfoot { display: table-footer-group; }
        #page-footer { height: ${footerHeight}px; }
        #page-footer-content { padding: 20px 40px; border-top: 8px solid #000; text-align: center; font-size: 10px; position: relative; }
        .signature-section.multi { display: flex; justify-content: space-between; text-align: center; }
        .signature-section.single { text-align: right; }
        .signature-box { width: 48%; }
        .signature-images { margin-top: 10px; }
        .signature-images img { max-height: 60px; margin-left: 20px; }
        .text-bold { font-weight: bold; }
      `;
      const docTitleHtml = `<div class="document-title">${getDocumentTitle(type)} N° ${item?.document_number || ''}</div><div>${formattedDate}</div>`;
      let headerDetailsHtml, itemsTableHtml, totalsHtml, signatureHtml;
      if (isDeliveryNote) {
        headerDetailsHtml = `<div>${docTitleHtml}</div><div class="document-details" style="margin-top: 20px;"><div class="order-info"><span class="text-bold">${t('order_reference')}:</span> <span style="color: red;">${item.order_reference || ''}</span><br/><span class="text-bold">${t('payment_method')}:</span> ${item.payment_method || ''}</div><div class="client-info"><span class="text-bold">${t('client')}:</span><br/>${item.clientName}<br/>- Libreville -</div></div>`;
        itemsTableHtml = `<table class="items-table"><thead><tr><th class="col-numero">${t('item_number_short')}</th><th>${t('designation')}</th><th class="col-quantity text-center">${t('quantity_short')}</th></tr></thead><tbody>${items.map((i, index) => `<tr><td class="text-center">${index + 1}</td><td>${i.description}</td><td class="text-center">${i.quantity}</td></tr>`).join('')}</tbody></table>`;
        totalsHtml = `<div class="totals-section"><table class="totals-table"><tbody><tr><td class="label">${t('total_quantity')}</td><td class="text-right">${totalQuantity}</td></tr></tbody></table></div>`;
        signatureHtml = `<div class="signature-section multi"><div class="signature-box"><span class="text-bold">${t('reception_acknowledgement')}</span><div style="height: 80px;"></div></div><div class="signature-box"><span class="text-bold">${t('manager')}</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div></div>`;
      } else {
        headerDetailsHtml = `<div>${docTitleHtml}</div><div style="text-align: right; margin-top: 20px;"><div class="client-info" style="display: inline-block; width: 250px;"><span class="text-bold">${t('client')}:</span><br/>${item.clientName}<br/>- Libreville -</div></div>`;
        itemsTableHtml = `<table class="items-table"><thead><tr><th>${t('designation')}</th><th class="text-center">${t('quantity_short')}</th><th class="text-right">${t('unit_price_short')}</th><th class="text-right">${t('total_amount')}</th></tr></thead><tbody>${items.map(i => `<tr><td>${i.description}</td><td class="text-center">${i.quantity}</td><td class="text-right">${i.price.toLocaleString(locale)}</td><td class="text-right">${(i.quantity * i.price).toLocaleString(locale)}</td></tr>`).join('')}</tbody></table>`;
        totalsHtml = `<div class="totals-section"><table class="totals-table"><tbody><tr><td class="label">${t('total_ht')}</td><td class="text-right">${total.toLocaleString(locale)} FCFA</td></tr><tr><td class="label">${t('total_ttc')}</td><td class="text-right">${total.toLocaleString(locale)} FCFA</td></tr></tbody></table></div><div class="total-in-words">${t(type === 'invoice' ? 'total_summary_invoice' : 'total_summary_quote', { documentType: getDocumentTitle(type) })} <span class="text-bold">${totalInWords}</span>.</div>`;
        signatureHtml = `<div class="signature-section single"><span class="text-bold">${t('manager')}</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div>`;
      }
      finalHtml = `<html><head><style>${styles}</style></head><body><table class="document-wrapper"><thead><tr><td><div id="page-header"><div id="page-header-content"><div class="header-flex"><div>${logoBase64 ? `<img src="${logoBase64}" class="header-logo" />` : ''}</div><div class="header-company-details"><p>${headerText}</p></div></div></div></div></td></tr></thead><tbody><tr><td id="main-content">${headerDetailsHtml}${itemsTableHtml}${totalsHtml}${signatureHtml}</td></tr></tbody><tfoot><tr><td><div id="page-footer"><div id="page-footer-content"><p>${footerText}</p></div></div></td></tr></tfoot></table></body></html>`;
      break;
    }
    case 3: { // Commercial Template based on user markdown
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
        @page { size: A4; margin: 1cm; }
        body {
          font-family: 'Outfit', Arial, sans-serif;
          font-size: 10pt;
          color: #000;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: stretch; /* Make columns equal height */
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .header-left { width: 70%; text-align: center; }
        .header-right {
          width: 30%;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center; /* Vertically center content */
        }
        .header h1 {
          margin: 0;
          font-size: 16pt;
          font-weight: bold;
        }
        .header .subtitle {
          font-size: 10pt;
          font-style: italic;
        }
        .header .info {
          font-size: 16pt;
          margin-top: 5px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .items-table th, .items-table td {
          border: 1px solid #000;
          padding: 5px;
          text-align: left;
        }
        .items-table th {
          font-weight: bold;
          text-align: center;
        }
        .items-table .col-numero { width: 10%; text-align: center; }
        .items-table .col-qte { width: 10%; text-align: center; }
        .items-table .col-pu, .items-table .col-pt { width: 20%; text-align: right; }
        .footer {
          margin-top: 20px;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        .footer-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .signature-area {
          width: 60%;
        }
        .totals-area {
          width: 35%;
          text-align: right;
        }
        .totals-area .status {
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 10px;
        }
        .totals-area .total {
          font-weight: bold;
          font-size: 14pt;
        }
        .total-in-words {
          margin-top: 20px;
          font-style: italic;
        }
        .text-bold { font-weight: bold; }
        .signature-section { margin-top: 20px; }
        .signature-section.multi { display: flex; justify-content: space-between; text-align: center; }
        .signature-box { width: 48%; /* Assign width to allow text-align to work effectively */ }
        .signature-images { margin-top: 10px; }
        .signature-images img { max-height: 60px; margin: 0 5px; }
        .table-container { position: relative; }
        .stamp {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          border: 5px solid red;
          color: red;
          font-size: 28px;
          font-weight: bold;
          padding: 10px 20px;
          opacity: 0.5;
          z-index: 1000;
          pointer-events: none;
        }
      `;

      // Extracting store details for the header
      const storeInfo = headerText.replace(/\n/g, ' - ');

      const docTitleString = type === 'quote'
        ? `PROFORMA ${t('document_number_prefix')}`
        : `${getDocumentTitle(type).toUpperCase()} ${t('document_number_prefix')}`;

      let itemsTableHtml, footerHtml, clientAndOrderInfoHtml;

      if (isDeliveryNote) {
        clientAndOrderInfoHtml = `
          <div style="display: flex; justify-content: space-between; margin-top: 20px; padding: 10px; border: 1px solid #000;">
              <div style="width: 48%;">
                  <strong>${t('client')}:</strong><br/>
                  ${item.clientName}<br/>
              </div>
              <div style="width: 48%;">
                  <strong>${t('order_reference')}:</strong> <span style="color: red;">${item.order_reference || ''}</span><br/>
                  <strong>${t('payment_method')}:</strong> ${item.payment_method || ''}
              </div>
          </div>
        `;

        itemsTableHtml = `
          <table class="items-table">
            <thead>
              <tr>
                <th class="col-numero">${t('item_number_short')}</th>
                <th>${t('designation')}</th>
                <th class="col-qte">${t('quantity_short')}</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((i, index) => `
                <tr>
                  <td class="col-numero">${index + 1}</td>
                  <td>${i.description}</td>
                  <td class="col-qte">${i.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        footerHtml = `
          <div class="footer">
            <div class="totals-area" style="text-align: right; width: 100%;">
                <div class="total">${t('total_quantity')}: ${totalQuantity}</div>
            </div>
            <div class="signature-section multi">
                <div class="signature-box">
                    <span class="text-bold">${t('reception_acknowledgement')}</span>
                    <div style="height: 80px;"></div>
                </div>
                <div class="signature-box">
                    <span class="text-bold">${t('manager')}</span>
                    ${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}
                </div>
            </div>
          </div>
        `;
      } else {
        clientAndOrderInfoHtml = `
          <div style="margin-top: 20px; padding: 10px; border: 1px solid #000; text-align: left;">
              <strong>${t('client')}:</strong><br/>
              ${item.clientName}<br/>
              - Libreville -
          </div>
        `;

        const stampHtml = type === 'invoice' && includeSignature ? `<div class="stamp">${t('paid_not_delivered')}</div>` : '';

        itemsTableHtml = `
          <div class="table-container">
            ${stampHtml}
            <table class="items-table">
              <thead>
                <tr>
                  <th class="col-qte">${t('quantity_short')}</th>
                  <th>${t('designation')}</th>
                  <th class="col-pu">${t('unit_price_short')}</th>
                  <th class="col-pt">${t('total_amount')}</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(i => `
                  <tr>
                    <td class="col-qte">${i.quantity}</td>
                    <td>${i.description}</td>
                    <td class="col-pu">${i.price.toLocaleString(locale)}</td>
                    <td class="col-pt">${(i.quantity * i.price).toLocaleString(locale)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        footerHtml = `
          <div class="footer">
            <div class="footer-flex" style="justify-content: flex-end;">
              <div class="totals-area">
                ${item.status ? `<div class="status">${item.status.toUpperCase()}</div>` : ''}
                <div class="total">${t('total_prefix')} ${total.toLocaleString(locale)}</div>
              </div>
            </div>
            <div class="total-in-words">
              ${t(type === 'invoice' ? 'total_summary_invoice' : 'total_summary_quote')} <span class="text-bold">${totalInWords}</span>.
            </div>
          </div>
        `;
      }

      finalHtml = `
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>
            <div class="header">
              <div class="header-left">
                <h1 style="font-size: 25pt;">${activeStore.name}</h1>
                <div class="subtitle">${footerText}</div>
                <div class="info">${storeInfo}</div>
              </div>
              <div class="header-right">
                <p>${t('date_prefix')} ${new Date(item.date).toLocaleDateString(locale)}</p>
                <p>${docTitleString}</p>
                <p><span style="color: red;">${item.document_number}</span></p>
              </div>
            </div>

            ${clientAndOrderInfoHtml}

            ${itemsTableHtml}
            ${footerHtml}

          </body>
        </html>
      `;
      break;
    }
    
    case 1: // Classic Template
    default: {
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
        .signature-box { width: 48%; }
        .signature-images { margin-top: 10px; }
        .signature-images img { max-height: 60px; margin-left: 20px; }
        .text-bold { font-weight: bold; }
      `;
      const docTitleHtml = `<div class="document-title">${getDocumentTitle(type)} N° ${item?.document_number || ''}</div><div>${formattedDate}</div>`;
      let headerDetailsHtml, itemsTableHtml, totalsHtml, signatureHtml;
      if (isDeliveryNote) {
        headerDetailsHtml = `<div>${docTitleHtml}</div><div class="document-details" style="margin-top: 20px;"><div class="order-info"><span class="text-bold">${t('order_reference')}:</span> <span style="color: red;">${item.order_reference || ''}</span><br/><span class="text-bold">${t('payment_method')}:</span> ${item.payment_method || ''}</div><div class="client-info"><span class="text-bold">${t('client')}:</span><br/>${item.clientName}<br/>- Libreville -</div></div>`;
        itemsTableHtml = `<table class="items-table"><thead><tr><th class="col-numero">${t('item_number_short')}</th><th>${t('designation')}</th><th class="col-quantity text-center">${t('quantity_short')}</th></tr></thead><tbody>${items.map((i, index) => `<tr><td class="text-center">${index + 1}</td><td>${i.description}</td><td class="text-center">${i.quantity}</td></tr>`).join('')}</tbody></table>`;
        totalsHtml = `<div class="totals-section"><table class="totals-table"><tbody><tr><td class="label">${t('total_quantity')}</td><td class="text-right">${totalQuantity}</td></tr></tbody></table></div>`;
        signatureHtml = `<div class="signature-section multi"><div class="signature-box"><span class="text-bold">${t('reception_acknowledgement')}</span><div style="height: 80px;"></div></div><div class="signature-box"><span class="text-bold">${t('manager')}</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div></div>`;
      } else {
        headerDetailsHtml = `<div>${docTitleHtml}</div><div style="text-align: right; margin-top: 20px;"><div class="client-info" style="display: inline-block; width: 250px;"><span class="text-bold">${t('client')}:</span><br/>${item.clientName}<br/>- Libreville -</div></div>`;
        itemsTableHtml = `<table class="items-table"><thead><tr><th>${t('designation')}</th><th class="text-center">${t('quantity_short')}</th><th class="text-right">${t('unit_price_short')}</th><th class="text-right">${t('total_amount')}</th></tr></thead><tbody>${items.map(i => `<tr><td>${i.description}</td><td class="text-center">${i.quantity}</td><td class="text-right">${i.price.toLocaleString(locale)}</td><td class="text-right">${(i.quantity * i.price).toLocaleString(locale)}</td></tr>`).join('')}</tbody></table>`;
        totalsHtml = `<div class="totals-section"><table class="totals-table"><tbody><tr><td class="label">${t('total_ht')}</td><td class="text-right">${total.toLocaleString(locale)} FCFA</td></tr><tr><td class="label">${t('total_ttc')}</td><td class="text-right">${total.toLocaleString(locale)} FCFA</td></tr></tbody></table></div><div class="total-in-words">${t(type === 'invoice' ? 'total_summary_invoice' : 'total_summary_quote', { documentType: getDocumentTitle(type) })} <span class="text-bold">${totalInWords}</span>.</div>`;
        signatureHtml = `<div class="signature-section single"><span class="text-bold">${t('manager')}</span>${includeSignature ? `<div class="signature-images"><img src="${signatureBase64}" /><img src="${stampBase64}" /></div>` : '<div style="height: 80px;"></div>'}</div>`;
      }
      finalHtml = `<html><head><style>${styles}</style></head><body><table class="document-wrapper"><thead><tr><td><div id="page-header"><div id="page-header-content"><div class="header-flex"><div>${logoBase64 ? `<img src="${logoBase64}" class="header-logo" />` : ''}</div><div class="header-company-details"><p>${headerText}</p></div></div></div></div></td></tr></thead><tbody><tr><td id="main-content">${headerDetailsHtml}${itemsTableHtml}${totalsHtml}${signatureHtml}</td></tr></tbody><tfoot><tr><td><div id="page-footer"><div id="page-footer-content"><p>${footerText}</p></div></div></td></tr></tfoot></table></body></html>`;
      break;
    }
  }

  return finalHtml;
};
