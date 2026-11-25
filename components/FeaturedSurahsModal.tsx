import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Volume2, BookOpen, Clock, ArrowRight, Shield, Heart, Moon, Calendar } from 'lucide-react';
import UnifiedModal from './UnifiedModal';
import { FEATURED_SURAHS, FeaturedSurah } from '../constants/featuredSurahs';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';

interface FeaturedSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeaturedSurahsModal: React.FC<FeaturedSurahsModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { playVerse } = useAudio();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: language === 'en' ? 'All Surahs' : 'Semua Surat' },
    { id: 'friday', label: language === 'en' ? 'Friday' : 'Hari Jumat', icon: Calendar },
    { id: 'night', label: language === 'en' ? 'Night & Sleep' : 'Malam & Tidur', icon: Moon },
    { id: 'protection', label: language === 'en' ? 'Protection' : 'Perlindungan', icon: Shield },
    { id: 'comfort', label: language === 'en' ? 'Comfort & Ease' : 'Penyejuk Hati', icon: Heart },
  ];

  const filteredSurahs = selectedCategory === 'all'
    ? FEATURED_SURAHS
    : FEATURED_SURAHS.filter(s => s.category === selectedCategory);

  const handleOpenSurah = (surahId: number) => {
    onClose();
    navigate(`/surah/${surahId}`);
  };

  const handlePlayAudio = (surah: FeaturedSurah) => {
    playVerse(surah.number, 1, surah.totalVerses, surah.transliteration);
    onClose();
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      badge={language === 'en' ? 'FEATURED SURAHS' : 'SURAT-SURAT PILIHAN'}
      badgeColorClass="bg-amber-500/15 text-amber-600 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400"
      title={
        <span className="flex items-center gap-2 text-lg sm:text-xl font-bold font-serif">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
          <span>{language === 'en' ? 'Virtues of Selected Surahs' : 'Koleksi Surat-Surat Pilihan'}</span>
        </span>
      }
      subtitle={
        language === 'en'
          ? 'Quick access to frequently recited surahs with special daily virtues and hadith references'
          : 'Akses cepat surat-surat utama yang dianjurkan dibaca harian beserta keutamaan dan dalilnya'
      }
      bodyClassName="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar"
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
        >
          {t('close')}
        </button>
      }
    >
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-slate-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Surah Cards Grid */}
      <div className="space-y-3">
        {filteredSurahs.map(surah => (
          <div
            key={surah.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-stone-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/25 shrink-0">
                  {surah.number}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span>{surah.transliteration}</span>
                    <span className="text-xs font-normal text-stone-400 dark:text-stone-500">
                      ({surah.totalVerses} {language === 'en' ? 'Verses' : 'Ayat'})
                    </span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {surah.translation} • {surah.revelation}
                  </p>
                </div>
              </div>
              <span className="font-arabic text-2xl font-bold text-quran-dark/80 dark:text-amber-200" dir="rtl">
                {surah.name}
              </span>
            </div>

            {/* Fadhilah & Time */}
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded-xl p-3 mb-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{surah.fadhilahTitle}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {language === 'en' ? surah.fadhilahDescEn : surah.fadhilahDesc}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/15 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                  <Clock className="w-3 h-3" />
                  <span>{language === 'en' ? surah.recommendedTimeEn : surah.recommendedTime}</span>
                </span>
                <span className="italic opacity-80 font-mono text-[10px]">
                  {surah.hadithReference}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handlePlayAudio(surah)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                title={language === 'en' ? 'Play Surah Murottal' : 'Putar Murottal Surat'}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Play' : 'Putar Audio'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSurah(surah.id)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-quran-dark dark:bg-quran-gold dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Read Surah' : 'Buka Surat'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </UnifiedModal>
  );
};

export default FeaturedSurahsModal;
