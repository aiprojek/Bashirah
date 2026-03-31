import { openDB, DBSchema } from "idb";
import { TranslationOption, TadabburData, WordMorphology, SurahInfo, AyahMorphology } from "../types";

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
    indexes: { "by-date": number };
  };
  user_settings: {
    key: string;
    value: any;
  };
  bookmarks: {
    key: string; // "surahId_verseId"
    value: any;
  };
  notes: {
    key: string; // noteId
    value: any;
    indexes: { "by-verse": [number, number] };
  };
  reading_history: {
    key: string; // "YYYY-MM-DD"
    value: any;
  };
  quiz_scores: {
    key: string; // scoreId
    value: any;
    indexes: { "by-score": number };
  };
  surah_info: {
    key: number; // surahId
    value: SurahInfo;
  };
  word_morphology: {
    key: string; // surahId_verseId_wordPosition
    value: WordMorphology;
  };
  ayah_morphology: {
    key: string; // surahId_verseId
    value: AyahMorphology;
  };
  download_tasks: {
    key: string; // taskId
    value: any;
    indexes: { "by-type": string; "by-status": string; "by-updated": number };
  };
}

const DB_NAME = "bashirah-db";
const DB_VERSION = 6;

export const getDB = async () => {
  return openDB<QuranDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains("downloads")) {
          db.createObjectStore("downloads", { keyPath: "identifier" });
        }
        if (!db.objectStoreNames.contains("content")) {
          db.createObjectStore("content");
        }
        if (!db.objectStoreNames.contains("tadabbur")) {
          const store = db.createObjectStore("tadabbur", { keyPath: "id" });
          store.createIndex("by-date", "timestamp");
        }
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains("user_settings")) {
          db.createObjectStore("user_settings");
        }
        if (!db.objectStoreNames.contains("bookmarks")) {
          db.createObjectStore("bookmarks", { keyPath: "id" }); // id: "surahId_verseId"
        }
        if (!db.objectStoreNames.contains("notes")) {
          const store = db.createObjectStore("notes", { keyPath: "id" });
          store.createIndex("by-verse", ["surahId", "verseId"]);
        }
        if (!db.objectStoreNames.contains("reading_history")) {
          db.createObjectStore("reading_history", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("quiz_scores")) {
          const store = db.createObjectStore("quiz_scores", { keyPath: "id" });
          store.createIndex("by-score", "score");
        }
      }

      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains("surah_info")) {
          db.createObjectStore("surah_info");
        }
      }

      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains("download_tasks")) {
          const store = db.createObjectStore("download_tasks", { keyPath: "id" });
          store.createIndex("by-type", "type");
          store.createIndex("by-status", "status");
          store.createIndex("by-updated", "updatedAt");
        }
      }

      if (oldVersion < 5) {
        if (!db.objectStoreNames.contains("word_morphology")) {
          db.createObjectStore("word_morphology", { keyPath: "id" });
        }
      }

      if (oldVersion < 6) {
        if (!db.objectStoreNames.contains("ayah_morphology")) {
          db.createObjectStore("ayah_morphology", { keyPath: "id" });
        }
      }
    },
  });
};

export const saveDownloadedEdition = async (edition: TranslationOption) => {
  const db = await getDB();
  await db.put("downloads", edition);
};

export const getDownloadedEditions = async (): Promise<TranslationOption[]> => {
  const db = await getDB();
  return db.getAll("downloads");
};

export const isEditionDownloaded = async (
  editionId: string,
): Promise<boolean> => {
  const db = await getDB();
  const result = await db.get("downloads", editionId);
  return !!result;
};

export const saveFullQuranContent = async (editionId: string, data: any) => {
  const db = await getDB();
  const tx = db.transaction("content", "readwrite");
  const store = tx.objectStore("content");

  // data.surahs contains the list of surahs with ayahs
  if (data.surahs && Array.isArray(data.surahs)) {
    for (const surah of data.surahs) {
      const key = `${editionId}_${surah.number}`;
      store.put(surah.ayahs, key);
    }
  }

  await tx.done;
};

export const getSurahContent = async (
  editionId: string,
  surahId: number,
): Promise<any[]> => {
  const db = await getDB();
  const key = `${editionId}_${surahId}`;
  return db.get("content", key) || [];
};

export const deleteDownloadedEdition = async (identifier: string) => {
  const db = await getDB();
  const tx = db.transaction(["downloads", "content"], "readwrite");

  // 1. Remove from downloads list
  await tx.objectStore("downloads").delete(identifier);

  // 2. Remove all related content verses
  // Since we don't have an index on the prefix, we iterate.
  const store = tx.objectStore("content");
  let cursor = await store.openCursor();

  while (cursor) {
    // Key format is "editionId_surahId"
    if (cursor.key.toString().startsWith(identifier + "_")) {
      cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
};

export const searchOfflineContent = async (
  query: string,
  editionId: string,
) => {
  const db = await getDB();
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();

  const tx = db.transaction("content", "readonly");
  const store = tx.objectStore("content");
  let cursor = await store.openCursor();

  while (cursor) {
    const key = cursor.key.toString();
    if (key.startsWith(editionId + "_")) {
      const ayahs = cursor.value as any[];
      // Search within this surah's ayahs
      for (const ayah of ayahs) {
        if (ayah.text && ayah.text.toLowerCase().includes(lowerQuery)) {
          results.push({
            surah: ayah.surah,
            verseId: ayah.numberInSurah,
            text: ayah.text,
            translation: ayah.text,
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
  return db.getAllFromIndex("tadabbur", "by-date");
};

export const saveTadabbur = async (data: TadabburData) => {
  const db = await getDB();
  await db.put("tadabbur", data);
};

export const deleteTadabbur = async (id: string) => {
  const db = await getDB();
  await db.delete("tadabbur", id);
};

// --- BACKUP RESTORE HELPER ---
export const bulkPutTadabbur = async (items: TadabburData[]) => {
  const db = await getDB();
  const tx = db.transaction("tadabbur", "readwrite");
  const store = tx.objectStore("tadabbur");
  for (const item of items) {
    await store.put(item);
  }
  await tx.done;
};

// --- GENERIC SETTINGS ---
export const getSetting = async (key: string) => {
  const db = await getDB();
  return db.get("user_settings", key);
};

export const setSetting = async (key: string, value: any) => {
  const db = await getDB();
  await db.put("user_settings", value, key);
};

// --- BOOKMARKS ---
export const getAllBookmarks = async () => {
  const db = await getDB();
  return db.getAll("bookmarks");
};

export const saveBookmark = async (bookmark: any) => {
  const db = await getDB();
  bookmark.id = `${bookmark.surahId}_${bookmark.verseId}`;
  await db.put("bookmarks", bookmark);
};

export const deleteBookmark = async (surahId: number, verseId: number) => {
  const db = await getDB();
  await db.delete("bookmarks", `${surahId}_${verseId}`);
};

// --- NOTES ---
export const getAllNotes = async () => {
  const db = await getDB();
  return db.getAll("notes");
};

export const dbSaveNote = async (note: any) => {
  const db = await getDB();
  if (!note.id) note.id = Date.now().toString();
  await db.put("notes", note);
};

export const deleteNoteById = async (noteId: string) => {
  const db = await getDB();
  await db.delete("notes", noteId);
};

// --- READING HISTORY ---
export const getReadingHistory = async () => {
  const db = await getDB();
  return db.getAll("reading_history");
};

export const saveReadingLog = async (log: any) => {
  const db = await getDB();
  await db.put("reading_history", log);
};

// --- QUIZ SCORES ---
export const getTopQuizScores = async (limit = 50) => {
  const db = await getDB();
  const scores = await db.getAllFromIndex("quiz_scores", "by-score");
  return scores.reverse().slice(0, limit);
};

export const saveQuizScore = async (score: any) => {
  const db = await getDB();
  if (!score.id) score.id = Date.now().toString();
  await db.put("quiz_scores", score);
};

// --- SURAH INFO ---
const getSurahInfoKey = (surahId: number, language: string = "id") => `${surahId}:${language}`;

export const saveSurahInfo = async (surahId: number, info: any, language: string = "id") => {
  const db = await getDB();
  const normalized = { ...info, language: info?.language || language };
  await db.put("surah_info", normalized, getSurahInfoKey(surahId, normalized.language));
};

export const getSurahInfo = async (surahId: number, language: string = "id") => {
  const db = await getDB();
  const localized = await db.get("surah_info", getSurahInfoKey(surahId, language));
  if (localized) return localized;

  // Backward compatibility for old cache entries that were saved without language keying.
  if (language === "id") {
    return db.get("surah_info", surahId as any);
  }

  return undefined;
};

export const getAllSurahInfos = async () => {
  const db = await getDB();
  return db.getAll("surah_info");
};

// --- WORD MORPHOLOGY ---
export const saveWordMorphology = async (entry: WordMorphology) => {
  const db = await getDB();
  const id = `${entry.surahId}_${entry.verseId}_${entry.wordPosition}`;
  await db.put("word_morphology", { ...entry, id } as WordMorphology & { id: string });
};

export const bulkSaveWordMorphology = async (entries: WordMorphology[]) => {
  const db = await getDB();
  const tx = db.transaction("word_morphology", "readwrite");
  const store = tx.objectStore("word_morphology");
  for (const entry of entries) {
    const id = `${entry.surahId}_${entry.verseId}_${entry.wordPosition}`;
    await store.put({ ...entry, id });
  }
  await tx.done;
};

export const getWordMorphology = async (surahId: number, verseId: number, wordPosition: number) => {
  const db = await getDB();
  return db.get("word_morphology", `${surahId}_${verseId}_${wordPosition}`) as Promise<(WordMorphology & { id?: string }) | undefined>;
};

export const countWordMorphologyEntries = async () => {
  const db = await getDB();
  return db.count("word_morphology");
};

// --- AYAH MORPHOLOGY ---
export const bulkSaveAyahMorphology = async (entries: AyahMorphology[]) => {
  const db = await getDB();
  const tx = db.transaction("ayah_morphology", "readwrite");
  const store = tx.objectStore("ayah_morphology");
  for (const entry of entries) {
    const id = `${entry.surahId}_${entry.verseId}`;
    await store.put({ ...entry, id });
  }
  await tx.done;
};

export const getAyahMorphology = async (surahId: number, verseId: number) => {
  const db = await getDB();
  return db.get("ayah_morphology", `${surahId}_${verseId}`) as Promise<(AyahMorphology & { id?: string }) | undefined>;
};

export const countAyahMorphologyEntries = async () => {
  const db = await getDB();
  return db.count("ayah_morphology");
};

// --- DOWNLOAD TASKS (RESUME SUPPORT) ---
export const saveDownloadTask = async (task: any) => {
  const db = await getDB();
  await db.put("download_tasks", task);
};

export const getDownloadTask = async (taskId: string) => {
  const db = await getDB();
  return db.get("download_tasks", taskId);
};

export const getAllDownloadTasks = async () => {
  const db = await getDB();
  return db.getAll("download_tasks");
};

export const deleteDownloadTask = async (taskId: string) => {
  const db = await getDB();
  await db.delete("download_tasks", taskId);
};

// --- MIGRATION UTILITY ---
export const migrateFromLocalStorage = async () => {
  const MIGRATION_KEY = "bashirah_migration_v2_done";
  if (localStorage.getItem(MIGRATION_KEY)) return;

  console.log("Starting storage migration to IndexedDB...");

  const keys: Record<string, string> = {
    quran_last_read: "last_read",
    quran_khatam_target: "khatam_target",
    quran_show_daily_ayat: "show_daily_ayat",
    quran_reciter_id: "reciter_id",
    quran_theme: "theme",
    active_mushaf_id: "active_mushaf_id",
    app_language: "app_language",
  };

  // 1. Settings migration
  for (const [lsKey, settingKey] of Object.entries(keys)) {
    const val = localStorage.getItem(lsKey);
    if (val !== null) {
      try {
        await setSetting(settingKey, JSON.parse(val));
      } catch (e) {
        await setSetting(settingKey, val);
      }
    }
  }

  // 2. Bookmarks migration
  const bookmarksJson = localStorage.getItem("quran_bookmarks");
  if (bookmarksJson) {
    try {
      const bookmarks = JSON.parse(bookmarksJson);
      for (const b of bookmarks) {
        await saveBookmark(b);
      }
    } catch (e) {
      console.error("Failed to migrate bookmarks", e);
    }
  }

  // 3. Notes migration
  const notesJson = localStorage.getItem("quran_notes");
  if (notesJson) {
    try {
      const notes = JSON.parse(notesJson);
      for (const n of notes) {
        await dbSaveNote(n);
      }
    } catch (e) {
      console.error("Failed to migrate notes", e);
    }
  }

  // 4. History migration
  const historyJson = localStorage.getItem("quran_reading_history");
  if (historyJson) {
    try {
      const history = JSON.parse(historyJson);
      for (const h of history) {
        await saveReadingLog(h);
      }
    } catch (e) {
      console.error("Failed to migrate history", e);
    }
  }

  // 5. Quiz Scores migration
  const scoresJson = localStorage.getItem("quran_quiz_scores");
  if (scoresJson) {
    try {
      const scores = JSON.parse(scoresJson);
      for (const s of scores) {
        await saveQuizScore(s);
      }
    } catch (e) {
      console.error("Failed to migrate scores", e);
    }
  }

  localStorage.setItem(MIGRATION_KEY, "true");
  console.log("Storage migration completed.");
};
