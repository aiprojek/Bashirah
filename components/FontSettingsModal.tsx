
import React from 'react';
import { X, Type, CaseUpper } from 'lucide-react';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  arabicFontSize: number;
  onArabicFontSizeChange: (size: number) => void;
  translationFontSize: number;
  onTranslationFontSizeChange: (size: number) => void;
}

const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  arabicFontSize,
  onArabicFontSizeChange,
  translationFontSize,
  onTranslationFontSizeChange
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
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100 border border-white/10">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50 dark:bg-slate-700/50">
                <h3 className="font-bold text-quran-dark dark:text-white font-serif text-lg flex items-center gap-2">
                    <Type className="w-5 h-5" /> Tampilan Ayat
                </h3>
                <button 
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
                
                {/* Arabic Settings */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-quran-gold/10 p-1 rounded text-quran-dark dark:text-quran-gold"><Type className="w-3 h-3" /></span>
                            Ukuran Arab
                        </label>
                        <span className="text-xs font-bold text-quran-gold bg-stone-50 dark:bg-slate-700 border border-stone-100 dark:border-slate-600 px-2 py-0.5 rounded">{arabicFontSize}px</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <CaseUpper className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        <input 
                            type="range" 
                            min="20" 
                            max="60" 
                            value={arabicFontSize} 
                            onChange={(e) => onArabicFontSizeChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-stone-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                        />
                        <CaseUpper className="w-6 h-6 text-quran-dark dark:text-white" />
                    </div>

                    {/* Live Preview */}
                    <div className="mt-4 p-4 bg-[#fcfbf7] dark:bg-slate-900 rounded-xl border border-stone-100 dark:border-slate-700 text-right shadow-inner">
                        <p className="font-arabic text-quran-dark dark:text-white leading-loose transition-all duration-200" style={{ fontSize: `${arabicFontSize}px` }} dir="rtl">
                            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                        </p>
                    </div>
                </div>

                <div className="border-t border-stone-100 dark:border-slate-700"></div>

                {/* Translation Settings */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                             <span className="bg-stone-100 dark:bg-slate-700 p-1 rounded text-gray-500 dark:text-gray-300"><Type className="w-3 h-3" /></span>
                             Ukuran Terjemahan
                        </label>
                        <span className="text-xs font-bold text-quran-gold bg-stone-50 dark:bg-slate-700 border border-stone-100 dark:border-slate-600 px-2 py-0.5 rounded">{translationFontSize}px</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <CaseUpper className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        <input 
                            type="range" 
                            min="12" 
                            max="24" 
                            value={translationFontSize} 
                            onChange={(e) => onTranslationFontSizeChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-stone-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-quran-gold"
                        />
                        <CaseUpper className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>

                     {/* Live Preview */}
                     <div className="mt-4 p-4 bg-stone-50 dark:bg-slate-700/30 rounded-xl border border-stone-100 dark:border-slate-700 text-left shadow-inner">
                        <p className="text-gray-600 dark:text-gray-300 font-serif italic leading-relaxed transition-all duration-200" style={{ fontSize: `${translationFontSize}px` }}>
                            Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.
                        </p>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-stone-50 dark:bg-slate-700/50 border-t border-stone-100 dark:border-slate-700">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    Selesai
                </button>
            </div>
        </div>
    </div>
  );
};

export default FontSettingsModal;
