
import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
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
                    <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-sm">
                      <path d="M256 180C320 160 400 160 432 200V380C400 340 320 340 256 360" stroke="#1e3a34" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M256 180C192 160 112 160 80 200V380C112 340 192 340 256 360" stroke="#1e3a34" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M256 180V400" stroke="#1e3a34" strokeWidth="24" strokeLinecap="round"/>
                      <path d="M300 240C340 230 380 235 400 250" stroke="#d4af37" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
                      <path d="M300 290C340 280 380 285 400 300" stroke="#d4af37" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
                      <path d="M212 240C172 230 132 235 112 250" stroke="#d4af37" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
                      <path d="M212 290C172 280 132 285 112 300" stroke="#d4af37" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
                      <path d="M256 60L275 95L315 100L285 130L295 170L256 150L217 170L227 130L197 100L237 95L256 60Z" fill="#d4af37"/>
                      <circle cx="256" cy="115" r="10" fill="#1e3a34"/>
                    </svg>
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
