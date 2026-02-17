
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
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
import NoteEditorModal from './components/NoteEditorModal';
import WordDetailModal from './components/WordDetailModal';
import AudioPlayer from './components/AudioPlayer'; 
import AudioDownloadModal from './components/AudioDownloadModal'; 
import KhatamWidget from './components/KhatamWidget'; 
import MushafView from './components/MushafView'; 
import AyatOfTheDay from './components/AyatOfTheDay'; 
import SurahInfoModal from './components/SurahInfoModal';
import { getAllSurahs, getSurahDetail, getAvailableEditions, getSurahStartPage, getSurahInfo, getAdjacentSurahs } from './services/quranService';
import * as StorageService from './services/storageService';
import { Surah, SurahDetail, LanguageCode, TranslationOption, DEFAULT_EDITIONS, LastReadData, BookmarkData, NoteData, Word, MemorizationLevel, SurahInfo } from './types';
import { JUZ_DATA, SAJDA_LOCATIONS } from './services/quranMeta';
import { BookOpen, ChevronRight, Clock, ScrollText, Grid, Eye, EyeOff, BrainCircuit, Sparkles, ChevronDown, Check, Zap, AlignCenter, Ghost, Type, Info, Layers, Bookmark, ArrowRight, ArrowLeft } from 'lucide-react';
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
  
  // List Mode State
  const [listMode, setListMode] = useState<'surah' | 'juz' | 'sajda'>('surah');
  
  // State for Ayat of the Day Modal
  const [showAyatModal, setShowAyatModal] = useState(false);
  const [isDailyAyatEnabled, setIsDailyAyatEnabled] = useState(true);
  
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
  
  const handleJuzClick = (surahId: number, verseId: number) => {
      navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  const handleSajdaClick = (surahId: number, verseId: number) => {
      navigate(`/surah/${surahId}#verse-${verseId}`);
  };

  const handleContinueReading = () => {
      if(lastRead) {
          navigate(`/surah/${lastRead.surahId}#verse-${lastRead.verseId}`);
      }
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
                <div className="mb-8 bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer" onClick={handleContinueReading}>
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

      {/* View Mode Tabs */}
      {!searchTerm && (
        <div className="flex justify-center mb-6">
            <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                    onClick={() => setListMode('surah')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${listMode === 'surah' ? 'bg-white text-quran-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Surat
                </button>
                <button
                    onClick={() => setListMode('juz')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${listMode === 'juz' ? 'bg-white text-quran-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Juz
                </button>
                <button
                    onClick={() => setListMode('sajda')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${listMode === 'sajda' ? 'bg-white text-quran-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Sajdah
                </button>
            </div>
        </div>
      )}

      {/* --- LIST CONTENT --- */}
      
      {/* 1. SURAH LIST */}
      {(listMode === 'surah' || searchTerm) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurahs.map((surah) => (
              <SurahCard 
                key={surah.id} 
                surah={surah} 
                onClick={handleSurahClick}
                showTranslation={showTranslation} 
              />
            ))}
          </div>
      )}

      {/* 2. JUZ LIST */}
      {listMode === 'juz' && !searchTerm && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {JUZ_DATA.map((juz) => (
                  <button 
                    key={juz.id}
                    onClick={() => handleJuzClick(juz.startSurahId, juz.startVerse)}
                    className="bg-white p-4 rounded-xl border border-stone-200 hover:border-quran-gold hover:shadow-md transition-all text-left group"
                  >
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-quran-gold transition-colors">Juz {juz.id}</span>
                          <Layers className="w-4 h-4 text-gray-300 group-hover:text-quran-gold transition-colors" />
                      </div>
                      <h4 className="font-serif font-bold text-quran-dark text-lg mb-0.5">Mulai</h4>
                      <p className="text-xs text-gray-500">
                          {juz.startSurahName} : Ayat {juz.startVerse}
                      </p>
                  </button>
              ))}
          </div>
      )}

      {/* 3. SAJDA LIST */}
      {listMode === 'sajda' && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAJDA_LOCATIONS.map((item, idx) => (
                  <button
                     key={idx}
                     onClick={() => handleSajdaClick(item.surahId, item.verseId)}
                     className="bg-white p-5 rounded-xl border border-stone-200 hover:border-quran-gold hover:shadow-md transition-all text-left flex items-center justify-between group"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-quran-gold/10 flex items-center justify-center text-quran-dark font-bold text-sm">
                              {idx + 1}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">{item.surahName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-gray-500 border border-stone-200">Ayat {item.verseId}</span>
                                  <span className="text-[10px] text-gray-400 italic">{item.recommendation}</span>
                              </div>
                          </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-quran-gold transition-colors" />
                  </button>
              ))}
          </div>
      )}
      
      {/* Empty State for Search */}
      {searchTerm && filteredSurahs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
              <p>Tidak ada surat yang ditemukan.</p>
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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list'); 
  
  // Navigation State
  const [adjacentSurahs, setAdjacentSurahs] = useState<{prev: Surah | null, next: Surah | null}>({prev: null, next: null});

  // Surah Info (Asbabun Nuzul) State
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Memorization Mode State
  const [isMemMode, setIsMemMode] = useState(false);
  const [memLevel, setMemLevel] = useState<MemorizationLevel>('normal');
  const [hideTranslation, setHideTranslation] = useState(true);
  const [showMemMenu, setShowMemMenu] = useState(false);

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

  const { currentSurah: audioSurah, currentVerse: audioVerse, playVerse } = useAudio();

  // --- SWIPE HANDLERS FOR LIST MODE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null); // To detect scroll vs swipe

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd || !touchStartY) return;
    
    const distanceX = touchStart - touchEnd;
    const distanceY = touchStartY - e.changedTouches[0].clientY;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const minSwipeDistance = 50;

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0 && adjacentSurahs.next) {
            // Swipe Left -> Go to Next
            navigate(`/surah/${adjacentSurahs.next.id}`);
        } else if (distanceX < 0 && adjacentSurahs.prev) {
            // Swipe Right -> Go to Prev
            navigate(`/surah/${adjacentSurahs.prev.id}`);
        }
    }
  };

  // --- KEYBOARD HANDLERS ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Ignore if user is typing in an input
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

          if (e.key === 'ArrowRight' && adjacentSurahs.next) {
              navigate(`/surah/${adjacentSurahs.next.id}`);
          } else if (e.key === 'ArrowLeft' && adjacentSurahs.prev) {
               navigate(`/surah/${adjacentSurahs.prev.id}`);
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adjacentSurahs, navigate]);


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

        // Fetch Adjacent Surahs
        getAdjacentSurahs(surahIdInt, appLang).then(setAdjacentSurahs);
    }
  }, [id, appLang]);

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
          <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
              {/* Toolbar */}
              <div className="bg-white p-2 border-b border-stone-100 flex justify-end px-4 z-20 shadow-sm shrink-0">
                   <button 
                       onClick={() => setViewMode('list')}
                       className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-stone-100 transition-colors"
                   >
                       <ScrollText className="w-4 h-4" />
                       Mode List
                   </button>
              </div>
              
              {/* Full height container for MushafView */}
              <div className="flex-1 relative overflow-hidden">
                  <MushafView 
                    startPage={startPage} 
                    translationId={translationId || 'id.indonesian'}
                  />
              </div>
          </div>
      );
  }

  // --- LIST MODE RENDER ---
  return (
    <div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-32"
        // Attach Swipe Handlers to Container
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
           {/* Memorization Dropdown */}
           <div className="flex flex-wrap items-center gap-2 relative">
                {isMemMode ? (
                     <div className="relative">
                        <button 
                            onClick={() => setShowMemMenu(!showMemMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-quran-dark text-white rounded-xl text-sm font-bold shadow-md hover:bg-quran-dark/90 transition-all"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            <span>{getMemLevelLabel(memLevel)}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {showMemMenu && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-fade-in">
                                <div className="p-2 space-y-1">
                                    {memLevels.map((lvl) => (
                                        <button
                                            key={lvl.id}
                                            onClick={() => {
                                                setMemLevel(lvl.id);
                                                setShowMemMenu(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${memLevel === lvl.id ? 'bg-quran-gold/10 text-quran-dark font-bold' : 'text-gray-600 hover:bg-stone-50'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <lvl.icon className="w-4 h-4" />
                                                {lvl.label}
                                            </div>
                                            {memLevel === lvl.id && <Check className="w-3 h-3 text-quran-gold" />}
                                        </button>
                                    ))}
                                    <div className="h-px bg-stone-100 my-1"></div>
                                    <button 
                                        onClick={() => setIsMemMode(false)}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium"
                                    >
                                        Matikan Mode Hafalan
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Backdrop for menu */}
                        {showMemMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMemMenu(false)}></div>}
                     </div>
                ) : (
                    <button 
                        onClick={() => setIsMemMode(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-stone-200 text-gray-500 hover:border-quran-dark hover:text-quran-dark transition-all"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Mode Hafalan
                    </button>
                )}

                {isMemMode && (
                    <button 
                        onClick={() => setHideTranslation(!hideTranslation)}
                        className={`p-2 rounded-xl border transition-colors ${hideTranslation ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-stone-200 text-gray-400 hover:bg-stone-50'}`}
                        title={hideTranslation ? "Tampilkan Terjemahan" : "Sembunyikan Terjemahan"}
                    >
                        {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}

                {/* Font Size Settings Toggle */}
                <div className="relative">
                    <button 
                         onClick={() => setShowFontSettings(!showFontSettings)}
                         className={`p-2 rounded-xl border transition-colors ${showFontSettings ? 'bg-stone-100 border-stone-300 text-quran-dark' : 'bg-white border-stone-200 text-gray-400 hover:bg-stone-50'}`}
                         title="Ukuran Font"
                    >
                        <Type className="w-4 h-4" />
                    </button>

                    {showFontSettings && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowFontSettings(false)}></div>
                            <div className="absolute right-0 sm:left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-100 p-4 z-20 animate-fade-in">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Arab</span>
                                        <span className="text-xs font-bold text-quran-gold">{arabicFontSize}px</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="60" 
                                        value={arabicFontSize} 
                                        onChange={(e) => setArabicFontSize(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                                    />
                                    <div className="font-arabic text-right mt-2 text-quran-dark" style={{fontSize: `${arabicFontSize}px`}}>
                                        بِسۡمِ ٱللَّهِ
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Terjemahan</span>
                                        <span className="text-xs font-bold text-quran-gold">{translationFontSize}px</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="12" 
                                        max="24" 
                                        value={translationFontSize} 
                                        onChange={(e) => setTranslationFontSize(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                                    />
                                    <div className="mt-2 text-gray-600 italic font-serif" style={{fontSize: `${translationFontSize}px`}}>
                                        Dengan menyebut nama Allah
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
           </div>

           <button 
               onClick={() => setViewMode('mushaf')}
               className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-stone-200 text-sm font-bold text-quran-dark hover:border-quran-gold transition-colors"
           >
               <BookOpen className="w-4 h-4 text-quran-gold" />
               Mode Mushaf (Halaman)
           </button>
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
             isAudioPlaying={audioSurah === surah.id && audioVerse === verse.id}
             onPlayAudio={() => playVerse(surah.id, verse.id, surah.total_verses, surah.transliteration)}
             
             // Font Size Props
             arabicFontSize={arabicFontSize}
             translationFontSize={translationFontSize}
          />
        ))}
      </div>
      
      {/* Navigation Footer */}
      <div className="mt-8 flex gap-4">
           {adjacentSurahs.prev ? (
               <button 
                   onClick={() => navigate(`/surah/${adjacentSurahs.prev!.id}`)}
                   className="flex-1 bg-white p-4 rounded-xl border border-stone-200 hover:border-quran-gold hover:shadow-md transition-all group text-left"
               >
                   <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 group-hover:text-quran-gold">
                       <ArrowLeft className="w-3 h-3" /> Sebelumnya
                   </div>
                   <div className="font-bold text-quran-dark">{adjacentSurahs.prev.transliteration}</div>
               </button>
           ) : <div className="flex-1"></div>}

           {adjacentSurahs.next ? (
               <button 
                   onClick={() => navigate(`/surah/${adjacentSurahs.next!.id}`)}
                   className="flex-1 bg-white p-4 rounded-xl border border-stone-200 hover:border-quran-gold hover:shadow-md transition-all group text-right"
               >
                   <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1 group-hover:text-quran-gold">
                       Selanjutnya <ArrowRight className="w-3 h-3" />
                   </div>
                   <div className="font-bold text-quran-dark">{adjacentSurahs.next.transliteration}</div>
               </button>
           ) : <div className="flex-1"></div>}
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm pb-8">
         <p>Akhir dari Surat {surah.transliteration}</p>
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
        <HashRouter>
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
        </HashRouter>
    </AudioProvider>
  );
};

export default App;
