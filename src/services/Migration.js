const migrations = [
  {
    version: 1,
    queries: [
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, companyName TEXT, logo TEXT, managerName TEXT, signature TEXT, stamp TEXT, description TEXT, informations TEXT);`,
      `CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS delivery_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, order_reference TEXT, payment_method TEXT);`,
      `CREATE TABLE IF NOT EXISTS stores (storeId INTEGER PRIMARY KEY AUTOINCREMENT, ownerUserId INTEGER, name TEXT NOT NULL, logoUrl TEXT, documentTemplateId INTEGER, customTexts TEXT, status TEXT NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS document_templates (templateId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, htmlContent TEXT);`,
      `ALTER TABLE invoices ADD COLUMN storeId INTEGER;`,
      `ALTER TABLE quotes ADD COLUMN storeId INTEGER;`,
      `ALTER TABLE delivery_notes ADD COLUMN storeId INTEGER;`,
      `ALTER TABLE settings ADD COLUMN storeId INTEGER;`,
      `UPDATE invoices SET storeId = 1 WHERE storeId IS NULL;`,
      `UPDATE quotes SET storeId = 1 WHERE storeId IS NULL;`,
      `UPDATE delivery_notes SET storeId = 1 WHERE storeId IS NULL;`,
      `UPDATE settings SET storeId = 1 WHERE storeId IS NULL;`,
      `ALTER TABLE stores ADD COLUMN signatureUrl TEXT;`,
      `ALTER TABLE stores ADD COLUMN stampUrl TEXT;`,
    ],
  },
  {
    version: 2,
    queries: [
      `ALTER TABLE invoices ADD COLUMN discountType TEXT;`,
      `ALTER TABLE invoices ADD COLUMN discountValue REAL;`,
      `ALTER TABLE invoices ADD COLUMN status TEXT;`,
      `ALTER TABLE quotes ADD COLUMN discountType TEXT;`,
      `ALTER TABLE quotes ADD COLUMN discountValue REAL;`,
      `ALTER TABLE quotes ADD COLUMN status TEXT;`,
    ],
  },
];

export const runMigrations = async (db) => {
  // 1. Ensure the version table exists.
  await db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS db_versions (version INTEGER PRIMARY KEY);');
  });

  // 2. Get the current version.
  const [results] = await db.executeSql('SELECT version FROM db_versions ORDER BY version DESC LIMIT 1;');
  let currentVersion = 0;
  if (results.rows.length > 0) {
    currentVersion = results.rows.item(0).version;
  }
  console.log(`Current DB version: ${currentVersion}`);

  // 3. Loop through migrations and apply if new.
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Attempting to migrate to version ${migration.version}`);
      try {
        await new Promise((resolve, reject) => {
          db.transaction(
            tx => {
              // Execute all migration queries
              migration.queries.forEach(query => {
                tx.executeSql(query, [], 
                  () => {}, // success callback for each query (optional)
                  (_, error) => { // error callback for each query
                    console.error(`Error executing query in migration version ${migration.version}: "${query}"`);
                    // Returning true from this callback triggers a rollback
                    // and calls the transaction's main error callback.
                    return true;
                  }
                );
              });
              // After queuing all migration queries, queue the version update
              tx.executeSql('INSERT INTO db_versions (version) VALUES (?);', [migration.version]);
            },
            (error) => { // Transaction error callback (called on rollback)
              console.error(`Failed to migrate to version ${migration.version}. The transaction was rolled back.`, error);
              reject(error);
            },
            () => { // Transaction success callback (called on commit)
              console.log(`Successfully migrated to version ${migration.version}`);
              resolve();
            }
          );
        });
      } catch (error) {
        // Re-throw the error to halt app initialization, as the migration failed.
        throw error;
      }
    }
  }
};
