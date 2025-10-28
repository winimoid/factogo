import { createDocumentForStore, updateDocument, getDocumentsForStore, getNextDocumentNumber, deleteDocument } from '../../src/services/DocumentService';
import { getDatabase } from '../../src/services/Database';

// Mock the database
jest.mock('../../src/services/Database', () => ({
  getDatabase: jest.fn(() => Promise.resolve({
    transaction: jest.fn(fn => {
      const mockTx = {
        executeSql: jest.fn((query, args, successCallback, errorCallback) => {
          if (successCallback) {
            successCallback(mockTx, { rows: { item: () => ({}) } });
          }
        }),
      };
      fn(mockTx);
    }),
    executeSql: jest.fn(() => Promise.resolve([{
      rows: {
        length: 0,
        item: () => ({}),
        raw: () => [],
      },
    }])),
  })),
}));

describe('DocumentService', () => {
  it('should apply percentage discount when creating a document', async () => {
    const db = await getDatabase();
    const docData = {
      document_number: '001/10/2025',
      clientName: 'Test Client',
      date: '2025-10-20',
      items: JSON.stringify([{ description: 'Item 1', quantity: 2, price: 50 }]),
      total: 90, // 100 - 10%
      discountType: 'percentage',
      discountValue: 10,
    };
    await createDocumentForStore(1, 'invoice', docData);
    expect(db.executeSql).toHaveBeenCalledWith(
      'INSERT INTO invoices (document_number, clientName, date, items, total, storeId, discountType, discountValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      ['001/10/2025', 'Test Client', '2025-10-20', '[{"description":"Item 1","quantity":2,"price":50}]', 90, 1, 'percentage', 10]
    );
  });

  it('should apply fixed discount when creating a document', async () => {
    const db = await getDatabase();
    const docData = {
      document_number: '002/10/2025',
      clientName: 'Test Client 2',
      date: '2025-10-21',
      items: JSON.stringify([{ description: 'Item 2', quantity: 1, price: 100 }]),
      total: 80, // 100 - 20
      discountType: 'fixed',
      discountValue: 20,
    };
    await createDocumentForStore(1, 'invoice', docData);
    expect(db.executeSql).toHaveBeenCalledWith(
      'INSERT INTO invoices (document_number, clientName, date, items, total, storeId, discountType, discountValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      ['002/10/2025', 'Test Client 2', '2025-10-21', '[{"description":"Item 2","quantity":1,"price":100}]', 80, 1, 'fixed', 20]
    );
  });

  it('should update quote status to Converted when a document is created from it', async () => {
    const db = await getDatabase();
    const docData = {
      document_number: '003/10/2025',
      clientName: 'Test Client 3',
      date: '2025-10-22',
      items: JSON.stringify([{ description: 'Item 3', quantity: 1, price: 200 }]),
      total: 200,
      discountType: 'percentage',
      discountValue: 0,
    };
    const convertedFromId = 123;

    await createDocumentForStore(1, 'invoice', docData, convertedFromId);

    // Check that the transaction was used
    expect(db.transaction).toHaveBeenCalled();

    // Manually inspect the calls within the transaction mock
    const mockTransaction = db.transaction.mock.calls[0][0];
    const firstCall = mockTransaction.executeSql.mock.calls[0];
    const secondCall = mockTransaction.executeSql.mock.calls[1];

    // Check the INSERT call
    expect(firstCall[0]).toBe('INSERT INTO invoices (document_number, clientName, date, items, total, storeId, discountType, discountValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?);');
    expect(firstCall[1]).toEqual(['003/10/2025', 'Test Client 3', '2025-10-22', '[{"description":"Item 3","quantity":1,"price":200}]', 200, 1, 'percentage', 0]);

    // Check the UPDATE call
    expect(secondCall[0]).toBe('UPDATE quotes SET status = \'Converted\' WHERE id = ?;');
    expect(secondCall[1]).toEqual([convertedFromId]);
  });
});
