
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Bookmark, Settings, Home, LayoutGrid, HeartHandshake, Heart, Trophy, BookHeart, Info, Sparkles, GraduationCap } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-[#1e3a34]/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel - Right side */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-80 max-w-[85vw] bg-[#fcfbf7] dark:bg-slate-900 shadow-2xl border-l border-[#d4af37]/20 dark:border-slate-700 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full text-gray-800 dark:text-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="w-8 h-8" />
                    <span className="font-serif font-bold text-xl text-[#1e3a34] dark:text-gray-100">Menu</span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-500 dark:text-gray-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => handleNavigation('/')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Home className={`w-5 h-5 ${isActive('/') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_home')}</span>
                </button>
                
                <button 
                    onClick={() => handleNavigation('/topics')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/topics') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <LayoutGrid className={`w-5 h-5 ${isActive('/topics') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_topics')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/tajweed-learn')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/tajweed-learn') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <GraduationCap className={`w-5 h-5 ${isActive('/tajweed-learn') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_tajweed')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/asmaul-husna')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/asmaul-husna') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Sparkles className={`w-5 h-5 ${isActive('/asmaul-husna') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_names')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/feelings')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/feelings') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isActive('/feelings') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_feelings')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/quiz')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/quiz') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Trophy className={`w-5 h-5 ${isActive('/quiz') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_quiz')}</span>
                </button>
                
                <button 
                    onClick={() => handleNavigation('/tadabbur')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/tadabbur') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <BookHeart className={`w-5 h-5 ${isActive('/tadabbur') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_tadabbur')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/duas')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/duas') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <HeartHandshake className={`w-5 h-5 ${isActive('/duas') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_dua')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/library')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/library') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Bookmark className={`w-5 h-5 ${isActive('/library') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_library')}</span>
                </button>

                <div className="my-4 border-t border-stone-100 dark:border-slate-800 mx-4"></div>

                <button 
                    onClick={() => handleNavigation('/settings')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/settings') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Settings className={`w-5 h-5 ${isActive('/settings') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_settings')}</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/about')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/about') 
                        ? 'bg-[#d4af37]/10 dark:bg-slate-800 text-[#1e3a34] dark:text-quran-gold font-bold' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Info className={`w-5 h-5 ${isActive('/about') ? 'text-[#d4af37]' : ''}`} />
                    <span>{t('nav_about')}</span>
                </button>
            </nav>

            {/* Footer */}
            <div className="p-6 bg-stone-50 dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-serif italic">{t('app_title')}</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Versi 20260219</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
