import React from 'react';
import { render } from '@testing-library/react-native';
import DocumentForm from '../../src/components/DocumentForm';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: {} }),
}));

jest.mock('../../src/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: jest.fn(key => key) }),
}));

describe('DocumentForm', () => {
  it('should render discount fields', () => {
    const { getByText } = render(<DocumentForm />);

    // Check if the discount related texts are rendered
    expect(getByText('Discount Type')).toBeTruthy();
    expect(getByText('Discount Value')).toBeTruthy();
  });
});
