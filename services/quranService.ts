
import { Surah, SurahDetail, Verse, LanguageCode, TranslationOption, CURATED_EDITIONS, Word, SurahInfo } from '../types';
import * as DB from './db';

const QURAN_LOCAL_URL = '/quran-json/quran.json'; // Fixed typo: qruan -> quran
const API_BASE_URL = 'https://api.alquran.cloud/v1';
const QURAN_COM_API_URL = 'https://api.quran.com/api/v4';

// Cache for the full Arabic Quran from local JSON
let globalArabicCache: Record<string, { chapter: number; verse: number; text: string }[]> | null = null;

// Cache for Surah lists (metadata) per language
const cachedSurahLists: Record<string, Surah[]> = {};

// Cache for specific translation/tafsir details (Memory cache on top of IDB)
const cachedContent: Record<string, any[]> = {};
const cachedWordByWord: Record<string, Record<number, Word[]>> = {};

// Cache for Surah Info (Asbabun Nuzul)
const cachedSurahInfo: Record<number, SurahInfo> = {};

// LIST OF INSPIRATIONAL VERSES FOR "AYAT OF THE DAY"
// { surah: number, verse: number }
const DAILY_VERSES_POOL = [
    { surah: 2, verse: 255 }, // Ayatul Kursi
    { surah: 2, verse: 286 }, // La yukallifullah
    { surah: 94, verse: 5 },  // Verily with hardship comes ease
    { surah: 65, verse: 2 },  // Wayarzuqhu min haisu la yahtasib
    { surah: 3, verse: 139 }, // Do not weaken
    { surah: 2, verse: 153 }, // Seek help through patience
    { surah: 40, verse: 60 }, // Call upon Me; I will respond
    { surah: 2, verse: 45 },  // Seek help in patience and prayer
    { surah: 39, verse: 53 }, // Do not despair of the mercy of Allah
    { surah: 13, verse: 28 }, // Verily, in the remembrance of Allah do hearts find rest
    { surah: 2, verse: 216 }, // Perhaps you hate a thing and it is good for you
    { surah: 8, verse: 30 },  // And Allah is the best of planners
    { surah: 1, verse: 6 },   // Guide us to the straight path
    { surah: 112, verse: 1 }, // Say, He is Allah, [who is] One
];

export const getAyatOfTheDayData = async (translationId: string = 'id.indonesian') => {
    // Determine Index based on Day of Year to ensure consistency for all users on the same day
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % DAILY_VERSES_POOL.length;
    const target = DAILY_VERSES_POOL[index];

    // Fetch details
    // Ideally we would reuse getSurahDetail but that fetches the WHOLE surah.
    // For performance, let's just fetch this specific verse if possible, or filter from local cache.
    
    try {
        // 1. Ensure Arabic text is loaded
        if (!globalArabicCache) {
             const response = await fetch(QURAN_LOCAL_URL);
             globalArabicCache = await response.json();
        }
        
        // Get Arabic
        const surahKey = target.surah.toString();
        const arabicData = globalArabicCache?.[surahKey]?.find(v => v.verse === target.verse);
        
        // Get Translation (Single request to API for specific verse is cleaner than loading whole surah)
        const transResponse = await fetch(`${API_BASE_URL}/ayah/${target.surah}:${target.verse}/${translationId}`);
        const transJson = await transResponse.json();
        const translationText = transJson.data.text;
        const surahInfo = transJson.data.surah;

        return {
            surah: surahInfo,
            verseNo: target.verse,
            text: arabicData ? arabicData.text : transJson.data.text, // Fallback to API arabic if local fails
            translation: translationText
        };
        
    } catch (e) {
        console.error("Failed to load Ayat of the Day", e);
        return null;
    }
};


// MAPPING: Surah ID to Start Page (Madani Mushaf Standard)
export const SURAH_START_PAGES: number[] = [
  0, 1, 2, 50, 77, 106, 128, 151, 177, 187, 
  208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 
  312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 
  404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 
  467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 
  518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 
  549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 
  568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 
  585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 
  594, 595, 596, 596, 597, 597, 598, 598, 599, 599, 
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 
  603, 604, 604, 604
];

export const getSurahStartPage = (surahId: number): number => {
    return SURAH_START_PAGES[surahId] || 1;
};

// NEW: Fetch Verse Data by Page Number (for Mushaf Mode Overlay)
export const getVersesByPage = async (pageNumber: number, translationId: string = 'id.indonesian'): Promise<any[]> => {
    try {
        // Fetch Arabic text for the page
        const arabicResponse = await fetch(`${API_BASE_URL}/page/${pageNumber}/quran-uthmani`);
        const arabicData = await arabicResponse.json();
        
        // Fetch Translation for the page
        const transResponse = await fetch(`${API_BASE_URL}/page/${pageNumber}/${translationId}`);
        const transData = await transResponse.json();

        if (arabicData.code === 200 && transData.code === 200) {
            const ayahList = arabicData.data.ayahs;
            const transList = transData.data.ayahs;

            // Merge
            return ayahList.map((ayah: any, index: number) => ({
                ...ayah,
                translation: transList[index] ? transList[index].text : '',
                surah: ayah.surah // contains surah info
            }));
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch page verses", e);
        return [];
    }
};

export const getAvailableEditions = async (): Promise<TranslationOption[]> => {
  return Promise.resolve(CURATED_EDITIONS);
};

// NEW: Verify if an edition is actually working by fetching Al-Fatihah
export const verifyEditionAvailability = async (editionId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/surah/1/${editionId}`);
        const data = await response.json();
        return data.code === 200 && data.data && data.data.ayahs && data.data.ayahs.length > 0;
    } catch (e) {
        return false;
    }
};

export const getAllSurahs = async (lang: LanguageCode = 'id'): Promise<Surah[]> => {
  if (cachedSurahLists[lang]) {
    return cachedSurahLists[lang];
  }

  try {
    // Fixed typo: qruan -> quran
    const response = await fetch(`/quran-json/chapters/${lang}.json`);
    
    if (!response.ok) {
        if (lang !== 'id') return getAllSurahs('id');
        throw new Error('Local chapters not found');
    }
    
    const data = await response.json();
    cachedSurahLists[lang] = data;
    return data;
  } catch (error) {
    console.warn(`Failed to load local chapters for ${lang}`, error);
    return [];
  }
};

// NEW: Get Surah Info (Asbabun Nuzul / Tafsir Intro)
export const getSurahInfo = async (surahId: number): Promise<SurahInfo | null> => {
    if (cachedSurahInfo[surahId]) {
        return cachedSurahInfo[surahId];
    }

    try {
        // Fetching from Quran.com API v4 for Surah Info (Indonesian)
        const response = await fetch(`${QURAN_COM_API_URL}/chapters/${surahId}/info?language=id`);
        const data = await response.json();
        
        if (data && data.chapter_info) {
            cachedSurahInfo[surahId] = data.chapter_info;
            return data.chapter_info;
        }
    } catch (e) {
        console.error("Failed to fetch Surah Info", e);
    }
    return null;
};

// NEW: SEARCH FUNCTIONALITY
export const searchGlobalVerses = async (query: string, translationId: string = 'id.indonesian'): Promise<{surah: Surah, verseId: number, text: string, translation: string}[]> => {
    if (!query || query.length < 3) return [];

    // NOTE: For a true global search without a backend, we need to iterate all surahs.
    // To make this performant in a frontend-only app, we should rely on what we have.
    // OPTION 1: Search only downloaded/cached content (Fastest but incomplete)
    // OPTION 2: Search only metadata/Surah names (Already done)
    // OPTION 3: Search a dedicated "Search Index" file (Best for UX). 
    // Since we don't have a search index file, we will do a 'Smart Hybrid Search':
    // - Search Surah Names
    // - Search within the first 2-3 juz or popular surahs if not cached
    
    // HOWEVER, `api.alquran.cloud` provides a search endpoint! Let's use that for accuracy.
    try {
        const response = await fetch(`${API_BASE_URL}/search/${query}/all/${translationId}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.matches) {
            // Transform API response to our app structure
            return data.data.matches.map((match: any) => ({
                surah: match.surah,
                verseId: match.numberInSurah,
                text: match.text, // Arabic text might not be here depending on API call, usually it returns translation text if searching in translation
                translation: match.text // The search result text
            }));
        }
    } catch (e) {
        console.error("Search API failed", e);
    }
    return [];
};


export const getSurahDetail = async (
  id: number, 
  appLang: LanguageCode, 
  translationIdentifier?: string, 
  tafsirIdentifier?: string,
  includeWords: boolean = false
): Promise<SurahDetail> => {
  
  // 1. Get Metadata
  let surahList = cachedSurahLists[appLang];
  if (!surahList) {
    surahList = await getAllSurahs(appLang);
  }
  
  const surahMeta = surahList.find(s => s.id === id);
  if (!surahMeta) {
      // Fallback if current language fails
      const fallbackList = await getAllSurahs('id');
      const fallbackMeta = fallbackList.find(s => s.id === id);
      if (!fallbackMeta) throw new Error(`Surah ${id} not found`);
      return processDetail(id, fallbackMeta, translationIdentifier, tafsirIdentifier, includeWords);
  }

  return processDetail(id, surahMeta, translationIdentifier, tafsirIdentifier, includeWords);
};

// Helper to fetch content (either from Cache, DB, or API)
const fetchContentForSurah = async (editionId: string, surahId: number): Promise<any[]> => {
    const cacheKey = `${surahId}-${editionId}`;
    
    // 1. Memory Cache
    if (cachedContent[cacheKey]) {
        return cachedContent[cacheKey];
    }

    // 2. IndexedDB
    try {
        const localContent = await DB.getSurahContent(editionId, surahId);
        if (localContent) {
            cachedContent[cacheKey] = localContent;
            return localContent;
        }
    } catch (e) {
        console.warn(`DB fetch failed for ${editionId}`, e);
    }

    // 3. API Fallback (On Demand)
    try {
        const response = await fetch(`${API_BASE_URL}/surah/${surahId}/${editionId}`);
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.ayahs) {
            const verses = data.data.ayahs;
            cachedContent[cacheKey] = verses;
            return verses;
        }
    } catch (e) {
        console.error(`API fetch failed for ${editionId}`, e);
    }

    return [];
};

// Helper to fetch Word-by-Word data from Quran.com API
const fetchWordByWordForSurah = async (surahId: number): Promise<Record<number, Word[]>> => {
    // V4 CACHE KEY: Forces refresh to include LEMMA data
    const cacheKey = `wbw-v4-${surahId}`;
    
    if (cachedWordByWord[cacheKey]) {
        return cachedWordByWord[cacheKey];
    }

    try {
        // Fetching word by word data with Indonesian translation
        // Request 'root' AND 'lemma' in word_fields
        const response = await fetch(`${QURAN_COM_API_URL}/verses/by_chapter/${surahId}?language=id&words=true&word_fields=text_uthmani,root,lemma&word_translation_language=id&per_page=300`);
        const data = await response.json();
        
        if (data && data.verses) {
             const wordsMap: Record<number, Word[]> = {};
             data.verses.forEach((v: any) => {
                 // Convert verse_key "1:1" to id "1"
                 const verseNum = parseInt(v.verse_key.split(':')[1]);
                 wordsMap[verseNum] = v.words;
             });
             cachedWordByWord[cacheKey] = wordsMap;
             return wordsMap;
        }
    } catch (e) {
        console.error("Failed to fetch Word-By-Word data", e);
    }
    return {};
}

// UTILITY: Remove Arabic Diacritics (Tashkeel)
export const removeDiacritics = (text: string): string => {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
};

// Find occurrences: Can search by ROOT (exact letters anywhere) or TEXT (word match)
export const findOccurrences = async (searchTerm: string, type: 'root' | 'text'): Promise<{surahId: number, verseId: number, text: string}[]> => {
    if (!searchTerm || searchTerm.length < 1) return [];

    // Ensure global cache is loaded
    if (!globalArabicCache) {
        try {
            const response = await fetch(QURAN_LOCAL_URL);
            globalArabicCache = await response.json();
        } catch (e) {
            console.error("Failed to load global cache for search", e);
            return [];
        }
    }

    if (!globalArabicCache) return [];

    const results: {surahId: number, verseId: number, text: string}[] = [];
    
    // Clean the search term
    const cleanSearch = removeDiacritics(searchTerm).replace(/\s/g, ''); 
    
    let regex: RegExp;
    
    if (type === 'root') {
        // For roots: matches letters in sequence, allowing other letters in between
        // e.g. "ktb" matches "kataba", "kitab", "maktub"
        const rootPattern = cleanSearch.split('').join('.*');
        regex = new RegExp(rootPattern); 
    } else {
        // For text: loose match
        // We simply use string inclusion for text to be safer
    }

    // Iterate through all surahs
    Object.keys(globalArabicCache).forEach(surahKey => {
        const surahVerses = globalArabicCache![surahKey];
        surahVerses.forEach(v => {
            const cleanText = removeDiacritics(v.text);
            
            if (type === 'root') {
                if (regex.test(cleanText)) {
                    results.push({ surahId: v.chapter, verseId: v.verse, text: v.text });
                }
            } else {
                if (cleanText.includes(cleanSearch)) {
                    results.push({ surahId: v.chapter, verseId: v.verse, text: v.text });
                }
            }
        });
    });

    // Limit results
    return results.slice(0, 50); 
};

// Legacy support wrapper
export const findRootOccurrences = (root: string) => findOccurrences(root, 'root');

const processDetail = async (
    id: number, 
    meta: Surah, 
    translationIdentifier?: string, 
    tafsirIdentifier?: string,
    includeWords: boolean = false
): Promise<SurahDetail> => {
  
  // 1. Get Arabic Text (Local - Fast Access)
  if (!globalArabicCache) {
    try {
      const response = await fetch(QURAN_LOCAL_URL);
      globalArabicCache = await response.json();
    } catch (e) {
      console.error("Failed to load local Quran JSON", e);
      throw new Error("Gagal memuat teks Al-Quran");
    }
  }
  
  const arabicVersesRaw = globalArabicCache?.[id.toString()];
  if (!arabicVersesRaw) throw new Error(`Verses for Surah ${id} not found`);

  // 2. Fetch Translations, Tafsir, WBW in Parallel
  const promises: Promise<any>[] = [];
  
  // Index 0: Meta/Translation Source
  // LOGIC FIX: Always fetch a source that has page numbers (metadata), even if translation is off.
  // Use the requested translation ID if valid, otherwise fallback to 'quran-uthmani' which is light and has page nums.
  const metaSourceId = translationIdentifier || 'quran-uthmani';
  promises.push(fetchContentForSurah(metaSourceId, id));

  // Index 1: Tafsir
  if (tafsirIdentifier) {
      promises.push(fetchContentForSurah(tafsirIdentifier, id));
  } else {
      promises.push(Promise.resolve([]));
  }
  
  // Index 2: Word By Word
  if (includeWords) {
      promises.push(fetchWordByWordForSurah(id));
  } else {
      promises.push(Promise.resolve({}));
  }

  const [metaVerses, tafsirVerses, wordByWordMap] = await Promise.all(promises);

  // 3. Merge
  const verses: Verse[] = arabicVersesRaw.map((v, index) => {
      // Get metadata (page number) from the meta source
      const metaVerse = metaVerses[index];
      const pageNumber = metaVerse ? metaVerse.page : undefined;

      // Only include translation text if the user actually requested a translation edition (not the fallback)
      const translationText = (translationIdentifier && metaVerse) ? metaVerse.text : undefined;

      return {
          id: v.verse,
          text: v.text,
          translation: translationText,
          tafsir: tafsirVerses[index] ? tafsirVerses[index].text : undefined,
          page_number: pageNumber, // Now reliably populated even if translation is off
          words: wordByWordMap[v.verse] || undefined
      };
  });

  return {
    ...meta,
    verses
  };
};

// Function to download full edition with simple progress simulation
export const downloadEdition = async (editionId: string, onProgress?: (msg: string, percent: number) => void) => {
    try {
        if(onProgress) onProgress("Menghubungi server...", 10);
        
        // Verify first
        const isWorking = await verifyEditionAvailability(editionId);
        if (!isWorking) throw new Error("Edisi ini tidak merespon dari server.");

        if(onProgress) onProgress("Mengunduh data...", 30);
        
        // Fetch full Quran for this edition
        const response = await fetch(`${API_BASE_URL}/quran/${editionId}`);
        
        if(onProgress) onProgress("Memproses data...", 70);
        
        const data = await response.json();

        if (data.code === 200 && data.data) {
            if(onProgress) onProgress("Menyimpan ke penyimpanan lokal...", 90);
            await DB.saveFullQuranContent(editionId, data.data);
            await DB.saveDownloadedEdition(data.data.edition);
            if(onProgress) onProgress("Selesai!", 100);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Download failed", e);
        throw e;
    }
}
