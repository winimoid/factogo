import { runMigrations } from '../../src/services/Migration';
import SQLite from 'react-native-sqlite-storage';

// Mock the react-native-sqlite-storage library
jest.mock('react-native-sqlite-storage', () => {
  const mockDb = {
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
      },
    }])),
  };
  return {
    openDatabase: jest.fn(() => mockDb),
  };
});

describe('Migrations', () => {
  it('should run all migrations without errors', async () => {
    const db = SQLite.openDatabase({ name: 'test.db' });
    await expect(runMigrations(db)).resolves.not.toThrow();
  });
});
