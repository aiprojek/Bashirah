export interface RawPhraseSource {
  key: string; // e.g. "2:23"
  from: number; // 1-indexed word start
  to: number; // 1-indexed word end
}

export interface RawPhraseItem {
  surahs: number;
  ayahs: number;
  count: number;
  source: RawPhraseSource;
  ayah: Record<string, number[][]>; // key -> [[from, to], ...]
}

export interface MutashabihatPhrase {
  id: string;
  arabicText: string;
  surahsCount: number;
  ayahsCount: number;
  occurrencesCount: number;
  sourceKey: string;
  sourceFrom: number;
  sourceTo: number;
  matchedAyahKeys: string[];
  ayahPositions: Record<string, number[][]>;
}

export interface AyahPhraseOccurrence {
  phraseId: string;
  arabicText: string;
  totalOccurrences: number;
  surahsCount: number;
  ayahsCount: number;
  currentWordRanges: number[][];
  otherAyahs: Array<{
    surahId: number;
    verseId: number;
    ayahKey: string;
    wordRanges: number[][];
  }>;
}

let phrasesCache: Record<string, RawPhraseItem> | null = null;
let phraseVersesCache: Record<string, number[]> | null = null;
let quranTextCache: Record<string, Array<{ chapter: number; verse: number; text: string }>> | null = null;
let phraseArabicTextCache: Record<string, string> = {};

// Load raw phrases
export const loadPhrases = async (): Promise<Record<string, RawPhraseItem>> => {
  if (phrasesCache) return phrasesCache;
  try {
    const res = await fetch('/qul/matching ayah/phrases.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    phrasesCache = await res.json();
    return phrasesCache || {};
  } catch (err) {
    console.error('Failed to load phrases.json:', err);
    return {};
  }
};

// Load verse-to-phrases mapping
export const loadPhraseVerses = async (): Promise<Record<string, number[]>> => {
  if (phraseVersesCache) return phraseVersesCache;
  try {
    const res = await fetch('/qul/matching ayah/phrase_verses.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    phraseVersesCache = await res.json();
    return phraseVersesCache || {};
  } catch (err) {
    console.error('Failed to load phrase_verses.json:', err);
    return {};
  }
};

// Load Quran text for word slicing
export const loadQuranText = async (): Promise<Record<string, Array<{ chapter: number; verse: number; text: string }>>> => {
  if (quranTextCache) return quranTextCache;
  try {
    const res = await fetch('/quran-json/quran.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    quranTextCache = await res.json();
    return quranTextCache || {};
  } catch (err) {
    console.error('Failed to load quran.json for phrases:', err);
    return {};
  }
};

// Extract Arabic text for a phrase
export const getArabicTextForPhrase = async (phraseId: string, phraseItem: RawPhraseItem): Promise<string> => {
  if (phraseArabicTextCache[phraseId]) {
    return phraseArabicTextCache[phraseId];
  }

  const quran = await loadQuranText();
  const [sIdStr, vIdStr] = phraseItem.source.key.split(':');
  const surahList = quran[sIdStr];

  if (!surahList) return '';
  const verseIndex = parseInt(vIdStr, 10) - 1;
  const verseObj = surahList[verseIndex];
  if (!verseObj || !verseObj.text) return '';

  const words = verseObj.text.split(/\s+/);
  const from = Math.max(0, phraseItem.source.from - 1);
  const to = phraseItem.source.to;
  const sliced = words.slice(from, to).join(' ');

  phraseArabicTextCache[phraseId] = sliced;
  return sliced;
};

/**
 * Get all Mutashabihat phrases for a specific verse (e.g. 2:23)
 */
export const getAyahMutashabihatPhrases = async (
  surahId: number,
  verseId: number
): Promise<AyahPhraseOccurrence[]> => {
  const [phrasesMap, phraseVersesMap] = await Promise.all([
    loadPhrases(),
    loadPhraseVerses(),
  ]);

  const verseKey = `${surahId}:${verseId}`;
  const phraseIds = phraseVersesMap[verseKey] || [];

  if (phraseIds.length === 0) return [];

  const results: AyahPhraseOccurrence[] = [];

  for (const pId of phraseIds) {
    const pIdStr = pId.toString();
    const phrase = phrasesMap[pIdStr];
    if (!phrase) continue;

    const arabicText = await getArabicTextForPhrase(pIdStr, phrase);
    const currentWordRanges = phrase.ayah[verseKey] || [];

    // Gather all other ayahs that share this phrase
    const otherAyahs: AyahPhraseOccurrence['otherAyahs'] = [];
    for (const [otherKey, ranges] of Object.entries(phrase.ayah)) {
      if (otherKey === verseKey) continue;
      const [sStr, vStr] = otherKey.split(':');
      otherAyahs.push({
        surahId: parseInt(sStr, 10),
        verseId: parseInt(vStr, 10),
        ayahKey: otherKey,
        wordRanges: ranges,
      });
    }

    // Sort other ayahs in Quran order
    otherAyahs.sort((a, b) => {
      if (a.surahId !== b.surahId) return a.surahId - b.surahId;
      return a.verseId - b.verseId;
    });

    results.push({
      phraseId: pIdStr,
      arabicText,
      totalOccurrences: phrase.count,
      surahsCount: phrase.surahs,
      ayahsCount: phrase.ayahs,
      currentWordRanges,
      otherAyahs,
    });
  }

  // Sort by highest occurrences first
  results.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  return results;
};

/**
 * Get top phrases across the entire Quran sorted by frequency
 */
export const getAllTopPhrases = async (
  limit: number = 100,
  minCount: number = 2
): Promise<MutashabihatPhrase[]> => {
  const phrasesMap = await loadPhrases();
  const entries = Object.entries(phrasesMap);

  // Filter and sort by count descending
  const sorted = entries
    .filter(([_, p]) => p.count >= minCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  const results: MutashabihatPhrase[] = [];

  for (const [id, phrase] of sorted) {
    const arabicText = await getArabicTextForPhrase(id, phrase);
    results.push({
      id,
      arabicText,
      surahsCount: phrase.surahs,
      ayahsCount: phrase.ayahs,
      occurrencesCount: phrase.count,
      sourceKey: phrase.source.key,
      sourceFrom: phrase.source.from,
      sourceTo: phrase.source.to,
      matchedAyahKeys: Object.keys(phrase.ayah),
      ayahPositions: phrase.ayah,
    });
  }

  return results;
};
