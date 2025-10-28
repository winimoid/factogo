import { getDatabase } from './Database';

const getTableName = (docType) => {
  const tableNames = {
    invoice: 'invoices',
    quote: 'quotes',
    delivery_note: 'delivery_notes',
  };
  const tableName = tableNames[docType];
  if (!tableName) {
    throw new Error(`Invalid document type: ${docType}`);
  }
  return tableName;
};

export const getNextDocumentNumber = async (storeId, documentType) => {
  const db = await getDatabase();
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const periodSuffix = `/${month}/${year}`;
  const tableName = getTableName(documentType);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `
        SELECT document_number FROM ${tableName}
        WHERE document_number LIKE ? AND storeId = ?
        ORDER BY SUBSTR(document_number, 1, 3) DESC
        LIMIT 1;
      `;
      
      tx.executeSql(query, [`%${periodSuffix}`, storeId], (_, { rows }) => {
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

export const createDocumentForStore = async (storeId, docType, docData, convertedFrom = null) => {
    const db = await getDatabase();
    const tableName = getTableName(docType);

    try {
        await db.transaction(async tx => {
            if (docType === 'delivery_note') {
                const { document_number, clientName, date, items, total, order_reference, payment_method } = docData;
                const query = `INSERT INTO ${tableName} (document_number, clientName, date, items, total, storeId, order_reference, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
                await tx.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, storeId, order_reference, payment_method]);
            } else {
                const { document_number, clientName, date, items, total, discountType, discountValue } = docData;
                const query = `INSERT INTO ${tableName} (document_number, clientName, date, items, total, storeId, discountType, discountValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
                await tx.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, storeId, discountType, discountValue]);
            }

            if (convertedFrom) {
                const updateQuery = `UPDATE quotes SET status = 'Converted' WHERE id = ?;`;
                await tx.executeSql(updateQuery, [convertedFrom]);
            }
        });
    } catch (error) {
        console.error(`Error adding document type ${docType}`, error);
        throw error;
    }
};

export const getDocumentsForStore = async (storeId, docType) => {
    const db = await getDatabase();
    const tableName = getTableName(docType);
    const query = `SELECT * FROM ${tableName} WHERE storeId = ? ORDER BY id DESC;`;
    try {
        const [results] = await db.executeSql(query, [storeId]);
        return results.rows.raw();
    } catch (error) {
        console.error(`Error getting documents type ${docType} for store`, error);
        return [];
    }
};

export const updateDocument = async (docId, docType, docData) => {
    const db = await getDatabase();
    const tableName = getTableName(docType);

    if (docType === 'delivery_note') {
        const { document_number, clientName, date, items, total, order_reference, payment_method } = docData;
        const query = `UPDATE ${tableName} SET document_number = ?, clientName = ?, date = ?, items = ?, total = ?, order_reference = ?, payment_method = ? WHERE id = ?;`;
        try {
            await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, order_reference, payment_method, docId]);
        } catch (error) {
            console.error(`Error updating document type ${docType}`, error);
            throw error;
        }
    } else {
        const { document_number, clientName, date, items, total, discountType, discountValue } = docData;
        const query = `UPDATE ${tableName} SET document_number = ?, clientName = ?, date = ?, items = ?, total = ?, discountType = ?, discountValue = ? WHERE id = ?;`;
        try {
            await db.executeSql(query, [document_number, clientName, date, JSON.stringify(items), total, discountType, discountValue, docId]);
        } catch (error) {
            console.error(`Error updating document type ${docType}`, error);
            throw error;
        }
    }
};

export const deleteDocument = async (docId, docType) => {
    const db = await getDatabase();
    const tableName = getTableName(docType);
    const query = `DELETE FROM ${tableName} WHERE id = ?;`;
    try {
        await db.executeSql(query, [docId]);
    } catch (error) {
        console.error(`Error deleting document type ${docType}`, error);
        throw error;
    }
};