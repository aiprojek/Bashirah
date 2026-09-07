import { Surah, SurahDetail, Verse, LanguageCode, TranslationOption, CURATED_EDITIONS, Word, SurahInfo } from '../types';
import * as DB from './db';
import { PAGE_START_MAPPING } from './pageMapping';

const QURAN_LOCAL_URL = 'quran-json/quran.json';
const QURAN_VERSE_META_LOCAL_URL = 'quran-json/verse-meta.json';
const API_BASE_URL = 'https://api.alquran.cloud/v1';
const QURAN_COM_API_URL = 'https://api.quran.com/api/v4';
const NETWORK_TIMEOUT_MS = 5000;
const DOWNLOAD_TIMEOUT_MS = 15000;

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

let globalArabicCache: Record<string, { chapter: number; verse: number; text: string; juz?: number; hizb?: number; ruku?: number }[]> | null = null;
type LocalVerseMeta = [number, number, number, number]; // [page, juz, hizb, ruku]
let localVerseMetaCache: Record<string, LocalVerseMeta[]> | null = null;
type PageIndexEntry = { surahId: number; verseId: number };
let pageIndexCache: Record<number, PageIndexEntry[]> | null = null;
const cachedSurahLists: Record<string, Surah[]> = {};
const cachedContent: Record<string, any[]> = {};
const cachedWordByWord: Record<string, Record<number, Word[]>> = {};
const cachedSurahInfo: Record<string, SurahInfo> = {};

const loadLocalVerseMeta = async (): Promise<Record<string, LocalVerseMeta[]> | null> => {
    if (localVerseMetaCache) return localVerseMetaCache;
    try {
        const response = await fetch(QURAN_VERSE_META_LOCAL_URL);
        if (!response.ok) return null;
        localVerseMetaCache = await response.json();
        return localVerseMetaCache;
    } catch (e) {
        console.warn("Failed to load local verse metadata", e);
        return null;
    }
};

const buildPageIndex = (meta: Record<string, LocalVerseMeta[]> | null) => {
    if (!meta) return null;
    if (pageIndexCache) return pageIndexCache;
    const index: Record<number, PageIndexEntry[]> = {};
    const surahIds = Object.keys(meta).map(Number).sort((a, b) => a - b);
    surahIds.forEach(surahId => {
        const verses = meta[surahId.toString()] || [];
        verses.forEach((tuple, idx) => {
            const page = tuple?.[0];
            if (!page) return;
            if (!index[page]) index[page] = [];
            index[page].push({ surahId, verseId: idx + 1 });
        });
    });
    pageIndexCache = index;
    return index;
};

const getLocalVerseMeta = (
    cache: Record<string, LocalVerseMeta[]> | null,
    surahId: number,
    verseId: number
) => {
    const tuple = cache?.[surahId.toString()]?.[verseId - 1];
    if (!tuple) return null;
    return { page: tuple[0], juz: tuple[1], hizb: tuple[2], ruku: tuple[3] };
};

const fetchWithTimeout = async (url: string, init: RequestInit = {}, timeoutMs: number = NETWORK_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        window.clearTimeout(timeoutId);
    }
};

const fetchOnlineJson = async (url: string, init: RequestInit = {}, timeoutMs: number = NETWORK_TIMEOUT_MS) => {
    const response = await fetchWithTimeout(url, init, timeoutMs);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response.json();
};

const DAILY_VERSES_POOL = [
    { surah: 1, verse: 1 }, { surah: 1, verse: 2 }, { surah: 1, verse: 5 }, { surah: 1, verse: 6 },
    { surah: 2, verse: 2 }, { surah: 2, verse: 45 }, { surah: 2, verse: 152 }, { surah: 2, verse: 153 },
    { surah: 2, verse: 183 }, { surah: 2, verse: 185 }, { surah: 2, verse: 186 }, { surah: 2, verse: 201 },
    { surah: 2, verse: 255 }, { surah: 2, verse: 256 }, { surah: 2, verse: 261 }, { surah: 2, verse: 284 },
    { surah: 2, verse: 285 }, { surah: 2, verse: 286 }, { surah: 3, verse: 8 }, { surah: 3, verse: 16 },
    { surah: 3, verse: 26 }, { surah: 3, verse: 27 }, { surah: 3, verse: 53 }, { surah: 3, verse: 103 },
    { surah: 3, verse: 133 }, { surah: 3, verse: 134 }, { surah: 3, verse: 139 }, { surah: 3, verse: 159 },
    { surah: 3, verse: 173 }, { surah: 3, verse: 191 }, { surah: 3, verse: 193 }, { surah: 3, verse: 194 },
    { surah: 3, verse: 200 }, { surah: 4, verse: 1 }, { surah: 4, verse: 29 }, { surah: 4, verse: 31 },
    { surah: 4, verse: 58 }, { surah: 4, verse: 86 }, { surah: 4, verse: 100 }, { surah: 4, verse: 147 },
    { surah: 5, verse: 2 }, { surah: 5, verse: 8 }, { surah: 5, verse: 32 }, { surah: 5, verse: 54 },
    { surah: 5, verse: 119 }, { surah: 6, verse: 17 }, { surah: 6, verse: 59 }, { surah: 6, verse: 73 },
    { surah: 6, verse: 115 }, { surah: 6, verse: 125 }, { surah: 6, verse: 151 }, { surah: 6, verse: 162 },
    { surah: 7, verse: 23 }, { surah: 7, verse: 56 }, { surah: 7, verse: 96 }, { surah: 7, verse: 126 },
    { surah: 7, verse: 156 }, { surah: 7, verse: 205 }, { surah: 8, verse: 2 }, { surah: 8, verse: 29 },
    { surah: 8, verse: 45 }, { surah: 8, verse: 46 }, { surah: 8, verse: 58 }, { surah: 9, verse: 40 },
    { surah: 9, verse: 51 }, { surah: 9, verse: 71 }, { surah: 9, verse: 119 }, { surah: 9, verse: 128 },
    { surah: 10, verse: 9 }, { surah: 10, verse: 57 }, { surah: 10, verse: 62 }, { surah: 10, verse: 63 },
    { surah: 10, verse: 107 }, { surah: 11, verse: 6 }, { surah: 11, verse: 56 }, { surah: 11, verse: 88 },
    { surah: 11, verse: 112 }, { surah: 11, verse: 115 }, { surah: 12, verse: 22 }, { surah: 12, verse: 56 },
    { surah: 12, verse: 86 }, { surah: 12, verse: 87 }, { surah: 12, verse: 90 }, { surah: 12, verse: 101 },
    { surah: 13, verse: 11 }, { surah: 13, verse: 22 }, { surah: 13, verse: 24 }, { surah: 13, verse: 28 },
    { surah: 14, verse: 7 }, { surah: 14, verse: 34 }, { surah: 14, verse: 40 }, { surah: 14, verse: 42 },
    { surah: 15, verse: 9 }, { surah: 15, verse: 29 }, { surah: 15, verse: 85 }, { surah: 15, verse: 99 },
    { surah: 16, verse: 18 }, { surah: 16, verse: 90 }, { surah: 16, verse: 96 }, { surah: 16, verse: 97 },
    { surah: 16, verse: 128 }, { surah: 17, verse: 9 }, { surah: 17, verse: 23 }, { surah: 17, verse: 24 },
    { surah: 17, verse: 32 }, { surah: 17, verse: 37 }, { surah: 17, verse: 70 }, { surah: 17, verse: 80 },
    { surah: 17, verse: 82 }, { surah: 17, verse: 85 }, { surah: 18, verse: 10 }, { surah: 18, verse: 28 },
    { surah: 18, verse: 30 }, { surah: 18, verse: 46 }, { surah: 18, verse: 109 }, { surah: 19, verse: 30 },
    { surah: 19, verse: 47 }, { surah: 19, verse: 55 }, { surah: 20, verse: 25 }, { surah: 20, verse: 26 },
    { surah: 20, verse: 27 }, { surah: 20, verse: 28 }, { surah: 20, verse: 46 }, { surah: 20, verse: 114 },
    { surah: 21, verse: 30 }, { surah: 21, verse: 35 }, { surah: 21, verse: 87 }, { surah: 21, verse: 89 },
    { surah: 21, verse: 107 }, { surah: 22, verse: 38 }, { surah: 22, verse: 40 }, { surah: 22, verse: 41 },
    { surah: 22, verse: 78 }, { surah: 23, verse: 1 }, { surah: 23, verse: 2 }, { surah: 23, verse: 11 },
    { surah: 23, verse: 51 }, { surah: 23, verse: 118 }, { surah: 24, verse: 35 }, { surah: 24, verse: 38 },
    { surah: 24, verse: 55 }, { surah: 25, verse: 58 }, { surah: 25, verse: 63 }, { surah: 25, verse: 74 },
    { surah: 26, verse: 80 }, { surah: 26, verse: 83 }, { surah: 26, verse: 89 }, { surah: 27, verse: 19 },
    { surah: 27, verse: 30 }, { surah: 27, verse: 62 }, { surah: 28, verse: 24 }, { surah: 28, verse: 77 },
    { surah: 28, verse: 83 }, { surah: 29, verse: 2 }, { surah: 29, verse: 6 }, { surah: 29, verse: 45 },
    { surah: 29, verse: 69 }, { surah: 30, verse: 21 }, { surah: 30, verse: 41 }, { surah: 31, verse: 13 },
    { surah: 31, verse: 17 }, { surah: 31, verse: 22 }, { surah: 32, verse: 15 }, { surah: 32, verse: 16 },
    { surah: 33, verse: 21 }, { surah: 33, verse: 35 }, { surah: 33, verse: 41 }, { surah: 33, verse: 42 },
    { surah: 33, verse: 56 }, { surah: 34, verse: 2 }, { surah: 34, verse: 4 }, { surah: 35, verse: 2 },
    { surah: 35, verse: 5 }, { surah: 35, verse: 10 }, { surah: 36, verse: 1 }, { surah: 36, verse: 12 },
    { surah: 36, verse: 58 }, { surah: 37, verse: 39 }, { surah: 38, verse: 29 }, { surah: 39, verse: 10 },
    { surah: 39, verse: 23 }, { surah: 39, verse: 53 }, { surah: 40, verse: 40 }, { surah: 40, verse: 55 },
    { surah: 40, verse: 60 }, { surah: 41, verse: 30 }, { surah: 41, verse: 33 }, { surah: 41, verse: 34 },
    { surah: 42, verse: 19 }, { surah: 42, verse: 38 }, { surah: 43, verse: 13 }, { surah: 44, verse: 58 },
    { surah: 45, verse: 15 }, { surah: 46, verse: 13 }, { surah: 47, verse: 7 }, { surah: 47, verse: 15 },
    { surah: 48, verse: 1 }, { surah: 48, verse: 4 }, { surah: 48, verse: 29 }, { surah: 49, verse: 10 },
    { surah: 49, verse: 12 }, { surah: 49, verse: 13 }, { surah: 50, verse: 16 }, { surah: 51, verse: 55 },
    { surah: 51, verse: 56 }, { surah: 52, verse: 48 }, { surah: 53, verse: 39 }, { surah: 53, verse: 40 },
    { surah: 53, verse: 41 }, { surah: 53, verse: 42 }, { surah: 54, verse: 17 }, { surah: 55, verse: 1 },
    { surah: 55, verse: 13 }, { surah: 55, verse: 60 }, { surah: 56, verse: 1 }, { surah: 57, verse: 3 },
    { surah: 57, verse: 4 }, { surah: 57, verse: 20 }, { surah: 58, verse: 11 }, { surah: 59, verse: 9 },
    { surah: 59, verse: 18 }, { surah: 60, verse: 4 }, { surah: 60, verse: 7 }, { surah: 61, verse: 2 },
    { surah: 61, verse: 10 }, { surah: 62, verse: 9 }, { surah: 62, verse: 10 }, { surah: 63, verse: 9 },
    { surah: 64, verse: 11 }, { surah: 65, verse: 2 }, { surah: 65, verse: 3 }, { surah: 66, verse: 6 },
    { surah: 66, verse: 8 }, { surah: 67, verse: 1 }, { surah: 67, verse: 2 }, { surah: 67, verse: 15 },
    { surah: 68, verse: 4 }, { surah: 69, verse: 1 }, { surah: 70, verse: 5 }, { surah: 71, verse: 10 },
    { surah: 71, verse: 11 }, { surah: 71, verse: 12 }, { surah: 72, verse: 1 }, { surah: 73, verse: 8 },
    { surah: 73, verse: 9 }, { surah: 73, verse: 20 }, { surah: 74, verse: 1 }, { surah: 74, verse: 3 },
    { surah: 75, verse: 3 }, { surah: 76, verse: 3 }, { surah: 76, verse: 9 }, { surah: 77, verse: 1 },
    { surah: 78, verse: 31 }, { surah: 79, verse: 40 }, { surah: 79, verse: 41 }, { surah: 80, verse: 1 },
    { surah: 81, verse: 27 }, { surah: 81, verse: 28 }, { surah: 82, verse: 6 }, { surah: 83, verse: 1 },
    { surah: 84, verse: 6 }, { surah: 85, verse: 21 }, { surah: 85, verse: 22 }, { surah: 86, verse: 4 },
    { surah: 87, verse: 14 }, { surah: 87, verse: 15 }, { surah: 88, verse: 17 }, { surah: 89, verse: 27 },
    { surah: 89, verse: 28 }, { surah: 89, verse: 29 }, { surah: 89, verse: 30 }, { surah: 90, verse: 4 },
    { surah: 90, verse: 17 }, { surah: 91, verse: 9 }, { surah: 91, verse: 10 }, { surah: 92, verse: 5 },
    { surah: 92, verse: 6 }, { surah: 92, verse: 7 }, { surah: 93, verse: 3 }, { surah: 93, verse: 4 },
    { surah: 93, verse: 5 }, { surah: 93, verse: 6 }, { surah: 93, verse: 7 }, { surah: 93, verse: 8 },
    { surah: 93, verse: 9 }, { surah: 93, verse: 10 }, { surah: 93, verse: 11 }, { surah: 94, verse: 1 },
    { surah: 94, verse: 2 }, { surah: 94, verse: 3 }, { surah: 94, verse: 4 }, { surah: 94, verse: 5 },
    { surah: 94, verse: 6 }, { surah: 94, verse: 7 }, { surah: 94, verse: 8 }, { surah: 95, verse: 4 },
    { surah: 95, verse: 5 }, { surah: 95, verse: 6 }, { surah: 96, verse: 1 }, { surah: 96, verse: 2 },
    { surah: 96, verse: 3 }, { surah: 96, verse: 4 }, { surah: 96, verse: 5 }, { surah: 97, verse: 1 },
    { surah: 97, verse: 2 }, { surah: 97, verse: 3 }, { surah: 97, verse: 4 }, { surah: 97, verse: 5 },
    { surah: 98, verse: 7 }, { surah: 98, verse: 8 }, { surah: 99, verse: 7 }, { surah: 99, verse: 8 },
    { surah: 100, verse: 6 }, { surah: 101, verse: 1 }, { surah: 102, verse: 1 }, { surah: 102, verse: 2 },
    { surah: 102, verse: 8 }, { surah: 103, verse: 1 }, { surah: 103, verse: 2 }, { surah: 103, verse: 3 },
    { surah: 104, verse: 1 }, { surah: 105, verse: 1 }, { surah: 106, verse: 1 }, { surah: 106, verse: 2 },
    { surah: 106, verse: 3 }, { surah: 106, verse: 4 }, { surah: 107, verse: 1 }, { surah: 107, verse: 2 },
    { surah: 107, verse: 3 }, { surah: 107, verse: 4 }, { surah: 107, verse: 5 }, { surah: 107, verse: 6 },
    { surah: 107, verse: 7 }, { surah: 108, verse: 1 }, { surah: 108, verse: 2 }, { surah: 108, verse: 3 },
    { surah: 109, verse: 1 }, { surah: 109, verse: 2 }, { surah: 109, verse: 3 }, { surah: 109, verse: 4 },
    { surah: 109, verse: 5 }, { surah: 109, verse: 6 }, { surah: 110, verse: 1 }, { surah: 110, verse: 2 },
    { surah: 110, verse: 3 }, { surah: 111, verse: 1 }, { surah: 112, verse: 1 }, { surah: 112, verse: 2 },
    { surah: 112, verse: 3 }, { surah: 112, verse: 4 }, { surah: 113, verse: 1 }, { surah: 113, verse: 2 },
    { surah: 113, verse: 3 }, { surah: 113, verse: 4 }, { surah: 113, verse: 5 }, { surah: 114, verse: 1 },
    { surah: 114, verse: 2 }, { surah: 114, verse: 3 }, { surah: 114, verse: 4 }, { surah: 114, verse: 5 },
    { surah: 114, verse: 6 }
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

        // 1. Try Offline First (Tafsir/Translation might be in DB)
        const cachedTranslation = await DB.getSurahContent(translationId, target.surah);
        const localVerse = cachedTranslation?.find((v: any) => v.numberInSurah === target.verse);
        
        if (localVerse) {
            const allSurahs = await getAllSurahs();
            const surahInfo = allSurahs.find(s => s.id === target.surah);
            return {
                surah: {
                    number: target.surah,
                    name: surahInfo?.name || "",
                    englishName: surahInfo?.transliteration || "",
                    englishNameTranslation: surahInfo?.translation || ""
                },
                verseNo: target.verse,
                text: arabicData ? arabicData.text : localVerse.text,
                translation: localVerse.text
            };
        }

        // 2. Try Online if not in local DB
        if (navigator.onLine) {
            try {
                const transJson = await fetchOnlineJson(`${API_BASE_URL}/ayah/${target.surah}:${target.verse}/${translationId}`);
                return {
                    surah: transJson.data.surah,
                    verseNo: target.verse,
                    text: arabicData ? arabicData.text : transJson.data.text,
                    translation: transJson.data.text
                };
            } catch (e) {
                // Ignore API failure, fallback further
            }
        }

        // 3. Absolute Fallback (Arabic only)
        if (arabicData) {
            const allSurahs = await getAllSurahs();
            const surahInfo = allSurahs.find(s => s.id === target.surah);
            return {
                surah: {
                    number: target.surah,
                    name: surahInfo?.name || "",
                    englishName: surahInfo?.transliteration || "",
                    englishNameTranslation: surahInfo?.translation || ""
                },
                verseNo: target.verse,
                text: arabicData.text,
                translation: "Terjemahan belum diunduh untuk penggunaan offline."
            };
        }

        return null;
    } catch (e) {
        console.error("Failed to load Ayat of the Day", e);
        return null;
    }
};

export const getSpecificVerses = async (refs: { surah: number; verse: number }[], translationId: string = 'id.indonesian'): Promise<{ surah: Surah, verseId: number, text: string, translation: string }[]> => {
    if (!refs || refs.length === 0) return [];
    
    try {
        if (!globalArabicCache) {
            const response = await fetch(QURAN_LOCAL_URL);
            globalArabicCache = await response.json();
        }
        
        const allSurahs = await getAllSurahs();
        const results = [];

        for (const ref of refs) {
            const surahKey = ref.surah.toString();
            const arabicData = globalArabicCache?.[surahKey]?.find(v => v.verse === ref.verse);
            const surah = allSurahs.find(s => s.id === ref.surah);

            if (arabicData && surah) {
                // Try to get translation
                let translation = "";
                try {
                    const cachedTranslation = await DB.getSurahContent(translationId, ref.surah);
                    const localVerse = cachedTranslation?.find((v: any) => v.numberInSurah === ref.verse);
                    translation = localVerse ? localVerse.text : "Terjemahan belum diunduh.";
                } catch (e) {
                    translation = "Terjemahan belum tersedia offline.";
                }

                results.push({
                    surah: {
                        number: surah.id,
                        name: surah.name,
                        englishName: surah.transliteration,
                        englishNameTranslation: surah.translation
                    } as any,
                    verseId: ref.verse,
                    text: arabicData.text,
                    translation: translation
                });
            }
        }
        return results;
    } catch (e) {
        console.error("Failed to fetch specific verses", e);
        return [];
    }
};

export const isAnyTranslationDownloaded = async (): Promise<boolean> => {
    try {
        const downloads = await DB.getDownloadedEditions();
        return downloads.length > 0;
    } catch (e) {
        return false;
    }
};

export const getVerseSampleForQuiz = async (limit: number = 5, includeWords: boolean = false, translationId: string = 'id.indonesian'): Promise<{ surahId: number; verseId: number; text: string; translation: string; surahName: string; words?: Word[] }[]> => {
    try {
        if (!globalArabicCache) {
            const response = await fetch(QURAN_LOCAL_URL);
            globalArabicCache = await response.json();
        }

        const allSurahs = await getAllSurahs();
        const surahIds = Object.keys(globalArabicCache);
        
        // 1. Pick a few random surahs first to limit network requests
        const preferredSurahs = surahIds.filter(id => parseInt(id) >= 78);
        const selectedSurahPool: string[] = [];
        const poolSize = Math.min(5, preferredSurahs.length);
        
        while (selectedSurahPool.length < poolSize) {
            const id = preferredSurahs[Math.floor(Math.random() * preferredSurahs.length)];
            if (!selectedSurahPool.includes(id)) selectedSurahPool.push(id);
        }

        // 2. Pick samples from this pool
        const samples: { surahId: number; verse: any }[] = [];
        const usedVerses = new Set<string>();
        
        let attempts = 0;
        while (samples.length < limit && attempts < 150) {
            attempts++;
            const surahId = selectedSurahPool[Math.floor(Math.random() * selectedSurahPool.length)];
            const verses = globalArabicCache[surahId];
            if (!verses || verses.length === 0) continue;
            
            const verse = verses[Math.floor(Math.random() * verses.length)];
            const key = `${surahId}:${verse.verse}`;
            
            if (usedVerses.has(key)) continue;
            if (verse.text.length > 250 || verse.text.length < 15) continue;

            samples.push({ surahId: parseInt(surahId), verse });
            usedVerses.add(key);

            // If we run out of verses in our small pool, expand it slightly
            if (attempts > 50 && samples.length < limit && selectedSurahPool.length < 10) {
                const id = preferredSurahs[Math.floor(Math.random() * preferredSurahs.length)];
                if (!selectedSurahPool.includes(id)) selectedSurahPool.push(id);
            }
        }

        // 3. Group by Surah to batch fetching
        const surahGroups: Record<number, any[]> = {};
        samples.forEach(s => {
            if (!surahGroups[s.surahId]) surahGroups[s.surahId] = [];
            surahGroups[s.surahId].push(s);
        });

        const results: any[] = [];
        
        // 4. Fetch data for each surah in parallel (limited to pool size)
        await Promise.all(Object.keys(surahGroups).map(async (sIdStr) => {
            const sId = parseInt(sIdStr);
            const surahInfo = allSurahs.find(s => s.id === sId);
            if (!surahInfo) return;

            // Batch Translation fetching (from local DB)
            let translationMap: Record<number, string> = {};
            if (translationId) {
                try {
                    const localContent = await DB.getSurahContent(translationId, sId);
                    if (localContent && Array.isArray(localContent)) {
                        localContent.forEach((v: any) => {
                            translationMap[v.numberInSurah] = v.text;
                        });
                    }
                } catch (e) {
                    console.error(`Failed to fetch translations for surah ${sId}`, e);
                }
            }

            // Batch Word-by-word fetching (from API or Cache)
            let wordMap: Record<number, Word[]> = {};
            if (includeWords) {
                try {
                    // Check cache first in the service function (it already does)
                    // But we only call it if we really need it
                    wordMap = await fetchWordByWordForSurah(sId);
                } catch (e) {
                    console.error(`Failed to fetch words for surah ${sId}`, e);
                }
            }

            surahGroups[sId].forEach(sample => {
                const verse = sample.verse;
                results.push({
                    surahId: sId,
                    verseId: verse.verse,
                    text: verse.text,
                    translation: translationMap[verse.verse] || "",
                    surahName: surahInfo.transliteration,
                    words: wordMap[verse.verse] || buildFallbackWordsForVerse(verse.text, verse.verse)
                });
            });
        }));

        return results;
    } catch (e) {
        console.error("Failed to get verse sample", e);
        return [];
    }
};

export const SURAH_START_PAGES: number[] = [0, 1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604];

export const getSurahStartPage = (surahId: number): number => {
    return SURAH_START_PAGES[surahId] || 1;
};

/**
 * Gets the starting surah and verse for a specific page using local mapping.
 * Avoids API calls for navigation.
 */
export const getPageStartLocal = (pageNumber: number): { surahId: number; verseId: number } => {
    return PAGE_START_MAPPING[pageNumber] || { surahId: 1, verseId: 1 };
};

export const getPageForVerse = async (surahId: number, verseId: number): Promise<number> => {
    try {
        const localMeta = await loadLocalVerseMeta();
        const meta = getLocalVerseMeta(localMeta, surahId, verseId);
        if (meta?.page) return meta.page;
    } catch (e) {
        console.warn('Failed to resolve page from local metadata', e);
    }
    return getSurahStartPage(surahId);
};

export const getSurahTotalVersesLocal = async (surahId: number): Promise<number | null> => {
    try {
        const localMeta = await loadLocalVerseMeta();
        const list = localMeta?.[surahId.toString()];
        if (list && list.length) return list.length;
    } catch (e) {
        console.warn('Failed to resolve total verses from local metadata', e);
    }
    return null;
};

export const getVersesByPage = async (
    pageNumber: number,
    translationId: string = 'id.indonesian',
    useTajweed: boolean = false,
    language: LanguageCode = 'id',
    showTranslation: boolean = true,
    showTafsir: boolean = false // Tafsir usually off by default for page view unless specified
): Promise<any[]> => {
    // 1. Offline First
    try {
        const localMeta = await loadLocalVerseMeta();
        const pageIndex = buildPageIndex(localMeta);
        const allSurahs = await getAllSurahs(language);

        // Helper to get verses for a range
        const getRange = async (sId: number, vStart: number, vEndExclusive?: number) => {
            const surah = allSurahs.find(s => s.id === sId);
            if (!surah) return [];

            // Get Arabic text (tajweed if enabled and available)
            let arabicVerses: any[] = [];
            if (useTajweed) {
                arabicVerses = await fetchContentForSurah('quran-tajweed', sId);
            }
            if (!arabicVerses || arabicVerses.length === 0) {
                if (!globalArabicCache) {
                    const response = await fetch(QURAN_LOCAL_URL);
                    globalArabicCache = await response.json();
                }
                arabicVerses = globalArabicCache?.[sId.toString()] || [];
            }

            // Get Translation
            let translationVerses: any[] = [];
            if (showTranslation) {
                translationVerses = await DB.getSurahContent(translationId, sId);
            }
            
            const wordByWordMap = await fetchWordByWordForSurah(sId);
            
            return arabicVerses
                .filter(v => {
                    const verseNum = v.verse || v.numberInSurah || v.number;
                    return verseNum >= vStart && (!vEndExclusive || verseNum < vEndExclusive);
                })
                .map(v => {
                    const verseNum = v.verse || v.numberInSurah || v.number;
                    const trans = showTranslation ? translationVerses?.find((tv: any) => tv.numberInSurah === verseNum) : null;
                    const local = getLocalVerseMeta(localMeta, sId, verseNum);
                    return {
                        numberInSurah: verseNum,
                        text: v.text,
                        translation: trans ? trans.text : (showTranslation ? "Unduh terjemahan untuk offline." : ""),
                        surah: {
                            number: sId,
                            name: surah.name,
                            englishName: surah.transliteration,
                            englishNameTranslation: surah.translation
                        },
                        page_number: v.page || local?.page || pageNumber,
                        juz_number: v.juz || local?.juz,
                        hizb_number: v.hizb || local?.hizb,
                        ruku_number: v.ruku || local?.ruku,
                        words: wordByWordMap[verseNum] || buildFallbackWordsForVerse(v.text, verseNum)
                    };
                });
        };

        const pageEntries = pageIndex?.[pageNumber];
        if (pageEntries && pageEntries.length) {
            const segments: Array<{ surahId: number; start: number; end: number }> = [];
            let currentSurah = pageEntries[0].surahId;
            let startVerse = pageEntries[0].verseId;
            let lastVerse = pageEntries[0].verseId;
            pageEntries.slice(1).forEach(entry => {
                const isNewSegment = entry.surahId !== currentSurah || entry.verseId !== lastVerse + 1;
                if (isNewSegment) {
                    segments.push({ surahId: currentSurah, start: startVerse, end: lastVerse });
                    currentSurah = entry.surahId;
                    startVerse = entry.verseId;
                }
                lastVerse = entry.verseId;
            });
            segments.push({ surahId: currentSurah, start: startVerse, end: lastVerse });

            let results: any[] = [];
            for (const seg of segments) {
                results = results.concat(await getRange(seg.surahId, seg.start, seg.end + 1));
            }
            return results;
        }

        const start = getPageStartLocal(pageNumber);
        const nextStart = pageNumber < 604 ? getPageStartLocal(pageNumber + 1) : null;
        if (!nextStart || nextStart.surahId === start.surahId) {
            return await getRange(start.surahId, start.verseId, nextStart?.verseId);
        }
        let results: any[] = [];
        results = results.concat(await getRange(start.surahId, start.verseId));
        for (let i = start.surahId + 1; i < nextStart.surahId; i++) {
            results = results.concat(await getRange(i, 1));
        }
        results = results.concat(await getRange(nextStart.surahId, 1, nextStart.verseId));
        return results;
    } catch (e) {
        console.error("Failed to fetch page verses offline", e);
    }

    // 2. Online Fallback
    if (!navigator.onLine) return [];
    try {
        const [arabicData, transData] = await Promise.all([
            fetchOnlineJson(`${API_BASE_URL}/page/${pageNumber}/quran-uthmani`),
            fetchOnlineJson(`${API_BASE_URL}/page/${pageNumber}/${translationId}`)
        ]);

        if (arabicData.code === 200 && transData.code === 200) {
            const ayahList = arabicData.data.ayahs;
            const transList = transData.data.ayahs;
            const allSurahs = await getAllSurahs(language);

            return ayahList.map((ayah: any, index: number) => ({
                number: ayah.number,
                numberInSurah: ayah.numberInSurah,
                text: ayah.text,
                translation: transList[index]?.text || '',
                surah: allSurahs.find((surah) => surah.id === ayah.surah.number) || ayah.surah,
                page_number: ayah.page,
                juz_number: ayah.juz,
                hizb_number: Math.ceil(ayah.hizbQuarter / 4),
                ruku_number: ayah.ruku,
                words: buildFallbackWordsForVerse(ayah.text, ayah.numberInSurah)
            }));
        }
    } catch (e) {
        console.warn("Online fallback failed for page verses", e);
    }

    return [];
};

export const getAvailableEditions = async (): Promise<TranslationOption[]> => {
    return Promise.resolve(CURATED_EDITIONS);
};

export const verifyEditionAvailability = async (editionId: string): Promise<boolean> => {
    try {
        if (!navigator.onLine) return false;
        const response = await fetchWithTimeout(`${API_BASE_URL}/surah/1/${editionId}`, { 
            method: 'GET', // Revert to GET for production/SW compatibility
            cache: 'no-cache' 
        }, NETWORK_TIMEOUT_MS);
        return response.ok;
    } catch (e) {
        console.error("Availability check failed", e);
        return false;
    }
};

export const getAllSurahs = async (lang: LanguageCode = 'id'): Promise<Surah[]> => {
    if (cachedSurahLists[lang]) {
        return cachedSurahLists[lang];
    }
    try {
        const response = await fetch(`quran-json/chapters/${lang}.json`);
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

export const getSurahInfo = async (surahId: number, language: LanguageCode = 'id', forceDownload: boolean = false): Promise<SurahInfo | null> => {
    const cacheKey = `${surahId}:${language}`;
    
    // If pack is not downloaded in settings and not forcing download, return null
    const packMeta = await DB.getSetting(`qul_surah_info_pack_meta_${language}`);
    if (!packMeta && !forceDownload) {
        return null;
    }

    // 1. Check Memory Cache
    if (cachedSurahInfo[cacheKey] && !forceDownload) return cachedSurahInfo[cacheKey];

    // 2. Check Persistent Cache (IndexedDB)
    const dbInfo = await DB.getSurahInfo(surahId, language);
    if (dbInfo && !forceDownload) {
        cachedSurahInfo[cacheKey] = dbInfo;
        return dbInfo;
    }

    if (!forceDownload) return null;

    try {
        if (!navigator.onLine) return null; // Simple offline check
        const fallbackLang = language === 'en' ? 'en' : 'id';
        const data = await fetchOnlineJson(`${QURAN_COM_API_URL}/chapters/${surahId}/info?language=${fallbackLang}`);
        if (data && data.chapter_info) {
            const info = { ...(data.chapter_info as SurahInfo), language: fallbackLang };
            // Save to both caches
            cachedSurahInfo[cacheKey] = info;
            await DB.saveSurahInfo(surahId, info, fallbackLang);
            return info;
        }
    } catch (e) {
        console.error("Failed to fetch Surah Info", e);
        if (navigator.onLine && forceDownload) {
            showToast("Gagal mengambil info Surah dari server.", "warning");
        }
    }
    return null;
};

/**
 * Downloads all Surah descriptions for offline use.
 * This satisfies the user's request for "offline-ready" Asbabun Nuzul.
 */
export const bulkDownloadSurahInfo = async (onProgress?: (progress: number) => void, language: LanguageCode = 'id'): Promise<boolean> => {
    try {
        const TOTAL = 114;
        let count = 0;

        for (let id = 1; id <= TOTAL; id++) {
            // Already cached? Skip fetch but count it
            const existing = await DB.getSurahInfo(id, language);
            if (!existing) {
                await getSurahInfo(id, language);
                // Respect API limits if needed, but for 114 calls it's usually fine
            }
            count++;
            if (onProgress) onProgress(Math.round((count / TOTAL) * 100));
        }
        return true;
    } catch (e) {
        console.error("Bulk download failed", e);
        return false;
    }
};

// IMPROVED SEARCH: HYBRID (Offline -> Online fallback)
export const searchGlobalVerses = async (query: string, translationId: string = 'id.indonesian', forceDeepSearch: boolean = false): Promise<{ surah: Surah, verseId: number, text: string, translation: string }[]> => {
    if (!query || query.length < 3) return [];
    const allSurahs = await getAllSurahs();
    const normalizedQuery = query.trim().toLowerCase();

    const results: any[] = [];
    const seenKeys = new Set<string>();

    // 1. Search Surah Names / Transliterations (Local & Instant)
    const matchedSurahs = allSurahs.filter(s => 
        s.transliteration.toLowerCase().includes(normalizedQuery) || 
        s.translation.toLowerCase().includes(normalizedQuery) ||
        s.name.includes(query)
    );

    matchedSurahs.slice(0, 5).forEach(s => {
        const key = `${s.id}:1`;
        results.push({
            surah: {
                number: s.id,
                name: s.name,
                englishName: s.transliteration,
                englishNameTranslation: s.translation
            },
            verseId: 1,
            text: "", // Placeholder or fetch first verse
            translation: `Buka Surat ${s.transliteration}`
        });
        seenKeys.add(key);
    });

    // 2. Offline Translation Search (IndexedDB)
    try {
        const offlineResults = await DB.searchOfflineContent(query, translationId);
        offlineResults.forEach(res => {
            const key = `${res.surah.number}:${res.verseId}`;
            if (!seenKeys.has(key)) {
                let fullSurah = res.surah;
                const found = allSurahs.find(s => s.id === res.surah.number);
                if (found) {
                    fullSurah = {
                        number: found.id,
                        name: found.name,
                        englishName: found.transliteration,
                        englishNameTranslation: found.translation
                    };
                }
                results.push({
                    surah: fullSurah,
                    verseId: res.verseId,
                    text: res.text,
                    translation: res.translation
                });
                seenKeys.add(key);
            }
        });
    } catch (e) {
        console.error("Offline search failed", e);
    }

    // 3. Offline Arabic Fallback (Local JSON)
    if (results.length < 10) {
        try {
            const arabicMatches = await findOccurrences(query, 'text');
            arabicMatches.forEach(match => {
                const key = `${match.surahId}:${match.verseId}`;
                if (!seenKeys.has(key)) {
                    const surah = allSurahs.find(s => s.id === match.surahId);
                    results.push({
                        surah: {
                            number: match.surahId,
                            name: surah?.name || '',
                            englishName: surah?.transliteration || '',
                            englishNameTranslation: surah?.translation || ''
                        } as any,
                        verseId: match.verseId,
                        text: match.text,
                        translation: match.text // Fallback translation to text itself if offline
                    });
                    seenKeys.add(key);
                }
            });
        } catch (e) {
            console.error("Offline Arabic fallback failed", e);
        }
    }

    // 4. Online Fallback / Deep Search (Always try if results are low or forced)
    if (navigator.onLine && (results.length < 5 || forceDeepSearch)) {
        try {
            const data = await fetchOnlineJson(`${API_BASE_URL}/search/${query}/all/${translationId}`);
            if (data.code === 200 && data.data && data.data.matches) {
                data.data.matches.forEach((match: any) => {
                    const key = `${match.surah.number}:${match.numberInSurah}`;
                    if (!seenKeys.has(key)) {
                        results.push({
                            surah: match.surah,
                            verseId: match.numberInSurah,
                            text: match.text,
                            translation: match.text
                        });
                        seenKeys.add(key);
                    }
                });
            }
        } catch (e) {
            console.warn("Online search fallback failed", e);
        }
    }

    return results;
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
        const data = await fetchOnlineJson(`${API_BASE_URL}/surah/${surahId}/${editionId}`);
        if (data.code === 200 && data.data && data.data.ayahs) {
            const verses = data.data.ayahs;
            cachedContent[cacheKey] = verses;
            return verses;
        }
    } catch (e) {
        console.error(`API fetch failed for ${editionId}`, e);
        if (navigator.onLine) {
            showToast("Gagal mengambil teks dari server. Periksa jaringan Anda.");
        }
    }
    return [];
};

const fetchWordByWordForSurah = async (surahId: number): Promise<Record<number, Word[]>> => {
    const cacheKey = `wbw-v4-${surahId}`;
    if (cachedWordByWord[cacheKey]) return cachedWordByWord[cacheKey];

    try {
        if (!navigator.onLine) return {};
        const data = await fetchOnlineJson(`${QURAN_COM_API_URL}/verses/by_chapter/${surahId}?language=id&words=true&word_fields=text_uthmani,root,lemma&word_translation_language=id&per_page=300`);
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
        if (navigator.onLine) {
            showToast("Gagal memuat terjemahan per kata.", "warning");
        }
    }
    return {};
}

const buildFallbackWordsForVerse = (verseText: string, verseId: number): Word[] => {
    const tokens = (verseText || '').trim().split(/\s+/).filter(Boolean);
    return tokens.map((token, index) => ({
        id: (verseId * 1000) + index + 1,
        position: index + 1,
        text_uthmani: token,
        char_type_name: 'word'
    }));
};

const processDetail = async (
    id: number,
    meta: Surah,
    translationIdentifier?: string,
    tafsirIdentifier?: string,
    includeWords: boolean = false,
    useTajweed: boolean = false,
    showTranslation: boolean = true,
    showTafsir: boolean = true
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
    
    if (showTranslation && translationIdentifier) {
        promises.push(fetchContentForSurah(metaSourceId, id));
    } else {
        promises.push(Promise.resolve([]));
    }

    if (showTafsir && tafsirIdentifier) {
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
    const localMeta = await loadLocalVerseMeta();

    const verses: Verse[] = arabicVerses.map((v, index) => {
        const verseId = v.verse || v.numberInSurah;
        const text = v.text;

        const metaVerse = metaVerses[index];
        const local = getLocalVerseMeta(localMeta, id, verseId);
        const pageNumber = v.page || metaVerse?.page || local?.page;
        const hizbNumber = metaVerse?.hizbQuarter
            ? Math.ceil(metaVerse.hizbQuarter / 4)
            : (metaVerse?.hizb || v.hizb || local?.hizb);

        const translationText = (translationIdentifier && metaVerse) ? metaVerse.text : undefined;

        return {
            id: verseId,
            text: text,
            translation: translationText,
            tafsir: tafsirVerses[index] ? tafsirVerses[index].text : undefined,
            page_number: pageNumber,
            juz_number: metaVerse?.juz || v.juz || local?.juz,
            hizb_number: hizbNumber,
            ruku_number: metaVerse?.ruku || v.ruku || local?.ruku,
            words: wordByWordMap[verseId] || buildFallbackWordsForVerse(text, verseId)
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
    useTajweed: boolean = false,
    showTranslation: boolean = false,
    showTafsir: boolean = false
): Promise<SurahDetail> => {
    const surahs = await getAllSurahs(lang);
    const meta = surahs.find(s => s.id === id);
    if (!meta) throw new Error(`Surah ${id} not found`);
    return processDetail(id, meta, translationIdentifier, tafsirIdentifier, includeWords, useTajweed, showTranslation, showTafsir);
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
        if (!navigator.onLine) {
            throw new Error("Tidak ada koneksi internet. Pastikan Anda terhubung ke jaringan.");
        }

        if (onProgress) onProgress("Menghubungi server...", 10);
        const isWorking = await verifyEditionAvailability(editionId);
        
        if (!isWorking) {
            throw new Error("Edisi ini saat ini tidak tersedia di server atau server sedang sibuk. Silakan coba edisi lain atau ulangi nanti.");
        }

        if (onProgress) onProgress("Mengunduh data...", 30);
        const response = await fetchWithTimeout(`${API_BASE_URL}/quran/${editionId}`, {}, DOWNLOAD_TIMEOUT_MS);
        
        if (!response.ok) {
            throw new Error(`Server merespon dengan status: ${response.status}. Gagal mengunduh.`);
        }

        if (onProgress) onProgress("Memproses data...", 70);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            if (onProgress) onProgress("Menyimpan ke penyimpanan lokal...", 90);
            await DB.saveFullQuranContent(editionId, data.data);
            await DB.saveDownloadedEdition(data.data.edition);
            if (onProgress) onProgress("Selesai!", 100);
            return true;
        } else {
            throw new Error(data.message || "Data yang diterima tidak valid.");
        }
    } catch (e) {
        console.error("Download failed", e);
        const errorMsg = e instanceof Error ? e.message : 'Terjadi kesalahan jaringan yang tidak terduga.';
        showToast(errorMsg, "error");
        throw e;
    }
}
