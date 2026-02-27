
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as StorageService from '../services/storageService';
import { BookmarkData, NoteData } from '../types';
import { Bookmark, ChevronRight, Trash2, FileText, X } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import ReadingHeatmap from '../components/ReadingHeatmap'; // New Import
import { useLanguage } from '../contexts/LanguageContext';

const LibraryPage: React.FC = () => {
  const { t } = useLanguage();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  
  // Note Modal State
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'bookmark' | 'note', data: any } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadLibraryData = async () => {
        setBookmarks(await StorageService.getBookmarks());
        setNotes(await StorageService.getNotes());
    };
    loadLibraryData();
  }, []);

  const handleBookmarkClick = (bm: BookmarkData) => {
    navigate(`/surah/${bm.surahId}#verse-${bm.verseId}`);
  };

  const initiateRemoveBookmark = (e: React.MouseEvent, bm: BookmarkData) => {
    e.stopPropagation();
    setDeleteTarget({ type: 'bookmark', data: bm });
  };

  const initiateRemoveNote = (e: React.MouseEvent, note: NoteData) => {
      e.stopPropagation();
      setDeleteTarget({ type: 'note', data: note });
  };
  
  const handleConfirmDelete = async () => {
      if (!deleteTarget) return;

      if (deleteTarget.type === 'bookmark') {
          const bm = deleteTarget.data as BookmarkData;
          await StorageService.toggleBookmark(bm.surahId, bm.surahName, bm.verseId);
          setBookmarks(await StorageService.getBookmarks());
      } else if (deleteTarget.type === 'note') {
          const note = deleteTarget.data as NoteData;
          await StorageService.deleteNote(note.id);
          setNotes(await StorageService.getNotes());
      }
      setDeleteTarget(null);
  };
  
  const handleNoteClick = (note: NoteData) => {
      setSelectedNote(note);
  };
  
  const handleGoToVerseFromNote = () => {
      if(selectedNote) {
          navigate(`/surah/${selectedNote.surahId}#verse-${selectedNote.verseId}`);
          setSelectedNote(null);
      }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen animate-fade-in relative">
        
        {/* NEW: Reading Statistics Heatmap */}
        <div className="mb-8">
            <ReadingHeatmap />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden min-h-[60vh]">
            
            {/* Tabs */}
            <div className="flex border-b border-stone-200 dark:border-slate-700">
                <button 
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'bookmarks' ? 'text-quran-dark dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-current' : ''}`} />
                    {t('lib_bookmarks')}
                    {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-quran-gold rounded-t-full mx-8"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'notes' ? 'text-quran-dark dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    <FileText className={`w-4 h-4 ${activeTab === 'notes' ? 'fill-current' : ''}`} />
                    {t('lib_notes')}
                     {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-quran-gold rounded-t-full mx-8"></div>}
                </button>
            </div>

            <div className="bg-stone-50/30 dark:bg-slate-900/30 min-h-full">
                {/* BOOKMARKS LIST */}
                {activeTab === 'bookmarks' && (
                    <>
                        {bookmarks.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>{t('lib_empty_bk')}</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-quran-gold hover:underline text-sm font-medium"
                                >
                                    {t('lib_start_read')}
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-slate-700">
                                {bookmarks.map((bm, idx) => (
                                    <div 
                                        key={`${bm.surahId}-${bm.verseId}`}
                                        onClick={() => handleBookmarkClick(bm)}
                                        className="p-5 hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group flex items-center justify-between bg-white dark:bg-slate-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-quran-gold/10 rounded-full flex items-center justify-center text-quran-gold font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-quran-dark dark:text-gray-100 text-lg">{bm.surahName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-slate-700 rounded text-stone-500 dark:text-gray-400 font-medium">{t('lib_verse')} {bm.verseId}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(bm.timestamp).toLocaleDateString(undefined, {day: 'numeric', month: 'short'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => initiateRemoveBookmark(e, bm)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title={t('btn_delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-quran-gold transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* NOTES LIST */}
                {activeTab === 'notes' && (
                     <>
                        {notes.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>{t('lib_empty_note')}</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-quran-gold hover:underline text-sm font-medium"
                                >
                                    {t('lib_start_read')}
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100 dark:divide-slate-700">
                                {notes.map((note, idx) => (
                                    <div 
                                        key={note.id}
                                        onClick={() => handleNoteClick(note)}
                                        className="p-5 hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group flex items-start justify-between bg-white dark:bg-slate-800"
                                    >
                                        <div className="flex gap-4 overflow-hidden">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs mt-1">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-quran-dark dark:text-gray-100 text-sm">{note.surahName} : {note.verseId}</h4>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(note.timestamp).toLocaleDateString(undefined, {day: 'numeric', month: 'short'})}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed italic">
                                                    "{note.text}"
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 pl-2">
                                             <button
                                                onClick={(e) => initiateRemoveNote(e, note)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title={t('btn_delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </>
                )}
            </div>
        </div>

        {/* Note Detail Modal */}
        {selectedNote && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
                <div 
                    className="absolute inset-0 bg-quran-dark/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedNote(null)}
                />
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-white/10">
                    <div className="px-6 py-5 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50 dark:bg-slate-700/50">
                        <div>
                            <h3 className="text-xl font-bold text-quran-dark dark:text-white font-serif">{selectedNote.surahName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('lib_verse')} {selectedNote.verseId}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedNote(null)}
                            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-8 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-800">
                         <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Catatan Anda</div>
                         <div className="text-gray-700 dark:text-gray-200 leading-loose font-serif text-lg italic whitespace-pre-wrap">
                             "{selectedNote.text}"
                         </div>
                         <div className="mt-6 text-xs text-gray-400 text-right">
                             {t('lib_created')} {new Date(selectedNote.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}
                         </div>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-stone-100 dark:border-slate-700 bg-stone-50 dark:bg-slate-700/50 flex justify-end">
                        <button 
                            onClick={handleGoToVerseFromNote}
                            className="flex items-center gap-2 px-5 py-2.5 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold text-sm hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all shadow-md"
                        >
                            {t('lib_view_verse')} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal 
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            title={deleteTarget?.type === 'bookmark' ? t('lib_delete_bk_title') : t('lib_delete_note_title')}
            message={deleteTarget?.type === 'bookmark' 
                ? t('lib_delete_bk_msg')
                : t('lib_delete_note_msg')
            }
            confirmText={t('btn_delete')}
            variant="danger"
        />

    </div>
  );
};

export default LibraryPage;
