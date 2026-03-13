# Quickstart: Deposit, Customer Suggestions, and GST Tax

## Feature Verification

### 1. Customer Suggestions
- Open a new **Invoice** or **Quote**.
- Start typing a name in the **Client Name** field.
- **Verification**: A suggestion list should appear with previously used customer names.
- Select a customer from the list.
- **Verification**: All related fields (Address, Email, Phone) should be automatically filled.

### 2. Deposit Support
- On an **Invoice** or **Quote**, toggle the **Deposit** switch.
- Enter a deposit amount (e.g., 5000).
- Generate a PDF preview.
- **Verification**: The PDF should display a breakdown:
    - `Total Amount: [Grand Total]`
    - `Deposit Paid: 5000`
    - `Balance Due: [Grand Total - 5000]`

### 3. GST Tax (Goods and Services Tax)
- On an **Invoice** or **Quote**, toggle the **GST** switch.
- **Verification**: A 1% GST (by default) should be calculated after discounts and added to the total.
- Generate a PDF preview.
- **Verification**: The PDF should display a separate line item for GST (e.g., `GST (1%): 150 FCFA`).
- Go to **Store Settings**.
- Change the **Default GST Rate** to 2%.
- Create a new invoice.
- **Verification**: The GST rate on the new document should default to 2%.

## Automated Tests
- Run `npm test` to verify migration integrity.
- Run `npm test src/services/DocumentService.test.js` to verify customer suggestion logic.
- Run `npm test src/components/DocumentForm.test.js` to verify calculation logic for GST and deposits.
