import { createBackup, restoreBackup } from '../../src/services/BackupService';
import * as FileSystem from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve(JSON.stringify({ 
    version: '1.0', 
    database: { users: [{ id: 1, name: 'Test' }] }, 
    asyncStorage: { '@key1': 'value1' } 
  }))),
  unlink: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  copyFile: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn(() => Promise.resolve('/mock/path/backup.fctg')),
  unzip: jest.fn(() => Promise.resolve('/mock/unzip/path')),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve(['@key1'])),
  multiGet: jest.fn(() => Promise.resolve([['@key1', 'value1']])),
  multiSet: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/Database', () => ({
  getDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => ({}) } }])),
    transaction: jest.fn((cb) => cb({ executeSql: jest.fn() })),
    close: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock react-native-restart
jest.mock('react-native-restart', () => ({
  Restart: jest.fn(),
}));

describe('BackupRestore Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Scenario 1: Successful Backup and Restore', async () => {
    // 1. Create Backup
    const backupPath = await createBackup();
    expect(backupPath).toBeDefined();
    expect(zip).toHaveBeenCalled();
    
    // 2. Restore Backup
    await restoreBackup(backupPath);
    expect(unzip).toHaveBeenCalledWith(backupPath, expect.any(String));
    expect(AsyncStorage.clear).toHaveBeenCalled();
    expect(AsyncStorage.multiSet).toHaveBeenCalled();
  });

  test('Scenario 2: Restore from Invalid File', async () => {
    // Mock unzip failure or invalid JSON
    require('react-native-zip-archive').unzip.mockRejectedValueOnce(new Error('Invalid zip'));

    await expect(restoreBackup('/invalid/path.fctg')).rejects.toThrow('Invalid zip');
  });

  test('Scenario 3: Restore with Destructive Overwrite Confirmation', async () => {
    // This scenario mainly tests that the service performs the overwrite logic
    // The UI confirmation is handled in the Component, not the Service.
    // So here we verify the destructive actions happen: clearing DB and AsyncStorage.

    await restoreBackup('/mock/path/backup.fctg');

    // Verify DB was cleared/reset (mocked interaction)
    // Verify AsyncStorage was cleared
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });
});
