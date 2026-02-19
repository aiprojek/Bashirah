
import React from 'react';
import { X, Globe } from 'lucide-react';
import { LanguageCode, APP_LANGUAGES } from '../types';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppLang: LanguageCode;
  onAppLangChange: (lang: LanguageCode) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentAppLang,
  onAppLangChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-quran-dark/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-700/30">
          <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-quran-gold" />
              <h3 className="text-lg font-bold text-quran-dark dark:text-white font-serif">Pilih Bahasa</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {APP_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                      onAppLangChange(lang.code);
                      onClose();
                  }}
                  className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all border text-left flex items-center justify-between ${
                    currentAppLang === lang.code 
                      ? 'bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark border-quran-dark dark:border-quran-gold shadow-md' 
                      : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-200 border-stone-200 dark:border-slate-600 hover:border-quran-gold dark:hover:border-quran-gold hover:text-quran-dark dark:hover:text-quran-gold hover:bg-stone-50 dark:hover:bg-slate-600'
                  }`}
                >
                  <span className="truncate">{lang.nativeName}</span>
                  {currentAppLang === lang.code && <div className="w-2 h-2 bg-quran-gold dark:bg-quran-dark rounded-full"></div>}
                </button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
