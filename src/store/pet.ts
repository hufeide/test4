import { ref, reactive } from 'vue';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface PetStore {
  petName: string;
  petLevel: number;
  petExp: number;
  need: number;
  chatHistory: ChatMessage[];
}

// IndexedDB for persistent storage
const DB_NAME = 'PetAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'chatHistory';

let db: IDBDatabase | null = null;

function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onerror = (event: Event) => {
      reject(new Error('Failed to initialize IndexedDB'));
    };
  });
}

function saveToDB(messages: ChatMessage[]): Promise<void> {
  if (!db) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'chatHistory', messages });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save to DB'));
  });
}

function loadFromDB(): Promise<ChatMessage[]> {
  if (!db) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('chatHistory');

    request.onsuccess = (event: Event) => {
      const result = (event.target as IDBRequest).result;
      resolve(result ? result.messages : []);
    };

    request.onerror = () => reject(new Error('Failed to load from DB'));
  });
}

// Initialize store with reactive state
const petStore = reactive<PetStore>({
  petName: 'Pet',
  petLevel: 1,
  petExp: 0,
  need: 100,
  chatHistory: [],
});

/**
 * Load chat history from IndexedDB
 */
export async function loadChatHistory(): Promise<void> {
  try {
    await initDB();
    const messages = await loadFromDB();
    petStore.chatHistory = messages;
  } catch (error) {
    console.error('Failed to load chat history:', error);
    petStore.chatHistory = [];
  }
}

/**
 * Save chat history to IndexedDB
 */
export async function saveChatHistory(): Promise<void> {
  try {
    await initDB();
    await saveToDB(petStore.chatHistory);
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

/**
 * Add a message to chat history
 */
export function addMessageToHistory(message: ChatMessage): void {
  petStore.chatHistory.push(message);
  saveChatHistory();
}

/**
 * Clear chat history
 */
export function clearChatHistory(): void {
  petStore.chatHistory = [];
  saveChatHistory();
}

/**
 * Get formatted chat history for API
 */
export function getFormattedHistory(): { role: 'user' | 'assistant' | 'system'; content: string }[] {
  return petStore.chatHistory
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
}

export default petStore;
