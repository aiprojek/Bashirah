import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  Tag,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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

export interface AyahThemeTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahId: number;
  surahName: string;
  verse: {
    id?: number;
    numberInSurah?: number;
    text: string;
    translation?: string;
  } | null;
  arabicFontFamilyStyle?: string;
  onOpenMatchingAyah?: (verseId: number) => void;
}

const AyahThemeTopicModal: React.FC<AyahThemeTopicModalProps> = ({
  isOpen,
  onClose,
  surahId,
  surahName,
  verse,
  arabicFontFamilyStyle,
  onOpenMatchingAyah,
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [theme, setTheme] = useState<AyahTheme | null>(null);
  const [topics, setTopics] = useState<AyahTopic[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [loading, setLoading] = useState(false);

  const verseNumber = verse ? verse.numberInSurah ?? verse.id ?? 1 : 1;

  useEffect(() => {
    if (!isOpen || !verse) {
      setTheme(null);
      setTopics([]);
      setShowAllTopics(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
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
        console.error('Failed to load theme/topics:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, surahId, verseNumber, verse]);

  if (!isOpen || !verse) return null;

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 6);

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      badge={`QS. ${surahName} : ${verseNumber}`}
      badgeColorClass="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300"
      title={
        <span className="text-lg sm:text-xl font-bold font-serif text-gray-900 dark:text-white">
          {language === 'en' ? 'Ayah Theme & Topics' : 'Tema & Topik Ayat'}
        </span>
      }
      subtitle={
        language === 'en'
          ? `Thematic classification and Quranic concepts for verse ${verseNumber}`
          : `Klasifikasi tematik dan konsep bahasan Al-Qur'an ayat ${verseNumber}`
      }
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/topics');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            <Compass className="w-4 h-4" />
            <span>{language === 'en' ? 'Browse All Topics' : 'Semua Indeks Topik'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
          >
            {t('close')}
          </button>
        </div>
      }
    >
      {/* Verse snippet */}
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

      {/* Section 1: Ayah Theme */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-transparent border border-emerald-500/25 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {language === 'en' ? 'Main Ayah Theme' : 'Tema Pokok Ayat'}
            </span>
          </div>
          {theme && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
              {language === 'en' ? 'Verses' : 'Ayat'} {theme.ayah_from} - {theme.ayah_to}
            </span>
          )}
        </div>

        {theme ? (
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed pt-1">
            {getLocalizedThemeText(theme, language)}
          </p>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400 italic pt-1">
            {language === 'en'
              ? 'No dedicated theme record for this verse.'
              : 'Belum ada rekaman tema terpisah untuk ayat ini.'}
          </p>
        )}
      </div>

      {/* Section 2: Ayah Topics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                {language === 'en' ? 'Thematic Topics' : 'Topik Bahasan Tematik'}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5">
                ({topics.length})
              </span>
            </div>
          </div>

          {topics.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllTopics((prev) => !prev)}
              className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{showAllTopics ? (language === 'en' ? 'Show less' : 'Lebih sedikit') : (language === 'en' ? `Show all (${topics.length})` : `Lihat semua (${topics.length})`)}</span>
              {showAllTopics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayedTopics.map((topic) => {
              const name = getLocalizedTopicName(topic, language);
              const desc = getLocalizedTopicDescription(topic, language);
              return (
                <div
                  key={topic.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-2 shadow-2xs group"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        #{name}
                      </span>
                      {topic.arabic && (
                        <span className="font-arabic text-xs text-stone-500 dark:text-stone-400 shrink-0" dir="rtl">
                          {topic.arabic}
                        </span>
                      )}
                    </div>
                    {desc && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug line-clamp-2">
                        {desc}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/topics?topicId=${topic.id}`);
                    }}
                    className="self-end inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                  >
                    <span>{language === 'en' ? 'Explore Topic' : 'Jelajahi Topik'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-dashed border-stone-200 dark:border-slate-700 text-xs text-stone-500 dark:text-stone-400">
            {language === 'en'
              ? 'No indexed topics for this specific verse.'
              : 'Belum ada topik khusus yang terindeks untuk ayat ini.'}
          </div>
        )}
      </div>

      {/* Section 3: Matching Ayah Shortcuts */}
      {onOpenMatchingAyah && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenMatchingAyah(verseNumber);
          }}
          className="w-full text-left p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border border-amber-500/25 flex items-center justify-between transition-colors shadow-2xs active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {language === 'en' ? 'Mutashabihat & Similar Ayahs' : 'Mutasyabihat & Ayat Serupa'}
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                {language === 'en'
                  ? 'Check lexical similarities with other verses across the Quran'
                  : 'Lihat kemiripan redaksi lafadz ayat ini di berbagai surat'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      )}
    </UnifiedModal>
  );
};

export default AyahThemeTopicModal;
