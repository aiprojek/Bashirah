
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import VerseItem from '../components/VerseItem';
import Loading from '../components/Loading';
import NoteEditorModal from '../components/NoteEditorModal';
import WordDetailModal from '../components/WordDetailModal';
import SurahInfoModal from '../components/SurahInfoModal';
import QuickJumpModal from '../components/QuickJumpModal';
import FontSettingsModal from '../components/FontSettingsModal';
import ShareVerseModal from '../components/ShareVerseModal';
import MemorizationSettingsModal from '../components/MemorizationSettingsModal';
import MushafView from '../components/MushafView';
import { getSurahDetail, getSurahStartPage, getSurahInfo, getAllSurahs } from '../services/quranService';
import * as StorageService from '../services/storageService';
import { Surah, SurahDetail, Word, MemorizationLevel, SurahInfo, Verse } from '../types';
import { BookOpen, ChevronRight, ScrollText, Eye, EyeOff, BrainCircuit, ChevronDown, Type, Info, ChevronLeft, Compass } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DetailPageProps {
  translationId?: string;
  tafsirId?: string;
  showTranslation: boolean;
  showTafsir: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
}

const SurahDetailPage: React.FC<DetailPageProps> = ({ 
    translationId, 
    tafsirId, 
    showTranslation, 
    showTafsir, 
    showWordByWord,
    showTajweed 
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]); 
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list'); 
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [showQuickJump, setShowQuickJump] = useState(false);
  
  const [isMemMode, setIsMemMode] = useState(false);
  const [memLevel, setMemLevel] = useState<MemorizationLevel>('normal');
  const [hideTranslation, setHideTranslation] = useState(true);
  const [showMemModal, setShowMemModal] = useState(false); 

  const [showFontSettings, setShowFontSettings] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState(30);
  const [translationFontSize, setTranslationFontSize] = useState(16);
  
  const [lastReadVerse, setLastReadVerse] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([]);
  const [versesWithNotes, setVersesWithNotes] = useState<number[]>([]);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingVerseId, setEditingVerseId] = useState<number | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [shareData, setShareData] = useState<{surahName: string, verse: Verse} | null>(null);
  const { currentSurah: audioSurah, currentVerse: audioVerse, playVerse } = useAudio();

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useEffect(() => {
      getAllSurahs(language).then(setAllSurahs);
  }, [language]);

  useEffect(() => {
    if(id) {
        const surahIdInt = parseInt(id);
        const lr = StorageService.getLastRead();
        if (lr && lr.surahId === surahIdInt) {
            setLastReadVerse(lr.verseId);
        }
        const bms = StorageService.getBookmarks();
        setBookmarkedVerses(bms.filter(b => b.surahId === surahIdInt).map(b => b.verseId));
        const notes = StorageService.getNotes();
        setVersesWithNotes(notes.filter(n => n.surahId === surahIdInt).map(n => n.verseId));
    }
  }, [id]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const activeTranslation = showTranslation ? translationId : undefined;
        const activeTafsir = showTafsir ? tafsirId : undefined;
        
        // Pass useTajweed param
        const data = await getSurahDetail(parseInt(id), language, activeTranslation, activeTafsir, showWordByWord, showTajweed);
        setSurah(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, language, translationId, tafsirId, showTranslation, showTafsir, showWordByWord, showTajweed]);

  // Scroll Handling for Virtualized List
  useEffect(() => {
      if (!loading && surah && viewMode === 'list') {
          // If audio is playing in this surah, scroll to that verse
          if (audioSurah === surah.id && audioVerse) {
              // verse ID is 1-based, index is 0-based
              virtuosoRef.current?.scrollToIndex({ index: audioVerse - 1, align: 'center', behavior: 'smooth' });
          } 
          // Else if URL hash present (e.g. from search click or bookmark)
          else if (location.hash) {
              const verseId = parseInt(location.hash.replace('#verse-', ''));
              if (!isNaN(verseId)) {
                  // Slight delay to ensure list is rendered
                  setTimeout(() => {
                      virtuosoRef.current?.scrollToIndex({ index: verseId - 1, align: 'center' });
                  }, 200);
              }
          }
      } 
  }, [loading, surah, location, audioVerse, audioSurah, viewMode]);

  const prevSurah = useMemo(() => (!surah || !allSurahs.length) ? null : allSurahs.find(s => s.id === surah.id - 1), [surah, allSurahs]);
  const nextSurah = useMemo(() => (!surah || !allSurahs.length) ? null : allSurahs.find(s => s.id === surah.id + 1), [surah, allSurahs]);
  const handleNavigateSurah = (targetId: number) => navigate(`/surah/${targetId}`);
  const handleQuickJump = (surahId: number, verseId: number) => { navigate(`/surah/${surahId}#verse-${verseId}`); };
  const handleToggleBookmark = (verseId: number) => {
      if(!surah) return;
      const isAdded = StorageService.toggleBookmark(surah.id, surah.transliteration, verseId);
      if (isAdded) setBookmarkedVerses(prev => [...prev, verseId]);
      else setBookmarkedVerses(prev => prev.filter(v => v !== verseId));
  };
  const handleSetLastRead = (verseId: number) => {
      if(!surah) return;
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      StorageService.setLastRead(surah.id, surah.transliteration, verseId, pageNum);
      setLastReadVerse(verseId);
  };
  const handleUpdateKhatam = (verseId: number) => {
      if(!surah) return;
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      if (pageNum) {
          StorageService.updateKhatamProgress(pageNum, surah.id, surah.transliteration, verseId);
          setLastReadVerse(verseId);
          alert(`Target Khatam diperbarui ke halaman ${pageNum} (Surat ${surah.transliteration} Ayat ${verseId}).`);
      } else { alert("Gagal memuat data halaman."); }
  };
  const handleTakeNote = (verseId: number) => {
      if(!surah) return;
      setEditingVerseId(verseId);
      const existingNote = StorageService.getNoteForVerse(surah.id, verseId);
      setCurrentNoteText(existingNote ? existingNote.text : '');
      setIsNoteModalOpen(true);
  };
  const handleSaveNote = (text: string) => {
      if(!surah || editingVerseId === null) return;
      StorageService.saveNote(surah.id, surah.transliteration, editingVerseId, text);
      if (text.trim() === '') setVersesWithNotes(prev => prev.filter(v => v !== editingVerseId));
      else setVersesWithNotes(prev => [...prev, editingVerseId]); 
  };
  const handleShareVerse = (verse: Verse, surahName: string) => setShareData({ surahName, verse });
  const handleOpenInfo = async () => {
      if (!surah) return;
      setShowInfoModal(true);
      if (!surahInfo) {
          setLoadingInfo(true);
          const info = await getSurahInfo(surah.id);
          setSurahInfo(info);
          setLoadingInfo(false);
      }
  };
  const getMemLevelLabel = (lvl: MemorizationLevel) => {
      switch(lvl) {
          case 'normal': return 'Normal (Blur)';
          case 'first-last': return 'Awal & Akhir';
          case 'ghost': return 'Samar (Ghost)';
          case 'random': return 'Acak (Random)';
          default: return 'Normal';
      }
  };

  if (loading) return <Loading />;
  if (!surah) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Surat tidak ditemukan.</div>;

  if (viewMode === 'mushaf') {
      const startPage = getSurahStartPage(surah.id);
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-900">
              <div className="bg-white dark:bg-slate-800 p-2 border-b border-stone-100 dark:border-slate-700 flex justify-between items-center px-4 z-20 shadow-sm shrink-0">
                   <div className="flex gap-1">
                        {prevSurah && (<button onClick={() => handleNavigateSurah(prevSurah.id)} className="p-2 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-300"><ChevronLeft className="w-5 h-5" /></button>)}
                         {nextSurah && (<button onClick={() => handleNavigateSurah(nextSurah.id)} className="p-2 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-300"><ChevronRight className="w-5 h-5" /></button>)}
                   </div>
                   <div className="flex gap-2">
                        <button onClick={() => setShowQuickJump(true)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"><Compass className="w-5 h-5" /></button>
                       <button onClick={() => setViewMode('list')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"><ScrollText className="w-4 h-4" /> Mode List</button>
                   </div>
              </div>
              <div className="flex-1 relative overflow-hidden"><MushafView startPage={startPage} translationId={translationId || 'id.indonesian'} /></div>
               <QuickJumpModal isOpen={showQuickJump} onClose={() => setShowQuickJump(false)} surahs={allSurahs} currentSurahId={surah.id} onNavigate={handleQuickJump} />
          </div>
      );
  }

  // --- VIRTUALIZED RENDER COMPONENTS ---
  const VirtualizedHeader = () => (
    <div className="pb-4">
        {/* Navigation & Controls */}
        <div className="flex flex-col gap-4 mb-6">
           <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <button onClick={() => setShowMemModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${isMemMode ? 'bg-quran-dark text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-500 dark:text-gray-300'}`}>
                        <BrainCircuit className="w-4 h-4" />
                        {isMemMode ? <span>{getMemLevelLabel(memLevel)}</span> : 'Mode Hafalan'}
                        {isMemMode && <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                    
                    {isMemMode && (
                        <button onClick={() => setHideTranslation(!hideTranslation)} className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${hideTranslation ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-gray-400 dark:text-gray-400 hover:bg-stone-50 dark:hover:bg-slate-700'}`} title={hideTranslation ? "Tampilkan Terjemahan" : "Sembunyikan Terjemahan"}>
                            {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                    <button onClick={() => setShowFontSettings(true)} className="p-2 rounded-xl border bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:text-quran-dark dark:hover:text-quran-gold hover:border-quran-dark dark:hover:border-quran-gold transition-all flex-shrink-0" title="Ukuran Font">
                        <Type className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowQuickJump(true)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:text-quran-dark dark:hover:text-quran-gold hover:border-quran-dark dark:hover:border-quran-gold transition-all flex-shrink-0" title="Pindah Cepat">
                        <Compass className="w-4 h-4" />
                    </button>
                </div>
                <button onClick={() => setViewMode('mushaf')} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-slate-700 text-sm font-bold text-quran-dark dark:text-gray-100 hover:border-quran-gold dark:hover:border-quran-gold transition-colors flex-shrink-0 w-full sm:w-auto">
                    <BookOpen className="w-4 h-4 text-quran-gold" /> Mode Mushaf
                </button>
           </div>
        </div>
      
        <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
           {prevSurah ? (<button onClick={() => handleNavigateSurah(prevSurah.id)} className="flex items-center gap-1 hover:text-quran-dark dark:hover:text-quran-gold transition-colors"><ChevronLeft className="w-4 h-4" /> {prevSurah.transliteration}</button>) : <div></div>}
           {nextSurah ? (<button onClick={() => handleNavigateSurah(nextSurah.id)} className="flex items-center gap-1 hover:text-quran-dark dark:hover:text-quran-gold transition-colors">{nextSurah.transliteration} <ChevronRight className="w-4 h-4" /></button>) : <div></div>}
        </div>

        {/* Surah Banner */}
        <div className="bg-gradient-to-br from-quran-dark to-[#142924] rounded-2xl p-8 mb-6 text-white text-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <button onClick={handleOpenInfo} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20 group" title="Info & Asbabun Nuzul"><Info className="w-5 h-5 text-white" /></button>
            <div className="relative z-10">
                <h2 className="text-4xl font-bold font-serif mb-2">{surah?.transliteration}</h2>
                <p className="text-quran-gold text-lg mb-6 italic">{surah?.translation}</p>
                <div className="flex justify-center items-center gap-4 text-sm text-white/70 font-sans tracking-wide">
                    <span className="uppercase">{surah?.type}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-quran-gold"></span>
                    <span>{surah?.total_verses} AYAT</span>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10"><p className="font-arabic text-4xl leading-relaxed">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p></div>
            </div>
        </div>
    </div>
  );

  const VirtualizedFooter = () => (
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-stone-200 dark:border-slate-700 pb-32">
         {prevSurah ? (<button onClick={() => { handleNavigateSurah(prevSurah.id); }} className="flex flex-col items-start gap-1 p-3 hover:bg-stone-50 dark:hover:bg-slate-700 rounded-xl transition-all group text-left"><span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> {t('prev_surah')}</span><span className="font-bold text-quran-dark dark:text-gray-200 group-hover:text-quran-gold">{prevSurah.transliteration}</span></button>) : <div />}
         {nextSurah ? (<button onClick={() => { handleNavigateSurah(nextSurah.id); }} className="flex flex-col items-end gap-1 p-3 hover:bg-stone-50 dark:hover:bg-slate-700 rounded-xl transition-all group text-right"><span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">{t('next_surah')} <ChevronRight className="w-3 h-3" /></span><span className="font-bold text-quran-dark dark:text-gray-200 group-hover:text-quran-gold">{nextSurah.transliteration}</span></button>) : <div />}
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex-1">
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: '100%' }}
            data={surah.verses}
            components={{
                Header: VirtualizedHeader,
                Footer: VirtualizedFooter
            }}
            itemContent={(index, verse) => (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 p-2 md:p-8 mb-4 mx-4 sm:mx-6 lg:mx-8">
                     <VerseItem 
                        key={verse.id} 
                        verse={verse} 
                        surahId={surah.id} 
                        totalVerses={surah.total_verses} 
                        surahName={surah.transliteration} 
                        verseTranslation={showTranslation ? verse.translation : undefined} 
                        verseTafsir={showTafsir ? verse.tafsir : undefined} 
                        isBookmarked={bookmarkedVerses.includes(verse.id)} 
                        isLastRead={lastReadVerse === verse.id} 
                        hasNote={versesWithNotes.includes(verse.id)} 
                        showWordByWord={showWordByWord} 
                        memorizationMode={{ isActive: isMemMode, level: memLevel, hideTranslation: hideTranslation }} 
                        onToggleBookmark={handleToggleBookmark} 
                        onSetLastRead={handleSetLastRead} 
                        onTakeNote={handleTakeNote} 
                        onWordClick={setSelectedWord} 
                        onUpdateKhatam={handleUpdateKhatam} 
                        onShare={handleShareVerse} 
                        isAudioPlaying={audioSurah === surah.id && audioVerse === verse.id} 
                        onPlayAudio={() => playVerse(surah.id, verse.id, surah.total_verses, surah.transliteration)} 
                        arabicFontSize={arabicFontSize} 
                        translationFontSize={translationFontSize} 
                        isTajweedMode={showTajweed} 
                      />
                </div>
            )}
          />
      </div>

      <NoteEditorModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveNote} surahName={surah.transliteration} verseId={editingVerseId || 0} initialText={currentNoteText} />
      {selectedWord && <WordDetailModal word={selectedWord} isOpen={!!selectedWord} onClose={() => setSelectedWord(null)} />}
      <SurahInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} info={surahInfo} surah={surah} isLoading={loadingInfo} />
      <QuickJumpModal isOpen={showQuickJump} onClose={() => setShowQuickJump(false)} surahs={allSurahs} currentSurahId={surah.id} onNavigate={handleQuickJump} />
      <FontSettingsModal isOpen={showFontSettings} onClose={() => setShowFontSettings(false)} arabicFontSize={arabicFontSize} onArabicFontSizeChange={setArabicFontSize} translationFontSize={translationFontSize} onTranslationFontSizeChange={setTranslationFontSize} />
      {shareData && <ShareVerseModal isOpen={true} onClose={() => setShareData(null)} surahName={shareData.surahName} verseNumber={shareData.verse.id} arabicText={shareData.verse.text} translationText={shareData.verse.translation || ''} />}
      <MemorizationSettingsModal isOpen={showMemModal} onClose={() => setShowMemModal(false)} level={memLevel} onLevelChange={setMemLevel} isActive={isMemMode} onToggleActive={setIsMemMode} />
    </div>
  );
};

export default SurahDetailPage;
