import { createBackup, restoreBackup } from '../../src/services/BackupService';

// Mock dependencies to prevent native module errors
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve(JSON.stringify({ database: {}, asyncStorage: {} }))),
  unlink: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  copyFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn(() => Promise.resolve('/mock/path/backup.fctg')),
  unzip: jest.fn(() => Promise.resolve('/mock/unzip/path')),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/Database', () => ({
  getDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => ({}) } }])),
    transaction: jest.fn((cb) => cb({ executeSql: jest.fn() })),
  })),
  exportDatabaseToJson: jest.fn(() => Promise.resolve({})),
  importDatabaseFromJson: jest.fn(() => Promise.resolve()),
}));

describe('BackupService Contract', () => {
  describe('createBackup', () => {
    it('should be a function', () => {
      expect(typeof createBackup).toBe('function');
    });

    it('should return a promise that resolves to the backup file path', async () => {
      const result = await createBackup();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\.fctg$/);
    });
  });

  describe('restoreBackup', () => {
    it('should be a function', () => {
      expect(typeof restoreBackup).toBe('function');
    });

    it('should accept a file path and return a promise', async () => {
      const mockPath = '/mock/path/backup.fctg';
      await expect(restoreBackup(mockPath)).resolves.not.toThrow();
    });
  });
});
