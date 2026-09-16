import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { AsmaulHusna } from '../services/asmaulHusnaData';
import { searchGlobalVerses, getSpecificVerses } from '../services/quranService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedModal from './UnifiedModal';

interface AsmaulHusnaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AsmaulHusna | null;
}

const AsmaulHusnaDetailModal: React.FC<AsmaulHusnaDetailModalProps> = ({ isOpen, onClose, data }) => {
  const { t, language } = useLanguage();
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset when data changes or modal opens
  useEffect(() => {
    if (isOpen && data) {
      fetchDalil();
    } else {
      setVerses([]);
    }
  }, [isOpen, data, language]);

  const fetchDalil = async () => {
    if (!data) return;
    setLoading(true);

    try {
      const transId = language === 'en' ? 'en.sahih' : 'id.indonesian';
      if (data.verses && data.verses.length > 0) {
        // If we have curated verses, use them with the current language translation
        const results = await getSpecificVerses(data.verses, transId);
        setVerses(results);
      } else {
        // Fallback to search
        const results = await searchGlobalVerses(data.arabic, 'quran-simple');
        setVerses(results.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to find dalil', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerseClick = (surahId: number, verseId: number) => {
    navigate(`/surah/${surahId}#verse-${verseId}`);
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      badge={`Asmaul Husna #${data.index}`}
      title={data.latin}
      subtitle={language === 'id' ? data.translation_id : data.translation_en}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* HERO CARD: Arabic Calligraphy, Latin, and Translation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-200/80 dark:border-slate-700/80 shadow-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-overlay opacity-30 dark:opacity-5 pointer-events-none" />

          <p className="font-arabic text-5xl sm:text-6xl text-quran-dark dark:text-white leading-relaxed drop-shadow-sm py-2" dir="rtl">
            {data.arabic}
          </p>

          <div className="mt-3 space-y-1">
            <p className="font-serif text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
              {data.latin}
            </p>
            <p className="font-sans text-xs sm:text-sm font-semibold text-quran-gold dark:text-quran-gold">
              {language === 'id' ? data.translation_id : data.translation_en}
            </p>
          </div>
        </div>

        {/* DALIL / AYAT CONTEXT CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-stone-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-quran-gold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{t('names_dalil_title')}</span>
            </div>
            {verses.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                {verses.length} {t('topics_ref')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-quran-gold" />
              <span className="text-xs">{t('loading')}</span>
            </div>
          ) : verses.length > 0 ? (
            <div className="space-y-3 pt-1">
              {verses.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVerseClick(v.surah.number, v.verseId)}
                  className="w-full text-left bg-stone-50/70 dark:bg-slate-700/40 hover:bg-stone-100 dark:hover:bg-slate-700 p-4 rounded-xl border border-stone-200/60 dark:border-slate-700 hover:border-quran-gold/60 dark:hover:border-quran-gold/60 transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-stone-600 dark:text-gray-300 px-2.5 py-0.5 rounded border border-stone-200 dark:border-slate-600">
                      QS. {v.surah.englishName || v.surah.transliteration} : {v.verseId}
                    </span>
                    <span className="text-[10px] font-bold text-quran-gold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{t('lib_view_verse')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <p className="font-arabic text-xl sm:text-2xl text-right text-gray-800 dark:text-gray-100 leading-loose line-clamp-2" dir="rtl">
                    {v.text}
                  </p>

                  {v.translation && (
                    <div className="border-t border-stone-200/60 dark:border-slate-600/60 pt-2 mt-2">
                      <p className="text-xs font-serif text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                        {v.translation}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl border border-dashed border-stone-200 dark:border-slate-700">
              <p className="text-gray-400 text-xs italic">{t('names_dalil_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </UnifiedModal>
  );
};

export default AsmaulHusnaDetailModal;
