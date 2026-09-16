import * as DB from './db';
import { CURATED_EDITIONS, TranslationOption } from '../types';

const API_BASE_URL = 'https://api.alquran.cloud/v1';

// Cache in-memory for loaded ayah tafsirs
const memoryTafsirCache = new Map<string, string>();

export interface TafsirResult {
  text: string | null;
  editionId: string;
  editionName: string;
  isDownloaded: boolean;
  source: 'offline' | 'online' | 'none';
  errorMessage?: string;
}

export const getTafsirOptions = (): TranslationOption[] => {
  return CURATED_EDITIONS.filter((e) => e.type === 'tafsir');
};

export const getDefaultTafsirId = (lang: string = 'id'): string => {
  if (lang === 'en') return 'en.jalalayn';
  if (lang === 'ar') return 'ar.jalalayn';
  return 'id.jalalayn';
};

export const getTafsirName = (editionId: string): string => {
  const found = CURATED_EDITIONS.find((e) => e.identifier === editionId);
  return found ? found.name : editionId;
};

/**
 * Fetch tafsir for a single verse.
 * Checks:
 * 1. In-memory cache
 * 2. IndexedDB (offline database)
 * 3. Online Al-Quran Cloud API fallback (if internet is available)
 */
export const getAyahTafsir = async (
  surahId: number,
  verseNumber: number,
  preferredEditionId?: string,
  appLang: string = 'id'
): Promise<TafsirResult> => {
  const editionId = preferredEditionId || getDefaultTafsirId(appLang);
  const editionName = getTafsirName(editionId);
  const cacheKey = `${editionId}_${surahId}_${verseNumber}`;

  // 1. Check in-memory cache
  if (memoryTafsirCache.has(cacheKey)) {
    const cachedText = memoryTafsirCache.get(cacheKey) || '';
    return {
      text: cachedText,
      editionId,
      editionName,
      isDownloaded: true,
      source: 'offline',
    };
  }

  // 2. Check IndexedDB
  let isDownloaded = false;
  try {
    isDownloaded = await DB.isEditionDownloaded(editionId);
  } catch (e) {
    console.warn('Checking download status failed:', e);
  }

  try {
    const localContent = await DB.getSurahContent(editionId, surahId);
    if (localContent && Array.isArray(localContent) && localContent.length > 0) {
      const match = localContent.find(
        (v: any) => v.numberInSurah === verseNumber || v.number === verseNumber
      );
      if (match && match.text) {
        memoryTafsirCache.set(cacheKey, match.text);
        return {
          text: match.text,
          editionId,
          editionName,
          isDownloaded: true,
          source: 'offline',
        };
      }
    }
  } catch (e) {
    console.warn(`Reading local tafsir content failed for ${editionId}:`, e);
  }

  // 3. Fallback to Online API if connected
  if (navigator.onLine) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${API_BASE_URL}/ayah/${surahId}:${verseNumber}/${editionId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && json.data && json.data.text) {
          const tafsirText = json.data.text;
          memoryTafsirCache.set(cacheKey, tafsirText);
          return {
            text: tafsirText,
            editionId,
            editionName,
            isDownloaded: false,
            source: 'online',
          };
        }
      }
    } catch (netErr: any) {
      console.warn('Online tafsir fallback failed:', netErr);
    }
  }

  // If not found offline and couldn't fetch online
  return {
    text: null,
    editionId,
    editionName,
    isDownloaded,
    source: 'none',
    errorMessage: isDownloaded
      ? (appLang === 'en' ? 'Tafsir text not found for this verse.' : 'Teks tafsir tidak ditemukan untuk ayat ini.')
      : (appLang === 'en'
          ? 'Tafsir data is not downloaded yet and device is offline.'
          : 'Data tafsir belum diunduh dan perangkat sedang offline. Silakan unduh di Pengaturan > Tafsir.'),
  };
};
