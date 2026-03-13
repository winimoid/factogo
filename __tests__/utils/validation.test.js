import { validateDocumentInputs, validateStoreSettings } from '../../src/utils/validation';

describe('Validation Logic', () => {
  describe('Document Inputs', () => {
    it('should validate non-negative deposit', () => {
      expect(validateDocumentInputs({ deposit: 100 }).isValid).toBe(true);
      expect(validateDocumentInputs({ deposit: -10 }).isValid).toBe(false);
      expect(validateDocumentInputs({ deposit: 0 }).isValid).toBe(true);
    });

    it('should validate client email format', () => {
      expect(validateDocumentInputs({ clientEmail: 'test@example.com' }).isValid).toBe(true);
      expect(validateDocumentInputs({ clientEmail: 'invalid-email' }).isValid).toBe(false);
      expect(validateDocumentInputs({ clientEmail: '' }).isValid).toBe(true); // Optional
    });
  });

  describe('Store Settings', () => {
    it('should validate default GST rate', () => {
      expect(validateStoreSettings({ default_gst_rate: 5 }).isValid).toBe(true);
      expect(validateStoreSettings({ default_gst_rate: -1 }).isValid).toBe(false);
      expect(validateStoreSettings({ default_gst_rate: 101 }).isValid).toBe(false); // Assuming <= 100
    });
  });
});
