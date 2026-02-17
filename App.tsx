
import React, { useState, useEffect, useMemo } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SurahCard from './components/SurahCard';
import VerseItem from './components/VerseItem';
import Search from './components/Search';
import Loading from './components/Loading';
import SettingsPage from './pages/SettingsPage';
import LibraryPage from './pages/LibraryPage';
import TopicIndexPage from './pages/TopicIndexPage'; 
import DuaCollectionPage from './pages/DuaCollectionPage'; 
import EmotionPage from './pages/EmotionPage'; 
import QuizPage from './pages/QuizPage'; 
import TadabburPage from './pages/TadabburPage';
import AboutPage from './pages/AboutPage';
import AsmaulHusnaPage from './pages/AsmaulHusnaPage'; 
import NoteEditorModal from './components/NoteEditorModal';
import WordDetailModal from './components/WordDetailModal';
import AudioPlayer from './components/AudioPlayer'; 
import AudioDownloadModal from './components/AudioDownloadModal'; 
import KhatamWidget from './components/KhatamWidget'; 
import MushafView from './components/MushafView'; 
import AyatOfTheDay from './components/AyatOfTheDay'; 
import SurahInfoModal from './components/SurahInfoModal';
import QuickJumpModal from './components/QuickJumpModal'; 
import FontSettingsModal from './components/FontSettingsModal';
import ShareVerseModal from './components/ShareVerseModal'; 
import MemorizationSettingsModal from './components/MemorizationSettingsModal'; // NEW IMPORT
import { getAllSurahs, getSurahDetail, getAvailableEditions, getSurahStartPage, getSurahInfo, JUZ_START_MAPPING, SAJDAH_VERSES, getHizbList } from './services/quranService';
import * as StorageService from './services/storageService';
import { Surah, SurahDetail, LanguageCode, TranslationOption, DEFAULT_EDITIONS, LastReadData, BookmarkData, NoteData, Word, MemorizationLevel, SurahInfo, Verse } from './types';
import { BookOpen, ChevronRight, Clock, ScrollText, Grid, Eye, EyeOff, BrainCircuit, Sparkles, ChevronDown, Check, Zap, AlignCenter, Ghost, Type, Info, ChevronLeft, Compass, Bookmark, Layout } from 'lucide-react';
import { AudioProvider, useAudio } from './contexts/AudioContext';

interface HomePageProps {
  appLang: LanguageCode;
  showTranslation: boolean;
  translationId: string;
}

interface DetailPageProps {
  appLang: LanguageCode;
  translationId?: string;
  tafsirId?: string;
  showTranslation: boolean;
  showTafsir: boolean;
  showWordByWord: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ appLang, showTranslation, translationId }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);
  
  // State for Ayat of the Day Modal
  const [showAyatModal, setShowAyatModal] = useState(false);
  const [isDailyAyatEnabled, setIsDailyAyatEnabled] = useState(true);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'hizb' | 'sajdah'>('surah');
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
        setLastRead(StorageService.getLastRead());
        setIsDailyAyatEnabled(StorageService.getShowAyatOfTheDay());
    };
    loadData();

    // Listen for storage updates
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const data = await getAllSurahs(appLang);
        setSurahs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, [appLang]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [surahs, searchTerm]);

  const handleSurahClick = (id: number) => {
      navigate(`/surah/${id}`);
  };

  const handleContinueReading = () => {
      if(lastRead) {
          navigate(`/surah/${lastRead.surahId}#verse-${lastRead.verseId}`);
      }
  };
  
  const handleNavigateToVerse = (surahId: number, verseId: number) => {
      navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      <div className="text-center mb-8 relative z-10">
        
        {/* Title Badge Container */}
        <div className="relative inline-block mb-4 group">
             {/* The Main Badge */}
             <div className="p-1 border border-quran-gold/30 rounded-full">
                <div className="px-4 py-1 bg-quran-gold/10 rounded-full text-quran-dark text-xs font-bold tracking-widest uppercase">
                    Al-Quran Al-Kareem
                </div>
             </div>

             {/* AYAT OF THE DAY TRIGGER - "Nyembul" Effect - Only show if enabled */}
             {isDailyAyatEnabled && (
                <button 
                    onClick={() => setShowAyatModal(true)}
                    className="absolute -top-3 -right-6 md:-right-8 z-20 animate-bounce hover:animate-none transition-transform hover:scale-110"
                    title="Lihat Ayat Harian"
                >
                    <div className="flex items-center gap-1 bg-quran-gold text-white px-2 py-1 rounded-lg shadow-md text-[10px] font-bold border border-white">
                        <Sparkles className="w-3 h-3 fill-white" />
                        <span className="hidden md:inline">Ayat Harian</span>
                    </div>
                    {/* Little triangle pointer */}
                    <div className="w-2 h-2 bg-quran-gold absolute left-2 -bottom-1 transform rotate-45 border-b border-r border-white"></div>
                </button>
             )}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-quran-dark mb-4 font-serif">Baca & Pelajari Al-Quran</h2>
        <p className="text-gray-500 max-w-xl mx-auto font-serif italic">Temukan kedamaian dalam setiap ayat suci-Nya.</p>
      </div>
      
      {/* Search Bar */}
      <Search value={searchTerm} onChange={setSearchTerm} />

      {/* Only show widgets if not searching */}
      {!searchTerm && (
        <>
            {/* Modal for Ayat of the Day */}
            {isDailyAyatEnabled && (
                <AyatOfTheDay 
                    isOpen={showAyatModal} 
                    onClose={() => setShowAyatModal(false)} 
                    translationId={translationId}
                />
            )}
            
            {/* Khatam Tracker */}
            <KhatamWidget />

            {/* Last Read */}
            {lastRead && (
                <div className="mb-10 bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer" onClick={handleContinueReading}>
                    <div className="flex items-center gap-4">
                        <div className="bg-quran-gold/10 p-3 rounded-full text-quran-gold">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Terakhir Dibaca</p>
                            <h3 className="font-bold text-quran-dark text-lg">
                                {lastRead.surahName} <span className="font-normal text-gray-400 text-sm">Ayat {lastRead.verseId}</span>
                            </h3>
                        </div>
                    </div>
                    <div className="bg-stone-100 p-2 rounded-full text-gray-400 group-hover:bg-quran-dark group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            )}
        </>
      )}

      {/* TABS NAVIGATION */}
      {!searchTerm && (
        <div className="flex justify-center mb-6">
            <div className="flex bg-stone-100 p-1 rounded-xl">
                 {(['surah', 'juz', 'hizb', 'sajdah'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeTab === tab 
                            ? 'bg-white text-quran-dark shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab === 'surah' ? 'Surat' : tab === 'juz' ? 'Juz' : tab === 'hizb' ? 'Hizb' : 'Sajdah'}
                    </button>
                 ))}
            </div>
        </div>
      )}

      {/* CONTENT LISTS */}
      {/* 1. Surah Grid */}
      {(activeTab === 'surah' || searchTerm) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurahs.map((surah) => (
              <SurahCard 
                key={surah.id} 
                surah={surah} 
                onClick={handleSurahClick}
                showTranslation={showTranslation} 
              />
            ))}
            {filteredSurahs.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                  <p>Tidak ada surat yang ditemukan.</p>
              </div>
            )}
          </div>
      )}

      {/* 2. Juz Grid */}
      {activeTab === 'juz' && !searchTerm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JUZ_START_MAPPING.map((juz) => (
                  <button 
                      key={juz.juz}
                      onClick={() => handleNavigateToVerse(juz.surahId, juz.verseId)}
                      className="bg-white p-4 rounded-xl border border-stone-200 hover:border-quran-gold/50 hover:shadow-md transition-all text-left flex items-center justify-between group"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center font-bold text-quran-dark border border-stone-100 group-hover:bg-quran-gold group-hover:text-white transition-colors">
                              {juz.juz}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">Juz {juz.juz}</h4>
                              <p className="text-xs text-gray-500">Mulai: {juz.label}</p>
                          </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-quran-gold" />
                  </button>
              ))}
          </div>
      )}

       {/* 3. Hizb Grid */}
       {activeTab === 'hizb' && !searchTerm && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {getHizbList().map((hizb) => (
                  <button 
                      key={hizb.id}
                      onClick={() => handleNavigateToVerse(hizb.surahId, hizb.verseId)}
                      className="bg-white p-3 rounded-xl border border-stone-200 hover:border-quran-gold/50 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center font-bold text-xs text-stone-500 border border-stone-100 group-hover:bg-quran-gold group-hover:text-white transition-colors">
                              {hizb.id}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-700 text-sm">Hizb {hizb.id}</h4>
                              <p className="text-[10px] text-gray-400">Juz {hizb.juz}</p>
                          </div>
                      </div>
                  </button>
              ))}
          </div>
      )}

      {/* 4. Sajdah Grid */}
      {activeTab === 'sajdah' && !searchTerm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {SAJDAH_VERSES.map((sajdah, idx) => (
                   <button 
                      key={idx}
                      onClick={() => handleNavigateToVerse(sajdah.surahId, sajdah.verseId)}
                      className="bg-white p-4 rounded-xl border border-stone-200 hover:border-quran-gold/50 hover:shadow-md transition-all text-left flex items-center justify-between group"
                   >
                       <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-quran-gold/10 rounded-full flex items-center justify-center text-quran-dark">
                                <Bookmark className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{sajdah.surahName}</h4>
                                <p className="text-xs text-gray-500">Ayat Sajdah: {sajdah.verseId}</p>
                            </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-quran-gold" />
                   </button>
               ))}
          </div>
      )}
      
    </div>
  );
};

const SurahDetailPage: React.FC<DetailPageProps> = ({ 
    appLang, 
    translationId, 
    tafsirId, 
    showTranslation, 
    showTafsir, 
    showWordByWord
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]); // For Navigation
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list'); 
  
  // Surah Info (Asbabun Nuzul) State
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Quick Jump Modal
  const [showQuickJump, setShowQuickJump] = useState(false);

  // Memorization Mode State
  const [isMemMode, setIsMemMode] = useState(false);
  const [memLevel, setMemLevel] = useState<MemorizationLevel>('normal');
  const [hideTranslation, setHideTranslation] = useState(true);
  const [showMemModal, setShowMemModal] = useState(false); // Changed to Modal

  // Font Size Settings State
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
  
  // Share Modal State
  const [shareData, setShareData] = useState<{surahName: string, verse: Verse} | null>(null);

  const { currentSurah: audioSurah, currentVerse: audioVerse, playVerse } = useAudio();

  // Load All Surahs for Navigation
  useEffect(() => {
      getAllSurahs(appLang).then(setAllSurahs);
  }, [appLang]);

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
        
        const data = await getSurahDetail(parseInt(id), appLang, activeTranslation, activeTafsir, showWordByWord);
        setSurah(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, appLang, translationId, tafsirId, showTranslation, showTafsir, showWordByWord]);

  useEffect(() => {
      if (!loading && surah && viewMode === 'list') {
          if (audioSurah === surah.id && audioVerse) {
              const element = document.getElementById(`verse-${audioVerse}`);
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (location.hash) {
              const verseId = location.hash.replace('#verse-', '');
              const element = document.getElementById(`verse-${verseId}`);
              if (element) {
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-quran-gold/10');
                    setTimeout(() => element.classList.remove('bg-quran-gold/10'), 2000);
                  }, 100);
              }
          } else {
               window.scrollTo(0, 0);
          }
      } 
  }, [loading, surah, location, audioVerse, audioSurah, viewMode]);

  // NAVIGATION HELPERS
  const prevSurah = useMemo(() => {
      if (!surah || !allSurahs.length) return null;
      return allSurahs.find(s => s.id === surah.id - 1);
  }, [surah, allSurahs]);

  const nextSurah = useMemo(() => {
      if (!surah || !allSurahs.length) return null;
      return allSurahs.find(s => s.id === surah.id + 1);
  }, [surah, allSurahs]);

  const handleNavigateSurah = (targetId: number) => {
      navigate(`/surah/${targetId}`);
  };

  const handleQuickJump = (surahId: number, verseId: number) => {
      navigate(`/surah/${surahId}#verse-${verseId}`);
      if (viewMode === 'mushaf') {
          // If in mushaf mode, we navigate URL but mushaf component might not auto-scroll to verse pixels yet.
          // It will load the correct start page of the surah because MushafView uses `getSurahStartPage(id)`.
          // For now, simply changing route handles the page load.
      }
  };


  const handleToggleBookmark = (verseId: number) => {
      if(!surah) return;
      const isAdded = StorageService.toggleBookmark(surah.id, surah.transliteration, verseId);
      if (isAdded) {
          setBookmarkedVerses(prev => [...prev, verseId]);
      } else {
          setBookmarkedVerses(prev => prev.filter(v => v !== verseId));
      }
  };

  const handleSetLastRead = (verseId: number) => {
      if(!surah) return;
      
      // Find the verse object to get page number
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      
      StorageService.setLastRead(surah.id, surah.transliteration, verseId, pageNum);
      setLastReadVerse(verseId);
  };
  
  // NEW: Dedicated handler for updating Khatam Progress
  const handleUpdateKhatam = (verseId: number) => {
      if(!surah) return;
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      
      if (pageNum) {
          StorageService.updateKhatamProgress(pageNum, surah.id, surah.transliteration, verseId);
          setLastReadVerse(verseId); // Also update visual "last read" indicator
          alert(`Target Khatam diperbarui ke halaman ${pageNum} (Surat ${surah.transliteration} Ayat ${verseId}).`);
      } else {
          // Fallback if no page data
          alert("Gagal memuat data halaman. Pastikan koneksi internet aktif.");
      }
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
      if (text.trim() === '') {
          setVersesWithNotes(prev => prev.filter(v => v !== editingVerseId));
      } else {
          setVersesWithNotes(prev => [...prev, editingVerseId]); 
      }
  };

  const handleShareVerse = (verse: Verse, surahName: string) => {
      setShareData({
          surahName,
          verse
      });
  };

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

  const memLevels: {id: MemorizationLevel, label: string, icon: any}[] = [
      { id: 'normal', label: 'Normal (Blur)', icon: EyeOff },
      { id: 'first-last', label: 'Awal & Akhir', icon: AlignCenter },
      { id: 'ghost', label: 'Samar (Ghost)', icon: Ghost },
      { id: 'random', label: 'Acak (Random)', icon: Zap },
  ];

  if (loading) return <Loading />;
  if (!surah) return <div className="text-center py-20">Surat tidak ditemukan.</div>;

  // --- MUSHAF MODE RENDER ---
  if (viewMode === 'mushaf') {
      const startPage = getSurahStartPage(surah.id);
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">
              {/* Toolbar Mushaf */}
              <div className="bg-white p-2 border-b border-stone-100 flex justify-between items-center px-4 z-20 shadow-sm shrink-0">
                   {/* Prev/Next Surah in Toolbar */}
                   <div className="flex gap-1">
                        {prevSurah && (
                            <button onClick={() => handleNavigateSurah(prevSurah.id)} className="p-2 hover:bg-stone-100 rounded-lg text-gray-500" title={`Ke Surat ${prevSurah.transliteration}`}>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                         {nextSurah && (
                            <button onClick={() => handleNavigateSurah(nextSurah.id)} className="p-2 hover:bg-stone-100 rounded-lg text-gray-500" title={`Ke Surat ${nextSurah.transliteration}`}>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                   </div>

                   <div className="flex gap-2">
                        {/* Quick Jump */}
                        <button 
                            onClick={() => setShowQuickJump(true)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-stone-100 transition-colors"
                            title="Pindah Ayat"
                        >
                            <Compass className="w-5 h-5" />
                        </button>

                       <button 
                           onClick={() => setViewMode('list')}
                           className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-stone-100 transition-colors whitespace-nowrap"
                       >
                           <ScrollText className="w-4 h-4" />
                           Mode List
                       </button>
                   </div>
              </div>
              
              {/* Full height container for MushafView */}
              <div className="flex-1 relative overflow-hidden">
                  <MushafView 
                    startPage={startPage} 
                    translationId={translationId || 'id.indonesian'}
                  />
              </div>

               <QuickJumpModal 
                    isOpen={showQuickJump}
                    onClose={() => setShowQuickJump(false)}
                    surahs={allSurahs}
                    currentSurahId={surah.id}
                    onNavigate={handleQuickJump}
               />
          </div>
      );
  }

  // --- LIST MODE RENDER ---
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-32">
      
      {/* Top Controls - Revised for Mobile */}
      <div className="flex flex-col gap-4 mb-6">
           <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Scrollable Container for Tools on Mobile */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    
                    {/* Memorization Button */}
                    {/* Replaced with simple button to open Modal */}
                    <button 
                        onClick={() => setShowMemModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                            isMemMode 
                            ? 'bg-quran-dark text-white shadow-md' 
                            : 'bg-white border border-stone-200 text-gray-500'
                        }`}
                    >
                        <BrainCircuit className="w-4 h-4" />
                        {isMemMode ? <span>{getMemLevelLabel(memLevel)}</span> : 'Mode Hafalan'}
                        {isMemMode && <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                    
                    {isMemMode && (
                        <button 
                            onClick={() => setHideTranslation(!hideTranslation)}
                            className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${hideTranslation ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-stone-200 text-gray-400 hover:bg-stone-50'}`}
                            title={hideTranslation ? "Tampilkan Terjemahan" : "Sembunyikan Terjemahan"}
                        >
                            {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Font Settings */}
                    <button 
                            onClick={() => setShowFontSettings(true)}
                            className="p-2 rounded-xl border bg-white border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-all flex-shrink-0"
                            title="Ukuran Font"
                    >
                        <Type className="w-4 h-4" />
                    </button>

                    {/* Quick Jump */}
                    <button 
                        onClick={() => setShowQuickJump(true)}
                        className="p-2 rounded-xl bg-white border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-all flex-shrink-0"
                        title="Pindah Cepat (Surat/Ayat)"
                    >
                        <Compass className="w-4 h-4" />
                    </button>
                </div>

                {/* Mushaf Mode Toggle (Full Width on Mobile usually looks better or top right) */}
                <button 
                    onClick={() => setViewMode('mushaf')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-stone-200 text-sm font-bold text-quran-dark hover:border-quran-gold transition-colors flex-shrink-0 w-full sm:w-auto"
                >
                    <BookOpen className="w-4 h-4 text-quran-gold" />
                    Mode Mushaf
                </button>
           </div>
      </div>
      
      {/* Top Surah Navigation */}
      <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-500">
         {prevSurah ? (
             <button onClick={() => handleNavigateSurah(prevSurah.id)} className="flex items-center gap-1 hover:text-quran-dark transition-colors">
                 <ChevronLeft className="w-4 h-4" /> {prevSurah.transliteration}
             </button>
         ) : <div></div>}
         
         {nextSurah ? (
             <button onClick={() => handleNavigateSurah(nextSurah.id)} className="flex items-center gap-1 hover:text-quran-dark transition-colors">
                 {nextSurah.transliteration} <ChevronRight className="w-4 h-4" />
             </button>
         ) : <div></div>}
      </div>

      {/* Surah Header */}
      <div className="bg-gradient-to-br from-quran-dark to-[#142924] rounded-2xl p-8 mb-6 text-white text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        
        {/* Info Button */}
        <button 
            onClick={handleOpenInfo}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20 group"
            title="Info & Asbabun Nuzul"
        >
            <Info className="w-5 h-5 text-white" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Info Surat</span>
        </button>

        <div className="relative z-10">
            <h2 className="text-4xl font-bold font-serif mb-2">{surah.transliteration}</h2>
            <p className="text-quran-gold text-lg mb-6 italic">{surah.translation}</p>
            <div className="flex justify-center items-center gap-4 text-sm text-white/70 font-sans tracking-wide">
                <span className="uppercase">{surah.type}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-quran-gold"></span>
                <span>{surah.total_verses} AYAT</span>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
                <p className="font-arabic text-4xl leading-relaxed">
                   بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
            </div>
        </div>
      </div>

      {/* Verses List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-2 md:p-8">
        {surah.verses.map((verse) => (
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
             // Pass Extended Memorization Props
             memorizationMode={{
                 isActive: isMemMode,
                 level: memLevel,
                 hideTranslation: hideTranslation
             }}
             onToggleBookmark={handleToggleBookmark}
             onSetLastRead={handleSetLastRead}
             onTakeNote={handleTakeNote}
             onWordClick={setSelectedWord}
             onUpdateKhatam={handleUpdateKhatam}
             onShare={handleShareVerse}
             isAudioPlaying={audioSurah === surah.id && audioVerse === verse.id}
             onPlayAudio={() => playVerse(surah.id, verse.id, surah.total_verses, surah.transliteration)}
             
             // Font Size Props
             arabicFontSize={arabicFontSize}
             translationFontSize={translationFontSize}
          />
        ))}
      </div>
      
      {/* Bottom Surah Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-stone-200">
         {prevSurah ? (
             <button onClick={() => { window.scrollTo(0,0); handleNavigateSurah(prevSurah.id); }} className="flex flex-col items-start gap-1 p-3 hover:bg-stone-50 rounded-xl transition-all group text-left">
                 <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Sebelumnya</span>
                 <span className="font-bold text-quran-dark group-hover:text-quran-gold">{prevSurah.transliteration}</span>
             </button>
         ) : <div />}
         
         {nextSurah ? (
             <button onClick={() => { window.scrollTo(0,0); handleNavigateSurah(nextSurah.id); }} className="flex flex-col items-end gap-1 p-3 hover:bg-stone-50 rounded-xl transition-all group text-right">
                 <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">Selanjutnya <ChevronRight className="w-3 h-3" /></span>
                 <span className="font-bold text-quran-dark group-hover:text-quran-gold">{nextSurah.transliteration}</span>
             </button>
         ) : <div />}
      </div>

      <NoteEditorModal 
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSave={handleSaveNote}
          surahName={surah.transliteration}
          verseId={editingVerseId || 0}
          initialText={currentNoteText}
      />

      {selectedWord && (
          <WordDetailModal 
            word={selectedWord}
            isOpen={!!selectedWord}
            onClose={() => setSelectedWord(null)}
          />
      )}

      {/* Surah Info Modal */}
      <SurahInfoModal 
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          info={surahInfo}
          surah={surah}
          isLoading={loadingInfo}
      />

      {/* Quick Jump Modal */}
      <QuickJumpModal 
          isOpen={showQuickJump}
          onClose={() => setShowQuickJump(false)}
          surahs={allSurahs}
          currentSurahId={surah.id}
          onNavigate={handleQuickJump}
      />

       {/* Font Settings Modal */}
       <FontSettingsModal 
          isOpen={showFontSettings}
          onClose={() => setShowFontSettings(false)}
          arabicFontSize={arabicFontSize}
          onArabicFontSizeChange={setArabicFontSize}
          translationFontSize={translationFontSize}
          onTranslationFontSizeChange={setTranslationFontSize}
       />

       {/* Share Verse Modal */}
       {shareData && (
          <ShareVerseModal 
              isOpen={true}
              onClose={() => setShareData(null)}
              surahName={shareData.surahName}
              verseNumber={shareData.verse.id}
              arabicText={shareData.verse.text}
              translationText={shareData.verse.translation || ''}
          />
       )}
       
       {/* Memorization Settings Modal */}
       <MemorizationSettingsModal 
           isOpen={showMemModal}
           onClose={() => setShowMemModal(false)}
           level={memLevel}
           onLevelChange={setMemLevel}
           isActive={isMemMode}
           onToggleActive={setIsMemMode}
       />

    </div>
  );
};

const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<LanguageCode>('id');
  const [translationEdition, setTranslationEdition] = useState<string>('id.indonesian');
  const [tafsirEdition, setTafsirEdition] = useState<string>('id.jalalayn'); 
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false); 
  const [showWordByWord, setShowWordByWord] = useState(false); 
  
  const [availableEditions, setAvailableEditions] = useState<TranslationOption[]>(DEFAULT_EDITIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
      const initData = async () => {
          const editions = await getAvailableEditions();
          if (editions.length > 0) {
              setAvailableEditions(editions);
          }
      };
      initData();
  }, []);

  return (
    <AudioProvider>
        <MemoryRouter>
        <div className="min-h-screen flex flex-col bg-pattern-overlay h-screen overflow-hidden">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
            
            <main className="flex-grow overflow-auto h-full">
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <HomePage 
                            appLang={appLanguage} 
                            showTranslation={showTranslation} 
                            translationId={translationEdition} // Pass Translation ID
                        />
                    } 
                />
                <Route 
                    path="/library" 
                    element={<LibraryPage />} 
                />
                 {/* New Topic Route */}
                <Route 
                    path="/topics" 
                    element={<TopicIndexPage />} 
                />
                 {/* New Dua Route */}
                <Route 
                    path="/duas" 
                    element={<DuaCollectionPage />} 
                />
                {/* NEW EMOTION ROUTE */}
                <Route 
                    path="/feelings" 
                    element={<EmotionPage />} 
                />
                {/* NEW QUIZ ROUTE */}
                <Route 
                    path="/quiz" 
                    element={<QuizPage />} 
                />
                 {/* NEW TADABBUR ROUTE */}
                 <Route 
                    path="/tadabbur" 
                    element={<TadabburPage />} 
                />
                {/* NEW ASMAUL HUSNA ROUTE */}
                <Route 
                    path="/asmaul-husna" 
                    element={<AsmaulHusnaPage />} 
                />
                {/* NEW ABOUT ROUTE */}
                <Route 
                    path="/about" 
                    element={<AboutPage />} 
                />
                <Route 
                    path="/surah/:id" 
                    element={
                        <SurahDetailPage 
                            appLang={appLanguage} 
                            translationId={translationEdition}
                            tafsirId={tafsirEdition}
                            showTranslation={showTranslation} 
                            showTafsir={showTafsir}
                            showWordByWord={showWordByWord}
                        />
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        <SettingsPage 
                            currentAppLang={appLanguage}
                            onAppLangChange={setAppLanguage}
                            
                            currentTranslationId={translationEdition}
                            onTranslationChange={setTranslationEdition}
                            showTranslation={showTranslation}
                            onToggleTranslation={setShowTranslation}

                            currentTafsirId={tafsirEdition}
                            onTafsirChange={setTafsirEdition}
                            showTafsir={showTafsir}
                            onToggleTafsir={setShowTafsir}

                            showWordByWord={showWordByWord}
                            onToggleWordByWord={setShowWordByWord}

                            availableEditions={availableEditions}
                        />
                    } 
                />
            </Routes>
            </main>

            <AudioPlayer />
            <AudioDownloadModal /> 
        </div>
        </MemoryRouter>
    </AudioProvider>
  );
};

export default App;
