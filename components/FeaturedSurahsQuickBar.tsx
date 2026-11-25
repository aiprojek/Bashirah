import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, ChevronRight } from 'lucide-react';
import { FEATURED_SURAHS } from '../constants/featuredSurahs';
import FeaturedSurahsModal from './FeaturedSurahsModal';
import { useLanguage } from '../contexts/LanguageContext';

const FeaturedSurahsQuickBar: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Top 6 primary quick surahs
  const quickSurahs = FEATURED_SURAHS.slice(0, 6);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto mb-6 px-1">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              {language === 'en' ? 'Featured Surahs' : 'Surat-Surat Pilihan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 sm:bg-transparent sm:hover:bg-transparent px-2.5 sm:px-0 py-1 sm:py-0 rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title={language === 'en' ? 'View Virtues & Hadith' : 'Lihat Keutamaan & Dalil'}
          >
            <span className="inline sm:hidden">{language === 'en' ? 'Virtues' : 'Keutamaan'}</span>
            <span className="hidden sm:inline">{language === 'en' ? 'View Virtues & Hadith' : 'Lihat Keutamaan & Dalil'}</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          </button>
        </div>

        {/* Horizontal Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
          {quickSurahs.map((surah) => (
            <button
              key={surah.id}
              type="button"
              onClick={() => navigate(`/surah/${surah.id}`)}
              className="group flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                {surah.number}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                  {surah.transliteration}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block leading-tight">
                  {surah.recommendedTime.split('/')[0].trim()}
                </span>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'en' ? 'More Surahs' : 'Lainnya...'}</span>
          </button>
        </div>
      </div>

      <FeaturedSurahsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FeaturedSurahsQuickBar;
