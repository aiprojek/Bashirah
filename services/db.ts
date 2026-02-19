
import { openDB, DBSchema } from 'idb';
import { TranslationOption, TadabburData } from '../types';

interface QuranDB extends DBSchema {
  downloads: {
    key: string;
    value: TranslationOption;
  };
  content: {
    key: string; // editionId_surahId
    value: any[];
  };
  tadabbur: {
    key: string;
    value: TadabburData;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'bashirah-db';
const DB_VERSION = 1;

export const getDB = async () => {
  return openDB<QuranDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('downloads')) {
        db.createObjectStore('downloads', { keyPath: 'identifier' });
      }
      if (!db.objectStoreNames.contains('content')) {
        db.createObjectStore('content');
      }
      if (!db.objectStoreNames.contains('tadabbur')) {
        const store = db.createObjectStore('tadabbur', { keyPath: 'id' });
        store.createIndex('by-date', 'timestamp');
      }
    },
  });
};

export const saveDownloadedEdition = async (edition: TranslationOption) => {
    const db = await getDB();
    await db.put('downloads', edition);
};

export const getDownloadedEditions = async (): Promise<TranslationOption[]> => {
    const db = await getDB();
    return db.getAll('downloads');
};

export const isEditionDownloaded = async (editionId: string): Promise<boolean> => {
    const db = await getDB();
    const result = await db.get('downloads', editionId);
    return !!result;
};

export const saveFullQuranContent = async (editionId: string, data: any) => {
  const db = await getDB();
  const tx = db.transaction('content', 'readwrite');
  const store = tx.objectStore('content');
  
  // data.surahs contains the list of surahs with ayahs
  if (data.surahs && Array.isArray(data.surahs)) {
      for (const surah of data.surahs) {
         const key = `${editionId}_${surah.number}`;
         store.put(surah.ayahs, key);
      }
  }
  
  await tx.done;
};

export const getSurahContent = async (editionId: string, surahId: number): Promise<any[]> => {
    const db = await getDB();
    const key = `${editionId}_${surahId}`;
    return db.get('content', key) || [];
};

export const deleteDownloadedEdition = async (identifier: string) => {
    const db = await getDB();
    const tx = db.transaction(['downloads', 'content'], 'readwrite');
    
    // 1. Remove from downloads list
    await tx.objectStore('downloads').delete(identifier);
    
    // 2. Remove all related content verses
    // Since we don't have an index on the prefix, we iterate.
    const store = tx.objectStore('content');
    let cursor = await store.openCursor();
    
    while (cursor) {
        // Key format is "editionId_surahId"
        if (cursor.key.toString().startsWith(identifier + '_')) {
            cursor.delete();
        }
        cursor = await cursor.continue();
    }
    
    await tx.done;
};

export const searchOfflineContent = async (query: string, editionId: string) => {
    const db = await getDB();
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    const tx = db.transaction('content', 'readonly');
    const store = tx.objectStore('content');
    let cursor = await store.openCursor();
    
    while (cursor) {
        const key = cursor.key.toString();
        if (key.startsWith(editionId + '_')) {
            const ayahs = cursor.value as any[];
            // Search within this surah's ayahs
            for (const ayah of ayahs) {
                if (ayah.text && ayah.text.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        surah: ayah.surah, 
                        verseId: ayah.numberInSurah,
                        text: ayah.text,
                        translation: ayah.text 
                    });
                }
            }
        }
        cursor = await cursor.continue();
        if (results.length > 50) break; // Limit results
    }
    
    return results;
};

// --- TADABBUR ---

export const getAllTadabbur = async (): Promise<TadabburData[]> => {
    const db = await getDB();
    return db.getAllFromIndex('tadabbur', 'by-date');
};

export const saveTadabbur = async (data: TadabburData) => {
    const db = await getDB();
    await db.put('tadabbur', data);
};

export const deleteTadabbur = async (id: string) => {
    const db = await getDB();
    await db.delete('tadabbur', id);
};

// --- BACKUP RESTORE HELPER ---
export const bulkPutTadabbur = async (items: TadabburData[]) => {
    const db = await getDB();
    const tx = db.transaction('tadabbur', 'readwrite');
    const store = tx.objectStore('tadabbur');
    for (const item of items) {
        await store.put(item);
    }
    await tx.done;
};
