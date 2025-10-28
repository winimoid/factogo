# Quickstart: Discount and Quote Conversion

This quickstart guide will walk you through testing the new discount and quote conversion features.

## Testing Discount Feature

1.  **Create a new invoice.**
2.  **Add a few items** to the invoice.
3.  **Apply a 10% discount.**
4.  **Verify that the total amount is correctly reduced by 10%.**
5.  **Change the discount to a fixed amount of $50.**
6.  **Verify that the total amount is correctly reduced by $50.**
7.  **Save the invoice.**
8.  **Re-open the invoice and verify that the discount is still applied correctly.**

## Testing Quote Conversion Feature

1.  **Create a new quote.**
2.  **Add a few items** to the quote.
3.  **Save the quote.**
4.  **From the quote view screen, select the "Convert to Invoice" option.**
5.  **Verify that you are redirected to a new invoice form.**
6.  **Verify that the new invoice is pre-filled with the same data as the quote.**
7.  **Save the new invoice.**
8.  **Go back to the original quote and verify that its status is now "Converted".**

## Verifying Migration

1.  **Before running the application with the new code, ensure you have an existing database with some invoices and quotes.**
2.  **Run the application.**
3.  **Verify that the application starts without any errors.**
4.  **Check the database to ensure that the `discountType` and `discountValue` columns have been added to the `invoices` and `quotes` tables.**
5.  **Verify that existing invoices and quotes have `NULL` or a default value for the new columns.**