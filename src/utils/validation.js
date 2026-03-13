export const validateDocumentInputs = (inputs) => {
  const errors = {};

  if (inputs.deposit !== undefined && inputs.deposit < 0) {
    errors.deposit = 'Deposit cannot be negative';
  }

  if (inputs.clientEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.clientEmail)) {
      errors.clientEmail = 'Invalid email format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStoreSettings = (settings) => {
  const errors = {};

  if (settings.default_gst_rate !== undefined) {
    if (settings.default_gst_rate < 0 || settings.default_gst_rate > 100) {
      errors.default_gst_rate = 'GST rate must be between 0 and 100';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
