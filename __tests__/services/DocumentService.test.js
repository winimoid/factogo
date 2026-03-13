import { createDocumentForStore, getUniqueCustomers } from '../../src/services/DocumentService';
import { getDatabase } from '../../src/services/Database';

// Mock the database
const mockExecuteSql = jest.fn();
const mockTransaction = jest.fn((fn) => {
  const tx = {
    executeSql: (query, args, successCallback) => {
      mockExecuteSql(query, args);
      if (successCallback) {
        successCallback(tx, { rows: { item: () => ({}), length: 0, raw: () => [] } });
      }
    },
  };
  fn(tx);
});

jest.mock('../../src/services/Database', () => ({
  getDatabase: jest.fn(() => Promise.resolve({
    executeSql: mockExecuteSql,
    transaction: mockTransaction,
  })),
}));

describe('DocumentService', () => {
  beforeEach(() => {
    mockExecuteSql.mockClear();
    mockTransaction.mockClear();
  });

  it('should retrieve unique customers from all document types', async () => {
    const storeId = 1;
    // Mock return value for the UNION query
    mockExecuteSql.mockImplementationOnce(() => Promise.resolve([{
      rows: {
        length: 2,
        raw: () => [
          { clientName: 'Alice', clientAddress: '123 Main St', clientEmail: 'alice@example.com', clientPhone: '555-0101' },
          { clientName: 'Bob', clientAddress: '456 Oak Ave', clientEmail: 'bob@example.com', clientPhone: '555-0102' }
        ],
      },
    }]));

    const customers = await getUniqueCustomers(storeId);

    expect(customers).toHaveLength(2);
    expect(customers[0].clientName).toBe('Alice');
    expect(customers[1].clientName).toBe('Bob');
    
    // Verify the query structure (simplified check)
    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT clientName, clientAddress, clientEmail, clientPhone'),
      [storeId, storeId, storeId]
    );
  });
});
