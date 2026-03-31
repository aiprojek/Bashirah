
import { BookmarkData, LastReadData, NoteData, KhatamTarget, ReadingLog, QuizScore } from "../types";
import { getSurahStartPage } from "./quranService"; // Import mapping helper
import * as DB from './db';
import { ArabicFontId, DEFAULT_ARABIC_FONT_ID, getArabicFontStack } from "../constants/quranFonts";

const LAST_READ_KEY = 'last_read';
const BOOKMARKS_KEY = 'bookmarks';
const NOTES_KEY = 'notes';
const KHATAM_KEY = 'khatam_target';
const HISTORY_KEY = 'reading_history';
const SHOW_DAILY_AYAT_KEY = 'show_daily_ayat';
const QUIZ_SCORES_KEY = 'quiz_scores';
const TOTAL_KHATAM_KEY = 'total_khatam_count';
const DEFAULT_MUSHAF_MODE_KEY = 'default_mushaf_mode';
const ARABIC_FONT_SIZE_KEY = 'arabic_font_size';
const TRANSLATION_FONT_SIZE_KEY = 'translation_font_size';
const ARABIC_FONT_FAMILY_KEY = 'arabic_font_family';

// Helper to notify components of changes
const notifyUpdate = () => {
    window.dispatchEvent(new Event('storage-update'));
};

// --- SETTINGS PREFERENCES ---
export const getShowAyatOfTheDay = async (): Promise<boolean> => {
    const data = await DB.getSetting(SHOW_DAILY_AYAT_KEY);
    return data === undefined ? true : data;
};

export const setShowAyatOfTheDay = async (show: boolean) => {
    await DB.setSetting(SHOW_DAILY_AYAT_KEY, show);
    notifyUpdate();
};

export const getDefaultMushafMode = async (): Promise<'text' | 'image'> => {
    const data = await DB.getSetting(DEFAULT_MUSHAF_MODE_KEY);
    return data === 'image' ? 'image' : 'text';
};

export const setDefaultMushafMode = async (mode: 'text' | 'image') => {
    await DB.setSetting(DEFAULT_MUSHAF_MODE_KEY, mode);
    notifyUpdate();
};

export const getArabicFontSize = async (): Promise<number> => {
    const data = await DB.getSetting(ARABIC_FONT_SIZE_KEY);
    return typeof data === 'number' && data >= 20 && data <= 60 ? data : 30;
};

export const setArabicFontSize = async (size: number) => {
    await DB.setSetting(ARABIC_FONT_SIZE_KEY, size);
    notifyUpdate();
};

export const getTranslationFontSize = async (): Promise<number> => {
    const data = await DB.getSetting(TRANSLATION_FONT_SIZE_KEY);
    return typeof data === 'number' && data >= 12 && data <= 24 ? data : 16;
};

export const setTranslationFontSize = async (size: number) => {
    await DB.setSetting(TRANSLATION_FONT_SIZE_KEY, size);
    notifyUpdate();
};

export const getArabicFontFamily = async (): Promise<ArabicFontId> => {
    const data = await DB.getSetting(ARABIC_FONT_FAMILY_KEY);
    return data === 'indopak' || data === 'nastaleeq' || data === 'me-quran' || data === 'uthmani-hafs' ? data : DEFAULT_ARABIC_FONT_ID;
};

export const setArabicFontFamily = async (fontId: ArabicFontId) => {
    await DB.setSetting(ARABIC_FONT_FAMILY_KEY, fontId);
    applyArabicFontFamily(fontId);
    notifyUpdate();
};

export const applyArabicFontFamily = (fontId: ArabicFontId) => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--quran-arabic-font', getArabicFontStack(fontId));
};

// --- LAST READ & TRACKING ---
export const getLastRead = async (): Promise<LastReadData | null> => {
    const data = await DB.getSetting(LAST_READ_KEY);
    return data || null;
};

// MODIFIED: This function now ONLY marks the position (Bookmark logic), it does NOT auto-update Khatam
export const setLastRead = async (surahId: number, surahName: string, verseId: number, pageNumber?: number) => {
    const actualPage = pageNumber || getSurahStartPage(surahId); 
    
    const data: LastReadData = {
        surahId,
        surahName,
        verseId,
        pageNumber: actualPage,
        timestamp: Date.now()
    };
    await DB.setSetting(LAST_READ_KEY, data);
    notifyUpdate(); 
    return data;
};

// --- BOOKMARKS ---
export const getBookmarks = async (): Promise<BookmarkData[]> => {
    const data = await DB.getAllBookmarks();
    return data || [];
};

export const isBookmarked = async (surahId: number, verseId: number): Promise<boolean> => {
    const bookmarks = await getBookmarks();
    return bookmarks.some(b => b.surahId === surahId && b.verseId === verseId);
};

export const toggleBookmark = async (surahId: number, surahName: string, verseId: number): Promise<boolean> => {
    const bookmarks = await getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.surahId === surahId && b.verseId === verseId);
    
    let isAdded = false;
    if (existingIndex >= 0) {
        await DB.deleteBookmark(surahId, verseId);
        isAdded = false;
    } else {
        const newBookmark = {
            surahId,
            surahName,
            verseId,
            timestamp: Date.now()
        };
        await DB.saveBookmark(newBookmark);
        isAdded = true;
    }
    
    notifyUpdate();
    return isAdded;
};

// --- NOTES ---
export const getNotes = async (): Promise<NoteData[]> => {
    const data = await DB.getAllNotes();
    return data || [];
};

export const getNoteForVerse = async (surahId: number, verseId: number): Promise<NoteData | undefined> => {
    const notes = await getNotes();
    return notes.find(n => n.surahId === surahId && n.verseId === verseId);
};

export const saveNote = async (surahId: number, surahName: string, verseId: number, text: string) => {
    const notes = await getNotes();
    const existingIndex = notes.findIndex(n => n.surahId === surahId && n.verseId === verseId);
    
    if (existingIndex >= 0) {
        if (text.trim() === "") {
            await DB.deleteNoteById(notes[existingIndex].id);
        } else {
            const updatedNote = {
                ...notes[existingIndex],
                text,
                timestamp: Date.now()
            };
            await DB.dbSaveNote(updatedNote);
        }
    } else if (text.trim() !== "") {
        const newNote: NoteData = {
            id: Date.now().toString(),
            surahId,
            surahName,
            verseId,
            text,
            timestamp: Date.now()
        };
        await DB.dbSaveNote(newNote);
    }
    
    notifyUpdate();
};

export const deleteNote = async (noteId: string) => {
    await DB.deleteNoteById(noteId);
    notifyUpdate();
};

// --- KHATAM & HABIT TRACKING ---
export const getKhatamTarget = async (): Promise<KhatamTarget | null> => {
    const data = await DB.getSetting(KHATAM_KEY);
    return data || null;
};

export const saveKhatamTarget = async (target: KhatamTarget) => {
    await DB.setSetting(KHATAM_KEY, target);
    notifyUpdate();
};

export const resetKhatamTarget = async () => {
    const target = await getKhatamTarget();
    if (target) {
        target.isActive = false;
        target.currentPage = 1; // Always reset progress when target is reset/stopped
        await saveKhatamTarget(target);
    }
};

export const getTotalKhatamCount = async (): Promise<number> => {
    const count = await DB.getSetting(TOTAL_KHATAM_KEY);
    return count || 0;
};

export const setTotalKhatamCount = async (count: number) => {
    await DB.setSetting(TOTAL_KHATAM_KEY, count);
    notifyUpdate();
};

export const incrementTotalKhatamCount = async () => {
    const current = await getTotalKhatamCount();
    await setTotalKhatamCount(current + 1);
};

// MODIFIED: This function handles logging reading progress and updating the khatam target
export const updateKhatamProgress = async (currentPage: number) => {
    const target = await getKhatamTarget();
    const lastRead = await getLastRead();
    
    // Choose the reference page to calculate progress: 
    // Ideally from target if active, otherwise from last_read position
    const lastPageReference = (target && target.isActive) 
        ? target.currentPage 
        : (lastRead ? lastRead.pageNumber : 0);

    // 1. Calculate pages read since last update
    const pagesDiff = currentPage - lastPageReference;
    
    // 2. Log History IF there's actual forward progress
    if (pagesDiff > 0) {
        await logReading(pagesDiff);
    }

    // 3. Update Target Page if active
    if (target && target.isActive) {
        target.currentPage = currentPage;
        target.lastUpdated = Date.now();
        await saveKhatamTarget(target);
    }
    
    // 4. Check for Completion (Global Counter)
    if (currentPage >= 604) {
        // Increment global counter if:
        // - There's an active target and it's the first time reaching 604
        // - OR there's NO active target but the last recorded page was < 604 (prevent double counting)
        if (lastPageReference < 604) {
             await incrementTotalKhatamCount();
        }
        window.dispatchEvent(new CustomEvent('app:khatam-complete', { detail: { target } }));
    }
};

export const calculateKhatamAnalytics = async () => {
    const target = await getKhatamTarget();
    if (!target || !target.isActive) return null;

    const history = await getReadingHistory();
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Total days active (since startDate)
    const daysActive = Math.max(1, Math.ceil((Date.now() - target.startDate) / msPerDay));
    
    // Average pages per day based on history since target started
    const startDateStr = new Date(target.startDate).toISOString().split('T')[0];
    const relevantHistory = history.filter(h => h.date >= startDateStr);
    
    const totalPagesRead = relevantHistory.reduce((sum, h) => sum + h.pagesRead, 0);
    const avgPagesPerDay = totalPagesRead / daysActive || 1; // Fallback to 1 to avoid infinity
    
    const pagesLeft = 604 - target.currentPage;
    const estimatedDaysLeft = Math.ceil(pagesLeft / avgPagesPerDay);
    const estimatedCompletionDate = Date.now() + (estimatedDaysLeft * msPerDay);
    const streak = await calculateReadingStreak();

    return {
        avgPagesPerDay: Math.round(avgPagesPerDay * 10) / 10,
        estimatedCompletionDate,
        totalDaysActive: daysActive,
        estimatedDaysLeft,
        totalPagesRead,
        streak
    };
};

export const calculateReadingStreak = async () => {
    const history = await getReadingHistory();
    if (history.length === 0) return 0;

    // Sort history by date descending
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user read today or yesterday to continue streak
    if (sorted[0].date !== today && sorted[0].date !== yesterday) {
        return 0;
    }

    let streak = 0;
    let currentDate = new Date(sorted[0].date);

    for (const log of sorted) {
        const logDate = new Date(log.date);
        const diffInDays = Math.floor((currentDate.getTime() - logDate.getTime()) / 86400000);

        if (diffInDays <= 1) { // 0 if same day, 1 if consecutive
            if (log.pagesRead > 0) {
                streak++;
                currentDate = logDate;
            }
        } else {
            break;
        }
    }

    return streak;
};

export const updateKhatamUserName = async (name: string) => {
    const target = await getKhatamTarget();
    if (target) {
        target.userName = name;
        await saveKhatamTarget(target);
    }
};

export const getReadingHistory = async (): Promise<ReadingLog[]> => {
    const data = await DB.getReadingHistory();
    return data || [];
};

export const logReading = async (pagesRead: number) => {
    const history = await getReadingHistory();
    const today = new Date().toISOString().split('T')[0];
    
    const todayIndex = history.findIndex(h => h.date === today);
    if (todayIndex >= 0) {
        history[todayIndex].pagesRead += pagesRead;
        await DB.saveReadingLog(history[todayIndex]);
    } else {
        const newLog = { date: today, pagesRead };
        await DB.saveReadingLog(newLog);
    }
    
    notifyUpdate(); // Notify heatmap to refresh
};

// --- QUIZ SCORES ---
export const saveQuizScore = async (playerName: string, score: number, totalQuestions: number) => {
    const newScore: QuizScore = {
        id: Date.now().toString(),
        playerName,
        score,
        totalQuestions,
        timestamp: Date.now()
    };
    
    await DB.saveQuizScore(newScore);
    notifyUpdate();
    return newScore;
};

export const getQuizScores = async (): Promise<QuizScore[]> => {
    const data = await DB.getTopQuizScores();
    return data || [];
};
