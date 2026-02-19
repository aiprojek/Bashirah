
import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo'; // Import custom logo
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const isHome = location.pathname === '/';
  
  // Title logic
  const getTitle = () => {
      if (location.pathname === '/settings') return t('nav_settings');
      if (location.pathname === '/library') return t('nav_library');
      if (location.pathname === '/topics') return t('nav_topics');
      if (location.pathname === '/duas') return t('nav_dua');
      if (location.pathname === '/feelings') return t('nav_feelings');
      if (location.pathname === '/quiz') return t('nav_quiz');
      if (location.pathname === '/tadabbur') return t('nav_tadabbur');
      if (location.pathname === '/about') return t('nav_about');
      if (location.pathname === '/asmaul-husna') return t('nav_names');
      if (location.pathname === '/tajweed-learn') return t('nav_tajweed');
      return t('app_title');
  };

  const handleBack = () => {
      navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fcfbf7]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#d4af37]/20 dark:border-slate-700 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT SECTION: Logo or Back Button */}
        <div className="flex items-center gap-3">
            {isHome ? (
                <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => navigate('/')}>
                    <Logo className="w-10 h-10" withText={true} />
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-quran-dark dark:text-gray-100 transition-all group"
                        aria-label="Kembali"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-xl font-bold text-quran-dark dark:text-gray-100 font-serif tracking-tight animate-fade-in">
                        {getTitle()}
                    </h1>
                </div>
            )}
        </div>
        
        {/* RIGHT SECTION: Menu Button */}
        <button 
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-quran-dark/70 dark:text-gray-300 hover:text-quran-dark dark:hover:text-white transition-all"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
