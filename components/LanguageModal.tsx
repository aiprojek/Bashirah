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
        className="absolute inset-0 bg-quran-dark/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-quran-gold" />
              <h3 className="text-lg font-bold text-quran-dark font-serif">Pilih Bahasa</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-gray-500 transition-colors"
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
                      ? 'bg-quran-dark text-white border-quran-dark shadow-md' 
                      : 'bg-white text-gray-600 border-stone-200 hover:border-quran-gold hover:text-quran-dark hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{lang.nativeName}</span>
                  {currentAppLang === lang.code && <div className="w-2 h-2 bg-quran-gold rounded-full"></div>}
                </button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
