
import React from 'react';
import { Surah } from '../types';
import { Star } from 'lucide-react';

interface SurahCardProps {
  surah: Surah;
  onClick: (id: number) => void;
  showTranslation?: boolean;
}

const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick, showTranslation = true }) => {
  return (
    <div 
      onClick={() => onClick(surah.id)}
      className="group relative bg-white dark:bg-slate-800 rounded-xl p-5 border border-stone-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-quran-gold/30 dark:hover:border-quran-gold/30 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <Star className="w-16 h-16 text-quran-dark dark:text-white" />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 bg-stone-100 dark:bg-slate-700 rounded-full group-hover:bg-quran-dark group-hover:text-white transition-colors duration-300 border border-stone-200 dark:border-slate-600 group-hover:border-quran-dark text-gray-600 dark:text-gray-300">
                <span className="font-bold text-sm">{surah.id}</span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-quran-dark dark:text-gray-100 group-hover:text-quran-gold dark:group-hover:text-quran-gold transition-colors">{surah.transliteration}</h3>
                {showTranslation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-serif italic">{surah.translation}</p>
                )}
            </div>
        </div>
        <div className="text-right">
             <span className="block font-arabic text-2xl text-quran-dark/80 dark:text-gray-300 group-hover:text-quran-dark dark:group-hover:text-white mb-1">{surah.name}</span>
             <span className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2 py-1 bg-stone-50 dark:bg-slate-700 rounded-full border border-stone-100 dark:border-slate-600">{surah.total_verses} Ayat</span>
        </div>
      </div>
    </div>
  );
};

export default SurahCard;
