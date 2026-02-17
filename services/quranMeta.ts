
// Data Inti Struktur Al-Quran (Juz & Sajdah)
// File ini diload oleh SW sebagai aset inti.

export interface JuzRef {
    id: number;
    startSurahId: number;
    startSurahName: string;
    startVerse: number;
}

export interface SajdaRef {
    id: number;
    surahId: number;
    surahName: string;
    verseId: number;
    recommendation: string; // Sunnah / Wajib (in Mazhab context, mostly sunnah muakkad)
}

export const JUZ_DATA: JuzRef[] = [
    { id: 1, startSurahId: 1, startSurahName: "Al-Fatihah", startVerse: 1 },
    { id: 2, startSurahId: 2, startSurahName: "Al-Baqarah", startVerse: 142 },
    { id: 3, startSurahId: 2, startSurahName: "Al-Baqarah", startVerse: 253 },
    { id: 4, startSurahId: 3, startSurahName: "Ali 'Imran", startVerse: 93 },
    { id: 5, startSurahId: 4, startSurahName: "An-Nisa", startVerse: 24 },
    { id: 6, startSurahId: 4, startSurahName: "An-Nisa", startVerse: 148 },
    { id: 7, startSurahId: 5, startSurahName: "Al-Ma'idah", startVerse: 82 },
    { id: 8, startSurahId: 6, startSurahName: "Al-An'am", startVerse: 111 },
    { id: 9, startSurahId: 7, startSurahName: "Al-A'raf", startVerse: 88 },
    { id: 10, startSurahId: 8, startSurahName: "Al-Anfal", startVerse: 41 },
    { id: 11, startSurahId: 9, startSurahName: "At-Tawbah", startVerse: 93 },
    { id: 12, startSurahId: 11, startSurahName: "Hud", startVerse: 6 },
    { id: 13, startSurahId: 12, startSurahName: "Yusuf", startVerse: 53 },
    { id: 14, startSurahId: 15, startSurahName: "Al-Hijr", startVerse: 1 },
    { id: 15, startSurahId: 17, startSurahName: "Al-Isra", startVerse: 1 },
    { id: 16, startSurahId: 18, startSurahName: "Al-Kahf", startVerse: 75 },
    { id: 17, startSurahId: 21, startSurahName: "Al-Anbiya", startVerse: 1 },
    { id: 18, startSurahId: 23, startSurahName: "Al-Mu'minun", startVerse: 1 },
    { id: 19, startSurahId: 25, startSurahName: "Al-Furqan", startVerse: 21 },
    { id: 20, startSurahId: 27, startSurahName: "An-Naml", startVerse: 56 },
    { id: 21, startSurahId: 29, startSurahName: "Al-Ankabut", startVerse: 46 },
    { id: 22, startSurahId: 33, startSurahName: "Al-Ahzab", startVerse: 31 },
    { id: 23, startSurahId: 36, startSurahName: "Ya-Sin", startVerse: 28 },
    { id: 24, startSurahId: 39, startSurahName: "Az-Zumar", startVerse: 32 },
    { id: 25, startSurahId: 41, startSurahName: "Fussilat", startVerse: 47 },
    { id: 26, startSurahId: 46, startSurahName: "Al-Ahqaf", startVerse: 1 },
    { id: 27, startSurahId: 51, startSurahName: "Adh-Dhariyat", startVerse: 31 },
    { id: 28, startSurahId: 58, startSurahName: "Al-Mujadila", startVerse: 1 },
    { id: 29, startSurahId: 67, startSurahName: "Al-Mulk", startVerse: 1 },
    { id: 30, startSurahId: 78, startSurahName: "An-Naba", startVerse: 1 },
];

export const SAJDA_LOCATIONS: SajdaRef[] = [
    { id: 1, surahId: 7, surahName: "Al-A'raf", verseId: 206, recommendation: "Sunnah" },
    { id: 2, surahId: 13, surahName: "Ar-Ra'd", verseId: 15, recommendation: "Sunnah" },
    { id: 3, surahId: 16, surahName: "An-Nahl", verseId: 50, recommendation: "Sunnah" },
    { id: 4, surahId: 17, surahName: "Al-Isra", verseId: 109, recommendation: "Sunnah" },
    { id: 5, surahId: 19, surahName: "Maryam", verseId: 58, recommendation: "Sunnah" },
    { id: 6, surahId: 22, surahName: "Al-Hajj", verseId: 18, recommendation: "Sunnah" },
    { id: 7, surahId: 22, surahName: "Al-Hajj", verseId: 77, recommendation: "Sunnah (Syafi'i)" },
    { id: 8, surahId: 25, surahName: "Al-Furqan", verseId: 60, recommendation: "Sunnah" },
    { id: 9, surahId: 27, surahName: "An-Naml", verseId: 26, recommendation: "Sunnah" },
    { id: 10, surahId: 32, surahName: "As-Sajdah", verseId: 15, recommendation: "Sunnah" },
    { id: 11, surahId: 38, surahName: "Sad", verseId: 24, recommendation: "Sunnah" },
    { id: 12, surahId: 41, surahName: "Fussilat", verseId: 38, recommendation: "Sunnah" },
    { id: 13, surahId: 53, surahName: "An-Najm", verseId: 62, recommendation: "Sunnah" },
    { id: 14, surahId: 84, surahName: "Al-Inshiqaq", verseId: 21, recommendation: "Sunnah" },
    { id: 15, surahId: 96, surahName: "Al-Alaq", verseId: 19, recommendation: "Sunnah" }
];
