import * as DB from './db';
import { AyahMorphology, LanguageCode, SurahInfo, WordMorphology } from '../types';

type MorphologyPackEntry = {
  surahId: number;
  verseId: number;
  wordPosition: number;
  token?: string;
  partOfSpeech?: string;
  grammar?: string;
  morphology?: string;
  root?: string;
  lemma?: string;
  stem?: string;
  description?: string;
  source?: string;
};

type SurahInfoPackEntry = {
  surahId: number;
  text: string;
  source: string;
  short_text?: string;
  summary?: string;
  revelation_background?: string;
  main_themes?: string[];
  key_topics?: string[];
  language?: string;
};

type AyahMorphologyPackEntry = {
  surahId: number;
  verseId: number;
  rootText?: string;
  lemmaText?: string;
  stemText?: string;
  source?: string;
};

const LOCAL_QUL_MORPHOLOGY_PACK_URL = '/qul/word-morphology-pack.json';
const LOCAL_QUL_AYAH_MORPHOLOGY_PACK_URL = '/qul/ayah-morphology-pack.json';
const getLocalQulSurahInfoPackUrl = (language: LanguageCode = 'id') => `/qul/surah-info/surah-info-${language}.json`;

const normalizeMorphologyEntry = (entry: MorphologyPackEntry): WordMorphology => ({
  surahId: entry.surahId,
  verseId: entry.verseId,
  wordPosition: entry.wordPosition,
  token: entry.token,
  partOfSpeech: entry.partOfSpeech,
  grammar: entry.grammar,
  morphology: entry.morphology,
  root: entry.root,
  lemma: entry.lemma,
  stem: entry.stem,
  description: entry.description,
  source: entry.source || 'QUL',
});

const normalizeSurahInfoEntry = (entry: SurahInfoPackEntry): SurahInfo => ({
  text: entry.text,
  source: entry.source || 'QUL',
  short_text: entry.short_text,
  summary: entry.summary,
  revelation_background: entry.revelation_background,
  main_themes: entry.main_themes || [],
  key_topics: entry.key_topics || [],
  language: entry.language || 'id',
});

const normalizeAyahMorphologyEntry = (entry: AyahMorphologyPackEntry): AyahMorphology => ({
  surahId: entry.surahId,
  verseId: entry.verseId,
  rootText: entry.rootText,
  lemmaText: entry.lemmaText,
  stemText: entry.stemText,
  source: entry.source || 'QUL',
});

type RawSurahInfoMapEntry = {
  surah_number?: number;
  surah_name?: string;
  text?: string;
  short_text?: string;
};

const stripHtml = (html: string = '') =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const extractHtmlSection = (html: string, headings: string[]) => {
  if (!html) return undefined;
  const joined = headings
    .map((heading) => heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const pattern = new RegExp(
    `<h[1-6][^>]*>\\s*(?:${joined})\\s*:?\\s*<\\/h[1-6]>([\\s\\S]*?)(?=<h[1-6][^>]*>|$)`,
    'i'
  );
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : undefined;
};

const normalizeRawSurahInfoMap = (
  data: Record<string, RawSurahInfoMapEntry>,
  language: LanguageCode
): SurahInfoPackEntry[] => {
  return Object.entries(data)
    .map(([key, value]) => {
      const surahId = Number(value.surah_number || key);
      const rawText = value.text || '';
      const summary = stripHtml(value.short_text || '');
      const revelation_background = extractHtmlSection(rawText, [
        'Period of Revelation',
        'Historical Background',
        'Latar Belakang',
        'Asbabun Nuzul',
        'Sebab Turun',
      ]);
      const themeSection = extractHtmlSection(rawText, ['Theme', 'Tema', 'Pokok-Pokok Isi', 'Pokok Pokok Isi']);

      return {
        surahId,
        text: rawText,
        short_text: value.short_text || summary,
        summary,
        revelation_background,
        main_themes: themeSection ? [themeSection] : [],
        key_topics: [],
        source: 'QUL',
        language,
      };
    })
    .filter((entry) => Number.isFinite(entry.surahId) && entry.surahId > 0 && !!entry.text);
};

export const importWordMorphologyPack = async (entries: MorphologyPackEntry[]) => {
  const normalized = entries.map(normalizeMorphologyEntry);
  await DB.bulkSaveWordMorphology(normalized);
  return normalized.length;
};

export const importAyahMorphologyPack = async (entries: AyahMorphologyPackEntry[]) => {
  const normalized = entries.map(normalizeAyahMorphologyEntry);
  await DB.bulkSaveAyahMorphology(normalized);
  return normalized.length;
};

export const importSurahInfoPack = async (entries: SurahInfoPackEntry[]) => {
  for (const entry of entries) {
    const normalized = normalizeSurahInfoEntry(entry);
    await DB.saveSurahInfo(entry.surahId, normalized, normalized.language || entry.language || 'id');
  }
  return entries.length;
};

export const downloadWordMorphologyPack = async (url: string = LOCAL_QUL_MORPHOLOGY_PACK_URL) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Morphology pack tidak ditemukan.');
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Format morphology pack tidak valid.');
  }
  return importWordMorphologyPack(data);
};

export const downloadAyahMorphologyPack = async (url: string = LOCAL_QUL_AYAH_MORPHOLOGY_PACK_URL) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Pack morphology ayat tidak ditemukan.');
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Format pack morphology ayat tidak valid.');
  }
  return importAyahMorphologyPack(data);
};

export const downloadSurahInfoPack = async (language: LanguageCode = 'id', url?: string) => {
  const targetUrl = url || getLocalQulSurahInfoPackUrl(language);
  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error('Surah info pack tidak ditemukan.');
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return importSurahInfoPack(data.map((entry) => ({ ...entry, language: entry.language || language })));
  }
  if (data && typeof data === 'object') {
    return importSurahInfoPack(normalizeRawSurahInfoMap(data as Record<string, RawSurahInfoMapEntry>, language));
  }
  throw new Error('Format surah info pack tidak valid.');
};

export const getWordMorphologyDetails = async (surahId: number, verseId: number, wordPosition: number) => {
  return DB.getWordMorphology(surahId, verseId, wordPosition);
};

export const getAyahMorphologyDetails = async (surahId: number, verseId: number) => {
  return DB.getAyahMorphology(surahId, verseId);
};
