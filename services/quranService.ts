import { Surah, SurahDetail, Verse, LanguageCode, TranslationOption, CURATED_EDITIONS, Word, SurahInfo } from '../types';
import * as DB from './db';

const QURAN_LOCAL_URL = '/quran-json/quran.json';
const API_BASE_URL = 'https://api.alquran.cloud/v1';
const QURAN_COM_API_URL = 'https://api.quran.com/api/v4';

// --- TOAST NOTIFICATION HELPER ---
export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message, type }
    }));
};

// --- JUZ & SAJDAH DATA MAPPING ---

export const JUZ_START_MAPPING = [
    { juz: 1, surahId: 1, verseId: 1, label: "Al-Fatihah 1" },
    { juz: 2, surahId: 2, verseId: 142, label: "Al-Baqarah 142" },
    { juz: 3, surahId: 2, verseId: 253, label: "Al-Baqarah 253" },
    { juz: 4, surahId: 3, verseId: 93, label: "Ali 'Imran 93" },
    { juz: 5, surahId: 4, verseId: 24, label: "An-Nisa 24" },
    { juz: 6, surahId: 4, verseId: 148, label: "An-Nisa 148" },
    { juz: 7, surahId: 5, verseId: 82, label: "Al-Ma'idah 82" },
    { juz: 8, surahId: 6, verseId: 111, label: "Al-An'am 111" },
    { juz: 9, surahId: 7, verseId: 88, label: "Al-A'raf 88" },
    { juz: 10, surahId: 8, verseId: 41, label: "Al-Anfal 41" },
    { juz: 11, surahId: 9, verseId: 93, label: "At-Tawbah 93" },
    { juz: 12, surahId: 11, verseId: 6, label: "Hud 6" },
    { juz: 13, surahId: 12, verseId: 53, label: "Yusuf 53" },
    { juz: 14, surahId: 15, verseId: 1, label: "Al-Hijr 1" },
    { juz: 15, surahId: 17, verseId: 1, label: "Al-Isra 1" },
    { juz: 16, surahId: 18, verseId: 75, label: "Al-Kahf 75" },
    { juz: 17, surahId: 21, verseId: 1, label: "Al-Anbiya 1" },
    { juz: 18, surahId: 23, verseId: 1, label: "Al-Mu'minun 1" },
    { juz: 19, surahId: 25, verseId: 21, label: "Al-Furqan 21" },
    { juz: 20, surahId: 27, verseId: 56, label: "An-Naml 56" },
    { juz: 21, surahId: 29, verseId: 46, label: "Al-Ankabut 46" },
    { juz: 22, surahId: 33, verseId: 31, label: "Al-Ahzab 31" },
    { juz: 23, surahId: 36, verseId: 28, label: "Ya-Sin 28" },
    { juz: 24, surahId: 39, verseId: 32, label: "Az-Zumar 32" },
    { juz: 25, surahId: 41, verseId: 47, label: "Fussilat 47" },
    { juz: 26, surahId: 46, verseId: 1, label: "Al-Ahqaf 1" },
    { juz: 27, surahId: 51, verseId: 31, label: "Adh-Dhariyat 31" },
    { juz: 28, surahId: 58, verseId: 1, label: "Al-Mujadila 1" },
    { juz: 29, surahId: 67, verseId: 1, label: "Al-Mulk 1" },
    { juz: 30, surahId: 78, verseId: 1, label: "An-Naba 1" },
];

export const SAJDAH_VERSES = [
    { surahId: 7, verseId: 206, surahName: "Al-A'raf" },
    { surahId: 13, verseId: 15, surahName: "Ar-Ra'd" },
    { surahId: 16, verseId: 50, surahName: "An-Nahl" },
    { surahId: 17, verseId: 109, surahName: "Al-Isra" },
    { surahId: 19, verseId: 58, surahName: "Maryam" },
    { surahId: 22, verseId: 18, surahName: "Al-Hajj" },
    { surahId: 22, verseId: 77, surahName: "Al-Hajj" },
    { surahId: 25, verseId: 60, surahName: "Al-Furqan" },
    { surahId: 27, verseId: 26, surahName: "An-Naml" },
    { surahId: 32, verseId: 15, surahName: "As-Sajdah" },
    { surahId: 38, verseId: 24, surahName: "Sad" },
    { surahId: 41, verseId: 38, surahName: "Fussilat" },
    { surahId: 53, verseId: 62, surahName: "An-Najm" },
    { surahId: 84, verseId: 21, surahName: "Al-Inshiqaq" },
    { surahId: 96, verseId: 19, surahName: "Al-Alaq" },
];

export const getHizbList = () => {
    const list = [];
    for (let i = 1; i <= 60; i++) {
        const juzNum = Math.ceil(i / 2);
        const isStartOfJuz = i % 2 !== 0;
        const juzData = JUZ_START_MAPPING.find(j => j.juz === juzNum);
        list.push({
            id: i,
            juz: juzNum,
            isStart: isStartOfJuz,
            surahId: juzData?.surahId || 1,
            verseId: juzData?.verseId || 1
        });
    }
    return list;
};

let globalArabicCache: Record<string, { chapter: number; verse: number; text: string }[]> | null = null;
const cachedSurahLists: Record<string, Surah[]> = {};
const cachedContent: Record<string, any[]> = {};
const cachedWordByWord: Record<string, Record<number, Word[]>> = {};
const cachedSurahInfo: Record<number, SurahInfo> = {};

const DAILY_VERSES_POOL = [
    { surah: 2, verse: 255 },
    { surah: 2, verse: 286 },
    { surah: 94, verse: 5 },
    { surah: 65, verse: 2 },
    { surah: 3, verse: 139 },
    { surah: 2, verse: 153 },
    { surah: 40, verse: 60 },
    { surah: 2, verse: 45 },
    { surah: 39, verse: 53 },
    { surah: 13, verse: 28 },
    { surah: 2, verse: 216 },
    { surah: 8, verse: 30 },
    { surah: 1, verse: 6 },
    { surah: 112, verse: 1 },
];

export const getAyatOfTheDayData = async (translationId: string = 'id.indonesian') => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % DAILY_VERSES_POOL.length;
    const target = DAILY_VERSES_POOL[index];

    try {
        if (!globalArabicCache) {
            const response = await fetch(QURAN_LOCAL_URL);
            globalArabicCache = await response.json();
        }

        const surahKey = target.surah.toString();
        const arabicData = globalArabicCache?.[surahKey]?.find(v => v.verse === target.verse);

        // Try online first for complete data including surah details
        if (navigator.onLine) {
            try {
                const transResponse = await fetch(`${API_BASE_URL}/ayah/${target.surah}:${target.verse}/${translationId}`);
                const transJson = await transResponse.json();
                return {
                    surah: transJson.data.surah,
                    verseNo: target.verse,
                    text: arabicData ? arabicData.text : transJson.data.text,
                    translation: transJson.data.text
                };
            } catch (e) {
                // Ignore API failure, fallback to offline minimal info if needed, but for daily ayat we usually need API for translation
            }
        }

        return null;
    } catch (e) {
        console.error("Failed to load Ayat of the Day", e);
        showToast("Gagal memuat Ayat Hari Ini. Periksa koneksi internet Anda.");
        return null;
    }
};

export const SURAH_START_PAGES: number[] = [0, 1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604];

export const getSurahStartPage = (surahId: number): number => {
    return SURAH_START_PAGES[surahId] || 1;
};

export const getVersesByPage = async (pageNumber: number, translationId: string = 'id.indonesian'): Promise<any[]> => {
    try {
        const arabicResponse = await fetch(`${API_BASE_URL}/page/${pageNumber}/quran-uthmani`);
        const arabicData = await arabicResponse.json();
        const transResponse = await fetch(`${API_BASE_URL}/page/${pageNumber}/${translationId}`);
        const transData = await transResponse.json();

        if (arabicData.code === 200 && transData.code === 200) {
            const ayahList = arabicData.data.ayahs;
            const transList = transData.data.ayahs;
            return ayahList.map((ayah: any, index: number) => ({
                ...ayah,
                translation: transList[index] ? transList[index].text : '',
                surah: ayah.surah
            }));
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch page verses", e);
        showToast("Gagal memuat halaman Mushaf. Periksa koneksi internet Anda.");
        return [];
    }
};

export const getAvailableEditions = async (): Promise<TranslationOption[]> => {
    return Promise.resolve(CURATED_EDITIONS);
};

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

export const getSurahInfo = async (surahId: number): Promise<SurahInfo | null> => {
    if (cachedSurahInfo[surahId]) return cachedSurahInfo[surahId];
    try {
        if (!navigator.onLine) return null; // Simple offline check
        const response = await fetch(`${QURAN_COM_API_URL}/chapters/${surahId}/info?language=id`);
        const data = await response.json();
        if (data && data.chapter_info) {
            cachedSurahInfo[surahId] = data.chapter_info;
            return data.chapter_info;
        }
    } catch (e) {
        console.error("Failed to fetch Surah Info", e);
        showToast("Gagal mengambil info Surah dari server.", "warning");
    }
    return null;
};

// IMPROVED SEARCH: HYBRID (Online -> Offline)
export const searchGlobalVerses = async (query: string, translationId: string = 'id.indonesian'): Promise<{ surah: Surah, verseId: number, text: string, translation: string }[]> => {
    if (!query || query.length < 3) return [];

    // 1. Try Online API
    if (navigator.onLine) {
        try {
            const response = await fetch(`${API_BASE_URL}/search/${query}/all/${translationId}`);
            const data = await response.json();
            if (data.code === 200 && data.data && data.data.matches) {
                return data.data.matches.map((match: any) => ({
                    surah: match.surah,
                    verseId: match.numberInSurah,
                    text: match.text,
                    translation: match.text
                }));
            }
        } catch (e) {
            console.warn("Online search failed, trying offline...", e);
        }
    }

    // 2. Offline Fallback (Search in IndexedDB)
    try {
        const offlineResults = await DB.searchOfflineContent(query, translationId);
        if (offlineResults.length > 0) {
            const allSurahs = await getAllSurahs();

            return offlineResults.map(res => {
                let fullSurah = res.surah;
                if (typeof res.surah === 'object' && res.surah.number) {
                    const found = allSurahs.find(s => s.id === res.surah.number);
                    if (found) {
                        fullSurah = {
                            number: found.id,
                            name: found.name,
                            englishName: found.transliteration,
                            englishNameTranslation: found.translation
                        };
                    }
                }

                return {
                    surah: fullSurah,
                    verseId: res.verseId,
                    text: res.text,
                    translation: res.translation
                };
            });
        }
    } catch (e) {
        console.error("Offline search failed", e);
        showToast("Pencarian offline bermasalah. Coba lagi nanti.", "error");
    }

    return [];
};

const fetchContentForSurah = async (editionId: string, surahId: number): Promise<any[]> => {
    const cacheKey = `${surahId}-${editionId}`;
    if (cachedContent[cacheKey]) return cachedContent[cacheKey];

    try {
        const localContent = await DB.getSurahContent(editionId, surahId);
        if (localContent && localContent.length > 0) {
            cachedContent[cacheKey] = localContent;
            return localContent;
        }
    } catch (e) { console.warn(`DB fetch failed for ${editionId}`, e); }

    try {
        if (!navigator.onLine) return [];
        const response = await fetch(`${API_BASE_URL}/surah/${surahId}/${editionId}`);
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.ayahs) {
            const verses = data.data.ayahs;
            cachedContent[cacheKey] = verses;
            return verses;
        }
    } catch (e) {
        console.error(`API fetch failed for ${editionId}`, e);
        showToast("Gagal mengambil teks dari server. Periksa jaringan Anda.");
    }
    return [];
};

const fetchWordByWordForSurah = async (surahId: number): Promise<Record<number, Word[]>> => {
    const cacheKey = `wbw-v4-${surahId}`;
    if (cachedWordByWord[cacheKey]) return cachedWordByWord[cacheKey];

    try {
        if (!navigator.onLine) return {};
        const response = await fetch(`${QURAN_COM_API_URL}/verses/by_chapter/${surahId}?language=id&words=true&word_fields=text_uthmani,root,lemma&word_translation_language=id&per_page=300`);
        const data = await response.json();
        if (data && data.verses) {
            const wordsMap: Record<number, Word[]> = {};
            data.verses.forEach((v: any) => {
                const verseNum = parseInt(v.verse_key.split(':')[1]);
                wordsMap[verseNum] = v.words;
            });
            cachedWordByWord[cacheKey] = wordsMap;
            return wordsMap;
        }
    } catch (e) {
        console.error("Failed to fetch Word-By-Word data", e);
        showToast("Gagal memuat terjemahan per kata.", "warning");
    }
    return {};
}

const processDetail = async (
    id: number,
    meta: Surah,
    translationIdentifier?: string,
    tafsirIdentifier?: string,
    includeWords: boolean = false,
    useTajweed: boolean = false
): Promise<SurahDetail> => {

    let arabicVerses: any[] = [];

    if (useTajweed) {
        arabicVerses = await fetchContentForSurah('quran-tajweed', id);
    }

    if (!useTajweed || !arabicVerses || arabicVerses.length === 0) {
        if (!globalArabicCache) {
            try {
                const response = await fetch(QURAN_LOCAL_URL);
                globalArabicCache = await response.json();
            } catch (e) {
                console.error("Failed to load local Quran JSON", e);
                throw new Error("Gagal memuat teks Al-Quran");
            }
        }
        const raw = globalArabicCache?.[id.toString()];
        if (!raw) throw new Error(`Verses for Surah ${id} not found`);
        arabicVerses = raw;
    }

    const promises: Promise<any>[] = [];
    const metaSourceId = translationIdentifier || 'quran-uthmani';
    promises.push(fetchContentForSurah(metaSourceId, id));

    if (tafsirIdentifier) {
        promises.push(fetchContentForSurah(tafsirIdentifier, id));
    } else {
        promises.push(Promise.resolve([]));
    }

    if (includeWords) {
        promises.push(fetchWordByWordForSurah(id));
    } else {
        promises.push(Promise.resolve({}));
    }

    const [metaVerses, tafsirVerses, wordByWordMap] = await Promise.all(promises);

    const verses: Verse[] = arabicVerses.map((v, index) => {
        const verseId = v.verse || v.numberInSurah;
        const text = v.text;

        const metaVerse = metaVerses[index];
        const pageNumber = v.page || (metaVerse ? metaVerse.page : undefined);

        const translationText = (translationIdentifier && metaVerse) ? metaVerse.text : undefined;

        return {
            id: verseId,
            text: text,
            translation: translationText,
            tafsir: tafsirVerses[index] ? tafsirVerses[index].text : undefined,
            page_number: pageNumber,
            words: wordByWordMap[verseId] || undefined
        };
    });

    return {
        ...meta,
        verses
    };
};

export const getSurahDetail = async (
    id: number,
    lang: LanguageCode = 'id',
    translationIdentifier?: string,
    tafsirIdentifier?: string,
    includeWords: boolean = false,
    useTajweed: boolean = false
): Promise<SurahDetail> => {
    const surahs = await getAllSurahs(lang);
    const meta = surahs.find(s => s.id === id);
    if (!meta) throw new Error(`Surah ${id} not found`);
    return processDetail(id, meta, translationIdentifier, tafsirIdentifier, includeWords, useTajweed);
};

export const removeDiacritics = (text: string): string => {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
};

export const findOccurrences = async (searchTerm: string, type: 'root' | 'text'): Promise<{ surahId: number, verseId: number, text: string }[]> => {
    if (!searchTerm || searchTerm.length < 1) return [];
    if (!globalArabicCache) {
        try {
            const response = await fetch(QURAN_LOCAL_URL);
            globalArabicCache = await response.json();
        } catch (e) {
            console.error("Failed to load global cache for search", e);
            showToast("Gagal memuat data pencarian Arab.");
            return [];
        }
    }
    if (!globalArabicCache) return [];

    const results: { surahId: number, verseId: number, text: string }[] = [];
    const cleanSearch = removeDiacritics(searchTerm).replace(/\s/g, '');
    let regex: RegExp;
    if (type === 'root') {
        const rootPattern = cleanSearch.split('').join('.*');
        regex = new RegExp(rootPattern);
    }
    Object.keys(globalArabicCache).forEach(surahKey => {
        const surahVerses = globalArabicCache![surahKey];
        surahVerses.forEach(v => {
            const cleanText = removeDiacritics(v.text);
            if (type === 'root') {
                if (regex.test(cleanText)) results.push({ surahId: v.chapter, verseId: v.verse, text: v.text });
            } else {
                if (cleanText.includes(cleanSearch)) results.push({ surahId: v.chapter, verseId: v.verse, text: v.text });
            }
        });
    });
    return results.slice(0, 50);
};

export const downloadEdition = async (editionId: string, onProgress?: (msg: string, percent: number) => void) => {
    try {
        if (onProgress) onProgress("Menghubungi server...", 10);
        const isWorking = await verifyEditionAvailability(editionId);
        if (!isWorking) throw new Error("Edisi ini tidak merespon dari server.");

        if (onProgress) onProgress("Mengunduh data...", 30);
        const response = await fetch(`${API_BASE_URL}/quran/${editionId}`);

        if (onProgress) onProgress("Memproses data...", 70);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            if (onProgress) onProgress("Menyimpan ke penyimpanan lokal...", 90);
            await DB.saveFullQuranContent(editionId, data.data);
            await DB.saveDownloadedEdition(data.data.edition);
            if (onProgress) onProgress("Selesai!", 100);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Download failed", e);
        showToast(`Gagal mengunduh: ${e instanceof Error ? e.message : 'Kesalahan jaringan'}`);
        throw e;
    }
}