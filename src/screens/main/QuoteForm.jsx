import React from 'react';
import DocumentForm from '../../components/DocumentForm';

const QuoteForm = (props) => {
  return <DocumentForm {...props} documentType="quote" />;
};

export default QuoteForm;
