import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Share2,
  Bookmark,
  BookOpen,
  Volume2,
  Tag,
  BookMarked,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';
import UnifiedModal from './UnifiedModal';
import {
  getThemeForVerse,
  getTopicsForVerse,
  getLocalizedThemeText,
  getLocalizedTopicName,
  getLocalizedTopicDescription,
  AyahTheme,
  AyahTopic,
} from '../services/ayahThemeTopicService';
import {
  getAyahTafsir,
  TafsirResult,
  getDefaultTafsirId,
  getTafsirName,
} from '../services/tafsirService';

export interface FlexibleVerse {
  id?: number;
  numberInSurah?: number;
  text: string;
  translation?: string;
  tafsir?: string;
  words?: any[];
  surah?: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation?: string;
  };
}

interface VerseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: FlexibleVerse | null;
  surahId: number;
  surahName: string;
  onOpenMatchingAyah: (verseId: number) => void;
  onBookmark: (verseId: number) => void;
  onShare: (verse: any) => void;
  onCopy: (verse: any) => void;
  isBookmarked?: boolean;
  tafsirText?: string | null;
  onLoadTafsir?: () => void;
  isLoadingTafsir?: boolean;
  tafsirId?: string;
  arabicFontFamilyStyle?: string;
}

const VerseActionModal: React.FC<VerseActionModalProps> = ({
  isOpen,
  onClose,
  verse,
  surahId,
  surahName,
  onOpenMatchingAyah,
  onBookmark,
  onShare,
  onCopy,
  isBookmarked = false,
  tafsirText,
  onLoadTafsir,
  isLoadingTafsir = false,
  tafsirId,
  arabicFontFamilyStyle,
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { playVerse } = useAudio();

  const [theme, setTheme] = useState<AyahTheme | null>(null);
  const [topics, setTopics] = useState<AyahTopic[]>([]);
  const [showTafsirInline, setShowTafsirInline] = useState(false);
  const [showTopicsDetails, setShowTopicsDetails] = useState(false);
  const [internalTafsir, setInternalTafsir] = useState<TafsirResult | null>(null);
  const [isInternalLoadingTafsir, setIsInternalLoadingTafsir] = useState(false);

  const verseNumber = verse ? verse.numberInSurah ?? verse.id ?? 1 : 1;

  useEffect(() => {
    if (!isOpen || !verse) {
      setTheme(null);
      setTopics([]);
      setShowTafsirInline(false);
      setShowTopicsDetails(false);
      setInternalTafsir(null);
      setIsInternalLoadingTafsir(false);
      return;
    }

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [themeData, topicsData] = await Promise.all([
          getThemeForVerse(surahId, verseNumber),
          getTopicsForVerse(surahId, verseNumber),
        ]);
        if (isMounted) {
          setTheme(themeData);
          setTopics(topicsData);
        }
      } catch (err) {
        console.error('Failed to load verse theme/topics:', err);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [isOpen, surahId, verseNumber, verse]);

  if (!isOpen || !verse) return null;

  const handleToggleTafsir = async () => {
    const nextState = !showTafsirInline;
    setShowTafsirInline(nextState);

    if (nextState) {
      if (onLoadTafsir) {
        onLoadTafsir();
      }
      // If parent didn't provide tafsirText, use self-contained loader
      if (!tafsirText && (!internalTafsir || !internalTafsir.text)) {
        setIsInternalLoadingTafsir(true);
        try {
          const res = await getAyahTafsir(surahId, verseNumber, tafsirId, language);
          setInternalTafsir(res);
        } catch (e) {
          console.error('Failed to load tafsir:', e);
        } finally {
          setIsInternalLoadingTafsir(false);
        }
      }
    }
  };

  const effectiveTafsirLoading = isLoadingTafsir || isInternalLoadingTafsir;
  const effectiveTafsirText = tafsirText || internalTafsir?.text || verse.tafsir;
  const effectiveEditionName = internalTafsir?.editionName || (tafsirId ? getTafsirName(tafsirId) : getTafsirName(getDefaultTafsirId(language)));

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      badge={`QS. ${surahName} : ${verseNumber}`}
      badgeColorClass="bg-quran-gold/15 text-quran-gold border-quran-gold/25 dark:bg-quran-gold/20 dark:text-quran-gold"
      title={
        <span className="text-lg sm:text-xl font-bold font-serif text-gray-900 dark:text-white">
          {surahName} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">({t('verse')} {verseNumber})</span>
        </span>
      }
      subtitle={language === 'en' ? 'Quick Actions & Ayah Insights' : 'Aksi Cepat & Wawasan Ayat'}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
        >
          {t('close')}
        </button>
      }
    >
      {/* Arabic and Translation Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-stone-200/80 dark:border-slate-700/80 shadow-xs space-y-2.5">
        <p
          className="font-arabic text-xl sm:text-2xl text-right leading-loose text-gray-900 dark:text-gray-100"
          style={arabicFontFamilyStyle ? { fontFamily: arabicFontFamilyStyle } : undefined}
          dir="rtl"
        >
          {verse.text}
        </p>
        {verse.translation && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic pt-2 border-t border-stone-100 dark:border-slate-700/60 leading-relaxed">
            {verse.translation}
          </p>
        )}
      </div>

      {/* Theme & Topics Insight Banner (From uploaded QUL databases) */}
      {(theme || topics.length > 0) && (
        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 rounded-2xl p-3.5 space-y-2">
          {theme && (
            <div className="flex items-start gap-2">
              <BookMarked className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {language === 'en' ? 'Ayah Theme' : 'Tema Ayat'}:
                </span>{' '}
                <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  {getLocalizedThemeText(theme, language)}{' '}
                  <span className="text-[11px] opacity-75 font-mono">
                    ({language === 'en' ? 'Verses' : 'Ayat'} {theme.ayah_from}-{theme.ayah_to})
                  </span>
                </span>
              </div>
            </div>
          )}

          {topics.length > 0 && (
            <div className="pt-1.5 border-t border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'Topics' : 'Topik Bahasan'} ({topics.length})</span>
                </div>
                {topics.length > 3 && (
                  <button
                    onClick={() => setShowTopicsDetails((prev) => !prev)}
                    className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>{showTopicsDetails ? (language === 'en' ? 'Show less' : 'Lebih sedikit') : (language === 'en' ? 'Show all' : 'Lihat semua')}</span>
                    {showTopicsDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {(showTopicsDetails ? topics : topics.slice(0, 4)).map((t) => {
                  const localizedTopicName = getLocalizedTopicName(t, language);
                  const localizedDesc = getLocalizedTopicDescription(t, language);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/topics?topicId=${t.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/80 dark:bg-slate-800/80 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all shadow-2xs group cursor-pointer text-left"
                      title={localizedDesc || (language === 'en' ? 'Click to explore all verses in this topic' : 'Klik untuk menjelajahi semua ayat dalam topik ini')}
                    >
                      <span className="group-hover:underline">#{localizedTopicName}</span>
                      {t.arabic && <span className="font-arabic text-[10px] text-emerald-600/70">{t.arabic}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tafsir Expandable Section */}
      {showTafsirInline && (
        <div className="bg-stone-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-stone-200 dark:border-slate-700/80 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                {language === 'en' ? 'Tafsir' : 'Kandungan Tafsir'}
              </span>
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                • {effectiveEditionName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {internalTafsir?.source === 'offline' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Offline
                </span>
              )}
              {internalTafsir?.source === 'online' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  Online
                </span>
              )}
              {effectiveTafsirLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              )}
            </div>
          </div>

          {effectiveTafsirLoading ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <p className="text-xs italic">
                {language === 'en' ? 'Loading tafsir...' : 'Memuat teks tafsir...'}
              </p>
            </div>
          ) : effectiveTafsirText ? (
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 border border-stone-200/60 dark:border-slate-700/60 shadow-2xs">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed max-h-56 overflow-y-auto pr-1">
                {effectiveTafsirText}
              </p>
            </div>
          ) : (
            <div className="py-3 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {internalTafsir?.errorMessage ||
                    (language === 'en'
                      ? 'Tafsir is not downloaded yet. Please download it in Settings > Tafsir.'
                      : 'Data tafsir belum tersedia di penyimpanan perangkat. Silakan unduh di menu Pengaturan.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/settings?tab=reading');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors"
              >
                <span>{language === 'en' ? 'Open Tafsir Settings' : 'Buka Pengaturan Tafsir'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons List */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        {/* Play Audio */}
        <button
          onClick={() => {
            playVerse(surahId, verseNumber, 1, 1, surahName, verse.text);
            onClose();
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/80 flex items-center justify-between transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <span>{language === 'en' ? 'Play Verse Audio' : 'Putar Audio Ayat'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {language === 'en' ? 'Play' : 'Putar'}
          </span>
        </button>

        {/* Similar / Matching Ayahs */}
        <button
          onClick={() => {
            onOpenMatchingAyah(verseNumber);
            onClose();
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/25 flex items-center justify-between transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                {language === 'en' ? 'Similar & Matching Verses' : 'Ayat Serupa & Kecocokan Redaksi'}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                {language === 'en' ? 'Find matching text across the Quran' : 'Cek kemiripan redaksi lafadz ayat'}
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </button>

        {/* Tafsir Toggle */}
        <button
          onClick={handleToggleTafsir}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/80 flex items-center justify-between transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>{showTafsirInline ? (language === 'en' ? 'Hide Tafsir' : 'Tutup Tafsir') : (language === 'en' ? 'View Tafsir' : 'Baca Tafsir Ayat')}</span>
          </div>
          {showTafsirInline ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {/* Bookmark */}
        <button
          onClick={() => {
            onBookmark(verseNumber);
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/80 flex items-center justify-between transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </div>
            <span>
              {isBookmarked
                ? (language === 'en' ? 'Remove Bookmark' : 'Hapus Penanda')
                : (language === 'en' ? 'Bookmark Verse' : 'Tandai (Bookmark)')}
            </span>
          </div>
          {isBookmarked && (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {language === 'en' ? 'Marked' : 'Ditandai'}
            </span>
          )}
        </button>

        {/* Copy */}
        <button
          onClick={() => {
            onCopy(verse);
            onClose();
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/80 flex items-center gap-3 transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
            <Copy className="w-4 h-4" />
          </div>
          <span>{language === 'en' ? 'Copy Text & Translation' : 'Salin Teks & Terjemahan'}</span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            onShare(verse);
            onClose();
          }}
          className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/80 flex items-center gap-3 transition-colors shadow-2xs active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <span>{language === 'en' ? 'Share Verse Card' : 'Bagikan Kartu Ayat'}</span>
        </button>
      </div>
    </UnifiedModal>
  );
};

export default VerseActionModal;
