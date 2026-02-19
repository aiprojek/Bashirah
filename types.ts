
export type LanguageCode = 'id' | 'en';

export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses?: Verse[];
}

export interface Verse {
  id: number;
  text: string;
  translation?: string;
  tafsir?: string;
  page_number?: number;
  words?: Word[];
}

export interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  text_indopak?: string;
  translation?: { text: string; language_name: string };
  transliteration?: { text: string; language_name: string };
  char_type_name: string;
  audio_url?: string;
  root?: string;
  lemma?: string;
  [key: string]: any;
}

export interface SurahDetail extends Surah {
  verses: Verse[];
}

export interface SurahInfo {
    text: string;
    source: string;
    short_text?: string;
}

export interface TranslationOption {
  identifier: string;
  name: string;
  language: string;
  englishName: string;
  format: string;
  type: 'translation' | 'tafsir' | 'quran';
  approxSize?: string;
}

export interface Reciter {
    id: string;
    name: string;
    path: string;
    style?: string;
}

export interface MushafEdition {
    id: string;
    name: string;
    type: string;
    format: string;
    provider: string;
    description?: string;
}

export interface LastReadData {
    surahId: number;
    surahName: string;
    verseId: number;
    pageNumber: number;
    timestamp: number;
}

export interface BookmarkData {
    surahId: number;
    surahName: string;
    verseId: number;
    timestamp: number;
}

export interface NoteData {
    id: string;
    surahId: number;
    surahName: string;
    verseId: number;
    text: string;
    timestamp: number;
}

export interface KhatamTarget {
    isActive: boolean;
    startDate: number;
    targetDays: number;
    currentPage: number;
    lastUpdated: number;
}

export interface ReadingLog {
    date: string;
    pagesRead: number;
}

export interface QuizScore {
    id: string;
    playerName: string;
    score: number;
    totalQuestions: number;
    timestamp: number;
}

export interface TadabburData {
    id: string;
    title: string;
    content: string;
    tag: TadabburTag;
    timestamp: number;
}

export type TadabburTag = 'syukur' | 'sabar' | 'istighfar' | 'doa' | 'ibrah' | 'umum';

export interface Topic {
    id: string;
    title: string;
    description: string;
    iconName: string;
    references: {
        surahId: number;
        surahName: string;
        verseId: number;
    }[];
}

export interface EmotionTopic {
    id: string;
    label: string;
    icon: string;
    description: string;
    verses: {
        surahId: number;
        verseId: number;
        surahName: string;
    }[];
}

export interface QuranDua {
    id: string;
    title: string;
    category: 'rabbana' | 'rabbi' | 'other';
    surahId: number;
    surahName: string;
    verseId: number;
    arabic: string;
    translation: string;
}

export type MemorizationLevel = 'normal' | 'first-last' | 'ghost' | 'random';

export const APP_LANGUAGES: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export const RECITERS: Reciter[] = [
    { id: 'alafasy', name: 'Mishary Rashid Al-Afasy', path: 'Alafasy_128kbps' },
    { id: 'sudais', name: 'Abdurrahmaan As-Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
    { id: 'ghamadi', name: 'Saad Al-Ghamdi', path: 'Ghamadi_40kbps' },
    { id: 'shuraym', name: 'Saood Ash-Shuraym', path: 'Saood_ash-Shuraym_128kbps' },
    { id: 'maher', name: 'Maher Al Muaiqly', path: 'Maher_AlMuaiqly_64kbps' },
    { id: 'husary', name: 'Mahmoud Khalil Al-Husary', path: 'Husary_128kbps' },
    { id: 'husary_muj', name: 'Al-Husary (Mujawwad)', path: 'Husary_Mujawwad_64kbps' },
    { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi', path: 'Minshawy_Murattal_128kbps' },
    { id: 'minshawi_muj', name: 'Al-Minshawi (Mujawwad)', path: 'Minshawy_Mujawwad_192kbps' },
    { id: 'basit', name: 'Abdul Basit (Murattal)', path: 'Abdul_Basit_Murattal_64kbps' },
    { id: 'basit_muj', name: 'Abdul Basit (Mujawwad)', path: 'Abdul_Basit_Mujawwad_128kbps' },
    { id: 'hudaify', name: 'Ali Al-Hudaify', path: 'Hudhaify_128kbps' },
    { id: 'ajamy', name: 'Ahmed Al-Ajamy', path: 'Ahmed_ibn_Ali_al-Ajamy_128kbps' },
    { id: 'basfar', name: 'Abdullah Basfar', path: 'Abdullah_Basfar_192kbps' },
    { id: 'shatri', name: 'Abu Bakr Ash-Shatri', path: 'Abu_Bakr_Ash-Shatri_128kbps' },
    { id: 'juhany', name: 'Abdullah Awad Al-Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
    { id: 'hani', name: 'Hani Ar-Rifai', path: 'Hani_Rifai_192kbps' },
    { id: 'matrud', name: 'Abdullah Al-Matrud', path: 'Abdullah_Matroud_128kbps' },
    { id: 'budair', name: 'Salah Budair', path: 'Salah_Al_Budair_128kbps' },
    { id: 'jaber', name: 'Ali Jaber', path: 'Ali_Jaber_64kbps' },
];

export const MUSHAF_EDITIONS: MushafEdition[] = [
    { 
        id: 'madani', 
        name: 'Madani (Standar)', 
        type: 'images', 
        format: 'png', 
        provider: 'https://android.quran.com/data/width_1024/page',
        description: 'Mushaf Madinah standar internasional.'
    },
    { 
        id: 'indopak', 
        name: 'IndoPak (Asia)', 
        type: 'images', 
        format: 'jpg', 
        provider: 'https://android.quran.com/data/13_lines/page',
        description: 'Gaya penulisan umum di Indonesia & Pakistan.'
    }
];

export const DEFAULT_EDITIONS: TranslationOption[] = [
  { identifier: 'id.indonesian', name: 'Bahasa Indonesia', language: 'id', englishName: 'Indonesian Ministry of Religious Affairs', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'en.sahih', name: 'Saheeh International', language: 'en', englishName: 'Saheeh International', format: 'text', type: 'translation', approxSize: '1.2 MB' },
];

export const TAJWEED_EDITION: TranslationOption = {
    identifier: 'quran-tajweed',
    name: 'Tajwid Berwarna',
    language: 'ar',
    englishName: 'Tajweed',
    format: 'text',
    type: 'quran',
    approxSize: '1.5 MB'
};

export const CURATED_EDITIONS: TranslationOption[] = [
  { identifier: 'id.indonesian', name: 'Kemenag RI', language: 'id', englishName: 'Indonesian Ministry of Religious Affairs', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'en.sahih', name: 'Saheeh International', language: 'en', englishName: 'Saheeh International', format: 'text', type: 'translation', approxSize: '1.2 MB' },
  { identifier: 'en.arberry', name: 'Arberry', language: 'en', englishName: 'Arberry', format: 'text', type: 'translation', approxSize: '1.0 MB' },
  { identifier: 'en.pickthall', name: 'Pickthall', language: 'en', englishName: 'Pickthall', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'en.yusufali', name: 'Yusuf Ali', language: 'en', englishName: 'Yusuf Ali', format: 'text', type: 'translation', approxSize: '1.3 MB' },
  { identifier: 'fr.hamidullah', name: 'Français (Hamidullah)', language: 'fr', englishName: 'Hamidullah', format: 'text', type: 'translation', approxSize: '1.2 MB' },
  { identifier: 'es.cortes', name: 'Español (Cortes)', language: 'es', englishName: 'Cortes', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'ru.kuliev', name: 'Русский (Kuliev)', language: 'ru', englishName: 'Kuliev', format: 'text', type: 'translation', approxSize: '1.4 MB' },
  { identifier: 'tr.diyanet', name: 'Türkçe (Diyanet)', language: 'tr', englishName: 'Diyanet Isleri', format: 'text', type: 'translation', approxSize: '1.0 MB' },
  { identifier: 'zh.jian', name: '中文 (Ma Jian)', language: 'zh', englishName: 'Ma Jian', format: 'text', type: 'translation', approxSize: '900 KB' },
  { identifier: 'ur.jalandhry', name: 'اردو (Jalandhry)', language: 'ur', englishName: 'Jalandhry', format: 'text', type: 'translation', approxSize: '1.3 MB' },
  { identifier: 'id.jalalayn', name: 'Tafsir Jalalayn (Indo)', language: 'id', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.5 MB' },
  { identifier: 'ar.jalalayn', name: 'Tafsir Jalalayn (Arab)', language: 'ar', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.2 MB' },
  { identifier: 'en.jalalayn', name: 'Tafsir Jalalayn (Inggris)', language: 'en', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.4 MB' },
  { identifier: 'ar.ibnkathir', name: 'Tafsir Ibnu Katsir (Arab)', language: 'ar', englishName: 'Ibn Kathir', format: 'text', type: 'tafsir', approxSize: '6.5 MB' },
  { identifier: 'ar.muyassar', name: 'Tafsir Al-Muyassar (Arab)', language: 'ar', englishName: 'King Fahad Quran Complex', format: 'text', type: 'tafsir', approxSize: '3.8 MB' },
  { identifier: 'ar.tabari', name: 'Tafsir Al-Tabari (Arab)', language: 'ar', englishName: 'Al-Tabari', format: 'text', type: 'tafsir', approxSize: '8.1 MB' },
  { identifier: 'ar.qurtubi', name: 'Tafsir Al-Qurtubi (Arab)', language: 'ar', englishName: 'Al-Qurtubi', format: 'text', type: 'tafsir', approxSize: '9.2 MB' },
  { identifier: 'ar.baghawy', name: 'Tafsir Al-Baghawy (Arab)', language: 'ar', englishName: 'Al-Baghawy', format: 'text', type: 'tafsir', approxSize: '5.5 MB' },
  { identifier: 'ar.sadi', name: 'Tafsir As-Sadi (Arab)', language: 'ar', englishName: 'As-Sadi', format: 'text', type: 'tafsir', approxSize: '4.2 MB' },
];
