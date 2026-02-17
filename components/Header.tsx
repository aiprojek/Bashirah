
import React from 'react';
import { BookOpen, Menu, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
    onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  
  // Title logic
  const getTitle = () => {
      if (location.pathname === '/settings') return "Pengaturan";
      if (location.pathname === '/library') return "Pustaka Saya";
      if (location.pathname === '/topics') return "Indeks Topik";
      if (location.pathname === '/duas') return "Koleksi Doa";
      if (location.pathname === '/feelings') return "Ayat Pelipur Lara";
      if (location.pathname === '/quiz') return "Kuis Al-Quran";
      if (location.pathname === '/tadabbur') return "Jurnal Tadabbur";
      if (location.pathname === '/about') return "Tentang Aplikasi";
      return "Basirah";
  };

  const handleBack = () => {
      navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 bg-quran-cream/90 backdrop-blur-md border-b border-quran-gold/20 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT SECTION: Logo or Back Button */}
        <div className="flex items-center gap-3">
            {isHome ? (
                <div 
                    className="flex items-center gap-3 select-none"
                >
                    <div className="bg-quran-dark p-2 rounded-lg shadow-sm">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-quran-dark font-serif tracking-tight leading-tight">
                            Basirah
                        </h1>
                        <p className="text-[10px] text-quran-text/60 font-sans tracking-widest uppercase leading-none">Al-Quran Digital</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-full hover:bg-stone-100 text-quran-dark transition-all group"
                        aria-label="Kembali"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-xl font-bold text-quran-dark font-serif tracking-tight animate-fade-in">
                        {getTitle()}
                    </h1>
                </div>
            )}
        </div>
        
        {/* RIGHT SECTION: Menu Button */}
        <button 
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:bg-stone-100 text-quran-dark/70 hover:text-quran-dark transition-all"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
