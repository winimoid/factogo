import { restoreBackup } from '../../src/services/BackupService';
import * as FileSystem from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(),
  unlink: jest.fn(() => Promise.resolve()),
  exists: jest.fn(),
  copyFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-zip-archive', () => ({
  unzip: jest.fn(() => Promise.resolve('/mock/unzip/path')),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/Database', () => ({
  getDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(),
  })),
}));

describe('BackupService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if data.json is missing in backup', async () => {
    FileSystem.exists.mockResolvedValueOnce(true); // temp dir exists (ensureDir check, maybe?)
    // Actually ensureDir uses exists. 
    // restoreBackup: ensureDir(tempDir) -> exists(tempDir) -> false -> mkdir.
    // Then unzip.
    // Then exists(jsonPath).
    
    FileSystem.exists.mockImplementation((path) => {
        if (path.includes('data.json')) return Promise.resolve(false);
        return Promise.resolve(false); // default for ensureDir to trigger mkdir
    });

    await expect(restoreBackup('/mock/backup.fctg')).rejects.toThrow('Invalid backup file: data.json not found');
  });

  it('should throw error if data.json is invalid JSON', async () => {
    FileSystem.exists.mockResolvedValue(true);
    FileSystem.readFile.mockResolvedValueOnce('invalid-json');

    await expect(restoreBackup('/mock/backup.fctg')).rejects.toThrow(SyntaxError);
  });
});
