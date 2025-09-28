const migrations = [
  {
    version: 1,
    queries: [
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, companyName TEXT, logo TEXT, managerName TEXT, signature TEXT, stamp TEXT, description TEXT, informations TEXT);`,
      `CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total REAL NOT NULL);`,
      `CREATE TABLE IF NOT EXISTS delivery_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, clientName TEXT NOT NULL, date TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, order_reference TEXT, payment_method TEXT);`,
    ],
  },
  {
    version: 2,
    queries: [
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
    ],
  },
  {
    version: 3,
    queries: [
      `ALTER TABLE stores ADD COLUMN signatureUrl TEXT;`,
      `ALTER TABLE stores ADD COLUMN stampUrl TEXT;`,
    ],
  },
  {
    version: 4, // This is a corrective migration to ensure both columns from v3 exist.
    queries: [
      `ALTER TABLE stores ADD COLUMN signatureUrl TEXT;`,
      `ALTER TABLE stores ADD COLUMN stampUrl TEXT;`,
    ],
  },
  {
    version: 5, // This is a corrective migration to ensure both columns from v3 exist.
    queries: [
      `ALTER TABLE stores ADD COLUMN stampUrl TEXT;`,
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
        // Run all queries for this version in a single transaction.
        await db.transaction(async (tx) => {
          for (const query of migration.queries) {
            await tx.executeSql(query);
          }
          // Update version table inside the same transaction.
          await tx.executeSql('INSERT INTO db_versions (version) VALUES (?);', [migration.version]);
        });
        console.log(`Successfully migrated to version ${migration.version}`);
        // Update our tracked version
        currentVersion = migration.version;
      } catch (error) {
        // This is the key part: handle the "duplicate column" error.
        if (error.message.includes('duplicate column')) {
          console.warn(`Migration to version ${migration.version} failed because it was likely already applied. Syncing version table.`);
          // The schema is already correct, so we just need to update the version table.
          await db.executeSql('INSERT INTO db_versions (version) VALUES (?);', [migration.version]);
          currentVersion = migration.version; // Update our tracked version
        } else {
          // For any other error, we stop to prevent corruption.
          console.error(`Failed to migrate to version ${migration.version}. Error: ${error.message}`);
          throw error; // Re-throw the error to stop the app initialization.
        }
      }
    }
  }
};
