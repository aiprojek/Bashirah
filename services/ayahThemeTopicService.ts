export interface AyahTheme {
  theme: string;
  theme_id?: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  total_ayahs: number;
}

export interface AyahTopic {
  id: number;
  name: string;
  name_id?: string;
  arabic?: string;
  description?: string;
  description_id?: string;
  wiki?: string;
  ayahs: string[];
}

export const SURAH_NAMES: string[] = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jatsiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adz-Dzariyat", "Ath-Thur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "Ath-Thalaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddatstsir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infithar", "Al-Muthaffifin", "Al-Insyiqaq", "Al-Buruj", "Ath-Thariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Adh-Dhuha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takatsur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kautsar", "Al-Kafirun", "An-Nasr",
  "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

export const getSurahName = (surahId: number): string => {
  return SURAH_NAMES[surahId - 1] || `Surah ${surahId}`;
};

export const getLocalizedThemeText = (theme: AyahTheme | null, lang: string): string => {
  if (!theme) return '';
  if (lang === 'id') {
    return theme.theme_id || theme.theme;
  }
  return theme.theme;
};

export const getLocalizedTopicName = (topic: AyahTopic, lang: string): string => {
  if (lang === 'id') {
    return topic.name_id || topic.name;
  }
  return topic.name;
};

export const sanitizeTopicDescription = (desc: string, name?: string): string => {
  if (!desc) return '';
  let s = desc.replace(/<[^>]*>?/gm, '').trim();

  // Remove spaces before punctuation
  s = s.replace(/\s+([.,;:!?])/g, '$1');
  s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');

  // Standardize Al-Qur'an spelling
  s = s.replace(/\bAl\s*-\s*Quran\b/gi, "Al-Qur'an");
  s = s.replace(/\bAl\s+Quran\b/gi, "Al-Qur'an");
  s = s.replace(/\bAl-Quran\b/gi, "Al-Qur'an");

  // Remove parenthesized Arabic in description e.g. ( فرعون )
  s = s.replace(/\s*\([\u0600-\u06FF\s]+\)\s*/g, ' ');

  // Remove redundant prefix "Name ( ... ) adalah / merupakan / yaitu / yakni"
  const prefixWithParen = /^([A-Za-z0-9\s'\-]+)\s*\([^)]*\)\s*(adalah|merupakan|yaitu|disebutkan|mengacu pada|yakni)\s*/i;
  const matchParen = s.match(prefixWithParen);
  if (matchParen) {
    const rem = s.slice(matchParen[0].length).trim();
    if (rem.length > 8) {
      s = rem.charAt(0).toUpperCase() + rem.slice(1);
    }
  }

  // Remove simple prefix "Name adalah / merupakan / yaitu"
  const simplePrefix = /^([A-Za-z0-9\s'\-]+)\s+(adalah|merupakan|yaitu|yakni)\s+/i;
  const matchSimple = s.match(simplePrefix);
  if (matchSimple && name && matchSimple[1].toLowerCase().trim() === name.toLowerCase().trim()) {
    const rem = s.slice(matchSimple[0].length).trim();
    if (rem.length > 8) {
      s = rem.charAt(0).toUpperCase() + rem.slice(1);
    }
  }

  // Strip leading "Dalam Al-Qur'an. " if left over
  if (s.startsWith("Dalam Al-Qur'an.")) {
    s = s.replace(/^Dalam Al-Qur'an\.\s*/, '');
  }

  // Capitalize first letter and ensure proper ending
  if (s) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!s.endsWith('.')) s += '.';
  }

  return s;
};

export const getLocalizedTopicDescription = (topic: AyahTopic, lang: string): string => {
  // If there is an explicit description in the dataset
  if (lang === 'id') {
    if (topic.description_id && topic.description_id.trim()) {
      return sanitizeTopicDescription(topic.description_id, topic.name_id || topic.name);
    }
    if (topic.description && topic.description.trim()) {
      return sanitizeTopicDescription(topic.description, topic.name_id || topic.name);
    }
  } else {
    if (topic.description && topic.description.trim()) {
      return sanitizeTopicDescription(topic.description, topic.name);
    }
    if (topic.description_id && topic.description_id.trim()) {
      return sanitizeTopicDescription(topic.description_id, topic.name);
    }
  }

  // Consistent fallback: generate clean, informative short description from ayahs
  const ayahCount = topic.ayahs ? topic.ayahs.length : 0;
  if (!ayahCount) {
    return lang === 'id'
      ? "Topik pembahasan dalam ayat Al-Qur'an."
      : "Topic explored in the verses of the Holy Quran.";
  }

  const surahIds = Array.from(
    new Set(
      topic.ayahs
        .map((a) => parseInt(a.split(':')[0], 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 114)
    )
  );

  const surahNames = surahIds.map((id) => getSurahName(id));

  if (lang === 'id') {
    if (surahNames.length === 1) {
      return `Tercantum dalam ${ayahCount} ayat di Surah ${surahNames[0]}.`;
    }
    if (surahNames.length === 2) {
      return `Tercantum dalam ${ayahCount} ayat di Surah ${surahNames[0]} dan ${surahNames[1]}.`;
    }
    if (surahNames.length === 3) {
      return `Tercantum dalam ${ayahCount} ayat di Surah ${surahNames[0]}, ${surahNames[1]}, dan ${surahNames[2]}.`;
    }
    return `Tercantum dalam ${ayahCount} ayat di ${surahNames.length} surah (termasuk Surah ${surahNames[0]}, ${surahNames[1]}, dll.).`;
  } else {
    const plural = ayahCount > 1 ? 'verses' : 'verse';
    if (surahNames.length === 1) {
      return `Mentioned in ${ayahCount} ${plural} in Surah ${surahNames[0]}.`;
    }
    if (surahNames.length === 2) {
      return `Mentioned in ${ayahCount} ${plural} across Surah ${surahNames[0]} and ${surahNames[1]}.`;
    }
    if (surahNames.length === 3) {
      return `Mentioned in ${ayahCount} ${plural} across Surah ${surahNames[0]}, ${surahNames[1]}, and ${surahNames[2]}.`;
    }
    return `Featured across ${surahNames.length} surahs in ${ayahCount} ${plural}, including Surah ${surahNames[0]}, ${surahNames[1]}, etc.`;
  }
};

let cachedThemes: AyahTheme[] | null = null;
let cachedTopics: AyahTopic[] | null = null;
let topicVerseMap: Map<string, AyahTopic[]> | null = null;

export const loadAyahThemes = async (): Promise<AyahTheme[]> => {
  if (cachedThemes) return cachedThemes;
  try {
    const res = await fetch('/qul/ayah themes - topics/ayah-themes.json');
    if (!res.ok) return [];
    cachedThemes = await res.json();
    return cachedThemes || [];
  } catch (err) {
    console.error('Failed to load ayah themes:', err);
    return [];
  }
};

export const loadAyahTopics = async (): Promise<AyahTopic[]> => {
  if (cachedTopics) return cachedTopics;
  try {
    const res = await fetch('/qul/ayah themes - topics/topics.json');
    if (!res.ok) return [];
    cachedTopics = await res.json();

    // Pre-build verse lookup map for fast O(1) queries
    topicVerseMap = new Map();
    if (cachedTopics) {
      for (const topic of cachedTopics) {
        for (const key of topic.ayahs) {
          const list = topicVerseMap.get(key) || [];
          list.push(topic);
          topicVerseMap.set(key, list);
        }
      }
    }

    return cachedTopics || [];
  } catch (err) {
    console.error('Failed to load ayah topics:', err);
    return [];
  }
};

export const getThemeForVerse = async (surahId: number, verseId: number): Promise<AyahTheme | null> => {
  const themes = await loadAyahThemes();
  const match = themes.find(
    (t) => t.surah_number === surahId && verseId >= t.ayah_from && verseId <= t.ayah_to
  );
  return match || null;
};

export const getTopicsForVerse = async (surahId: number, verseId: number): Promise<AyahTopic[]> => {
  await loadAyahTopics();
  if (topicVerseMap) {
    const key = `${surahId}:${verseId}`;
    return topicVerseMap.get(key) || [];
  }
  return [];
};

export const getAyahTopicById = async (topicId: number): Promise<AyahTopic | null> => {
  const topics = await loadAyahTopics();
  return topics.find((t) => t.id === topicId) || null;
};

