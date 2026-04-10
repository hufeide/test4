/**
 * Memory Service with IndexedDB persistence
 * Manages chat history and knowledge sharing records
 */

const DB_NAME = 'PetCareMemory';
const DB_VERSION = 1;
const STORE_NAME = 'chatMessages';

/**
 * Open IndexedDB database
 * @returns {Promise<IDBDatabase>} Database connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
  });
}

/**
 * Add a chat message to the database
 * @param {Object} message - Message object
 * @returns {Promise<number>} Message ID
 */
export async function addChatMessageToDB(message) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(message);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get chat messages for a specific session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Array of messages
 */
export async function getChatMessagesFromDB(sessionId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);

    request.onsuccess = () => {
      // Sort by timestamp
      const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
      resolve(messages);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all chat messages ordered by timestamp
 * @returns {Promise<Array>} Array of all messages
 */
export async function getAllChatMessages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by timestamp
      const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
      resolve(messages);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get chat sessions grouped by date
 * @returns {Promise<Array>} Array of sessions with messages
 */
export async function getSessionsByDate() {
  const messages = await getAllChatMessages();
  const sessions = {};

  messages.forEach(msg => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!sessions[date]) {
      sessions[date] = [];
    }
    sessions[date].push(msg);
  });

  return Object.entries(sessions).map(([date, msgs]) => ({
    date,
    messages: msgs,
    messageCount: msgs.length
  }));
}

/**
 * Clear all chat history
 * @returns {Promise<void>}
 */
export async function clearChatHistory() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete old messages (older than 30 days)
 * @returns {Promise<void>}
 */
export async function cleanupOldMessages() {
  const db = await openDB();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      const messagesToDelete = request.result.filter(msg => msg.timestamp < thirtyDaysAgo);
      if (messagesToDelete.length === 0) {
        resolve();
        return;
      }

      const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
      const deleteStore = deleteTransaction.objectStore(STORE_NAME);

      messagesToDelete.forEach(msg => {
        deleteStore.delete(msg.id);
      });

      deleteTransaction.oncomplete = () => resolve();
      deleteTransaction.onerror = () => reject(deleteTransaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}
