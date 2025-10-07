export function openDB(dbName = "pdf-db", storeName = "pdfs") {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = (evt) => {
      const db = evt.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "key" }); // store: {key, name, blob, savedAt}
        console.log(`IndexedDB: Object store '${storeName}' created.`);
      }
    };
    req.onsuccess = (evt) => {
      console.log(`IndexedDB: Database '${dbName}' opened successfully.`);
      resolve({ db: evt.target.result, storeName });
    };
    req.onerror = (evt) => {
      console.error(`IndexedDB: Error opening database '${dbName}':`, evt.target.error);
      reject(evt.target.error);
    };
  });
}

export async function putPdf({ key, name, blob }) {
  try {
    const { db, storeName } = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put({ key, name, blob, savedAt: Date.now() });
      req.onsuccess = () => {
        console.log(`IndexedDB: PDF '${name}' (key: ${key}) put successfully.`);
        resolve(true);
      };
      req.onerror = (e) => {
        console.error(`IndexedDB: Error putting PDF '${name}' (key: ${key}):`, e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB: Error in putPdf - openDB failed:", error);
    throw error;
  }
}

export async function getPdf(key) {
  try {
    const { db, storeName } = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        console.log(`IndexedDB: PDF (key: ${key}) retrieved successfully.`, req.result ? "Found" : "Not found");
        resolve(req.result);
      };
      req.onerror = (e) => {
        console.error(`IndexedDB: Error getting PDF (key: ${key}):`, e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB: Error in getPdf - openDB failed:", error);
    throw error;
  }
}

export async function listPdfs() {
  try {
    const { db, storeName } = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const out = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          out.push(cursor.value);
          cursor.continue();
        } else {
          console.log(`IndexedDB: Listed ${out.length} PDFs.`);
          resolve(out);
        }
      };
      cursorReq.onerror = (e) => {
        console.error("IndexedDB: Error listing PDFs:", e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB: Error in listPdfs - openDB failed:", error);
    throw error;
  }
}

export async function deletePdf(key) {
  try {
    const { db, storeName } = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => {
        console.log(`IndexedDB: PDF (key: ${key}) deleted successfully.`);
        resolve(true);
      };
      req.onerror = (e) => {
        console.error(`IndexedDB: Error deleting PDF (key: ${key}):`, e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error("IndexedDB: Error in deletePdf - openDB failed:", error);
    throw error;
  }
}
