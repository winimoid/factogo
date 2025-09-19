import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'FactoGo.db';

let db;

export const openDatabase = async () => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabase({ name: DATABASE_NAME, location: 'default' });
  await createTables(db);
  return db;
};

export const createTables = async (db) => {
  const usersQuery = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);`;
  const settingsQuery = `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, companyName TEXT, logo TEXT, managerName TEXT, signature TEXT, stamp TEXT, description TEXT, informations TEXT);`;
  const invoicesQuery = `CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`;
  const quotesQuery = `CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`;
  const deliveryNotesQuery = `CREATE TABLE IF NOT EXISTS delivery_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, order_reference TEXT, payment_method TEXT);`;

  try {
    await db.executeSql(usersQuery);
    await db.executeSql(settingsQuery);
    await db.executeSql(invoicesQuery);
    await db.executeSql(quotesQuery);
    await db.executeSql(deliveryNotesQuery);
  } catch (error) {
    console.error('Error creating tables', error);
  }
};

// Sequence Generator
export const getNextDocumentNumber = async (documentType) => {
  const db = await openDatabase();
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const periodSuffix = `/${month}/${year}`;

  // Map documentType to the correct table name
  const tableNames = {
    invoice: 'invoices',
    quote: 'quotes',
    delivery_note: 'delivery_notes',
  };
  const tableName = tableNames[documentType];
  if (!tableName) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Query to get the document with the highest number for the current period
      const query = `
        SELECT document_number FROM ${tableName}
        WHERE document_number LIKE ?
        ORDER BY SUBSTR(document_number, 1, 3) DESC
        LIMIT 1;
      `;
      
      tx.executeSql(query, [`%${periodSuffix}`], (_, { rows }) => {
        let nextSequence = 1;
        if (rows.length > 0) {
          const lastDocumentNumber = rows.item(0).document_number;
          const lastSequence = parseInt(lastDocumentNumber.split('/')[0], 10);
          nextSequence = lastSequence + 1;
        }
        const formattedSequence = nextSequence.toString().padStart(3, '0');
        resolve(`${formattedSequence}${periodSuffix}`);
      },
      (tx, error) => {
        console.error(`Error getting next document number for ${documentType}`, error);
        reject(error);
      });
    });
  });
};


// User functions
export const addUser = async (username, password) => {
  const db = await openDatabase();
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  try {
    await db.executeSql(query, [username, password]);
  } catch (error) {
    console.error('Error adding user', error);
  }
};

export const getUser = async (username) => {
  const db = await openDatabase();
  const query = 'SELECT * FROM users WHERE username = ?';
  try {
    const [results] = await db.executeSql(query, [username]);
    return results.rows.item(0);
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
};

// Settings functions
export const saveSettings = async (settings) => {
  const db = await openDatabase();
  const query = `INSERT OR REPLACE INTO settings (id, companyName, logo, managerName, signature, stamp, description, informations) VALUES (1, ?, ?, ?, ?, ?, ?, ?);`;
  const { companyName, logo, managerName, signature, stamp, description, informations } = settings;
  try {
    await db.executeSql(query, [companyName, logo, managerName, signature, stamp, description, informations]);
  } catch (error) {
    console.error('Error saving settings', error);
  }
};

export const getSettings = async () => {
  const db = await openDatabase();
  const query = 'SELECT * FROM settings WHERE id = 1';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.item(0);
  } catch (error) {
    console.error('Error getting settings', error);
    return null;
  }
};

// Invoice functions
export const addInvoice = async (invoice) => {
  const db = await openDatabase();
  const query = 'INSERT INTO invoices (document_number, clientName, date, items, total) VALUES (?, ?, ?, ?, ?)';
  const { document_number, clientName, date, items, total } = invoice;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total]);
  } catch (error) {
    console.error('Error adding invoice', error);
  }
};

export const getInvoices = async () => {
  const db = await openDatabase();
  const query = 'SELECT * FROM invoices ORDER BY id DESC';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.raw();
  } catch (error) {
    console.error('Error getting invoices', error);
    return [];
  }
};

export const updateInvoice = async (id, invoice) => {
  const db = await openDatabase();
  const query = 'UPDATE invoices SET document_number = ?, clientName = ?, date = ?, items = ?, total = ? WHERE id = ?';
  const { document_number, clientName, date, items, total } = invoice;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, id]);
  } catch (error) {
    console.error('Error updating invoice', error);
  }
};

export const deleteInvoice = async (id) => {
  const db = await openDatabase();
  const query = 'DELETE FROM invoices WHERE id = ?';
  try {
    await db.executeSql(query, [id]);
  } catch (error) {
    console.error('Error deleting invoice', error);
  }
};


// Quote functions
export const addQuote = async (quote) => {
  const db = await openDatabase();
  const query = 'INSERT INTO quotes (document_number, clientName, date, items, total) VALUES (?, ?, ?, ?, ?)';
  const { document_number, clientName, date, items, total } = quote;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total]);
  } catch (error) {
    console.error('Error adding quote', error);
  }
};

export const getQuotes = async () => {
  const db = await openDatabase();
  const query = 'SELECT * FROM quotes ORDER BY id DESC';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.raw();
  } catch (error) {
    console.error('Error getting quotes', error);
    return [];
  }
};

export const updateQuote = async (id, quote) => {
  const db = await openDatabase();
  const query = 'UPDATE quotes SET document_number = ?, clientName = ?, date = ?, items = ?, total = ? WHERE id = ?';
  const { document_number, clientName, date, items, total } = quote;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, id]);
  } catch (error) {
    console.error('Error updating quote', error);
  }
};

export const deleteQuote = async (id) => {
  const db = await openDatabase();
  const query = 'DELETE FROM quotes WHERE id = ?';
  try {
    await db.executeSql(query, [id]);
  } catch (error) {
    console.error('Error deleting quote', error);
  }
};

// Delivery Note functions
export const addDeliveryNote = async (deliveryNote) => {
  const db = await openDatabase();
  const query = 'INSERT INTO delivery_notes (document_number, clientName, date, items, total, order_reference, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const { document_number, clientName, date, items, total, orderReference, paymentMethod } = deliveryNote;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, orderReference, paymentMethod]);
  } catch (error) {
    console.error('Error adding delivery note', error);
  }
};

export const getDeliveryNotes = async () => {
  const db = await openDatabase();
  const query = 'SELECT * FROM delivery_notes ORDER BY id DESC';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.raw();
  } catch (error) {
    console.error('Error getting delivery notes', error);
    return [];
  }
};

export const updateDeliveryNote = async (id, deliveryNote) => {
  const db = await openDatabase();
  const query = 'UPDATE delivery_notes SET document_number = ?, clientName = ?, date = ?, items = ?, total = ?, order_reference = ?, payment_method = ? WHERE id = ?';
  const { document_number, clientName, date, items, total, orderReference, paymentMethod } = deliveryNote;
  try {
    await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, orderReference, paymentMethod, id]);
  } catch (error) {
    console.error('Error updating delivery note', error);
  }
};

export const deleteDeliveryNote = async (id) => {
  const db = await openDatabase();
  const query = 'DELETE FROM delivery_notes WHERE id = ?';
  try {
    await db.executeSql(query, [id]);
  } catch (error) {
    console.error('Error deleting delivery note', error);
  }
};