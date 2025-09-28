import { getDatabase } from './Database';

export const createClientForStore = async (client, storeId) => {
  const db = await getDatabase();
  // ... (rest of the function)
};

export const getClientsForStore = async (storeId) => {
  const db = await getDatabase();
  // ... (rest of the function)
};
