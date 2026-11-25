import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import UnifiedModal from './UnifiedModal';
import { WaqafItem } from '../constants/waqafData';
import { useLanguage } from '../contexts/LanguageContext';

interface WaqafDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  waqafItem: WaqafItem | null;
}

const WaqafDetailModal: React.FC<WaqafDetailModalProps> = ({
  isOpen,
  onClose,
  waqafItem,
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  if (!isOpen || !waqafItem) return null;

  const handleOpenFullGuide = () => {
    onClose();
    navigate(`/waqaf?id=${waqafItem.id}`);
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      badge={language === 'en' ? 'Waqaf Sign Guide' : 'Panduan Tanda Waqaf'}
      badgeColorClass="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25"
      title={
        <span className="text-lg sm:text-xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
          <span>{waqafItem.name}</span>
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
            ({waqafItem.symbol})
          </span>
        </span>
      }
      subtitle={language === 'en' ? 'Tajweed Waqaf Sign Explanation' : 'Penjelasan Hukum & Kaidah Tanda Waqaf'}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            type="button"
            onClick={handleOpenFullGuide}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Full Guide & Quiz' : 'Semua Tanda & Kuis'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      }
    >
      {/* Symbol & Name Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/50 dark:from-slate-800 dark:to-slate-800/80 p-5 border border-amber-500/20 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border mb-2 ${waqafItem.categoryColor}`}
          >
            {waqafItem.categoryLabel}
          </span>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {waqafItem.name}
          </h3>
          <p className="font-arabic text-lg text-stone-600 dark:text-stone-300 mt-0.5" dir="rtl">
            {waqafItem.arabicName}
          </p>
        </div>

        {/* Big arabic symbol ornament */}
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 border border-amber-500/30 flex items-center justify-center text-3xl font-bold font-arabic text-amber-600 dark:text-amber-300 shadow-sm shrink-0">
          {waqafItem.symbol}
        </div>
      </div>

      {/* Hukum Bacaan */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-stone-200/80 dark:border-slate-700/80 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
          {language === 'en' ? 'Ruling (Hukum Bacaan)' : 'Hukum Bacaan'}
        </span>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {waqafItem.hukum}
        </p>
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pt-1 border-t border-stone-100 dark:border-slate-700/50">
          {language === 'en' ? waqafItem.descriptionEn : waqafItem.description}
        </p>
      </div>

      {/* Cara Membaca */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
          {language === 'en' ? 'How to Read (Cara Membaca)' : 'Cara Membaca'}
        </span>
        <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
          {waqafItem.howToRead}
        </p>
      </div>

      {/* Contoh Ayat */}
      {waqafItem.example && (
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700/70 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Example in Quran' : 'Contoh dalam Al-Qur\'an'}</span>
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-mono">
              QS. {waqafItem.example.surahName}: {waqafItem.example.verseId}
            </span>
          </div>
          <p className="font-arabic text-base sm:text-lg text-right text-gray-900 dark:text-gray-100 leading-loose" dir="rtl">
            {waqafItem.example.arabicSnippet}
          </p>
          <p className="text-[11px] text-stone-600 dark:text-stone-300 italic leading-relaxed pt-1 border-t border-stone-200/60 dark:border-slate-700/60">
            "{waqafItem.example.translation}"
          </p>
        </div>
      )}
    </UnifiedModal>
  );
};

export default WaqafDetailModal;
