
import React from 'react';
import { X, BookOpen, MapPin, AlignLeft } from 'lucide-react';
import { SurahInfo, Surah } from '../types';

interface SurahInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: SurahInfo | null;
  surah: Surah | null; // Passed to show basic details while loading
  isLoading: boolean;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ 
    isOpen, 
    onClose, 
    info, 
    surah,
    isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-quran-dark/80 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 dark:border-slate-700 flex justify-between items-center bg-stone-50/50 dark:bg-slate-700/50">
                <div>
                     <h3 className="text-xl font-bold text-quran-dark dark:text-white font-serif">
                         Info & Asbabun Nuzul
                     </h3>
                     {surah && (
                         <p className="text-sm text-gray-500 dark:text-gray-400">QS. {surah.transliteration} ({surah.translation})</p>
                     )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white dark:bg-slate-800">
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
                        <div className="h-32 bg-gray-100 dark:bg-slate-700 rounded-xl mt-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-full mt-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-5/6"></div>
                    </div>
                ) : info ? (
                    <div className="space-y-6">
                        
                        {/* Quick Stats */}
                        {surah && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-stone-50 dark:bg-slate-700 p-3 rounded-xl border border-stone-100 dark:border-slate-600 text-center">
                                    <div className="text-gray-400 mb-1 flex justify-center"><BookOpen className="w-4 h-4" /></div>
                                    <div className="font-bold text-quran-dark dark:text-white text-lg">{surah.total_verses}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Ayat</div>
                                </div>
                                <div className="bg-stone-50 dark:bg-slate-700 p-3 rounded-xl border border-stone-100 dark:border-slate-600 text-center">
                                    <div className="text-gray-400 mb-1 flex justify-center"><MapPin className="w-4 h-4" /></div>
                                    <div className="font-bold text-quran-dark dark:text-white text-lg">{surah.type}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Tempat</div>
                                </div>
                                <div className="bg-stone-50 dark:bg-slate-700 p-3 rounded-xl border border-stone-100 dark:border-slate-600 text-center">
                                    <div className="text-gray-400 mb-1 flex justify-center"><AlignLeft className="w-4 h-4" /></div>
                                    <div className="font-bold text-quran-dark dark:text-white text-lg">{surah.id}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Urutan</div>
                                </div>
                            </div>
                        )}

                        {/* Main Text content */}
                        <div className="prose prose-sm md:prose-base max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-serif">
                            {/* Injecting HTML safely - Data comes from trusted API but standard procedure is sanitize in prod */}
                            <div dangerouslySetInnerHTML={{ __html: info.text }} />
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-stone-100 dark:border-slate-700 text-[10px] text-gray-400 italic">
                            Sumber: {info.source}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>Informasi detail tidak tersedia untuk surat ini.</p>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};

export default SurahInfoModal;
