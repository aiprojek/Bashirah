
import { BookmarkData, LastReadData, NoteData, KhatamTarget, ReadingLog, QuizScore } from "../types";
import { getSurahStartPage } from "./quranService"; // Import mapping helper

const LAST_READ_KEY = 'quran_last_read';
const BOOKMARKS_KEY = 'quran_bookmarks';
const NOTES_KEY = 'quran_notes';
const KHATAM_KEY = 'quran_khatam_target';
const HISTORY_KEY = 'quran_reading_history';
const SHOW_DAILY_AYAT_KEY = 'quran_show_daily_ayat';
const QUIZ_SCORES_KEY = 'quran_quiz_scores';

// Helper to notify components of changes
const notifyUpdate = () => {
    window.dispatchEvent(new Event('storage-update'));
};

// --- SETTINGS PREFERENCES ---
export const getShowAyatOfTheDay = (): boolean => {
    const data = localStorage.getItem(SHOW_DAILY_AYAT_KEY);
    return data === null ? true : JSON.parse(data);
};

export const setShowAyatOfTheDay = (show: boolean) => {
    localStorage.setItem(SHOW_DAILY_AYAT_KEY, JSON.stringify(show));
    notifyUpdate();
};

// --- LAST READ & TRACKING ---
export const getLastRead = (): LastReadData | null => {
    const data = localStorage.getItem(LAST_READ_KEY);
    return data ? JSON.parse(data) : null;
};

// MODIFIED: This function now ONLY marks the position (Bookmark logic), it does NOT auto-update Khatam
export const setLastRead = (surahId: number, surahName: string, verseId: number, pageNumber?: number) => {
    const actualPage = pageNumber || getSurahStartPage(surahId); 
    
    const data: LastReadData = {
        surahId,
        surahName,
        verseId,
        pageNumber: actualPage,
        timestamp: Date.now()
    };
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(data));
    notifyUpdate(); 
    return data;
};

// --- BOOKMARKS ---
export const getBookmarks = (): BookmarkData[] => {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
};

export const isBookmarked = (surahId: number, verseId: number): boolean => {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.surahId === surahId && b.verseId === verseId);
};

export const toggleBookmark = (surahId: number, surahName: string, verseId: number): boolean => {
    const bookmarks = getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.surahId === surahId && b.verseId === verseId);
    
    let isAdded = false;
    if (existingIndex >= 0) {
        bookmarks.splice(existingIndex, 1);
        isAdded = false;
    } else {
        bookmarks.push({
            surahId,
            surahName,
            verseId,
            timestamp: Date.now()
        });
        isAdded = true;
    }
    
    bookmarks.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    notifyUpdate();
    return isAdded;
};

// --- NOTES ---
export const getNotes = (): NoteData[] => {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
};

export const getNoteForVerse = (surahId: number, verseId: number): NoteData | undefined => {
    const notes = getNotes();
    return notes.find(n => n.surahId === surahId && n.verseId === verseId);
};

export const saveNote = (surahId: number, surahName: string, verseId: number, text: string) => {
    const notes = getNotes();
    const existingIndex = notes.findIndex(n => n.surahId === surahId && n.verseId === verseId);
    
    if (existingIndex >= 0) {
        if (text.trim() === "") {
            notes.splice(existingIndex, 1);
        } else {
            notes[existingIndex].text = text;
            notes[existingIndex].timestamp = Date.now();
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
        notes.push(newNote);
    }
    
    notes.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    notifyUpdate();
};

export const deleteNote = (noteId: string) => {
    const notes = getNotes();
    const newNotes = notes.filter(n => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    notifyUpdate();
};

// --- KHATAM & HABIT TRACKING ---
export const getKhatamTarget = (): KhatamTarget | null => {
    const data = localStorage.getItem(KHATAM_KEY);
    return data ? JSON.parse(data) : null;
};

export const saveKhatamTarget = (target: KhatamTarget) => {
    localStorage.setItem(KHATAM_KEY, JSON.stringify(target));
    notifyUpdate();
};

// MODIFIED: This function explicitly handles Khatam Logic + Reading History + Last Read Sync
export const updateKhatamProgress = (currentPage: number, surahId?: number, surahName?: string, verseId?: number) => {
    const target = getKhatamTarget();
    
    // 1. Log History (Statistik Ibadah)
    if (target && target.isActive) {
        // Calculate pages read since last update
        // Logic: If new page is ahead, calculate diff. If new page is behind (re-reading), we don't add to "Total Pages Read" to avoid duplicate stats, unless we want to track effort.
        // For simplicity: We log progress if moving forward relative to the *Khatam Target*.
        const pagesDiff = currentPage - target.currentPage;
        
        if (pagesDiff > 0) {
            logReading(pagesDiff);
        } else if (pagesDiff === 0) {
             // Same page, maybe just finished the page. Log 1 page if not logged today?
             // Let's simpler: If explicitly clicking "Update Khatam", we assume at least 1 page of effort if it's a new session.
             // But for now, stick to progress diff to be accurate on "Pages Finished".
        }

        // 2. Update Target
        target.currentPage = currentPage;
        target.lastUpdated = Date.now();
        saveKhatamTarget(target);
    } else {
        // If no target exists but user clicks "Update Khatam", maybe just log history?
        // Or prompt to create target. For now, just log history of 1 page as an activity.
        logReading(1);
    }

    // 3. Sync Last Read (Because if you update Khatam, you definitely read there)
    if (surahId && surahName && verseId) {
        setLastRead(surahId, surahName, verseId, currentPage);
    }
};

export const getReadingHistory = (): ReadingLog[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
};

export const logReading = (pagesRead: number) => {
    const history = getReadingHistory();
    const today = new Date().toISOString().split('T')[0];
    
    const todayIndex = history.findIndex(h => h.date === today);
    if (todayIndex >= 0) {
        history[todayIndex].pagesRead += pagesRead;
    } else {
        history.push({ date: today, pagesRead });
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    notifyUpdate(); // Notify heatmap to refresh
};

// --- QUIZ SCORES ---
export const saveQuizScore = (playerName: string, score: number, totalQuestions: number) => {
    const scores = getQuizScores();
    const newScore: QuizScore = {
        id: Date.now().toString(),
        playerName,
        score,
        totalQuestions,
        timestamp: Date.now()
    };
    
    scores.push(newScore);
    // Sort by score descending, then by timestamp descending
    scores.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
    
    // Keep only top 50
    const topScores = scores.slice(0, 50);
    
    localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(topScores));
    return newScore;
};

export const getQuizScores = (): QuizScore[] => {
    const data = localStorage.getItem(QUIZ_SCORES_KEY);
    return data ? JSON.parse(data) : [];
};
