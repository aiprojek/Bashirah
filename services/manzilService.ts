import { LanguageCode } from '../types';

export interface ManzilMeta {
  manzil_number: number;
  verses_count: number;
  first_verse_key: string;
  last_verse_key: string;
  verse_mapping: Record<string, string>;
}

export interface ManzilItem {
  id: number;
  nameId: string;
  nameEn: string;
  mnemonic: {
    letter: string;
    letterName: string;
    surahName: string;
  };
  dayLabelId: string;
  dayLabelEn: string;
  versesCount: number;
  firstVerseKey: string;
  lastVerseKey: string;
  startSurahId: number;
  startVerseId: number;
  endSurahId: number;
  endVerseId: number;
  surahRangeText: string;
  surahIds: number[];
  verseMapping: Record<string, string>;
}

// Mnemonics from the Sahabah tradition: Fami bi-shawq (فمي بشوق)
// 1. F (Fa) -> Al-Fatihah (1)
// 2. M (Mim) -> Al-Ma'idah (5)
// 3. Y (Ya) -> Yunus (10)
// 4. B (Ba) -> Bani Isra'il / Al-Isra' (17)
// 5. Sh (Shin) -> Ash-Shu'ara' (26)
// 6. W (Waw) -> Wa-s-Saffat (37)
// 7. Q (Qaf) -> Qaf (50)
const MANZIL_STATIC_INFO: Record<number, {
  nameId: string;
  nameEn: string;
  letter: string;
  letterName: string;
  surahName: string;
  dayLabelId: string;
  dayLabelEn: string;
  surahRangeText: string;
}> = {
  1: {
    nameId: "Manzil 1: Al-Fatihah s/d An-Nisa'",
    nameEn: "Manzil 1: Al-Fatihah to An-Nisa'",
    letter: "ف",
    letterName: "Fa (ف)",
    surahName: "Al-Fatihah",
    dayLabelId: "Hari ke-1 (Jum'at)",
    dayLabelEn: "Day 1 (Friday)",
    surahRangeText: "QS. Al-Fatihah (1) - QS. An-Nisa' (4)"
  },
  2: {
    nameId: "Manzil 2: Al-Ma'idah s/d At-Tawbah",
    nameEn: "Manzil 2: Al-Ma'idah to At-Tawbah",
    letter: "م",
    letterName: "Mim (م)",
    surahName: "Al-Ma'idah",
    dayLabelId: "Hari ke-2 (Sabtu)",
    dayLabelEn: "Day 2 (Saturday)",
    surahRangeText: "QS. Al-Ma'idah (5) - QS. At-Tawbah (9)"
  },
  3: {
    nameId: "Manzil 3: Yunus s/d An-Nahl",
    nameEn: "Manzil 3: Yunus to An-Nahl",
    letter: "ي",
    letterName: "Ya (ي)",
    surahName: "Yunus",
    dayLabelId: "Hari ke-3 (Ahad)",
    dayLabelEn: "Day 3 (Sunday)",
    surahRangeText: "QS. Yunus (10) - QS. An-Nahl (16)"
  },
  4: {
    nameId: "Manzil 4: Al-Isra' s/d Al-Furqan",
    nameEn: "Manzil 4: Al-Isra' to Al-Furqan",
    letter: "ب",
    letterName: "Ba (ب)",
    surahName: "Bani Isra'il (Al-Isra')",
    dayLabelId: "Hari ke-4 (Senin)",
    dayLabelEn: "Day 4 (Monday)",
    surahRangeText: "QS. Al-Isra' (17) - QS. Al-Furqan (25)"
  },
  5: {
    nameId: "Manzil 5: Asy-Syu'ara' s/d Ya-Sin",
    nameEn: "Manzil 5: Ash-Shu'ara' to Ya-Sin",
    letter: "ش",
    letterName: "Syin (ش)",
    surahName: "Asy-Syu'ara'",
    dayLabelId: "Hari ke-5 (Selasa)",
    dayLabelEn: "Day 5 (Tuesday)",
    surahRangeText: "QS. Asy-Syu'ara' (26) - QS. Ya-Sin (36)"
  },
  6: {
    nameId: "Manzil 6: As-Saffat s/d Al-Hujurat",
    nameEn: "Manzil 6: As-Saffat to Al-Hujurat",
    letter: "و",
    letterName: "Waw (و)",
    surahName: "Wash-Shaffat",
    dayLabelId: "Hari ke-6 (Rabu)",
    dayLabelEn: "Day 6 (Wednesday)",
    surahRangeText: "QS. As-Saffat (37) - QS. Al-Hujurat (49)"
  },
  7: {
    nameId: "Manzil 7: Qaf s/d An-Nas",
    nameEn: "Manzil 7: Qaf to An-Nas",
    letter: "ق",
    letterName: "Qaf (ق)",
    surahName: "Qaf",
    dayLabelId: "Hari ke-7 (Kamis)",
    dayLabelEn: "Day 7 (Thursday)",
    surahRangeText: "QS. Qaf (50) - QS. An-Nas (114)"
  }
};

let manzilRawCache: Record<string, ManzilMeta> | null = null;
let manzilListCache: ManzilItem[] | null = null;

export const loadManzilMetadata = async (): Promise<Record<string, ManzilMeta>> => {
  if (manzilRawCache) return manzilRawCache;
  try {
    const res = await fetch('/qul/surah-info/quran-metadata-manzil.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manzilRawCache = await res.json();
    return manzilRawCache || {};
  } catch (err) {
    console.error('Failed to load manzil metadata:', err);
    return {};
  }
};

export const getManzilList = async (): Promise<ManzilItem[]> => {
  if (manzilListCache) return manzilListCache;
  const raw = await loadManzilMetadata();
  const list: ManzilItem[] = [];

  for (let m = 1; m <= 7; m++) {
    const mStr = m.toString();
    const meta = raw[mStr];
    const staticInfo = MANZIL_STATIC_INFO[m];

    if (!meta) continue;

    const [startS, startV] = meta.first_verse_key.split(':').map(Number);
    const [endS, endV] = meta.last_verse_key.split(':').map(Number);
    const surahIds = Object.keys(meta.verse_mapping).map(Number).sort((a, b) => a - b);

    list.push({
      id: m,
      nameId: staticInfo?.nameId || `Manzil ${m}`,
      nameEn: staticInfo?.nameEn || `Manzil ${m}`,
      mnemonic: {
        letter: staticInfo?.letter || '',
        letterName: staticInfo?.letterName || '',
        surahName: staticInfo?.surahName || ''
      },
      dayLabelId: staticInfo?.dayLabelId || `Hari ${m}`,
      dayLabelEn: staticInfo?.dayLabelEn || `Day ${m}`,
      versesCount: meta.verses_count,
      firstVerseKey: meta.first_verse_key,
      lastVerseKey: meta.last_verse_key,
      startSurahId: startS,
      startVerseId: startV,
      endSurahId: endS,
      endVerseId: endV,
      surahRangeText: staticInfo?.surahRangeText || `QS. ${startS}:${startV} - ${endS}:${endV}`,
      surahIds,
      verseMapping: meta.verse_mapping
    });
  }

  manzilListCache = list;
  return list;
};

/**
 * Find which Manzil (1..7) an ayah belongs to
 */
export const getManzilForVerse = (surahId: number, verseId: number): number => {
  if (surahId >= 1 && surahId <= 4) return 1;
  if (surahId >= 5 && surahId <= 9) return 2;
  if (surahId >= 10 && surahId <= 16) return 3;
  if (surahId >= 17 && surahId <= 25) return 4;
  if (surahId >= 26 && surahId <= 36) return 5;
  if (surahId >= 37 && surahId <= 49) return 6;
  if (surahId >= 50 && surahId <= 114) return 7;
  return 1;
};
