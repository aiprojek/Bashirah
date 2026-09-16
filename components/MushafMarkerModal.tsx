import React from 'react';
import { Compass, BookOpen, Layers, Bookmark, Volume2, X } from 'lucide-react';
import UnifiedModal from './UnifiedModal';
import { useLanguage } from '../contexts/LanguageContext';
import { getManzilForVerse } from '../services/manzilService';

export interface MushafMarkerVerse {
  numberInSurah: number;
  text: string;
  translation?: string;
  juz_number?: number;
  hizb_number?: number;
  ruku_number?: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation?: string;
  };
}

interface MushafMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: MushafMarkerVerse | null;
  onOpenVerseActions?: (verse: MushafMarkerVerse) => void;
  onPlayVerse?: (verse: MushafMarkerVerse) => void;
}

const MushafMarkerModal: React.FC<MushafMarkerModalProps> = ({
  isOpen,
  onClose,
  verse,
  onOpenVerseActions,
  onPlayVerse,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen || !verse) return null;

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      badge={language === 'en' ? 'MUSHAF NAVIGATION' : 'NAVIGASI MUSHAF'}
      badgeColorClass="bg-quran-gold/15 text-quran-gold border-quran-gold/25 dark:bg-quran-gold/20 dark:text-quran-gold"
      title={
        <span className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <Compass className="w-5 h-5 text-quran-gold shrink-0" />
          {language === 'en' ? 'Marker Information' : 'Informasi Penanda Ayat'}
        </span>
      }
      subtitle={`${verse.surah.englishName} : Ayat ${verse.numberInSurah}`}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="w-full flex items-center justify-end gap-2">
          {onOpenVerseActions && (
            <button
              onClick={() => {
                onClose();
                onOpenVerseActions(verse);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-quran-gold/15 text-quran-dark hover:bg-quran-gold/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Verse Actions' : 'Aksi Ayat'}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
          >
            {t('close')}
          </button>
        </div>
      }
    >
      {/* 4-Column Info Cards for Juz, Manzil, Hizb, Ruku */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Juz Card */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-xl p-2.5 flex flex-col items-center text-center justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Juz
          </span>
          <span className="text-xl font-black text-amber-800 dark:text-amber-300 mt-0.5">
            {verse.juz_number || '-'}
          </span>
          <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
            {language === 'en' ? 'Juz 1-30' : 'Juz 1-30'}
          </span>
        </div>

        {/* Manzil Card */}
        <div className="bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 rounded-xl p-2.5 flex flex-col items-center text-center justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Manzil
          </span>
          <span className="text-xl font-black text-teal-800 dark:text-teal-300 mt-0.5">
            {getManzilForVerse(verse.surah.number, verse.numberInSurah)}
          </span>
          <span className="text-[9px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">
            {language === 'en' ? 'Day 1-7' : 'Hari 1-7'}
          </span>
        </div>

        {/* Hizb Card */}
        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 rounded-xl p-2.5 flex flex-col items-center text-center justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Hizb
          </span>
          <span className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
            {verse.hizb_number || '-'}
          </span>
          <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            {language === 'en' ? 'Hizb 1-60' : 'Hizb 1-60'}
          </span>
        </div>

        {/* Ruku Card */}
        <div className="bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 rounded-xl p-2.5 flex flex-col items-center text-center justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Ruku&apos;
          </span>
          <span className="text-xl font-black text-indigo-800 dark:text-indigo-300 mt-0.5">
            {verse.ruku_number || '-'}
          </span>
          <span className="text-[9px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
            {language === 'en' ? 'Section' : 'Bagian'}
          </span>
        </div>
      </div>

      {/* Verse Excerpt Preview */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 border border-stone-200/80 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-slate-400">
          <span>{verse.surah.englishName} : {verse.numberInSurah}</span>
          <span className="font-arabic font-bold text-stone-600 dark:text-slate-300">{verse.surah.name}</span>
        </div>
        <p className="font-arabic text-xl text-right leading-loose text-gray-900 dark:text-gray-100">
          {verse.text}
        </p>
        {verse.translation && (
          <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-3 pt-1 border-t border-stone-100 dark:border-slate-700/60">
            {verse.translation}
          </p>
        )}
      </div>

      {/* Quick Play Audio Button */}
      {onPlayVerse && (
        <button
          onClick={() => {
            onClose();
            onPlayVerse(verse);
          }}
          className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{language === 'en' ? 'Play Audio for this Marker' : 'Putar Audio Penanda Ini'}</span>
        </button>
      )}
    </UnifiedModal>
  );
};

export default MushafMarkerModal;
