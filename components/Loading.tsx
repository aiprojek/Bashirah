
import React from 'react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

const Loading: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-fade-in">
      <div className="relative w-24 h-24">
        {/* Decorative background circle */}
        <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
        {/* Spinning indicator */}
        <div className="absolute inset-0 border-4 border-t-quran-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000"></div>
        
        {/* Inner Logo */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
             <Logo className="w-10 h-10" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-quran-dark font-serif text-xl font-bold tracking-tight">{t('loading_title')}</h3>
        <div className="flex flex-col items-center gap-1">
             <p className="text-xs text-gray-400 font-sans tracking-widest uppercase">{t('loading_desc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
