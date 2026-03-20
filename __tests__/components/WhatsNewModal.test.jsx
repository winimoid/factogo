import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WhatsNewModal from '../../src/components/WhatsNewModal';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        whats_new_title: `What's new in Version ${options?.version || '3.0'}? 🚀`,
        whats_new_deposit: 'Manage deposits on your invoices and quotes.',
        whats_new_gst: 'Apply configurable GST tax to your documents.',
        whats_new_suggestions: 'Quickly select repeat customers with auto-fill suggestions.',
        lets_go: "Let's go!",
        deposit: 'Deposit',
        gst_label: 'GST',
        customer_suggestions: 'Customer Suggestions',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock react-native-paper theming
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
        surface: '#ffffff',
        onSurface: '#000000',
      },
    }),
  };
});

describe('WhatsNewModal', () => {
  const mockOnDismiss = jest.fn();
  const testVersion = '3.0.0';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null when visible is false', () => {
    const { toJSON } = render(
      <WhatsNewModal
        visible={false}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    expect(toJSON()).toBeNull();
  });

  it('renders modal with correct title when visible', () => {
    const { getByText } = render(
      <WhatsNewModal
        visible={true}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    expect(getByText("What's new in Version 3.0.0? 🚀")).toBeTruthy();
  });

  it('displays all three feature items', () => {
    const { getByText } = render(
      <WhatsNewModal
        visible={true}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    expect(getByText('Manage deposits on your invoices and quotes.')).toBeTruthy();
    expect(getByText('Apply configurable GST tax to your documents.')).toBeTruthy();
    expect(getByText('Quickly select repeat customers with auto-fill suggestions.')).toBeTruthy();
  });

  it('calls onDismiss when "Let\'s go!" button is pressed', () => {
    const { getByText } = render(
      <WhatsNewModal
        visible={true}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    fireEvent.press(getByText("Let's go!"));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render when dismissed', () => {
    const { toJSON, rerender } = render(
      <WhatsNewModal
        visible={true}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    expect(toJSON()).not.toBeNull();

    rerender(
      <WhatsNewModal
        visible={false}
        onDismiss={mockOnDismiss}
        version={testVersion}
      />
    );

    expect(toJSON()).toBeNull();
  });
});
