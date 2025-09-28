import { getDatabase } from './Database';

// Store functions
export const createStore = async (storeData) => {
  const db = await getDatabase();
  const { ownerUserId, name, logoUrl, signatureUrl, stampUrl, documentTemplateId, customTexts } = storeData;
  const query = 'INSERT INTO Stores (ownerUserId, name, logoUrl, signatureUrl, stampUrl, documentTemplateId, customTexts, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
  try {
    const result = await db.executeSql(query, [ownerUserId, name, logoUrl, signatureUrl, stampUrl, documentTemplateId, customTexts, 'active']);
    return result[0].insertId;
  } catch (error) {
    console.error('Error creating store', error);
    throw error;
  }
};

export const getStore = async (storeId) => {
  const db = await getDatabase();
  const query = 'SELECT * FROM Stores WHERE storeId = ?;';
  try {
    const [results] = await db.executeSql(query, [storeId]);
    return results.rows.item(0);
  } catch (error) {
    console.error('Error getting store', error);
    throw error;
  }
};

export const getStoresForUser = async (userId) => {
  const db = await getDatabase();
  const query = 'SELECT * FROM Stores WHERE ownerUserId = ?;';
  try {
    const [results] = await db.executeSql(query, [userId]);
    return results.rows.raw();
  } catch (error) {
    console.error('Error getting stores for user', error);
    throw error;
  }
};

export const updateStore = async (storeId, storeData) => {
  const db = await getDatabase();
  const { name, logoUrl, signatureUrl, stampUrl, documentTemplateId, customTexts } = storeData;
  const query = 'UPDATE Stores SET name = ?, logoUrl = ?, signatureUrl = ?, stampUrl = ?, documentTemplateId = ?, customTexts = ? WHERE storeId = ?;';
  try {
    await db.executeSql(query, [name, logoUrl, signatureUrl, stampUrl, documentTemplateId, customTexts, storeId]);
  } catch (error) {
    console.error('Error updating store', error);
    throw error;
  }
};

export const archiveStore = async (storeId) => {
  const db = await getDatabase();
  const query = 'UPDATE Stores SET status = ? WHERE storeId = ?;';
  try {
    await db.executeSql(query, ['archived', storeId]);
  } catch (error) {
    console.error('Error archiving store', error);
    throw error;
  }
};
