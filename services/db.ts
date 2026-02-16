
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TadabburData } from '../types';

interface QuranAppDB extends DBSchema {
  downloads: {
    key: string; // edition identifier
    value: {
      identifier: string;
      name: string;
      language: string;
      type: string;
      englishName: string;
      format: string;
      timestamp: number;
    };
  };
  content: {
    key: string; // Format: "editionId_surahId" e.g., "id.indonesian_1"
    value: any[]; // Array of verses
  };
  tadabbur: {
    key: string;
    value: TadabburData;
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'QuranAppDB';
const DB_VERSION = 2; // Incremented version

let dbPromise: Promise<IDBPDatabase<QuranAppDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<QuranAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // 1. Store for Offline Editions
        if (!db.objectStoreNames.contains('downloads')) {
          db.createObjectStore('downloads', { keyPath: 'identifier' });
        }
        // 2. Store for Surah JSON Content
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content');
        }
        // 3. Store for Tadabbur Journal (New in v2)
        if (!db.objectStoreNames.contains('tadabbur')) {
          const store = db.createObjectStore('tadabbur', { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

// --- DOWNLOADS & CONTENT ---

export const saveDownloadedEdition = async (editionInfo: any) => {
  const db = await getDB();
  await db.put('downloads', {
    ...editionInfo,
    timestamp: Date.now(),
  });
};

export const getDownloadedEditions = async () => {
  const db = await getDB();
  return await db.getAll('downloads');
};

export const isEditionDownloaded = async (editionId: string) => {
  const db = await getDB();
  const result = await db.get('downloads', editionId);
  return !!result;
};

export const saveSurahContent = async (editionId: string, surahId: number, verses: any[]) => {
  const db = await getDB();
  const key = `${editionId}_${surahId}`;
  await db.put('content', verses, key);
};

export const getSurahContent = async (editionId: string, surahId: number) => {
  const db = await getDB();
  const key = `${editionId}_${surahId}`;
  return await db.get('content', key);
};

export const saveFullQuranContent = async (editionId: string, data: any) => {
  const db = await getDB();
  const tx = db.transaction('content', 'readwrite');
  const store = tx.objectStore('content');
  
  for (const surah of data.surahs) {
     const key = `${editionId}_${surah.number}`;
     store.put(surah.ayahs, key);
  }
  
  await tx.done;
};

// --- TADABBUR JOURNAL (ASYNC) ---

export const getAllTadabbur = async (): Promise<TadabburData[]> => {
    const db = await getDB();
    // Get all and sort by timestamp desc
    const entries = await db.getAllFromIndex('tadabbur', 'by-timestamp');
    return entries.reverse(); // Newest first
};

export const saveTadabbur = async (entry: TadabburData) => {
    const db = await getDB();
    await db.put('tadabbur', entry);
};

export const deleteTadabbur = async (id: string) => {
    const db = await getDB();
    await db.delete('tadabbur', id);
};
