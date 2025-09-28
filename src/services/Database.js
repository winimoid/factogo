import SQLite from 'react-native-sqlite-storage';
import { runMigrations } from './Migration';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'FactoGo.db';

let db;
let initPromise = null;

export const initDatabase = async () => {
  // If the promise exists, it means initialization is in progress or done.
  if (initPromise) {
    return initPromise;
  }

  // Create the promise and store it, so subsequent calls get the same promise.
  initPromise = (async () => {
    try {
      console.log("Initializing database...");
      const connection = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
      console.log("Database opened, running migrations...");
      await runMigrations(connection);
      console.log("Migrations complete.");
      db = connection;
      return db;
    } catch (error) {
      console.error("Database initialization failed", error);
      initPromise = null; // Allow retrying initialization if it fails
      throw error;
    }
  })();
  
  return initPromise;
};

export const getDatabase = async () => {
  if (db) {
    return db;
  }
  // If db is not ready, wait for the initialization to complete.
  // initDatabase() will return the existing promise if it's already been called.
  return await initDatabase();
};


// User functions
export const addUser = async (username, password) => {
  const db = await getDatabase();
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  try {
    await db.executeSql(query, [username, password]);
  } catch (error) {
    console.error('Error adding user', error);
  }
};

export const getUser = async (username) => {
  const db = await getDatabase();
  const query = 'SELECT * FROM users WHERE username = ?';
  try {
    const [results] = await db.executeSql(query, [username]);
    return results.rows.item(0);
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
};

// ... (rest of the database functions)