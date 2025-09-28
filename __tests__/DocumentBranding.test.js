import { render, fireEvent } from '@testing-library/react-native';
import { StoreProvider } from '../src/contexts/StoreContext';
import NewDocumentScreen from '../src/screens/main/NewDocumentScreen';
import * as pdfUtils from '../src/utils/pdfUtils';

// Mock the pdfUtils
jest.mock('../src/utils/pdfUtils');

describe('Document Branding', () => {
  it('should use the active store branding when generating a document', async () => {
    // Mock stores
    const store1 = { id: 1, name: 'Store 1', logoUrl: 'logo1.png', documentTemplateId: 1 };
    const store2 = { id: 2, name: 'Store 2', logoUrl: 'logo2.png', documentTemplateId: 2 };

    // Render the NewDocumentScreen with a mock store context
    const { getByText, rerender } = render(
      <StoreProvider>
        <NewDocumentScreen />
      </StoreProvider>
    );

    // Helper function to simulate store switching
    const switchStore = (store) => {
      // In a real app, this would be done through the UI.
      // Here, we'll just re-render with a different active store.
      rerender(
        <StoreProvider activeStore={store}>
          <NewDocumentScreen />
        </StoreProvider>
      );
    };

    // 1. Set store 1 as active and generate a document
    switchStore(store1);
    fireEvent.press(getByText('Generate PDF'));
    expect(pdfUtils.generatePdf).toHaveBeenCalledWith(expect.objectContaining({
      logoUrl: 'logo1.png',
      templateId: 1,
    }));

    // 2. Set store 2 as active and generate a document
    switchStore(store2);
    fireEvent.press(getByText('Generate PDF'));
    expect(pdfUtils.generatePdf).toHaveBeenCalledWith(expect.objectContaining({
      logoUrl: 'logo2.png',
      templateId: 2,
    }));
  });
});