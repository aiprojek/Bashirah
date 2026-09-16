export interface MatchingAyahMatch {
  matched_ayah_key: string; // e.g. "27:30"
  matched_words_count: number;
  coverage: number;
  score: number;
  match_words: number[][];
}

let matchingAyahCache: Record<string, MatchingAyahMatch[]> | null = null;

export const loadMatchingAyahs = async (): Promise<Record<string, MatchingAyahMatch[]>> => {
  if (matchingAyahCache) return matchingAyahCache;
  try {
    const res = await fetch('/qul/matching ayah/matching-ayah.json');
    if (!res.ok) return {};
    matchingAyahCache = await res.json();
    return matchingAyahCache || {};
  } catch (err) {
    console.error('Failed to load matching ayahs:', err);
    return {};
  }
};

export const getMatchingAyahsForVerse = async (surahId: number, verseId: number): Promise<MatchingAyahMatch[]> => {
  const data = await loadMatchingAyahs();
  const key = `${surahId}:${verseId}`;
  return data[key] || [];
};
