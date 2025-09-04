import React from 'react';
import DocumentForm from '../../components/DocumentForm';
import { addDeliveryNote, updateDeliveryNote } from '../../services/Database';

const DeliveryNoteForm = (props) => {
  const dbActions = {
    add: addDeliveryNote,
    update: updateDeliveryNote,
  };

  return <DocumentForm {...props} documentType="delivery_note" dbActions={dbActions} />;
};

export default DeliveryNoteForm;
