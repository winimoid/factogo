export const calculateTotals = (items, discountValue = 0, isPercentage = false, gstRate = 0, deposit = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (isPercentage) {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  const netTotal = Math.max(0, subtotal - discountAmount);
  
  const gstAmount = (netTotal * gstRate) / 100;
  
  const grandTotal = netTotal + gstAmount;
  
  const balanceDue = Math.max(0, grandTotal - deposit);

  return {
    subtotal,
    discountAmount,
    netTotal,
    gstAmount,
    grandTotal,
    balanceDue
  };
};
