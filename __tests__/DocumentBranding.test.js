import { generatePdfHtml } from '../src/utils/pdfUtils';
import fs from 'react-native-fs';

// Mock dependencies
jest.mock('react-native-fs', () => ({
  readFileAssets: jest.fn().mockResolvedValue('mock-base64-font'),
  readFile: jest.fn().mockResolvedValue('mock-base64-image'),
  MainBundlePath: 'mock-path',
}));

jest.mock('../src/utils/numberToWords', () => ({
  toWords: jest.fn().mockReturnValue('One hundred'),
}));

// Mock React Native Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn(),
}));

describe('Document Branding', () => {
  const mockItem = {
    document_number: 'INV-001',
    clientName: 'Test Client',
    date: '2025-10-27',
    items: JSON.stringify([{ description: 'Item 1', quantity: 1, price: 100 }]),
    total: 100,
    deposit: 0,
    has_gst: 0,
  };

  const mockT = (key) => key;
  const mockLocale = 'en-US';

  it('should include store logo and custom texts in generated HTML', async () => {
    const activeStore = {
      name: 'Test Store',
      logoUrl: 'file://logo.png',
      customTexts: JSON.stringify({ header: 'Custom Header', footer: 'Custom Footer' }),
      documentTemplateId: 1,
    };

    const html = await generatePdfHtml(mockItem, 'invoice', activeStore, mockT, mockLocale, true, '#000000');

    expect(html).toContain('mock-base64-image'); // Logo
    expect(html).toContain('Custom Header');
    expect(html).toContain('Custom Footer');
  });

  it('should handle missing logo or custom texts gracefully', async () => {
    const activeStore = {
      name: 'Test Store',
      logoUrl: null,
      customTexts: null,
      documentTemplateId: 1,
    };

    const html = await generatePdfHtml(mockItem, 'invoice', activeStore, mockT, mockLocale, true, '#000000');

    expect(html).not.toContain('<img src="" class="header-logo" />'); // Check specifically for the image tag
    expect(html).toContain('Test Store'); // Should probably use name if header missing, but logic uses customTexts.header
  });
  
  it('should render deposit and balance due when applicable', async () => {
    const activeStore = { documentTemplateId: 1 };
    const itemWithDeposit = {
      ...mockItem,
      deposit: 20,
      balance_due: 80,
    };
    
    const html = await generatePdfHtml(itemWithDeposit, 'invoice', activeStore, mockT, mockLocale, true, '#000000');
    
    expect(html).toContain('deposit_paid');
    expect(html).toContain('20');
    expect(html).toContain('balance_due');
    expect(html).toContain('80');
  });
});
