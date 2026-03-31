
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
import MushafTextView from '../components/MushafTextView';
import ConfirmationModal from '../components/ConfirmationModal';
import { getSurahDetail, getSurahStartPage, getSurahInfo, getAllSurahs, showToast, getPageForVerse } from '../services/quranService';
import * as StorageService from '../services/storageService';
import { Surah, SurahDetail, Word, MemorizationLevel, SurahInfo, Verse } from '../types';
import { BookOpen, ChevronRight, ScrollText, Eye, EyeOff, BrainCircuit, ChevronDown, Type, Info, ChevronLeft, Compass, X, MoreVertical } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArabicFontId, DEFAULT_ARABIC_FONT_ID, getArabicFontOption } from '../constants/quranFonts';
import { getQcfSurahNameGlyphCandidate } from '../constants/qcfGlyphs';

interface DetailPageProps {
  translationId?: string;
  tafsirId?: string;
  showTranslation: boolean;
  showTafsir: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
}

const EDGE_SWIPE_ZONE_PX = 32;

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
  const [viewMode, setViewMode] = useState<'list' | 'mushaf' | 'mushaf-text'>('list'); 
  const [mushafTextStartPage, setMushafTextStartPage] = useState<number | null>(null);
  const [showMushafModeModal, setShowMushafModeModal] = useState(false);
  const [defaultMushafMode, setDefaultMushafMode] = useState<'text' | 'image'>('text');
  
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
  const [arabicFontFamily, setArabicFontFamily] = useState<ArabicFontId>(DEFAULT_ARABIC_FONT_ID);
  
  const [lastReadVerse, setLastReadVerse] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([]);
  const [versesWithNotes, setVersesWithNotes] = useState<number[]>([]);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingVerseId, setEditingVerseId] = useState<number | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  
  const [selectedWord, setSelectedWord] = useState<{ word: Word; verseId: number } | null>(null);
  const [shareData, setShareData] = useState<{surahName: string, verse: Verse} | null>(null);
  const [showKhatamConfirm, setShowKhatamConfirm] = useState(false);
  const [pendingKhatamVerse, setPendingKhatamVerse] = useState<{id: number, page: number} | null>(null);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [showMobileHeaderMenu, setShowMobileHeaderMenu] = useState(false);
  const { currentSurah: audioSurah, currentVerse: audioVerse, playVerse, stop } = useAudio();

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const listSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const prevViewModeRef = useRef<'list' | 'mushaf' | 'mushaf-text'>(viewMode);
  const stopRef = useRef(stop);
  const lastListScrollTopRef = useRef(0);
  const mobileNavVisibleRef = useRef(true);

  useEffect(() => {
      stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
      mobileNavVisibleRef.current = mobileNavVisible;
  }, [mobileNavVisible]);

  useEffect(() => {
      getAllSurahs(language).then(setAllSurahs);
  }, [language]);

  useEffect(() => {
      const prev = prevViewModeRef.current;
      if ((prev === 'mushaf' || prev === 'mushaf-text') && viewMode === 'list') {
          stop();
      }
      prevViewModeRef.current = viewMode;
  }, [viewMode, stop]);

  useEffect(() => {
      if (viewMode === 'mushaf' || viewMode === 'mushaf-text') {
          setShowMushafModeModal(false);
          setShowMobileHeaderMenu(false);
      }
  }, [viewMode]);

  useEffect(() => {
      if (showQuickJump || showFontSettings || showMemModal || showMushafModeModal) {
          setShowMobileHeaderMenu(false);
      }
  }, [showQuickJump, showFontSettings, showMemModal, showMushafModeModal]);

  const prevSurah = useMemo(() => (!surah || !allSurahs.length) ? null : allSurahs.find(s => s.id === surah.id - 1), [surah, allSurahs]);
  const nextSurah = useMemo(() => (!surah || !allSurahs.length) ? null : allSurahs.find(s => s.id === surah.id + 1), [surah, allSurahs]);

  useEffect(() => {
      const handleKeydown = (event: KeyboardEvent) => {
          if (viewMode !== 'list' || window.innerWidth < 768) return;
          const target = event.target as HTMLElement | null;
          const tagName = target?.tagName?.toLowerCase();
          const isTypingTarget = !!target && (
              target.isContentEditable ||
              tagName === 'input' ||
              tagName === 'textarea' ||
              tagName === 'select' ||
              tagName === 'button'
          );
          if (isTypingTarget) return;

          if (event.key === 'ArrowLeft' && prevSurah) {
              event.preventDefault();
              handleNavigateSurah(prevSurah.id);
          } else if (event.key === 'ArrowRight' && nextSurah) {
              event.preventDefault();
              handleNavigateSurah(nextSurah.id);
          }
      };

      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
  }, [viewMode, prevSurah, nextSurah]);

  useEffect(() => {
      return () => {
          stopRef.current();
      };
  }, []);

  useEffect(() => {
      if (viewMode === 'mushaf-text' && !mushafTextStartPage && surah) {
          setMushafTextStartPage(getSurahStartPage(surah.id));
      }
  }, [viewMode, mushafTextStartPage, surah]);

  useEffect(() => {
      const loadDefaultMode = async () => {
          const mode = await StorageService.getDefaultMushafMode();
          setDefaultMushafMode(mode);
      };
      loadDefaultMode();
      const onStorageUpdate = () => loadDefaultMode();
      window.addEventListener('storage-update', onStorageUpdate);
      return () => window.removeEventListener('storage-update', onStorageUpdate);
  }, []);

  useEffect(() => {
      const loadDisplaySettings = async () => {
          const [savedArabicSize, savedTranslationSize, savedArabicFamily] = await Promise.all([
              StorageService.getArabicFontSize(),
              StorageService.getTranslationFontSize(),
              StorageService.getArabicFontFamily(),
          ]);
          setArabicFontSize(savedArabicSize);
          setTranslationFontSize(savedTranslationSize);
          setArabicFontFamily(savedArabicFamily);
          StorageService.applyArabicFontFamily(savedArabicFamily);
      };
      loadDisplaySettings();
      const onStorageUpdate = () => loadDisplaySettings();
      window.addEventListener('storage-update', onStorageUpdate);
      return () => window.removeEventListener('storage-update', onStorageUpdate);
  }, []);

  useEffect(() => {
    const loadStorageData = async () => {
      if(id) {
          const surahIdInt = parseInt(id);
          const lr = await StorageService.getLastRead();
          if (lr && lr.surahId === surahIdInt) {
              setLastReadVerse(lr.verseId);
          }
          const bms = await StorageService.getBookmarks();
          setBookmarkedVerses(bms.filter(b => b.surahId === surahIdInt).map(b => b.verseId));
          const notes = await StorageService.getNotes();
          setVersesWithNotes(notes.filter(n => n.surahId === surahIdInt).map(n => n.verseId));
      }
    };
    loadStorageData();
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

  useEffect(() => {
    setMushafTextStartPage(null);
  }, [id]);

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
  const handleNavigateSurah = (targetId: number) => navigate(`/surah/${targetId}`);
  const handleQuickJump = (surahId: number, verseId: number) => { navigate(`/surah/${surahId}#verse-${verseId}`); };
  const handleQuickJumpMushafText = async (surahId: number, verseId: number) => {
      const page = await getPageForVerse(surahId, verseId);
      setMushafTextStartPage(page);
      if (surahId !== surah?.id) {
          navigate(`/surah/${surahId}#verse-${verseId}`);
      }
  };
  const closeMushafMode = () => {
      setViewMode('list');
  };

  const openMushafMode = (mode: 'mushaf' | 'mushaf-text', pageOverride?: number) => {
      if (mode === 'mushaf-text') {
          setMushafTextStartPage(pageOverride || mushafTextStartPage || getSurahStartPage(surah?.id || 1));
      }
      setViewMode(mode);
      setShowMushafModeModal(false);
  };

  const handleListTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      if (viewMode !== 'list') return;
      const t = e.touches[0];
      listSwipeStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleListTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      if (viewMode !== 'list') return;
      if (showInfoModal || showQuickJump || showMemModal || isNoteModalOpen || showFontSettings || !!selectedWord || !!shareData) return;
      if (!listSwipeStartRef.current) return;

      const start = listSwipeStartRef.current;
      const end = e.changedTouches[0];
      const deltaX = start.x - end.clientX;
      const deltaY = Math.abs(start.y - end.clientY);
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const fromLeftEdge = start.x <= EDGE_SWIPE_ZONE_PX;
      const fromRightEdge = start.x >= (viewportWidth - EDGE_SWIPE_ZONE_PX);
      listSwipeStartRef.current = null;

      // Horizontal-first swipe gesture for quick surah navigation.
      if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > deltaY * 1.25) {
          // Edge swipe only: from right edge for next, from left edge for previous.
          if (deltaX > 0 && fromRightEdge && nextSurah) handleNavigateSurah(nextSurah.id); // Swipe left -> next surah
          if (deltaX < 0 && fromLeftEdge && prevSurah) handleNavigateSurah(prevSurah.id); // Swipe right -> previous surah
      }
  };
  const handleToggleBookmark = async (verseId: number) => {
      if(!surah) return;
      const isAdded = await StorageService.toggleBookmark(surah.id, surah.transliteration, verseId);
      if (isAdded) setBookmarkedVerses(prev => [...prev, verseId]);
      else setBookmarkedVerses(prev => prev.filter(v => v !== verseId));
  };
  const handleSetLastRead = async (verseId: number) => {
      if(!surah) return;
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      await StorageService.setLastRead(surah.id, surah.transliteration, verseId, pageNum);
      setLastReadVerse(verseId);
  };
  const handleUpdateKhatam = (verseId: number) => {
      if(!surah) return;
      const verseObj = surah.verses.find(v => v.id === verseId);
      const pageNum = verseObj ? verseObj.page_number : undefined;
      if (pageNum) {
          setPendingKhatamVerse({ id: verseId, page: pageNum });
          setShowKhatamConfirm(true);
      } else { 
          showToast("Gagal memuat data halaman.", "error");
      }
  };

  const performKhatamUpdate = async () => {
      if (!surah || !pendingKhatamVerse) return;
      try {
          await StorageService.updateKhatamProgress(pendingKhatamVerse.page);
          showToast(`Target Khatam diperbarui ke halaman ${pendingKhatamVerse.page} (Surat ${surah.transliteration} Ayat ${pendingKhatamVerse.id}).`, "success");
      } catch (e) {
          showToast("Gagal memperbarui progres khatam.", "error");
      } finally {
          setShowKhatamConfirm(false);
          setPendingKhatamVerse(null);
      }
  };
  const handleTakeNote = async (verseId: number) => {
      if(!surah) return;
      setEditingVerseId(verseId);
      const existingNote = await StorageService.getNoteForVerse(surah.id, verseId);
      setCurrentNoteText(existingNote ? existingNote.text : '');
      setIsNoteModalOpen(true);
  };
  const handleSaveNote = async (text: string) => {
      if(!surah || editingVerseId === null) return;
      await StorageService.saveNote(surah.id, surah.transliteration, editingVerseId, text);
      if (text.trim() === '') setVersesWithNotes(prev => prev.filter(v => v !== editingVerseId));
      else setVersesWithNotes(prev => [...prev, editingVerseId]); 
  };
  const handleShareVerse = (verse: Verse, surahName: string) => setShareData({ surahName, verse });
  const handleOpenInfo = async () => {
      if (!surah) return;
      setShowInfoModal(true);
      if (!surahInfo) {
          setLoadingInfo(true);
          const info = await getSurahInfo(surah.id, language);
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

  const virtuosoScroller = useMemo(
      () =>
          React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => (
              <div
                  {...props}
                  ref={ref}
                  onScroll={(event) => {
                      props.onScroll?.(event);
                      const target = event.currentTarget;
                      const nextTop = target.scrollTop;
                      const delta = nextTop - lastListScrollTopRef.current;

                      if (window.innerWidth < 640) {
                          if (nextTop < 24) {
                              if (!mobileNavVisibleRef.current) setMobileNavVisible(true);
                          } else if (delta > 12) {
                              if (mobileNavVisibleRef.current) setMobileNavVisible(false);
                          } else if (delta < -12) {
                              if (!mobileNavVisibleRef.current) setMobileNavVisible(true);
                          }
                      }

                      lastListScrollTopRef.current = nextTop;
                  }}
              />
          )),
      []
  );

  if (loading) return <Loading />;
  if (!surah) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Surat tidak ditemukan.</div>;

  if (viewMode === 'mushaf') {
      const startPage = getSurahStartPage(surah.id);
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-900">
              <div className="flex-1 relative overflow-hidden">
                  <MushafView
                    startPage={startPage}
                    translationId={translationId || 'id.indonesian'}
                    onClose={closeMushafMode}
                    onSwitchToText={(page) => openMushafMode('mushaf-text', page)}
                    onOpenQuickJump={() => setShowQuickJump(true)}
                  />
              </div>
               <QuickJumpModal isOpen={showQuickJump} onClose={() => setShowQuickJump(false)} surahs={allSurahs} currentSurahId={surah.id} onNavigate={handleQuickJump} />
          </div>
      );
  }

  if (viewMode === 'mushaf-text') {
      const startPage = mushafTextStartPage || getSurahStartPage(surah.id);
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-900">
              <MushafTextView
                startPage={startPage}
                translationId={translationId || 'id.indonesian'}
                showTranslation={showTranslation}
                showTajweed={showTajweed}
                tafsirId={tafsirId}
                onClose={closeMushafMode}
                onSwitchToImage={() => openMushafMode('mushaf')}
                onOpenQuickJump={() => setShowQuickJump(true)}
                onOpenFontSettings={() => setShowFontSettings(true)}
                onOpenMemorization={() => setShowMemModal(true)}
                isMemMode={isMemMode}
                memLevel={memLevel}
                memLevelLabel={getMemLevelLabel(memLevel)}
                arabicFontSize={arabicFontSize}
                arabicFontFamily={arabicFontFamily}
                hideTranslation={hideTranslation}
              />
              <QuickJumpModal isOpen={showQuickJump} onClose={() => setShowQuickJump(false)} surahs={allSurahs} currentSurahId={surah.id} onNavigate={handleQuickJumpMushafText} />
              <FontSettingsModal
                isOpen={showFontSettings}
                onClose={() => setShowFontSettings(false)}
                arabicFontFamily={arabicFontFamily}
                onArabicFontFamilyChange={(fontId) => {
                    setArabicFontFamily(fontId);
                    StorageService.setArabicFontFamily(fontId);
                }}
                arabicFontSize={arabicFontSize}
                onArabicFontSizeChange={(size) => {
                    setArabicFontSize(size);
                    StorageService.setArabicFontSize(size);
                }}
                translationFontSize={translationFontSize}
                onTranslationFontSizeChange={(size) => {
                    setTranslationFontSize(size);
                    StorageService.setTranslationFontSize(size);
                }}
              />
              <MemorizationSettingsModal isOpen={showMemModal} onClose={() => setShowMemModal(false)} level={memLevel} onLevelChange={setMemLevel} isActive={isMemMode} onToggleActive={setIsMemMode} />
          </div>
      );
  }

  // --- VIRTUALIZED RENDER COMPONENTS ---
  const VirtualizedHeader = () => (
    <div className="pt-4 sm:pt-2 px-4 sm:px-6 lg:px-8 pb-3">
        {/* Surah Banner */}
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-quran-dark to-[#142924] px-5 py-5 sm:px-7 sm:py-6 text-white shadow-lg">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <button onClick={handleOpenInfo} className="absolute top-3 right-3 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20 group" title="Info & Asbabun Nuzul"><Info className="w-4 h-4 text-white" /></button>
            <div className="relative z-10 text-center">
                {surah && getQcfSurahNameGlyphCandidate(surah.id) && (
                    <div
                        className="mx-auto mb-2 leading-none text-[28px] sm:text-[40px] md:text-[48px]"
                        style={{ fontFamily: '"Surah Names", serif', filter: 'brightness(0) invert(1)' }}
                        aria-hidden="true"
                    >
                        {getQcfSurahNameGlyphCandidate(surah.id)}
                    </div>
                )}
                {!getQcfSurahNameGlyphCandidate(surah.id) && (
                    <p className="font-surah-name text-3xl sm:text-4xl text-white/95 mb-2 leading-tight" style={{ fontFamily: 'var(--quran-surah-name-font)' }}>
                        {surah?.name}
                    </p>
                )}
                <h2 className={`${getQcfSurahNameGlyphCandidate(surah.id) ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold font-serif mb-1`}>
                    {surah?.transliteration}
                </h2>
                <p className="text-quran-gold text-sm sm:text-base mb-4 italic">{surah?.translation}</p>
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-white/70 font-sans tracking-[0.16em] uppercase">
                    <span>{surah?.type}</span>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-quran-gold"></span>
                    <span>{surah?.total_verses} Ayat</span>
                </div>
                {surah.id !== 1 && surah.id !== 9 && (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 sm:px-5 sm:py-4 text-center backdrop-blur-[2px]">
                        <p className="font-arabic text-[26px] sm:text-[32px] md:text-[34px] leading-relaxed text-white/95 text-center" style={{ fontFamily: getArabicFontOption(arabicFontFamily).family }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col" onTouchStart={handleListTouchStart} onTouchEnd={handleListTouchEnd}>
      <div className="sm:hidden sticky top-0 z-20 px-4 pt-2 pb-3 bg-stone-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-stone-200/70 dark:border-slate-700/70">
        <div className="rounded-2xl border border-stone-200/80 dark:border-slate-700 bg-white/92 dark:bg-slate-800/92 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMushafModeModal(true)}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-quran-dark to-[#23453e] px-4 py-3 text-sm font-bold text-white shadow-sm"
            >
              <BookOpen className="h-4 w-4 text-quran-gold" />
              <span>Mode Mushaf</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMobileHeaderMenu(prev => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700/80 px-3 py-3 text-stone-600 dark:text-gray-200"
                title="Opsi"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMobileHeaderMenu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl">
                  <button
                    onClick={() => { setShowMemModal(true); setShowMobileHeaderMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-stone-700 dark:text-gray-200 hover:bg-stone-50 dark:hover:bg-slate-700"
                  >
                    <BrainCircuit className="h-4 w-4" /> Mode Hafalan
                  </button>
                  {isMemMode && (
                    <button
                      onClick={() => { setHideTranslation(!hideTranslation); setShowMobileHeaderMenu(false); }}
                      className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-stone-700 dark:text-gray-200 hover:bg-stone-50 dark:hover:bg-slate-700"
                    >
                      {hideTranslation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {hideTranslation ? 'Tampilkan Terjemahan' : 'Sembunyikan Terjemahan'}
                    </button>
                  )}
                  <button
                    onClick={() => { setShowFontSettings(true); setShowMobileHeaderMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-stone-700 dark:text-gray-200 hover:bg-stone-50 dark:hover:bg-slate-700"
                  >
                    <Type className="h-4 w-4" /> Tampilan Font
                  </button>
                  <button
                    onClick={() => { setShowQuickJump(true); setShowMobileHeaderMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-stone-700 dark:text-gray-200 hover:bg-stone-50 dark:hover:bg-slate-700"
                  >
                    <Compass className="h-4 w-4" /> Pindah Cepat
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isMemMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-quran-dark/8 px-3 py-1.5 text-[11px] font-bold text-quran-dark dark:bg-quran-gold/10 dark:text-quran-gold">
                <BrainCircuit className="h-3.5 w-3.5" />
                {getMemLevelLabel(memLevel)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-slate-700/80 px-3 py-1.5 text-[11px] font-bold text-stone-600 dark:text-gray-200">
              <Type className="h-3.5 w-3.5" />
              {getArabicFontOption(arabicFontFamily).label}
            </span>
            {showTajweed && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Tajwid Aktif
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="hidden sm:block sticky top-0 z-20 px-4 sm:px-6 lg:px-8 pt-2 pb-3 bg-stone-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-stone-200/70 dark:border-slate-700/70">
        <div className="mx-auto grid max-w-4xl grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-stone-200/80 dark:border-slate-700 bg-white/92 dark:bg-slate-800/92 px-3 py-2 shadow-sm">
          <div className="flex items-center justify-start">
            {prevSurah ? (
              <button
                onClick={() => handleNavigateSurah(prevSurah.id)}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700/70 px-3 py-2 text-stone-600 dark:text-gray-300 hover:text-quran-dark dark:hover:text-quran-gold hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
                title={`${t('prev_surah')}: ${prevSurah.transliteration}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700/80 px-3 py-2 text-gray-600 dark:text-gray-200 hover:text-quran-dark dark:hover:text-quran-gold hover:border-quran-dark dark:hover:border-quran-gold hover:bg-stone-100 dark:hover:bg-slate-700 transition-all"
              title="Kembali ke daftar surat"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden xl:inline text-sm font-semibold truncate max-w-[140px]">{surah.transliteration}</span>
            </button>
            <button onClick={() => setShowMemModal(true)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${isMemMode ? 'bg-quran-dark text-white shadow-md shadow-quran-dark/20' : 'bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 text-gray-600 dark:text-gray-200 hover:bg-stone-100 dark:hover:bg-slate-700'}`}>
              <BrainCircuit className="w-4 h-4" />
              <span className="hidden lg:inline">{isMemMode ? getMemLevelLabel(memLevel) : 'Hafalan'}</span>
            </button>
            {isMemMode && (
              <button onClick={() => setHideTranslation(!hideTranslation)} className={`p-2 rounded-xl border transition-colors ${hideTranslation ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'bg-stone-50 dark:bg-slate-700/80 border-stone-200 dark:border-slate-600 text-gray-400 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-slate-700'}`} title={hideTranslation ? "Tampilkan Terjemahan" : "Sembunyikan Terjemahan"}>
                {hideTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => setShowFontSettings(true)} className="flex items-center gap-2 rounded-xl border bg-stone-50 dark:bg-slate-700/80 border-stone-200 dark:border-slate-600 px-3 py-2 text-gray-600 dark:text-gray-200 hover:text-quran-dark dark:hover:text-quran-gold hover:border-quran-dark dark:hover:border-quran-gold hover:bg-stone-100 dark:hover:bg-slate-700 transition-all" title="Tampilan Font">
              <Type className="w-4 h-4" />
              <span className="hidden xl:inline text-sm font-semibold">Tampilan</span>
            </button>
            <button onClick={() => setShowQuickJump(true)} className="flex items-center gap-2 rounded-xl bg-stone-50 dark:bg-slate-700/80 border border-stone-200 dark:border-slate-600 px-3 py-2 text-gray-600 dark:text-gray-200 hover:text-quran-dark dark:hover:text-quran-gold hover:border-quran-dark dark:hover:border-quran-gold hover:bg-stone-100 dark:hover:bg-slate-700 transition-all" title="Navigasi Cepat">
              <Compass className="w-4 h-4" />
              <span className="hidden xl:inline text-sm font-semibold">Cepat</span>
            </button>
            <button onClick={() => setShowMushafModeModal(true)} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-quran-dark to-[#23453e] dark:from-quran-gold dark:to-[#f0c96b] px-4 py-2 text-sm font-bold text-white dark:text-quran-dark hover:opacity-95 transition-colors">
              <BookOpen className="w-4 h-4 text-quran-gold" />
              <span className="hidden lg:inline">Mode Mushaf</span>
            </button>
          </div>

          <div className="flex items-center justify-end">
            {nextSurah ? (
              <button
                onClick={() => handleNavigateSurah(nextSurah.id)}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700/70 px-3 py-2 text-stone-600 dark:text-gray-300 hover:text-quran-dark dark:hover:text-quran-gold hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
                title={`${t('next_surah')}: ${nextSurah.transliteration}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
      </div>
      <div className="flex-1">
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: '100%' }}
            data={surah.verses}
            components={{
                Scroller: virtuosoScroller,
                Header: VirtualizedHeader
            }}
            itemContent={(index, verse) => {
                const prevVerse = index > 0 ? surah.verses[index - 1] : null;
                const isNewPage = verse.page_number && (!prevVerse || prevVerse.page_number !== verse.page_number);
                const isNewJuz = verse.juz_number && (!prevVerse || prevVerse.juz_number !== verse.juz_number);
                const isNewHizb = verse.hizb_number && (!prevVerse || prevVerse.hizb_number !== verse.hizb_number);
                const isNewRuku = verse.ruku_number && (!prevVerse || prevVerse.ruku_number !== verse.ruku_number);

                return (
                    <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
                        {/* Boundaries Dividers */}
                        {(isNewPage || isNewJuz || isNewHizb || isNewRuku) && (
                            <div className="mb-6 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-200 dark:via-slate-700 to-stone-200 dark:to-slate-700"></div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {isNewJuz && (
                                            <span className="px-3 py-1 bg-quran-dark text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                                                Juz {verse.juz_number}
                                            </span>
                                        )}
                                        {isNewHizb && (
                                            <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                                                Hizb {verse.hizb_number}
                                            </span>
                                        )}
                                        {isNewPage && (
                                            <span className="px-3 py-1 bg-quran-gold text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                                                Halaman {verse.page_number}
                                            </span>
                                        )}
                                        {isNewRuku && (
                                            <span className="px-3 py-1 bg-stone-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold border border-stone-200 dark:border-slate-600 rounded-full uppercase tracking-widest">
                                                Ruku {verse.ruku_number}
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-200 dark:via-slate-700 to-stone-200 dark:to-slate-700"></div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 p-2 md:p-8">
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
                                onWordClick={(word) => setSelectedWord({ word, verseId: verse.id })} 
                                onUpdateKhatam={handleUpdateKhatam} 
                                onShare={handleShareVerse} 
                                isAudioPlaying={audioSurah === surah.id && audioVerse === verse.id} 
                                onPlayAudio={() => playVerse(surah.id, verse.id, surah.total_verses, surah.transliteration)} 
                                arabicFontSize={arabicFontSize} 
                                translationFontSize={translationFontSize} 
                                arabicFontFamily={arabicFontFamily}
                                isTajweedMode={showTajweed} 
                            />
                        </div>
                    </div>
                );
            }}
          />
      </div>

      <div className={`sm:hidden sticky bottom-0 z-20 px-4 pb-4 pt-2 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent backdrop-blur-sm transition-transform duration-300 ${mobileNavVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-2xl border border-stone-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
          {prevSurah ? (
            <button
              onClick={() => handleNavigateSurah(prevSurah.id)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left text-stone-600 dark:text-gray-300 transition-colors hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-quran-dark dark:hover:text-quran-gold"
              title={`${t('prev_surah')}: ${prevSurah.transliteration}`}
            >
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{prevSurah.transliteration}</div>
              </div>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {nextSurah ? (
            <button
              onClick={() => handleNavigateSurah(nextSurah.id)}
              className="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-xl px-2 py-2 text-right text-stone-600 dark:text-gray-300 transition-colors hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-quran-dark dark:hover:text-quran-gold"
              title={`${t('next_surah')}: ${nextSurah.transliteration}`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{nextSurah.transliteration}</div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>

      <NoteEditorModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveNote} surahName={surah.transliteration} verseId={editingVerseId || 0} initialText={currentNoteText} />
      {selectedWord && (
        <WordDetailModal
          word={selectedWord.word}
          surahId={surah.id}
          verseId={selectedWord.verseId}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
      <SurahInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} info={surahInfo} surah={surah} isLoading={loadingInfo} />
      <QuickJumpModal isOpen={showQuickJump} onClose={() => setShowQuickJump(false)} surahs={allSurahs} currentSurahId={surah.id} onNavigate={handleQuickJump} />
      <FontSettingsModal
        isOpen={showFontSettings}
        onClose={() => setShowFontSettings(false)}
        arabicFontFamily={arabicFontFamily}
        onArabicFontFamilyChange={(fontId) => {
            setArabicFontFamily(fontId);
            StorageService.setArabicFontFamily(fontId);
        }}
        arabicFontSize={arabicFontSize}
        onArabicFontSizeChange={(size) => {
            setArabicFontSize(size);
            StorageService.setArabicFontSize(size);
        }}
        translationFontSize={translationFontSize}
        onTranslationFontSizeChange={(size) => {
            setTranslationFontSize(size);
            StorageService.setTranslationFontSize(size);
        }}
      />
      {shareData && <ShareVerseModal isOpen={true} onClose={() => setShareData(null)} surahName={shareData.surahName} verseNumber={shareData.verse.id} arabicText={shareData.verse.text} translationText={shareData.verse.translation || ''} />}
      <MemorizationSettingsModal isOpen={showMemModal} onClose={() => setShowMemModal(false)} level={memLevel} onLevelChange={setMemLevel} isActive={isMemMode} onToggleActive={setIsMemMode} />
      {showMushafModeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
            <div className="absolute inset-0 bg-quran-dark/80 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowMushafModeModal(false)} />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
                <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-quran-dark dark:text-white font-serif text-lg">Pilih Mode Mushaf</h3>
                    <button onClick={() => setShowMushafModeModal(false)} className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <button
                        onClick={() => openMushafMode('mushaf-text')}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                            defaultMushafMode === 'text'
                                ? 'border-quran-gold bg-quran-gold/5 dark:bg-quran-gold/10'
                                : 'border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-gray-800 dark:text-gray-100">Mushaf Teks (Offline)</div>
                            {defaultMushafMode === 'text' && <span className="text-[10px] font-bold text-quran-gold">Default</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ringan, bisa tanpa internet, cocok untuk navigasi cepat.</p>
                    </button>
                    <button
                        onClick={() => openMushafMode('mushaf')}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                            defaultMushafMode === 'image'
                                ? 'border-quran-gold bg-quran-gold/5 dark:bg-quran-gold/10'
                                : 'border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-gray-800 dark:text-gray-100">Mushaf Gambar</div>
                            {defaultMushafMode === 'image' && <span className="text-[10px] font-bold text-quran-gold">Default</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tampilan mushaf asli. Wajib unduh data mushaf terlebih dahulu.</p>
                    </button>
                </div>
            </div>
        </div>
      )}
      
      <ConfirmationModal 
          isOpen={showKhatamConfirm}
          onClose={() => { setShowKhatamConfirm(false); setPendingKhatamVerse(null); }}
          onConfirm={performKhatamUpdate}
          title="Update Khatam?"
          message={pendingKhatamVerse ? `Anda akan memperbarui progres khatam Anda ke halaman ${pendingKhatamVerse.page} (Surat ${surah.transliteration} Ayat ${pendingKhatamVerse.id}). Lanjutkan?` : ''}
          confirmText="Ya, Update"
          variant="primary"
      />
    </div>
  );
};

export default SurahDetailPage;
