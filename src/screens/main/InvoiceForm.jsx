
import React from 'react';
import DocumentForm from '../../components/DocumentForm';
import { addInvoice, updateInvoice } from '../../services/Database';

const InvoiceForm = (props) => {
  const dbActions = {
    add: addInvoice,
    update: updateInvoice,
  };

  return <DocumentForm {...props} documentType="invoice" dbActions={dbActions} />;
};

export default InvoiceForm;
