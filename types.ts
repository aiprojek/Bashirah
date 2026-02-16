
export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  link?: string;
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  text_uthmani: string;
  root?: string; // Akar kata (misal: "k-t-b")
  lemma?: string; // Kata dasar kamus (misal: "kataba")
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
    language_name: string;
  };
}

export interface Verse {
  id: number;
  text: string;
  translation?: string;
  tafsir?: string;
  page_number?: number; // New field for stats tracking
  words?: Word[]; 
}

export interface SurahDetail extends Surah {
  verses: Verse[];
}

export interface SurahInfo {
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string; // HTML Content
}

// New Types for Storage
export interface LastReadData {
  surahId: number;
  surahName: string;
  verseId: number;
  pageNumber?: number; // New field to track progress
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

export type TadabburTag = 'syukur' | 'sabar' | 'istighfar' | 'doa' | 'ibrah' | 'umum';

export interface TadabburData {
  id: string;
  title: string;
  content: string;
  tag: TadabburTag;
  timestamp: number;
}

export interface QuizScore {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

// Memorization Levels
export type MemorizationLevel = 'normal' | 'first-last' | 'ghost' | 'random';

// Topic Index Types
export interface TopicReference {
  surahId: number;
  surahName: string;
  verseId: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  iconName: string; // string identifier for icon component
  references: TopicReference[];
}

// Dua Types
export interface QuranDua {
  id: string;
  title: string;
  category: 'rabbana' | 'rabbi';
  surahId: number;
  surahName: string;
  verseId: number;
  arabic: string;
  translation: string;
}

// --- MUSHAF TYPES ---
export interface MushafEdition {
  id: string;
  name: string;
  description: string;
  type: 'madani' | 'indopak' | 'warsh' | 'qaloon';
  provider: string;
}

export const MUSHAF_EDITIONS: MushafEdition[] = [
  { 
    id: 'madani', 
    name: 'Madani (Standar)', 
    description: 'Standar internasional, khat Utsmani, rapi dan tipis.', 
    type: 'madani',
    provider: 'https://android.quran.com/data/width_1024/page' 
  },
  { 
    id: 'indopak', 
    name: 'IndoPak (Asia)', 
    description: 'Khat tebal, umum digunakan di Indonesia & Pakistan.', 
    type: 'indopak',
    provider: 'https://android.quran.com/data/width_1024/indopak/page'
  },
  { 
    id: 'warsh', 
    name: 'Warsh (Afrika Utara)', 
    description: 'Riwayat Warsh an-Nafi\', populer di Maroko & Aljazair.', 
    type: 'warsh',
    provider: 'https://android.quran.com/data/width_1024/warsh/page'
  },
  { 
    id: 'qaloon', 
    name: 'Qaloon (Libya)', 
    description: 'Riwayat Qaloon an-Nafi\', populer di Libya & Tunisia.', 
    type: 'qaloon',
    provider: 'https://android.quran.com/data/width_1024/qaloon/page'
  }
];

// --- KHATAM & HABIT TRACKER TYPES ---
export interface KhatamTarget {
  isActive: boolean;
  startDate: number; // Timestamp
  targetDays: number; // e.g. 30
  currentPage: number; // 1 - 604
  lastUpdated: number;
}

export interface ReadingLog {
  date: string; // Format YYYY-MM-DD
  pagesRead: number;
}

export type LanguageCode = 'id' | 'en' | 'ar' | 'bn' | 'es' | 'fr' | 'ru' | 'sv' | 'tr' | 'ur' | 'zh';

// UI Languages (For Surah Names & App Interface) - Uses Local JSON
export const APP_LANGUAGES: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export interface TranslationOption {
  identifier: string; // API identifier
  name: string;
  language: string;
  englishName: string;
  format: string;
  type: string; // 'translation' | 'tafsir'
  approxSize: string; // New field for UI display (e.g., "1.2 MB")
}

// Reciter Interface
export interface Reciter {
  id: string;
  name: string;
  path: string; // URL path segment for verses.quran.com or everyayah
  style?: string;
}

export const RECITERS: Reciter[] = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy', path: 'Alafasy_128kbps' },
  { id: 'huthaify', name: 'Ali Al-Huthaify', path: 'Hudhaify_128kbps' },
  { id: 'sudais', name: 'Abdurrahmaan As-Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'shuraim', name: 'Saood Ash-Shuraim', path: 'Saood_ash-Shuraym_128kbps' },
  { id: 'ghamdi', name: 'Saad Al Ghamdi', path: 'Ghamadi_40kbps' },
  { id: 'maher', name: 'Maher Al Muaiqly', path: 'MaherAlMuaiqly_64kbps' },
  { id: 'basit', name: 'Abdul Basit (Murattal)', path: 'Abdul_Basit_Murattal_64kbps', style: 'Murattal' },
  { id: 'basit_mujawwad', name: 'Abdul Basit (Mujawwad)', path: 'Abdul_Basit_Mujawwad_128kbps', style: 'Mujawwad' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', path: 'Husary_128kbps' },
  { id: 'husary_mujawwad', name: 'Mahmoud Khalil Al-Husary (Mujawwad)', path: 'Husary_Mujawwad_64kbps', style: 'Mujawwad' },
  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi', path: 'Minshawy_Murattal_128kbps', style: 'Murattal' },
  { id: 'minshawi_mujawwad', name: 'Mohamed Siddiq Al-Minshawi (Mujawwad)', path: 'Minshawy_Mujawwad_192kbps', style: 'Mujawwad' },
  { id: 'tablawi', name: 'Mohammad al Tablaway', path: 'Mohammad_al_Tablaway_128kbps' },
  { id: 'abu_bakr', name: 'Abu Bakr Ash-Shatri', path: 'Abu_Bakr_Ash-Shatri_128kbps' },
  { id: 'juhany', name: 'Abdullah Awad Al-Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
  { id: 'hani', name: 'Hani Ar-Rifai', path: 'Hani_Rifai_192kbps' },
  { id: 'ajamy', name: 'Ahmed ibn Ali al-Ajamy', path: 'Ahmed_ibn_Ali_al-Ajamy_128kbps' },
  { id: 'ayyoub', name: 'Muhammad Ayyub', path: 'Muhammad_Ayyoub_128kbps' },
  { id: 'jibreel', name: 'Muhammad Jibreel', path: 'Muhammad_Jibreel_128kbps' },
];

// Fallback defaults if API fails or offline initially
export const DEFAULT_EDITIONS: TranslationOption[] = [
  { identifier: 'id.indonesian', name: 'Bahasa Indonesia', language: 'id', englishName: 'Indonesian Ministry of Religious Affairs', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'en.sahih', name: 'Saheeh International', language: 'en', englishName: 'Saheeh International', format: 'text', type: 'translation', approxSize: '1.2 MB' },
];

// Curated list of high quality editions requested by user
export const CURATED_EDITIONS: TranslationOption[] = [
  // ... (keep existing content)
  // Indonesia
  { identifier: 'id.indonesian', name: 'Kemenag RI', language: 'id', englishName: 'Indonesian Ministry of Religious Affairs', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'id.muntakhab', name: 'Muntakhab (Quraish Shihab)', language: 'id', englishName: 'Muntakhab', format: 'text', type: 'translation', approxSize: '1.3 MB' },

  // English
  { identifier: 'en.sahih', name: 'Saheeh International', language: 'en', englishName: 'Saheeh International', format: 'text', type: 'translation', approxSize: '1.2 MB' },
  { identifier: 'en.arberry', name: 'Arberry', language: 'en', englishName: 'Arberry', format: 'text', type: 'translation', approxSize: '1.0 MB' },
  { identifier: 'en.pickthall', name: 'Pickthall', language: 'en', englishName: 'Pickthall', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'en.yusufali', name: 'Yusuf Ali', language: 'en', englishName: 'Yusuf Ali', format: 'text', type: 'translation', approxSize: '1.3 MB' },

  // Other International Languages
  { identifier: 'fr.hamidullah', name: 'Français (Hamidullah)', language: 'fr', englishName: 'Hamidullah', format: 'text', type: 'translation', approxSize: '1.2 MB' },
  { identifier: 'es.cortes', name: 'Español (Cortes)', language: 'es', englishName: 'Cortes', format: 'text', type: 'translation', approxSize: '1.1 MB' },
  { identifier: 'ru.kuliev', name: 'Русский (Kuliev)', language: 'ru', englishName: 'Kuliev', format: 'text', type: 'translation', approxSize: '1.4 MB' },
  { identifier: 'tr.diyanet', name: 'Türkçe (Diyanet)', language: 'tr', englishName: 'Diyanet Isleri', format: 'text', type: 'translation', approxSize: '1.0 MB' },
  { identifier: 'zh.jian', name: '中文 (Ma Jian)', language: 'zh', englishName: 'Ma Jian', format: 'text', type: 'translation', approxSize: '900 KB' },
  { identifier: 'ur.jalandhry', name: 'اردو (Jalandhry)', language: 'ur', englishName: 'Jalandhry', format: 'text', type: 'translation', approxSize: '1.3 MB' },

  // =========================================================
  // TAFSIR (COMMENTARIES)
  // =========================================================

  // --- TAFSIR JALALAYN (Medium Size) ---
  { identifier: 'id.jalalayn', name: 'Tafsir Jalalayn (Indo)', language: 'id', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.5 MB' },
  { identifier: 'ar.jalalayn', name: 'Tafsir Jalalayn (Arab)', language: 'ar', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.2 MB' },
  { identifier: 'en.jalalayn', name: 'Tafsir Jalalayn (Inggris)', language: 'en', englishName: 'Tafsir Al-Jalalayn', format: 'text', type: 'tafsir', approxSize: '2.4 MB' },

  // --- TAFSIR IBN KATHIR (Large Size) ---
  { identifier: 'ar.ibnkathir', name: 'Tafsir Ibnu Katsir (Arab)', language: 'ar', englishName: 'Ibn Kathir', format: 'text', type: 'tafsir', approxSize: '6.5 MB' },
  
  // --- TAFSIR AL-MUYASSAR ---
  { identifier: 'ar.muyassar', name: 'Tafsir Al-Muyassar (Arab)', language: 'ar', englishName: 'King Fahad Quran Complex', format: 'text', type: 'tafsir', approxSize: '3.8 MB' },
  
  // --- OTHERS ---
  { identifier: 'ar.tabari', name: 'Tafsir Al-Tabari (Arab)', language: 'ar', englishName: 'Al-Tabari', format: 'text', type: 'tafsir', approxSize: '8.1 MB' },
  { identifier: 'ar.qurtubi', name: 'Tafsir Al-Qurtubi (Arab)', language: 'ar', englishName: 'Al-Qurtubi', format: 'text', type: 'tafsir', approxSize: '9.2 MB' },
  { identifier: 'ar.baghawy', name: 'Tafsir Al-Baghawy (Arab)', language: 'ar', englishName: 'Al-Baghawy', format: 'text', type: 'tafsir', approxSize: '5.5 MB' },
  { identifier: 'ar.sadi', name: 'Tafsir As-Sadi (Arab)', language: 'ar', englishName: 'As-Sadi', format: 'text', type: 'tafsir', approxSize: '4.2 MB' },
];
