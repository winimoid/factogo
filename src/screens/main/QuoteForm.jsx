
import React from 'react';
import DocumentForm from '../../components/DocumentForm';
import { addQuote, updateQuote } from '../../services/Database';

const QuoteForm = (props) => {
  const dbActions = {
    add: addQuote,
    update: updateQuote,
  };

  return <DocumentForm {...props} documentType="quote" dbActions={dbActions} />;
};

export default QuoteForm;
