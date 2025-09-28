import React from 'react';
import DocumentForm from '../../components/DocumentForm';

const InvoiceForm = (props) => {
  return <DocumentForm {...props} documentType="invoice" />;
};

export default InvoiceForm;
