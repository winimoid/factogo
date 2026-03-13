import { calculateTotals } from '../../src/utils/calculations';

describe('Calculation Logic', () => {
  const items = [
    { price: 100, quantity: 2 }, // 200
    { price: 50, quantity: 1 }   // 50
  ];
  // Subtotal = 250

  it('should calculate totals without GST or deposit', () => {
    const result = calculateTotals(items, 0, false, 0, 0);
    expect(result.subtotal).toBe(250);
    expect(result.discountAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(250);
    expect(result.balanceDue).toBe(250);
  });

  it('should calculate totals with percentage discount', () => {
    const result = calculateTotals(items, 10, true, 0, 0); // 10% discount
    expect(result.subtotal).toBe(250);
    expect(result.discountAmount).toBe(25);
    expect(result.grandTotal).toBe(225);
  });

  it('should calculate totals with fixed discount', () => {
    const result = calculateTotals(items, 20, false, 0, 0); // 20 fixed discount
    expect(result.subtotal).toBe(250);
    expect(result.discountAmount).toBe(20);
    expect(result.grandTotal).toBe(230);
  });

  it('should calculate GST on net amount (after discount)', () => {
    // Subtotal: 250, Discount: 50 (20%), Net: 200
    // GST (10%): 20
    // Grand Total: 220
    const result = calculateTotals(items, 20, true, 10, 0); 
    expect(result.subtotal).toBe(250);
    expect(result.discountAmount).toBe(50);
    expect(result.gstAmount).toBe(20);
    expect(result.grandTotal).toBe(220);
  });

  it('should calculate balance due with deposit', () => {
    // Grand Total: 250, Deposit: 50
    const result = calculateTotals(items, 0, false, 0, 50);
    expect(result.grandTotal).toBe(250);
    expect(result.balanceDue).toBe(200);
  });

  it('should handle zero or negative deposit gracefully', () => {
    const result = calculateTotals(items, 0, false, 0, -10);
    expect(result.balanceDue).toBe(260); // Should ignore negative? Or treat as 0? 
    // Validation logic usually handles inputs, but calculation might just do math.
    // Let's assume validation happens before, but math holds up.
    // Ideally balance = total - deposit. 250 - (-10) = 260. 
    // BUT we want to enforce non-negative deposit. 
    // Let's test standard math here, validation elsewhere.
    expect(result.balanceDue).toBe(260); 
  });
});
