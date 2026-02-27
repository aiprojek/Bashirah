
import { BookmarkData, LastReadData, NoteData, KhatamTarget, ReadingLog, QuizScore } from "../types";
import { getSurahStartPage } from "./quranService"; // Import mapping helper
import * as DB from './db';

const LAST_READ_KEY = 'last_read';
const BOOKMARKS_KEY = 'bookmarks';
const NOTES_KEY = 'notes';
const KHATAM_KEY = 'khatam_target';
const HISTORY_KEY = 'reading_history';
const SHOW_DAILY_AYAT_KEY = 'show_daily_ayat';
const QUIZ_SCORES_KEY = 'quiz_scores';

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

// MODIFIED: This function explicitly handles Khatam Logic + Reading History + Last Read Sync
export const updateKhatamProgress = async (currentPage: number, surahId?: number, surahName?: string, verseId?: number) => {
    const target = await getKhatamTarget();
    
    // 1. Log History (Statistik Ibadah)
    if (target && target.isActive) {
        // Calculate pages read since last update
        const pagesDiff = currentPage - target.currentPage;
        
        if (pagesDiff > 0) {
            await logReading(pagesDiff);
        }

        // 2. Update Target
        target.currentPage = currentPage;
        target.lastUpdated = Date.now();
        await saveKhatamTarget(target);
    } else {
        await logReading(1);
    }

    // 3. Sync Last Read (Because if you update Khatam, you definitely read there)
    if (surahId && surahName && verseId) {
        await setLastRead(surahId, surahName, verseId, currentPage);
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
