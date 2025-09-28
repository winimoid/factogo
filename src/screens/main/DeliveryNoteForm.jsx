import React from 'react';
import DocumentForm from '../../components/DocumentForm';

const DeliveryNoteForm = (props) => {
  return <DocumentForm {...props} documentType="delivery_note" />;
};

export default DeliveryNoteForm;
