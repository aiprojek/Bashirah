import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Check, Target, ScrollText, Image as ImageIcon, Loader2, Info, Copy, Volume2, MoreVertical, Compass, Type, BrainCircuit, ChevronDown, EyeOff, Eye } from 'lucide-react';
import { getAllSurahs, getSurahInfo, getVersesByPage, showToast } from '../services/quranService';
import * as StorageService from '../services/storageService';
import * as DB from '../services/db';
import SurahInfoModal from './SurahInfoModal';
import ShareVerseModal from './ShareVerseModal';
import { Surah, SurahInfo } from '../types';
import TajweedText from './TajweedText';
import { useAudio } from '../contexts/AudioContext';

interface MushafTextViewProps {
  startPage: number;
  translationId: string;
  showTranslation: boolean;
  showTajweed?: boolean;
  tafsirId?: string;
  onClose?: () => void;
  onSwitchToImage?: () => void;
  onOpenQuickJump?: () => void;
  onOpenFontSettings?: () => void;
  onOpenMemorization?: () => void;
  isMemMode?: boolean;
  memLevelLabel?: string;
  memLevel?: 'normal' | 'first-last' | 'ghost' | 'random';
  arabicFontSize?: number;
  hideTranslation?: boolean;
}

type PageVerse = {
  numberInSurah: number;
  text: string;
  translation?: string;
  page_number?: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation?: string;
  };
};

const MushafTextView: React.FC<MushafTextViewProps> = ({
  startPage,
  translationId,
  showTranslation,
  showTajweed = false,
  tafsirId,
  onClose,
  onSwitchToImage,
  onOpenQuickJump,
  onOpenFontSettings,
  onOpenMemorization,
  isMemMode = false,
  memLevelLabel,
  memLevel = 'normal',
  arabicFontSize = 30,
  hideTranslation = false
}) => {
  const [currentPage, setCurrentPage] = useState(startPage);
  const [verses, setVerses] = useState<PageVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTajweedOn, setIsTajweedOn] = useState(showTajweed);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [slideKey, setSlideKey] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [lastReadPage, setLastReadPage] = useState<number | null>(null);
  const [hasKhatamTarget, setHasKhatamTarget] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [surahBasic, setSurahBasic] = useState<Surah | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<PageVerse | null>(null);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [shareVerseData, setShareVerseData] = useState<PageVerse | null>(null);
  const [plainVerseTextMap, setPlainVerseTextMap] = useState<Record<string, string>>({});
  const [isLoadingPlainVerse, setIsLoadingPlainVerse] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [revealedVerses, setRevealedVerses] = useState<Record<string, boolean>>({});
  const { playVerse, setRepeatSettings, isPlaying, currentSurah, currentVerse } = useAudio();
  const [pagePlaybackActive, setPagePlaybackActive] = useState(false);
  const [pagePlaybackSurah, setPagePlaybackSurah] = useState<number | null>(null);
  const [pagePlaybackStart, setPagePlaybackStart] = useState<number | null>(null);
  const [autoPlayNextPage, setAutoPlayNextPage] = useState(false);
  const lastPlayingRef = useRef(false);

  useEffect(() => {
    setCurrentPage(startPage);
  }, [startPage]);

  useEffect(() => {
    setIsTajweedOn(showTajweed);
  }, [showTajweed]);

  useEffect(() => {
    setRevealedVerses({});
  }, [isMemMode, memLevel, currentPage]);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const data = await getVersesByPage(currentPage, translationId, isTajweedOn);
        setVerses(data || []);
      } catch (e) {
        console.error('Failed to load mushaf text page', e);
        setVerses([]);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [currentPage, translationId, isTajweedOn]);

  useEffect(() => {
    const checkLastRead = async () => {
      const lr = await StorageService.getLastRead();
      if (lr) setLastReadPage(lr.pageNumber || null);
      const target = await StorageService.getKhatamTarget();
      setHasKhatamTarget(!!(target && target.isActive));
    };
    checkLastRead();
    window.addEventListener('storage-update', checkLastRead);
    return () => window.removeEventListener('storage-update', checkLastRead);
  }, []);

  const changePageWithAnimation = (nextPage: number, direction: 'next' | 'prev') => {
    if (nextPage < 1 || nextPage > 604) return;
    setSlideDirection(direction);
    setSlideKey(prev => prev + 1);
    setCurrentPage(nextPage);
  };

  const handlePrevPage = () => changePageWithAnimation(currentPage - 1, 'prev');
  const handleNextPage = () => changePageWithAnimation(currentPage + 1, 'next');
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= 604) setCurrentPage(val);
  };

  const handleMarkAsRead = async () => {
    setIsMarkingRead(true);
    try {
      const lastVerse = verses[verses.length - 1];
      if (lastVerse) {
        await StorageService.updateKhatamProgress(currentPage);
        await StorageService.setLastRead(
          lastVerse.surah.number,
          lastVerse.surah.englishName,
          lastVerse.numberInSurah,
          currentPage
        );
        setLastReadPage(currentPage);
      }
    } catch (e) {
      console.error('Gagal menandai halaman', e);
      showToast('Gagal menyimpan progres.', 'error');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleUpdateKhatam = async () => {
    setIsMarkingRead(true);
    try {
      await StorageService.updateKhatamProgress(currentPage);
      showToast(`Target Khatam diperbarui ke halaman ${currentPage}.`, 'success');
    } catch (e) {
      console.error('Gagal memperbarui khatam', e);
      showToast('Gagal memperbarui progres khatam.', 'error');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const isCurrentPageLastRead = lastReadPage === currentPage;

  const groupedVerses = useMemo(() => {
    let lastSurahId: number | null = null;
    return verses.map(v => {
      const isNewSurah = lastSurahId !== v.surah.number;
      lastSurahId = v.surah.number;
      return { verse: v, isNewSurah };
    });
  }, [verses]);

  const primarySurah = useMemo(() => {
    return verses[0]?.surah || null;
  }, [verses]);

  const handleOpenInfo = async () => {
    if (!primarySurah) return;
    setShowInfoModal(true);
    if (!surahInfo || surahBasic?.id !== primarySurah.number) {
      setLoadingInfo(true);
      try {
        const all = await getAllSurahs('id');
        setSurahBasic(all.find(s => s.id === primarySurah.number) || null);
        const info = await getSurahInfo(primarySurah.number);
        setSurahInfo(info);
      } finally {
        setLoadingInfo(false);
      }
    }
  };

  const getPageRangeLabel = async () => {
    if (verses.length === 0) return `Halaman ${currentPage}`;
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sameSurah = verses.every(v => v.surah.number === first.surah.number);
    if (sameSurah) {
      return `QS. ${first.surah.englishName} ${first.numberInSurah}-${last.numberInSurah} (Hal. ${currentPage})`;
    }
    return `Halaman ${currentPage} (Multi Surat)`;
  };

  const buildPageShareText = async () => {
    const label = await getPageRangeLabel();
    const lines = verses.map(v => `${v.surah.englishName} ${v.numberInSurah} — ${v.text}`);
    const trans = showTranslation
      ? verses.map(v => `${v.surah.englishName} ${v.numberInSurah} — ${v.translation || 'Unduh terjemahan untuk offline.'}`)
      : [];
    return [label, ...lines, ...(trans.length ? ['—', ...trans] : []), '', 'Bashirah - Al Quran Digital', 'bashirah.pages.dev'].join('\n');
  };

  const handleCopyPage = async () => {
    try {
      const text = await buildPageShareText();
      await navigator.clipboard.writeText(text);
      showToast('Teks halaman disalin.', 'success');
      setShowActionsMenu(false);
    } catch (e) {
      showToast('Gagal menyalin teks halaman.', 'error');
    }
  };

  const buildSingleVerseText = (verse: PageVerse, arabicTextOverride?: string) => {
    const label = `${verse.surah.englishName} ${verse.numberInSurah}`;
    const translation = verse.translation || 'Unduh terjemahan untuk offline.';
    const arabicText = arabicTextOverride || verse.text;
    return [label, arabicText, translation, '', 'Bashirah - Al Quran Digital', 'bashirah.pages.dev'].join('\n');
  };

  const getVerseKey = (verse: PageVerse) => `${verse.surah.number}:${verse.numberInSurah}`;

  const handleOpenVerseActions = async (verse: PageVerse) => {
    setSelectedVerse(verse);
    setShowVerseModal(true);
    setTafsirText(null);
    if (!isTajweedOn) return;
    const key = getVerseKey(verse);
    if (plainVerseTextMap[key]) return;
    setIsLoadingPlainVerse(true);
    try {
      const plainPageVerses = await getVersesByPage(currentPage, translationId, false);
      const nextMap: Record<string, string> = {};
      plainPageVerses.forEach(v => {
        nextMap[`${v.surah.number}:${v.numberInSurah}`] = v.text;
      });
      setPlainVerseTextMap(prev => ({ ...prev, ...nextMap }));
    } catch (e) {
      console.error('Gagal memuat teks ayat non-tajwid', e);
    } finally {
      setIsLoadingPlainVerse(false);
    }
  };

  const toggleRevealVerse = (verse: PageVerse) => {
    const key = getVerseKey(verse);
    setRevealedVerses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderMushafVerse = (verse: PageVerse) => {
    const key = getVerseKey(verse);
    const isRevealed = !!revealedVerses[key];
    const words = verse.text.trim().split(/\s+/);
    const renderWord = (word: string, idx: number) => (
      <span key={`${key}-w-${idx}`} className="ml-1.5">
        {isTajweedOn ? <TajweedText text={word} /> : word}{' '}
      </span>
    );

    if (!isMemMode) {
      return (
        <>
          {isTajweedOn ? <TajweedText text={verse.text} /> : verse.text}
        </>
      );
    }

    if (isRevealed) {
      return (
        <span className="cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
          {isTajweedOn ? <TajweedText text={verse.text} /> : verse.text}
        </span>
      );
    }

    if (memLevel === 'normal') {
      return (
        <span className="blur-md opacity-40 select-none cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
          {isTajweedOn ? <TajweedText text={verse.text} /> : verse.text}
        </span>
      );
    }

    if (memLevel === 'ghost') {
      return (
        <span className="opacity-10 select-none cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
          {isTajweedOn ? <TajweedText text={verse.text} /> : verse.text}
        </span>
      );
    }

    if (memLevel === 'first-last') {
      return (
        <span className="cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
          {words.map((word, idx) => {
            const isVisible = words.length <= 4 ? idx === 0 || idx === words.length - 1 : idx < 2 || idx >= words.length - 2;
            if (isVisible) return renderWord(word, idx);
            return (
              <span key={`${key}-h-${idx}`} className="inline-block bg-stone-200/50 rounded-md text-transparent select-none ml-1.5 min-w-[26px] h-4 align-middle opacity-50">
                ....{' '}
              </span>
            );
          })}
        </span>
      );
    }

    if (memLevel === 'random') {
      return (
        <span className="cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
          {words.map((word, idx) => {
            const pseudoRandom = (verse.numberInSurah + idx * 7) % 10;
            const shouldHide = pseudoRandom < 4;
            if (!shouldHide) return renderWord(word, idx);
            return (
              <span key={`${key}-r-${idx}`} className="inline-block bg-stone-200/50 rounded-md text-transparent select-none ml-1.5 min-w-[20px] h-4 align-middle opacity-50">
                ...{' '}
              </span>
            );
          })}
        </span>
      );
    }

    return (
      <span className="cursor-pointer" onClick={() => toggleRevealVerse(verse)}>
        {isTajweedOn ? <TajweedText text={verse.text} /> : verse.text}
      </span>
    );
  };

  const handleCopyVerse = async () => {
    if (!selectedVerse) return;
    try {
      const key = getVerseKey(selectedVerse);
      const plainText = isTajweedOn ? plainVerseTextMap[key] : undefined;
      await navigator.clipboard.writeText(buildSingleVerseText(selectedVerse, plainText));
      showToast('Ayat disalin.', 'success');
      setShowVerseModal(false);
    } catch (e) {
      showToast('Gagal menyalin ayat.', 'error');
    }
  };

  const handleLoadTafsir = async () => {
    if (!selectedVerse) return;
    if (!tafsirId) {
      showToast('Tafsir belum dipilih. Buka Pengaturan > Tafsir untuk memilih.', 'warning');
      return;
    }
    setIsLoadingTafsir(true);
    try {
      const isDownloaded = await DB.isEditionDownloaded(tafsirId);
      if (!isDownloaded) {
        showToast('Tafsir belum diunduh. Silakan unduh di Pengaturan > Tafsir.', 'warning');
        return;
      }
      const tafsirVerses = await DB.getSurahContent(tafsirId, selectedVerse.surah.number);
      const tafsirItem = tafsirVerses.find((v: any) => v.numberInSurah === selectedVerse.numberInSurah || v.number === selectedVerse.numberInSurah);
      const text = tafsirItem?.text || '';
      if (!text) {
        showToast('Tafsir tidak tersedia untuk ayat ini.', 'info');
      }
      setTafsirText(text || null);
    } catch (e) {
      console.error('Gagal memuat tafsir', e);
      showToast('Gagal memuat tafsir.', 'error');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handlePlayPage = async () => {
    if (verses.length === 0) return;
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sameSurah = verses.every(v => v.surah.number === first.surah.number);
    if (!sameSurah) {
      showToast('Murottal per halaman hanya untuk satu surat.', 'warning');
      setAutoPlayNextPage(false);
      return;
    }
    let surahMeta = surahBasic;
    if (!surahMeta || surahMeta.id !== first.surah.number) {
      const all = await getAllSurahs('id');
      surahMeta = all.find(s => s.id === first.surah.number) || null;
      setSurahBasic(surahMeta);
    }
    if (!surahMeta) {
      showToast('Gagal memuat info surat.', 'error');
      setAutoPlayNextPage(false);
      return;
    }
    setRepeatSettings({
      mode: 'range',
      rangeStart: first.numberInSurah,
      rangeEnd: last.numberInSurah,
      count: 1
    });
    playVerse(first.surah.number, first.numberInSurah, surahMeta.total_verses, surahMeta.transliteration);
    setPagePlaybackActive(true);
    setPagePlaybackSurah(first.surah.number);
    setPagePlaybackStart(first.numberInSurah);
    setShowActionsMenu(false);
  };

  useEffect(() => {
    if (!pagePlaybackActive) {
      lastPlayingRef.current = isPlaying;
      return;
    }
    const justStopped = lastPlayingRef.current && !isPlaying;
    const isSameSurah = pagePlaybackSurah !== null && currentSurah === pagePlaybackSurah;
    const isAtRangeStart = pagePlaybackStart !== null && currentVerse === pagePlaybackStart;
    if (justStopped && isSameSurah && isAtRangeStart) {
      if (currentPage < 604) {
        setAutoPlayNextPage(true);
        handleNextPage();
      }
      setPagePlaybackActive(false);
    }
    lastPlayingRef.current = isPlaying;
  }, [isPlaying, currentSurah, currentVerse, pagePlaybackActive, pagePlaybackSurah, pagePlaybackStart, currentPage]);

  useEffect(() => {
    if (!autoPlayNextPage) return;
    if (verses.length === 0) return;
    const pageNum = verses[0]?.page_number;
    if (pageNum !== currentPage) return;
    handlePlayPage();
    setAutoPlayNextPage(false);
  }, [autoPlayNextPage, verses, currentPage]);

  const toArabicNumerals = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);

  return (
    <div className="flex flex-col h-full bg-[#f9f6ef]">
      <div className="bg-white border-b border-stone-200 px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-quran-dark text-white text-xs font-bold px-2 py-1 rounded hidden sm:inline-flex">
            Hal {currentPage}
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-700 hidden sm:inline">
            Mushaf Teks (Offline)
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowActionsMenu(prev => !prev)}
              className="p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
              title="Aksi Halaman"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActionsMenu && (
              <div className="absolute left-0 mt-2 w-52 max-w-[calc(100vw-1.5rem)] bg-white border border-stone-200 rounded-lg shadow-lg z-30 overflow-hidden">
                <button onClick={handleCopyPage} className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Salin Ayat Halaman
                </button>
                <button
                  onClick={() => { setIsTajweedOn(prev => !prev); setShowActionsMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                >
                  Tajwid {isTajweedOn ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => { onOpenFontSettings?.(); setShowActionsMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                >
                  <Type className="w-4 h-4" /> Ukuran Teks
                </button>
                <button
                  onClick={() => { onOpenMemorization?.(); setShowActionsMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                >
                  <BrainCircuit className="w-4 h-4" /> Mode Hafalan
                </button>
                <button
                  onClick={() => { onOpenQuickJump?.(); setShowActionsMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" /> Pindah Cepat
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleCopyPage}
            className="hidden sm:inline-flex p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
            title="Salin Ayat Halaman"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlayPage}
            className="inline-flex p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
            title="Murottal Per Halaman"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenInfo}
            className="p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
            title="Asbabun Nuzul"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsTajweedOn(prev => !prev)}
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              isTajweedOn
                ? 'bg-quran-gold/10 text-quran-dark border-quran-gold/40'
                : 'bg-white text-gray-600 border-stone-200 hover:bg-stone-50'
            }`}
            title="Tajwid"
          >
            Tajwid
          </button>
          <button
            onClick={() => onOpenQuickJump?.()}
            className="hidden sm:inline-flex p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
            title="Pindah Cepat"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenFontSettings?.()}
            className="hidden sm:inline-flex p-2 rounded-lg border border-stone-200 text-gray-500 hover:text-quran-dark hover:border-quran-dark transition-colors"
            title="Ukuran Teks"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenMemorization?.()}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              isMemMode
                ? 'bg-quran-dark text-white border-quran-dark'
                : 'bg-white text-gray-600 border-stone-200 hover:bg-stone-50'
            }`}
            title="Mode Hafalan"
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">{isMemMode ? (memLevelLabel || 'Hafalan') : 'Mode Hafalan'}</span>
            {isMemMode && <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={handleUpdateKhatam}
            disabled={isMarkingRead}
            className={`p-2 rounded-lg transition-colors border ${
              hasKhatamTarget
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100'
            }`}
            title="Update Progres Khatam"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead || isCurrentPageLastRead}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isCurrentPageLastRead
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-white text-gray-600 border-stone-200 hover:bg-stone-50'
            }`}
            title={isCurrentPageLastRead ? 'Halaman Terakhir Dibaca' : 'Tandai Selesai Dibaca'}
          >
            {isMarkingRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCurrentPageLastRead ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Tandai</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Tandai</span>
              </>
            )}
          </button>
          {onSwitchToImage && (
            <button
              onClick={onSwitchToImage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-quran-gold/10 text-quran-dark hover:bg-quran-gold/20"
              title="Mushaf Gambar"
            >
              <ImageIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Mushaf Gambar</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-stone-100"
              title="Mode List"
            >
              <ScrollText className="w-3 h-3" />
              <span className="hidden sm:inline">Mode List</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-quran-gold animate-spin" />
          </div>
        ) : groupedVerses.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Gagal memuat halaman.</div>
        ) : (
          <div className="relative">
            <div
              key={slideKey}
              className={`bg-white/80 rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-sm ${slideDirection === 'next' ? 'mushaf-text-slide-next' : 'mushaf-text-slide-prev'}`}
            >
            {primarySurah && (
              <div className="mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-bold font-arabic text-quran-dark text-center">
                    {primarySurah.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold tracking-wide">
                    {primarySurah.englishName}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="h-px w-16 bg-quran-gold/60" />
                  <span className="w-2.5 h-2.5 rotate-45 bg-quran-gold/70" />
                  <span className="h-px w-16 bg-quran-gold/60" />
                </div>
              </div>
            )}
            <div
              dir="rtl"
              className="font-arabic leading-[2.6] text-quran-dark"
              style={{ textAlign: 'justify', textAlignLast: 'right', fontSize: `${arabicFontSize}px` }}
            >
              {groupedVerses.map(({ verse, isNewSurah }, idx) => {
                const isActiveVerse = currentSurah === verse.surah.number && currentVerse === verse.numberInSurah;
                const shouldMask =
                  isMemMode &&
                  ['ghost', 'first-last', 'random'].includes(memLevel);
                return (
                <React.Fragment key={`${verse.surah.number}-${verse.numberInSurah}-${idx}`}>
                  {isNewSurah && verse.surah.number !== 1 && verse.numberInSurah === 1 && (
                    <div className="block w-full my-5">
                      <div className="block w-full text-2xl sm:text-3xl text-quran-dark font-arabic mushaf-center">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </div>
                    </div>
                  )}
                  <span className={isActiveVerse ? 'bg-quran-gold/20 rounded px-1' : ''}>
                    {renderMushafVerse(verse)}
                    <button
                      type="button"
                      className="verse-ornament"
                      onClick={(e) => { e.stopPropagation(); handleOpenVerseActions(verse); }}
                      aria-label={`Aksi ayat ${verse.surah.englishName} ${verse.numberInSurah}`}
                    >
                      {toArabicNumerals(verse.numberInSurah)}
                    </button>
                  </span>
                  <span> </span>
                </React.Fragment>
              )})}
            </div>

            {showTranslation && !(isMemMode && hideTranslation) && (
              <div className="mt-6 space-y-3">
                {groupedVerses.map(({ verse }, idx) => (
                  <div key={`tr-${verse.surah.number}-${verse.numberInSurah}-${idx}`} className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-700">
                      {verse.surah.englishName} {verse.numberInSurah}
                    </span>
                    : {verse.translation || 'Unduh terjemahan untuk offline.'}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {primarySurah && (
        <SurahInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          info={surahInfo}
          surah={surahBasic}
          isLoading={loadingInfo}
        />
      )}

      {showVerseModal && selectedVerse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-700">
                {selectedVerse.surah.englishName} {selectedVerse.numberInSurah}
              </div>
              <button
                onClick={() => setShowVerseModal(false)}
                className="text-xs px-2 py-1 rounded-lg bg-stone-100 text-gray-600 hover:bg-stone-200"
              >
                Tutup
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div className="text-right font-arabic text-2xl leading-[2.4] text-quran-dark">
                {(() => {
                  const key = getVerseKey(selectedVerse);
                  const plainText = isTajweedOn ? plainVerseTextMap[key] : undefined;
                  return plainText || selectedVerse.text;
                })()}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {selectedVerse.translation || 'Unduh terjemahan untuk offline.'}
              </div>
              {isTajweedOn && isLoadingPlainVerse && (
                <div className="text-[11px] text-gray-400">Memuat teks non-tajwid...</div>
              )}
              <button
                onClick={handleLoadTafsir}
                className="w-full px-3 py-2 rounded-lg text-xs font-bold border border-stone-200 text-gray-600 hover:bg-stone-50"
                disabled={isLoadingTafsir}
              >
                {isLoadingTafsir ? 'Memuat Tafsir...' : 'Lihat Tafsir'}
              </button>
              {tafsirText && (
                <div className="text-sm text-gray-700 leading-relaxed bg-stone-50 border border-stone-200 rounded-lg p-3">
                  {tafsirText}
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-stone-100 flex items-center gap-2">
              <button
                onClick={handleCopyVerse}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold border border-stone-200 text-gray-600 hover:bg-stone-50"
              >
                Salin Ayat
              </button>
              <button
                onClick={() => {
                  const key = getVerseKey(selectedVerse);
                  const plainText = isTajweedOn ? plainVerseTextMap[key] : undefined;
                  const payload = plainText ? { ...selectedVerse, text: plainText } : selectedVerse;
                  setShareVerseData(payload);
                  setShowVerseModal(false);
                }}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-quran-gold/10 text-quran-dark hover:bg-quran-gold/20"
              >
                Bagikan Ayat
              </button>
            </div>
          </div>
        </div>
      )}

      {shareVerseData && (
        <ShareVerseModal
          isOpen={true}
          onClose={() => setShareVerseData(null)}
          surahName={shareVerseData.surah.englishName}
          verseNumber={shareVerseData.numberInSurah}
          arabicText={shareVerseData.text}
          translationText={shareVerseData.translation || ''}
        />
      )}


      <div className="bg-white border-t border-stone-200 p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0 safe-area-bottom">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-quran-dark disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 px-2">
            <input
              type="range"
              min="1"
              max="604"
              value={currentPage}
              onChange={handleSliderChange}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-quran-gold"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold font-sans">
              <span>1</span>
              <span className="text-quran-gold text-xs">{currentPage}</span>
              <span>604</span>
            </div>
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-quran-dark disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MushafTextView;
