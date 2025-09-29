import { getDatabase } from './Database';

/**
 * Retrieves all available document templates from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of document template objects.
 */
export const getDocumentTemplates = async () => {
  try {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM document_templates;');
    return results.rows.raw();
  } catch (error) {
    console.error('Error fetching document templates', error);
    return [];
  }
};

/**
 * Seeds the database with default document templates if they don't exist.
 */
export const seedDefaultTemplates = async (db) => {
  try {
    // const db = await getDatabase(); // This line is removed
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          // Ensure the table exists before trying to read from it.
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS document_templates (templateId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, htmlContent TEXT);',
            [],
            () => {
              // Now that we're sure the table exists, check if it's empty.
              tx.executeSql(
                'SELECT COUNT(*) as count FROM document_templates;',
                [],
                (_, results) => {
                  if (results.rows.item(0).count === 0) {
                    console.log('Seeding default document templates...');
                    // Use "INSERT ... SELECT ... WHERE NOT EXISTS" to be safe.
                    tx.executeSql(
                      `INSERT INTO document_templates (templateId, name, htmlContent) 
                       SELECT 1, 'Classic', 'Default classic template structure' 
                       WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE templateId = 1);`
                    );
                    tx.executeSql(
                      `INSERT INTO document_templates (templateId, name, htmlContent) 
                       SELECT 2, 'Modern', 'Sleek modern template structure' 
                       WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE templateId = 2);`
                    );
                    tx.executeSql(
                      `INSERT INTO document_templates (templateId, name, htmlContent) 
                       SELECT 3, 'Commercial', 'Commercial-style template' 
                       WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE templateId = 3);`
                    );
                  }
                },
                (tx, error) => {
                  console.error('Error checking template count', error);
                  return false; // Rollback
                }
              );
            },
            (tx, error) => {
              console.error('Error creating document_templates table in seeder', error);
              return false; // Rollback
            }
          );
        },
        (error) => { // Transaction error callback
          console.error('Transaction error during seeding', error);
          reject(error);
        },
        () => { // Transaction success callback
          resolve();
        }
      );
    });
  } catch (error) {
    console.error('Error seeding default templates', error);
    throw error; // Re-throw to be caught by initDatabase
  }
};

/**
 * Retrieves a single document template by its ID.
 * @param {number} templateId The ID of the template to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the template object or null if not found.
 */
export const getDocumentTemplate = async (templateId) => {
  try {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM document_templates WHERE templateId = ?;', [templateId]);
    return results.rows.item(0) || null;
  } catch (error) {
    console.error(`Error fetching document template with id ${templateId}`, error);
    return null;
  }
};

/**
 * Creates a new document template.
 * @param {Object} templateData The data for the new template.
 * @param {string} templateData.name The name of the template.
 * @param {string} templateData.htmlContent The HTML content of the template.
 * @returns {Promise<number|null>} A promise that resolves to the new template's ID or null on failure.
 */
export const createDocumentTemplate = async (templateData) => {
  const { name, htmlContent } = templateData;
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql('INSERT INTO document_templates (name, htmlContent) VALUES (?, ?);', [name, htmlContent]);
    return result.insertId;
  } catch (error) {
    console.error('Error creating document template', error);
    return null;
  }
};

/**
 * Updates an existing document template.
 * @param {number} templateId The ID of the template to update.
 * @param {Object} templateData The new data for the template.
 * @param {string} templateData.name The new name.
 * @param {string} templateData.htmlContent The new HTML content.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export const updateDocumentTemplate = async (templateId, templateData) => {
  const { name, htmlContent } = templateData;
  try {
    const db = await getDatabase();
    await db.executeSql('UPDATE document_templates SET name = ?, htmlContent = ? WHERE templateId = ?;', [name, htmlContent, templateId]);
    return true;
  } catch (error) {
    console.error(`Error updating document template with id ${templateId}`, error);
    return false;
  }
};

/**
 * Deletes a document template.
 * @param {number} templateId The ID of the template to delete.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export const deleteDocumentTemplate = async (templateId) => {
  try {
    const db = await getDatabase();
    await db.executeSql('DELETE FROM document_templates WHERE templateId = ?;', [templateId]);
    return true;
  } catch (error) {
    console.error(`Error deleting document template with id ${templateId}`, error);
    return false;
  }
};
