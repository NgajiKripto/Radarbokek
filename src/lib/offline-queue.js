/**
 * IndexedDB-based offline queue for location pings
 */
const DB_NAME = 'radarbokek';
const DB_VERSION = 1;
const STORE_NAME = 'location-queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add location ping to offline queue
 */
export async function enqueueLocation(payload) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({
    ...payload,
    timestamp: Date.now(),
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all queued locations and clear store
 * @returns {Promise<Array>}
 */
export async function drainQueue() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getAll = store.getAll();
    getAll.onsuccess = () => {
      const items = getAll.result;
      store.clear();
      resolve(items);
    };
    getAll.onerror = () => reject(getAll.error);
  });
}

/**
 * Check if online
 */
export function isOnline() {
  return navigator.onLine;
}
