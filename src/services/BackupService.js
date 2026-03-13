import { getDatabase } from './Database';
import * as FileSystem from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKUP_DIR = FileSystem.CachesDirectoryPath + '/backups';
const APP_IMAGES_DIR = FileSystem.DocumentDirectoryPath + '/images';

// List of tables to backup
const TABLES = [
  'users',
  'settings',
  'invoices',
  'quotes',
  'delivery_notes',
  'stores',
  'document_templates',
  'db_versions'
];

// Helper to ensure directory exists
const ensureDir = async (path) => {
  const exists = await FileSystem.exists(path);
  if (!exists) {
    await FileSystem.mkdir(path);
  }
};

// Helper to extract table data
const exportTable = async (db, tableName) => {
  const query = `SELECT * FROM ${tableName}`;
  const [results] = await db.executeSql(query);
  const rows = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i));
  }
  return rows;
};

// Helper to import table data
const importTable = async (db, tableName, rows) => {
  if (!rows || rows.length === 0) return;

  // clear table first
  await db.executeSql(`DELETE FROM ${tableName}`);

  // Insert rows
  // We construct a large INSERT statement or multiple statements
  // For safety against SQL injection (though this is a restore from JSON), use params.
  // But constructing params for dynamic columns is tricky.
  // We assume the JSON keys match column names.

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(',');
  const query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;

  for (const row of rows) {
    const values = columns.map(col => row[col]);
    await db.executeSql(query, values);
  }
};

// Recursive function to find and process images
const processImagesForBackup = async (obj, tempImagesDir) => {
  if (typeof obj !== 'object' || obj === null) return;

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string' && value.startsWith('file://')) {
      // It's a file path. Copy it.
      const filename = value.split('/').pop();
      // Handle potential duplicate filenames by appending hash or timestamp?
      // For simplicity, we assume unique filenames or that overwriting with same name is fine (same image).
      
      const destPath = `${tempImagesDir}/${filename}`;
      const srcPath = value.replace('file://', ''); // remove protocol for FS operations if needed?
      // react-native-fs copyFile usually takes absolute paths. 
      // value usually is "file:///data/..." or "/data/..." depending on platform.
      // On Android "file://" might need stripping for some APIs, but copyFile usually handles it or needs plain path.
      // Safest is to try copying.
      
      try {
        await FileSystem.copyFile(value, destPath);
        // Update the value in the object to be relative
        obj[key] = `images/${filename}`;
      } catch (err) {
        console.warn(`Failed to copy image: ${value}`, err);
        // Keep original path if copy fails? Or null?
      }
    } else if (typeof value === 'object') {
      await processImagesForBackup(value, tempImagesDir);
    }
  }
};

// Recursive function to restore images
const processImagesForRestore = async (obj, tempImagesDir) => {
  if (typeof obj !== 'object' || obj === null) return;

  await ensureDir(APP_IMAGES_DIR);

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string' && value.startsWith('images/')) {
      // It's a relative path. Restore it.
      const filename = value.split('/').pop();
      const srcPath = `${tempImagesDir}/${filename}`;
      const destPath = `${APP_IMAGES_DIR}/${filename}`;
      
      try {
        if (await FileSystem.exists(srcPath)) {
            // Check if destination exists, delete if so (overwrite)
            if (await FileSystem.exists(destPath)) {
                await FileSystem.unlink(destPath);
            }
            await FileSystem.copyFile(srcPath, destPath);
            // Update the value in the object to be absolute
            obj[key] = `file://${destPath}`;
        } else {
             console.warn(`Image file not found in backup: ${srcPath}`);
        }
      } catch (err) {
        console.warn(`Failed to restore image: ${srcPath}`, err);
      }
    } else if (typeof value === 'object') {
      await processImagesForRestore(value, tempImagesDir);
    }
  }
};


export const createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDirName = `backup_${timestamp}`;
    const tempDir = `${FileSystem.CachesDirectoryPath}/${tempDirName}`;
    const tempImagesDir = `${tempDir}/images`;
    const jsonPath = `${tempDir}/data.json`;
    const destZipPath = `${FileSystem.CachesDirectoryPath}/Backup_${timestamp}.fctg`;

    await ensureDir(tempDir);
    await ensureDir(tempImagesDir);

    const db = await getDatabase();
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      database: {},
      asyncStorage: {}
    };

    // 1. Export Database
    for (const table of TABLES) {
      backupData.database[table] = await exportTable(db, table);
    }

    // 2. Export AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    stores.forEach(([key, value]) => {
      backupData.asyncStorage[key] = value;
    });

    // 3. Process Images
    await processImagesForBackup(backupData, tempImagesDir);

    // 4. Write JSON
    await FileSystem.writeFile(jsonPath, JSON.stringify(backupData, null, 2), 'utf8');

    // 5. Zip
    const zipPath = await zip(tempDir, destZipPath);

    // 6. Cleanup Temp
    await FileSystem.unlink(tempDir);

    return zipPath;
  } catch (error) {
    console.error('Create Backup Failed:', error);
    throw error;
  }
};

export const restoreBackup = async (filePath) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDirName = `restore_${timestamp}`;
    const tempDir = `${FileSystem.CachesDirectoryPath}/${tempDirName}`;

    await ensureDir(tempDir);

    let zipFilePath = filePath;

    // Handle content:// URIs (Android)
    if (filePath.startsWith('content://')) {
        const tempZipPath = `${tempDir}/temp_restore.zip`;
        await FileSystem.copyFile(filePath, tempZipPath);
        zipFilePath = tempZipPath;
    }

    // 1. Unzip
    await unzip(zipFilePath, tempDir);

    // 2. Read JSON
    const jsonPath = `${tempDir}/data.json`;
    if (!(await FileSystem.exists(jsonPath))) {
      throw new Error('Invalid backup file: data.json not found');
    }
    const jsonContent = await FileSystem.readFile(jsonPath, 'utf8');
    const backupData = JSON.parse(jsonContent);

    // 3. Process Images (Restore to App Dir)
    const tempImagesDir = `${tempDir}/images`;
    await processImagesForRestore(backupData, tempImagesDir);

    // 4. Restore Database
    const db = await getDatabase();
    // We should probably use a transaction
    // But since we are deleting everything, maybe we need to be careful about open connections?
    // React-native-sqlite-storage handles transactions.
    
    // Disable Foreign Keys to allow clearing tables in any order
    await db.executeSql('PRAGMA foreign_keys = OFF');

    for (const table of TABLES) {
      if (backupData.database[table]) {
        await importTable(db, table, backupData.database[table]);
      }
    }
    
    await db.executeSql('PRAGMA foreign_keys = ON');

    // 5. Restore AsyncStorage
    await AsyncStorage.clear();
    const kvPairs = Object.entries(backupData.asyncStorage);
    if (kvPairs.length > 0) {
        await AsyncStorage.multiSet(kvPairs);
    }

    // 6. Cleanup Temp
    await FileSystem.unlink(tempDir);

    return true;
  } catch (error) {
    console.error('Restore Backup Failed:', error);
    throw error;
  }
};
