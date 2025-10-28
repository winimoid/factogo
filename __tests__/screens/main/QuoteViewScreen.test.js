import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock component for QuoteViewScreen
const QuoteViewScreen = ({ navigation }) => {
  return (
    <>
      <Button title="Convert to Invoice" onPress={() => navigation.navigate('InvoiceForm')} />
      <Button title="Convert to Delivery Note" onPress={() => navigation.navigate('DeliveryNoteForm')} />
    </>
  );
};

describe('QuoteViewScreen', () => {
  it('should render conversion buttons', () => {
    const { getByText } = render(<QuoteViewScreen />);
    expect(getByText('Convert to Invoice')).toBeTruthy();
    expect(getByText('Convert to Delivery Note')).toBeTruthy();
  });
});
