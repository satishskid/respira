
import { UserPreferences, SessionLog, JournalEntry } from '../types';
import { DEFAULT_PREFERENCES } from '../constants';

const DB_NAME = 'prana_flow_db';
const DB_VERSION = 2; // Incremented for new store
const STORE_PREFS = 'preferences';
const STORE_SESSIONS = 'sessions';
const STORE_JOURNAL = 'journal_entries';

export const dbService = {
  db: null as IDBDatabase | null,

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store for User Preferences
        if (!db.objectStoreNames.contains(STORE_PREFS)) {
          db.createObjectStore(STORE_PREFS, { keyPath: 'id' });
        }

        // Store for Session History
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: 'id', autoIncrement: true });
        }

        // Store for Journal Entries
        if (!db.objectStoreNames.contains(STORE_JOURNAL)) {
          db.createObjectStore(STORE_JOURNAL, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  async savePreferences(prefs: UserPreferences): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PREFS], 'readwrite');
      const store = transaction.objectStore(STORE_PREFS);
      const request = store.put({ id: 'user_settings', ...prefs });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getPreferences(): Promise<UserPreferences> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_PREFS], 'readonly');
      const store = transaction.objectStore(STORE_PREFS);
      const request = store.get('user_settings');

      request.onsuccess = () => {
        if (request.result) {
          // Exclude the 'id' key from the result
          const { id, ...prefs } = request.result;
          resolve(prefs as UserPreferences);
        } else {
          resolve(DEFAULT_PREFERENCES);
        }
      };
      request.onerror = () => {
        console.warn('Failed to load prefs, using default');
        resolve(DEFAULT_PREFERENCES);
      };
    });
  },

  async logSession(session: Omit<SessionLog, 'id'>): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.add(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getHistory(): Promise<SessionLog[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const sorted = (request.result as SessionLog[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_JOURNAL], 'readwrite');
      const store = transaction.objectStore(STORE_JOURNAL);
      const request = store.add(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_JOURNAL], 'readonly');
      const store = transaction.objectStore(STORE_JOURNAL);
      const request = store.getAll();
      request.onsuccess = () => {
        const sorted = (request.result as JournalEntry[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }
};
